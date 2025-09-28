package com.capella.daf;

import javax.naming.Context;
import javax.sound.sampled.AudioFormat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.AudioRecord;
import android.media.AudioTrack;
import android.media.MediaRecorder;
import androidx.core.app.ActivityCompat;

public class DAFModule extends ReactContextBaseJavaModule {
    
    // Audio configuration
    private static final int SAMPLE_RATE = 44100;
    private static final int CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO;
    private static final int AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT;
    private static final int BUFFER_SIZE = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT);
    private ReactApplicationContext reactContext;
    private AudioRecord audioRecord;
    private AudioTrack audioTrack;
    private boolean isRecording = false;
    private boolean isDAFActive = false;
    
    private Thread recordingThread;
    private int delayTime = 200; // milliseconds
    private int pitchShift = 0; // semitones
    private double volume = 0.8;
    
    public DAFModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }
    
    @Override
    public String getName() {
        return "DAFModule";
    }
    
    // Check if external headphones are connected
    @ReactMethod
    public void checkHeadphoneConnection(Promise promise) {
        try {
            AudioManager audioManager = (AudioManager) reactContext.getSystemService(Context.AUDIO_SERVICE);
            boolean isWiredHeadsetOn = audioManager.isWiredHeadsetOn();
            boolean isBluetoothA2dpOn = audioManager.isBluetoothA2dpOn();
            boolean isBluetoothScoOn = audioManager.isBluetoothScoOn();
            
            boolean isHeadphoneConnected = isWiredHeadsetOn || isBluetoothA2dpOn || isBluetoothScoOn;
            
            WritableMap deviceInfo = Arguments.createMap();
            deviceInfo.putBoolean("isHeadphoneConnected", isHeadphoneConnected);
            
            if (isWiredHeadsetOn) {
                deviceInfo.putString("deviceType", "headphone");
                deviceInfo.putString("deviceName", "Wired Headphones");
            } else if (isBluetoothA2dpOn || isBluetoothScoOn) {
                deviceInfo.putString("deviceType", "bluetooth");
                deviceInfo.putString("deviceName", "Bluetooth Headphones");
            } else {
                deviceInfo.putString("deviceType", "speaker");
            }
            
            promise.resolve(deviceInfo);
            
        } catch (Exception e) {
            promise.reject("AUDIO_ERROR", "Failed to check headphone connection: " + e.getMessage(), e);
        }
    }
    
    // Request audio permissions
    @ReactMethod
    public void requestAudioPermissions(Promise promise) {
        if (ActivityCompat.checkSelfPermission(reactContext, Manifest.permission.RECORD_AUDIO) 
            == PackageManager.PERMISSION_GRANTED) {
            promise.resolve(true);
        } else {
            promise.resolve(false);
        }
    }
    
    // Initialize DAF with configuration
    @ReactMethod
    public void initializeDAF(WritableMap config, Promise promise) {
        try {
            delayTime = config.hasKey("delayTime") ? config.getInt("delayTime") : 200;
            pitchShift = config.hasKey("pitchShift") ? config.getInt("pitchShift") : 0;
            volume = config.hasKey("volume") ? config.getDouble("volume") : 0.8;
            
            // Initialize audio record
            audioRecord = new AudioRecord(
                MediaRecorder.AudioSource.MIC,
                SAMPLE_RATE,
                CHANNEL_CONFIG,
                AUDIO_FORMAT,
                BUFFER_SIZE
            );
            
            // Initialize audio track
            audioTrack = new AudioTrack.Builder()
                .setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build())
                .setAudioFormat(new AudioFormat.Builder()
                    .setEncoding(AUDIO_FORMAT)
                    .setSampleRate(SAMPLE_RATE)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                    .build())
                .setBufferSizeInBytes(BUFFER_SIZE)
                .build();
            
            promise.resolve(true);
            
        } catch (Exception e) {
            promise.reject("DAF_ERROR", "Failed to initialize DAF: " + e.getMessage(), e);
        }
    }
    
    // Start DAF processing
    @ReactMethod
    public void startDAF(Promise promise) {
        try {
            if (audioRecord == null || audioTrack == null) {
                promise.reject("DAF_ERROR", "DAF not initialized", null);
                return;
            }
            
            audioRecord.startRecording();
            audioTrack.play();
            isDAFActive = true;
            
            // Start processing thread
            recordingThread = new Thread(new Runnable() {
                @Override
                public void run() {
                    processAudio();
                }
            });
            recordingThread.start();
            
            promise.resolve(true);
            
        } catch (Exception e) {
            promise.reject("DAF_ERROR", "Failed to start DAF: " + e.getMessage(), e);
        }
    }
    
    // Stop DAF processing
    @ReactMethod
    public void stopDAF(Promise promise) {
        try {
            isDAFActive = false;
            
            if (audioRecord != null) {
                audioRecord.stop();
            }
            
            if (audioTrack != null) {
                audioTrack.stop();
            }
            
            if (recordingThread != null) {
                recordingThread.interrupt();
            }
            
            promise.resolve(true);
            
        } catch (Exception e) {
            promise.reject("DAF_ERROR", "Failed to stop DAF: " + e.getMessage(), e);
        }
    }
    
    // Update DAF configuration
    @ReactMethod
    public void updateDAFConfig(WritableMap config, Promise promise) {
        try {
            if (config.hasKey("delayTime")) {
                delayTime = config.getInt("delayTime");
            }
            if (config.hasKey("pitchShift")) {
                pitchShift = config.getInt("pitchShift");
            }
            if (config.hasKey("volume")) {
                volume = config.getDouble("volume");
            }
            
            promise.resolve(true);
            
        } catch (Exception e) {
            promise.reject("DAF_ERROR", "Failed to update DAF config: " + e.getMessage(), e);
        }
    }
    
    // Check if DAF is currently active
    @ReactMethod
    public void isDAFActive(Promise promise) {
        promise.resolve(isDAFActive);
    }
    
    // Get current audio device info
    @ReactMethod
    public void getCurrentAudioDevice(Promise promise) {
        checkHeadphoneConnection(promise);
    }
    
    // Audio processing method
    private void processAudio() {
        short[] buffer = new short[BUFFER_SIZE];
        short[] delayedBuffer = new short[BUFFER_SIZE];
        
        // Calculate delay in samples
        int delaySamples = (int) (delayTime * SAMPLE_RATE / 1000.0);
        
        while (isDAFActive && !Thread.currentThread().isInterrupted()) {
            try {
                int bytesRead = audioRecord.read(buffer, 0, BUFFER_SIZE);
                
                if (bytesRead > 0) {
                    // Apply delay
                    System.arraycopy(buffer, 0, delayedBuffer, delaySamples, 
                                   Math.min(bytesRead, BUFFER_SIZE - delaySamples));
                    
                    // Apply pitch shift (simplified - would need more complex algorithm)
                    applyPitchShift(delayedBuffer, bytesRead);
                    
                    // Apply volume
                    applyVolume(delayedBuffer, bytesRead);
                    
                    // Write to output
                    audioTrack.write(delayedBuffer, 0, bytesRead);
                }
                
            } catch (Exception e) {
                e.printStackTrace();
                break;
            }
        }
    }
    
    // Apply pitch shift (simplified implementation)
    private void applyPitchShift(short[] buffer, int length) {
        // This is a simplified pitch shift implementation
        // A real implementation would use more sophisticated algorithms
        if (pitchShift != 0) {
            for (int i = 0; i < length; i++) {
                buffer[i] = (short) (buffer[i] * (1.0 + pitchShift * 0.1));
            }
        }
    }
    
    // Apply volume
    private void applyVolume(short[] buffer, int length) {
        for (int i = 0; i < length; i++) {
            buffer[i] = (short) (buffer[i] * volume);
        }
    }
}
