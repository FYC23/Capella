# Delayed Auditory Feedback (DAF) Implementation

This document explains how to implement the native Delayed Auditory Feedback functionality for the Capella speech therapy app.

## Overview

The DAF feature provides delayed auditory feedback to help users improve their speech fluency. The implementation consists of:

1. **React Native Bridge**: TypeScript interface and mock implementation for development
2. **Native iOS Implementation**: Swift code using AVAudioEngine
3. **Native Android Implementation**: Java code using AudioRecord and AudioTrack

## Key Features

- **Headphone Detection**: Ensures external headphones are connected before starting DAF
- **Audio Permissions**: Handles microphone permissions properly
- **Real-time Processing**: Low-latency audio processing with configurable delay and pitch shift
- **Error Handling**: Comprehensive error handling and user feedback

## Implementation Steps

### 1. React Native Setup

The React Native side is already implemented with:
- `native-modules/DAFModule.ts` - TypeScript interface and mock implementation
- `hooks/use-daf.ts` - Custom hook for DAF functionality
- `app/delayed-feedback.tsx` - Updated UI component

### 2. iOS Implementation

1. **Add the Swift file** to your iOS project:
   - Copy `native-examples/DAFModule.swift` to your iOS project
   - Add it to your Xcode project

2. **Update iOS Bridge**:
   ```swift
   // In your AppDelegate or main iOS file
   import DAFModule
   ```

3. **Configure Audio Session**:
   The implementation automatically configures the audio session for recording and playback.

### 3. Android Implementation

1. **Add the Java file** to your Android project:
   - Copy `native-examples/DAFModule.java` to `android/app/src/main/java/com/capella/daf/`
   - Update the package name to match your app

2. **Update MainApplication.java**:
   ```java
   import com.capella.daf.DAFModule;
   
   @Override
   protected List<ReactPackage> getPackages() {
       return Arrays.<ReactPackage>asList(
           new MainReactPackage(),
           new DAFModulePackage() // Add this
       );
   }
   ```

3. **Create DAFModulePackage.java**:
   ```java
   package com.capella.daf;
   
   import com.facebook.react.ReactPackage;
   import com.facebook.react.bridge.NativeModule;
   import com.facebook.react.bridge.ReactApplicationContext;
   import com.facebook.react.uimanager.ViewManager;
   
   import java.util.Arrays;
   import java.util.Collections;
   import java.util.List;
   
   public class DAFModulePackage implements ReactPackage {
       @Override
       public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
           return Arrays.<NativeModule>asList(new DAFModule(reactContext));
       }
   
       @Override
       public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
           return Collections.emptyList();
       }
   }
   ```

### 4. Permissions

The app.json file has been updated with the necessary permissions:

**iOS**:
- `NSMicrophoneUsageDescription` - Microphone access for DAF
- `NSCameraUsageDescription` - Camera access for video recording

**Android**:
- `RECORD_AUDIO` - Audio recording permission
- `MODIFY_AUDIO_SETTINGS` - Audio settings modification
- `BLUETOOTH` - Bluetooth headphone detection
- `BLUETOOTH_CONNECT` - Bluetooth connection management

## Usage

The DAF functionality is now integrated into the delayed-feedback screen:

1. **Headphone Detection**: The app automatically checks for external headphones
2. **Permission Handling**: Requests microphone permissions when needed
3. **DAF Controls**: Start/stop DAF with configurable delay and pitch settings
4. **Real-time Feedback**: Visual indicators show connection status and DAF state

## Configuration

The DAF system accepts the following configuration:

```typescript
interface DAFConfiguration {
  delayTime: number;    // Delay in milliseconds (50-500ms)
  pitchShift: number;   // Pitch shift in semitones (-12 to +12)
  volume: number;        // Volume level (0.0 to 1.0)
}
```

## Testing

During development, the mock implementation provides:
- Simulated headphone detection (70% chance of "connected")
- Mock permission granting
- Console logging of DAF operations

To test with real hardware:
1. Connect external headphones
2. Grant microphone permissions
3. Start DAF and speak into the microphone
4. You should hear your voice with the configured delay and pitch shift

## Troubleshooting

### Common Issues

1. **No Audio Output**: Ensure headphones are connected and DAF is active
2. **Permission Denied**: Check device settings for microphone permissions
3. **High Latency**: Reduce delay time or check device performance
4. **Audio Feedback**: Ensure headphones are properly connected (not speakers)

### Debug Information

The implementation includes comprehensive logging:
- Audio device changes
- DAF state changes
- Permission status changes
- Error messages with detailed descriptions

## Performance Considerations

- **Low Latency**: Optimized for real-time audio processing
- **Battery Usage**: Efficient audio processing to minimize battery drain
- **Memory Management**: Proper cleanup of audio resources
- **Thread Safety**: Audio processing runs on dedicated threads

## Future Enhancements

Potential improvements for future versions:
- Advanced pitch shifting algorithms
- Noise reduction and filtering
- Multiple delay presets
- Session recording and playback
- Integration with speech recognition for feedback analysis
