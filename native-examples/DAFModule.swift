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
    private var routeObserver: Any?
    
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
        // Lightly (and safely) configure/activate the session so Bluetooth routes like AirPods are visible
        do {
            try audioSession.setCategory(.playAndRecord, mode: .voiceChat, options: [.allowBluetooth, .allowBluetoothA2DP])
            try audioSession.setActive(true, options: [])
        } catch {
            // Non-fatal; continue with existing route if activation fails
        }
        let currentRoute = audioSession.currentRoute
        var isHeadphoneConnected = false
        var deviceType = "unknown"
        var deviceName: String?

        for output in currentRoute.outputs {
            switch output.portType {
            case .headphones, .bluetoothA2DP, .bluetoothHFP, .bluetoothLE, .usbAudio, .lineOut:
                isHeadphoneConnected = true
                deviceType = output.portType.rawValue
                deviceName = output.portName
            case .builtInSpeaker, .builtInReceiver:
                // ignore built-in routes
                break
            default:
                // Treat any other non-built-in output as external
                isHeadphoneConnected = true
                deviceType = output.portType.rawValue
                deviceName = output.portName
            }
        }

        let outputsInfo: [[String: Any]] = currentRoute.outputs.map { out in
            return [
                "portType": out.portType.rawValue,
                "portName": out.portName,
                "uid": out.uid
            ]
        }

        let deviceInfo: [String: Any] = [
            "isHeadphoneConnected": isHeadphoneConnected,
            "deviceType": deviceType,
            "deviceName": deviceName ?? NSNull(),
            "outputs": outputsInfo
        ]

        NSLog("[DAF] checkHeadphoneConnection route outputs: \(outputsInfo)")
        // Also emit a device change event so JS can reflect the latest status immediately
        self.sendEvent(withName: "audioDeviceChanged", body: deviceInfo)
        resolve(deviceInfo)
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
            // Configure session for low latency voice I/O
            try configureAudioSessionIfNeeded(AVAudioSession.sharedInstance())

            let audioEngine = AVAudioEngine()
            let inputNode = audioEngine.inputNode
            let outputNode = audioEngine.outputNode
            
            // Create delay node
            let delayNode = AVAudioUnitDelay()
            delayNode.delayTime = Double(config["delayTime"] as? Int ?? 200) / 1000.0 // Convert ms to seconds
            delayNode.feedback = 0.0 // No feedback to prevent echo
            delayNode.wetDryMix = 100.0 // 100% wet (we don't want dry path)
            
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
            // Apply volume at mixer
            audioEngine.mainMixerNode.outputVolume = Float(dafConfig.volume)

            // Observe route changes to emit device events
            installRouteChangeObserver()
            
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
        removeRouteChangeObserver()
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
        
        if let volume = config["volume"] as? Double, let engine = audioEngine {
            engine.mainMixerNode.outputVolume = Float(volume)
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

// MARK: - Helpers

extension DAFModule {
    private func configureAudioSessionIfNeeded(_ session: AVAudioSession) throws {
        // Configure once or update safely
        try session.setCategory(.playAndRecord, mode: .voiceChat, options: [.allowBluetooth, .allowBluetoothA2DP])
        try session.setPreferredIOBufferDuration(0.005) // ~5ms
        try session.setActive(true, options: [])
    }
    
    private func installRouteChangeObserver() {
        removeRouteChangeObserver()
        routeObserver = NotificationCenter.default.addObserver(
            forName: AVAudioSession.routeChangeNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            guard let self = self else { return }
            let session = AVAudioSession.sharedInstance()
            let route = session.currentRoute
            var isHeadphoneConnected = false
            var deviceType = "unknown"
            var deviceName: String?
            for output in route.outputs {
                switch output.portType {
                case .headphones, .bluetoothA2DP, .bluetoothHFP, .bluetoothLE:
                    isHeadphoneConnected = true
                    deviceType = output.portType.rawValue
                    deviceName = output.portName
                default:
                    break
                }
            }
            let outputsInfo: [[String: Any]] = route.outputs.map { out in
                return [
                    "portType": out.portType.rawValue,
                    "portName": out.portName,
                    "uid": out.uid
                ]
            }
            let payload: [String: Any] = [
                "isHeadphoneConnected": isHeadphoneConnected,
                "deviceType": deviceType,
                "deviceName": deviceName ?? NSNull(),
                "outputs": outputsInfo
            ]
            NSLog("[DAF] routeChangeNotification outputs: \(outputsInfo)")
            self.sendEvent(withName: "audioDeviceChanged", body: payload)
        }
    }
    
    private func removeRouteChangeObserver() {
        if let obs = routeObserver {
            NotificationCenter.default.removeObserver(obs)
            routeObserver = nil
        }
    }
}
