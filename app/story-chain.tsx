// app/story-chain.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import wordBankData from '@/assets/word-bank/word-bank.json';

// ---- Types (lightweight to keep keys with hyphens) ----
type WordItem = {
  level: number;
  ['traditional_chinese']: string;
  ['simplified_chinese']: string;
  pinyin: string;
  score?: number; // dynamic field added at runtime
};

export default function StoryChainScreen() {
  const { t } = useTranslation();

  const [bank, setBank] = useState<WordItem[]>([]);
  const [promptWords, setPromptWords] = useState<WordItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // simple timer for the recording UI (no real audio)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // initialize bank with score=0 for SRS
  useEffect(() => {
    const init = (wordBankData as WordItem[]).map((w) => ({ ...w, score: 0 }));
    setBank(init);
    setPromptWords(pickPrompt(init, 3));
  }, []);

  // --------- SRS helpers ----------
  // weight: lower score => higher weight; clamp scores to [-3, 3]
  const weightOf = (w: WordItem) => 1 / (1 + Math.exp(Math.max(-3, Math.min(3, w.score ?? 0))));
  // sample without replacement by weights
  const pickPrompt = (pool: WordItem[], n: number): WordItem[] => {
    const selected: WordItem[] = [];
    const used = new Set<number>();
    for (let k = 0; k < Math.min(n, pool.length); k++) {
      const weights = pool.map((w, i) => (used.has(i) ? 0 : weightOf(w)));
      const total = weights.reduce((a, b) => a + b, 0);
      if (total <= 0) break;
      let r = Math.random() * total;
      let idx = 0;
      for (; idx < weights.length; idx++) {
        r -= weights[idx];
        if (r <= 0) break;
      }
      used.add(idx);
      selected.push(pool[idx]);
    }
    return selected;
  };

  const nextPrompt = (updated: WordItem[]) => {
    setBank(updated);
    setPromptWords(pickPrompt(updated, 3));
    setIsRecording(false);
    setElapsed(0);
  };

  // --------- UI handlers ----------
  const handleBack = () => router.back();

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
    // purely UI; no actual audio capture
  };

  // Adjust score based on performance
  const handleResponse = (difficulty: string) => {
    const ids = new Set(promptWords.map((w) => w['simplified_chinese']));
    const updated = bank.map(w => {
      if (ids.has(w['simplified_chinese'])) {
        let delta = 0;
        if (difficulty === t('difficulty.easy')) delta = 1.0;
        else if (difficulty === t('difficulty.medium')) delta = 0.3;
        else if (difficulty === t('difficulty.hard')) delta = -0.7;
        else if (difficulty === t('difficulty.doNotKnow')) delta = -1.0;
        return { ...w, score: Math.max(-3, Math.min(3, (w.score ?? 0) + delta)) };
      }
      return w;
    });

    nextPrompt(updated);
  };

  // small helper for mm:ss
  const timeLabel = useMemo(() => {
    const m = Math.floor(elapsed / 60)
      .toString()
      .padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [elapsed]);

  // guard
  if (!promptWords.length) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>{t('storyChain.title')}</ThemedText>
          <View style={styles.placeholder} />
        </View>
        <View style={[styles.center, { padding: 24 }]}>
          <ThemedText>{t('storyChain.loading')}</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>{t('storyChain.title')}</ThemedText>
        <View style={styles.placeholder} />
      </View>

      {/* Prompt words */}
      <ThemedView style={styles.content}>
        <ThemedText style={styles.instructions}>
          {t('storyChain.instructions')}
        </ThemedText>

        <View style={styles.wordsRow}>
          {promptWords.map((w, i) => (
            <View key={i} style={styles.wordChip}>
              <ThemedText style={styles.wordChipText}>{w['simplified_chinese']}</ThemedText>
            </View>
          ))}
        </View>

        {/* Recording UI (no actual audio) */}
        <View style={styles.recorderCard}>
          <View style={styles.timerRow}>
            <IconSymbol name={isRecording ? 'record.circle.fill' : 'mic'} size={22} color={isRecording ? '#D32F2F' : '#007AFF'} />
            <ThemedText style={[styles.timerText, isRecording && { color: '#D32F2F' }]}>{timeLabel}</ThemedText>
          </View>

          <TouchableOpacity
            onPress={toggleRecording}
            activeOpacity={0.9}
            style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
          >
            <IconSymbol name={isRecording ? 'stop.fill' : 'mic.fill'} size={28} color="#FFFFFF" />
            <ThemedText style={styles.recordBtnText}>{isRecording ? t("storyChain.stopRecording") : t("storyChain.startRecording")}</ThemedText>
          </TouchableOpacity>

          {/* Optional: a skip button to get a new set of words without rating */}
          <TouchableOpacity onPress={() => nextPrompt(bank)} style={styles.skipBtn}>
            <ThemedText style={styles.skipBtnText}>{t("storyChain.changeWords")}</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Difficulty feedback */}
        <ThemedText style={[styles.instructions, { marginTop: 24 }]}>
          {t('storyChain.selectDifficultyDescriptions')}
        </ThemedText>

        <View style={styles.rateGrid}>
          {([t("difficulty.easy"), t("difficulty.medium"), t("difficulty.hard"), t("difficulty.noClue")] as const).map((label) => (
            <TouchableOpacity
              key={label}
              onPress={() => handleResponse(label)}
              style={[
                styles.rateBtn,
                label === t("difficulty.easy") && styles.easy,
                label === t("difficulty.medium") && styles.medium,
                label === t("difficulty.hard") && styles.hard,
                label === t("difficulty.noClue") && styles.unknown,
              ]}
            >
              <ThemedText style={styles.rateBtnText}>{label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: { padding: 8 },
  title: { fontSize: 20, fontWeight: '600', color: '#000000' },
  placeholder: { width: 40 },

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  instructions: { fontSize: 16, color: '#000', lineHeight: 22 },

  wordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    marginBottom: 18,
  },
  wordChip: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  wordChipText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  recorderCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  timerText: { fontSize: 16, color: '#111', fontWeight: '600' },

  recordBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  recordBtnActive: { backgroundColor: '#D32F2F' },
  recordBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  skipBtn: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#E8F0FE',
  },
  skipBtnText: { color: '#007AFF', fontSize: 14, fontWeight: '600' },

  rateGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  rateBtn: {
    flexBasis: '48%',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  easy: { backgroundColor: '#E8F5E8' },
  medium: { backgroundColor: '#FFF3CD' },
  hard: { backgroundColor: '#F8D7DA' },
  unknown: { backgroundColor: '#E0E0E0' },
  rateBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },

  center: { alignItems: 'center', justifyContent: 'center' },
});
