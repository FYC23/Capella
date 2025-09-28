//
//  DAFModule.swift
//  Capella
//
//  Created by AI Assistant
//  Copyright © 2024 Capella. All rights reserved.
//

import Foundation
import AVFoundation
import React

@objc(DAFModule)
class DAFModule: RCTEventEmitter {
    
    private var audioEngine: AVAudioEngine?
    private var inputNode: AVAudioInputNode?
    private var outputNode: AVAudioOutputNode?
    private var delayNode: AVAudioUnitDelay?
    private var pitchNode: AVAudioUnitTimePitch?
    private var isDAFActive = false
    private var currentConfig: DAFConfiguration?
    
    override func supportedEvents() -> [String]! {
        return ["audioDeviceChanged", "dafStateChanged", "permissionChanged"]
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    // MARK: - Audio Device Detection
    
    @objc
    func checkHeadphoneConnection(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let audioSession = AVAudioSession.sharedInstance()
        
        do {
            try audioSession.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetooth])
            try audioSession.setActive(true)
            
            let currentRoute = audioSession.currentRoute
            var isHeadphoneConnected = false
            var deviceType = "unknown"
            var deviceName: String?
            
            for output in currentRoute.outputs {
                switch output.portType {
                case .headphones, .bluetoothA2DP, .bluetoothHFP, .bluetoothLE:
                    isHeadphoneConnected = true
                    deviceType = output.portType.rawValue
                    deviceName = output.portName
                    break
                default:
                    break
                }
            }
            
            let deviceInfo: [String: Any] = [
                "isHeadphoneConnected": isHeadphoneConnected,
                "deviceType": deviceType,
                "deviceName": deviceName ?? NSNull()
            ]
            
            resolve(deviceInfo)
            
        } catch {
            reject("AUDIO_ERROR", "Failed to check headphone connection: \(error.localizedDescription)", error)
        }
    }
    
    // MARK: - Permissions
    
    @objc
    func requestAudioPermissions(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        AVAudioSession.sharedInstance().requestRecordPermission { granted in
            DispatchQueue.main.async {
                resolve(granted)
                self.sendEvent(withName: "permissionChanged", body: granted)
            }
        }
    }
    
    // MARK: - DAF Implementation
    
    @objc
    func initializeDAF(_ config: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            let audioEngine = AVAudioEngine()
            let inputNode = audioEngine.inputNode
            let outputNode = audioEngine.outputNode
            
            // Create delay node
            let delayNode = AVAudioUnitDelay()
            delayNode.delayTime = Double(config["delayTime"] as? Int ?? 200) / 1000.0 // Convert ms to seconds
            delayNode.feedback = 0.0 // No feedback to prevent echo
            delayNode.wetDryMix = 0.8 // Mix level
            
            // Create pitch shift node
            let pitchNode = AVAudioUnitTimePitch()
            pitchNode.pitch = Float(config["pitchShift"] as? Int ?? 0) * 100.0 // Convert semitones to cents
            
            // Connect nodes: Input -> Delay -> Pitch -> Output
            audioEngine.attach(delayNode)
            audioEngine.attach(pitchNode)
            
            audioEngine.connect(inputNode, to: delayNode, format: inputNode.outputFormat(forBus: 0))
            audioEngine.connect(delayNode, to: pitchNode, format: inputNode.outputFormat(forBus: 0))
            audioEngine.connect(pitchNode, to: outputNode, format: inputNode.outputFormat(forBus: 0))
            
            self.audioEngine = audioEngine
            self.inputNode = inputNode
            self.outputNode = outputNode
            self.delayNode = delayNode
            self.pitchNode = pitchNode
            
            let dafConfig = DAFConfiguration(
                delayTime: config["delayTime"] as? Int ?? 200,
                pitchShift: config["pitchShift"] as? Int ?? 0,
                volume: config["volume"] as? Double ?? 0.8
            )
            self.currentConfig = dafConfig
            
            resolve(true)
            
        } catch {
            reject("DAF_ERROR", "Failed to initialize DAF: \(error.localizedDescription)", error)
        }
    }
    
    @objc
    func startDAF(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let audioEngine = audioEngine else {
            reject("DAF_ERROR", "DAF not initialized", nil)
            return
        }
        
        do {
            try audioEngine.start()
            isDAFActive = true
            resolve(true)
            sendEvent(withName: "dafStateChanged", body: true)
        } catch {
            reject("DAF_ERROR", "Failed to start DAF: \(error.localizedDescription)", error)
        }
    }
    
    @objc
    func stopDAF(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let audioEngine = audioEngine else {
            reject("DAF_ERROR", "DAF not initialized", nil)
            return
        }
        
        audioEngine.stop()
        isDAFActive = false
        resolve(true)
        sendEvent(withName: "dafStateChanged", body: false)
    }
    
    @objc
    func updateDAFConfig(_ config: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let delayNode = delayNode, let pitchNode = pitchNode else {
            reject("DAF_ERROR", "DAF not initialized", nil)
            return
        }
        
        if let delayTime = config["delayTime"] as? Int {
            delayNode.delayTime = Double(delayTime) / 1000.0
        }
        
        if let pitchShift = config["pitchShift"] as? Int {
            pitchNode.pitch = Float(pitchShift) * 100.0
        }
        
        resolve(true)
    }
    
    @objc
    func isDAFActive(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        resolve(isDAFActive)
    }
    
    @objc
    func getCurrentAudioDevice(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        checkHeadphoneConnection(resolve, reject: reject)
    }
}

// MARK: - Configuration Struct

struct DAFConfiguration {
    let delayTime: Int
    let pitchShift: Int
    let volume: Double
}
