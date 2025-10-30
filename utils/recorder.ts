import { Audio, AVPlaybackStatus } from 'expo-av';

export type RecordingSession = {
  stop: () => Promise<{ uri: string | null }>;
  getPeak: () => number;
};

export async function startRecording(): Promise<RecordingSession> {
  const { granted } = await Audio.requestPermissionsAsync();
  if (!granted) throw new Error('Microphone permission not granted');

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    shouldDuckAndroid: true,
    interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    playThroughEarpieceAndroid: false,
  });

  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  await recording.startAsync();

  let peak = 0;
  const sub = recording.setOnRecordingStatusUpdate((status: any) => {
    if (status?.metering) {
      // metering is platform dependent; fallback to duration-based pseudo meter
      const level = Math.max(0, Math.min(1, (status.metering + 160) / 160));
      peak = Math.max(peak, level);
    } else if (typeof status?.durationMillis === 'number') {
      const phase = (status.durationMillis % 1000) / 1000;
      const pseudo = Math.sin(phase * Math.PI);
      peak = Math.max(peak, pseudo);
    }
  });

  return {
    async stop() {
      try {
        await recording.stopAndUnloadAsync();
        sub && recording.setOnRecordingStatusUpdate(null as any);
        const uri = recording.getURI();
        return { uri: uri || null };
      } finally {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      }
    },
    getPeak() { return peak; },
  };
}


