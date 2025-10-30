import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

export type TtsVoice = {
  identifier?: string;
  name?: string;
  language?: string;
};

export type SpeakOptions = {
  voice?: string; // identifier
  language?: string;
  rate?: number; // 0.1 - 1.0 on native
  pitch?: number; // 0.5 - 2.0 on native
  volume?: number; // 0.0 - 1.0
  onDone?: () => void;
  onStart?: () => void;
  onError?: (e: any) => void;
};

let isCurrentlySpeaking = false;

export async function getAvailableVoices(): Promise<TtsVoice[]> {
  if (Platform.OS === 'web') {
    const synth = (globalThis as any).speechSynthesis as SpeechSynthesis | undefined;
    if (!synth) return [];
    const voices = synth.getVoices();
    // Some browsers return empty until async; try lazy warmup
    if (!voices || voices.length === 0) {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => resolve(), 200);
        synth.onvoiceschanged = () => {
          clearTimeout(timer);
          resolve();
        };
      });
    }
    const final = synth.getVoices() || [];
    return final.map(v => ({ identifier: v.voiceURI, name: v.name, language: v.lang }));
  }
  const nativeVoices = await Speech.getAvailableVoicesAsync();
  return (nativeVoices || []).map(v => ({ identifier: v.identifier, name: v.name, language: v.language }));
}

export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!text || text.trim().length === 0) return;

  if (Platform.OS === 'web') {
    const synth = (globalThis as any).speechSynthesis as SpeechSynthesis | undefined;
    if (!synth) {
      opts.onError?.(new Error('Web Speech Synthesis not supported'));
      return;
    }
    await stop();
    const utter = new SpeechSynthesisUtterance(text);
    if (opts.language) utter.lang = opts.language;
    if (typeof opts.rate === 'number') utter.rate = Math.max(0.5, Math.min(1.5, opts.rate));
    if (typeof opts.pitch === 'number') utter.pitch = Math.max(0.5, Math.min(2.0, opts.pitch));
    if (typeof opts.volume === 'number') utter.volume = Math.max(0.0, Math.min(1.0, opts.volume));
    if (opts.voice) {
      const voices = synth.getVoices();
      const v = voices.find(v => v.voiceURI === opts.voice || v.name === opts.voice);
      if (v) utter.voice = v;
    }
    isCurrentlySpeaking = true;
    opts.onStart?.();
    utter.onend = () => { isCurrentlySpeaking = false; opts.onDone?.(); };
    utter.onerror = (e) => { isCurrentlySpeaking = false; opts.onError?.(e); };
    synth.speak(utter);
    return;
  }

  await stop();
  isCurrentlySpeaking = true;
  opts.onStart?.();
  return new Promise<void>(async (resolve) => {
    try {
      // Improve iOS reliability (play even with silent switch)
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    } catch {}
    const isIOS = Platform.OS === 'ios';
    const nativeRate = typeof opts.rate === 'number' ? Math.max(0.5, Math.min(1.2, opts.rate)) : undefined;
    const nativePitch = typeof opts.pitch === 'number' ? Math.max(0.5, Math.min(2.0, opts.pitch)) : undefined;
    const nativeVolume = typeof opts.volume === 'number' ? Math.max(0.0, Math.min(1.0, opts.volume)) : undefined;
    Speech.speak(text, {
      voice: isIOS ? undefined : opts.voice, // let iOS pick a compatible default
      language: opts.language,
      rate: nativeRate,
      pitch: nativePitch,
      volume: nativeVolume,
      onDone: () => { isCurrentlySpeaking = false; opts.onDone?.(); resolve(); },
      onStopped: () => { isCurrentlySpeaking = false; resolve(); },
      onError: (e) => { isCurrentlySpeaking = false; opts.onError?.(e); resolve(); },
    } as any);
  });
}

export async function stop(): Promise<void> {
  if (Platform.OS === 'web') {
    const synth = (globalThis as any).speechSynthesis as SpeechSynthesis | undefined;
    if (synth && synth.speaking) synth.cancel();
    isCurrentlySpeaking = false;
    return;
  }
  try {
    Speech.stop();
  } finally {
    isCurrentlySpeaking = false;
  }
}

export function isSpeaking(): boolean {
  if (Platform.OS === 'web') {
    const synth = (globalThis as any).speechSynthesis as SpeechSynthesis | undefined;
    return !!(synth && synth.speaking);
  }
  return isCurrentlySpeaking;
}


