import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

// --- Load your JSON word bank (replace path as needed) ---
import wordBankData from '@/assets/word-bank/word-bank.json';

export default function PracticeScreen() {
  const [wordBank, setWordBank] = useState<any[]>([]);
  const [currentWord, setCurrentWord] = useState<any | null>(null);
  const [showPinyin, setShowPinyin] = useState(false);

  useEffect(() => {
    // Initialize spaced repetition queue
    const words = wordBankData.map(w => ({
      ...w,
      score: 0, // lower = harder, higher = easier
    }));
    setWordBank(words);
    setCurrentWord(getNextWord(words));
  }, []);

  const getNextWord = (words: any[]) => {
    // Weighted selection: words with lower score have higher chance to appear
    const weights = words.map(w => 1 / (1 + Math.exp(w.score))); // logistic weighting
    const total = weights.reduce((a, b) => a + b, 0);
    const r = Math.random() * total;
    let sum = 0;
    for (let i = 0; i < words.length; i++) {
      sum += weights[i];
      if (r <= sum) return words[i];
    }
    return words[0];
  };

  const handleResponse = (difficulty: string) => {
    if (!currentWord) return;
    // Adjust score based on performance
    const newBank = wordBank.map(w => {
      if (w.simplified_chinese === currentWord["simplified_chinese"]) {
        let delta = 0;
        if (difficulty === '简单') delta = 1.0;
        else if (difficulty === '普通') delta = 0.3;
        else if (difficulty === '困难') delta = -0.7;
        else if (difficulty === '不知道') delta = -1.0;
        return { ...w, score: Math.max(-3, Math.min(3, w.score + delta)) };
      }
      return w;
    });

    setWordBank(newBank);
    setShowPinyin(false);
    setCurrentWord(getNextWord(newBank));
  };

  const handleReveal = () => setShowPinyin(!showPinyin);
  const handleExit = () => router.back();

  if (!currentWord) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Flashcard */}
      <ThemedView style={styles.flashcardContainer}>
        <ThemedText style={styles.flashcardText}>
          {currentWord["simplified_chinese"]}
        </ThemedText>
        {showPinyin && (
          <ThemedText style={styles.pinyinText}>
            {currentWord.pinyin}
          </ThemedText>
        )}
      </ThemedView>

      {/* Reveal Button */}
      <TouchableOpacity onPress={handleReveal} style={styles.revealButton}>
        <ThemedText style={styles.revealButtonText}>
          {showPinyin ? '隐藏拼音' : '显示拼音'}
        </ThemedText>
      </TouchableOpacity>

      {/* Difficulty Buttons */}
      <View style={styles.buttonGroup}>
        {['简单', '普通', '困难', '不知道'].map((label, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.difficultyButton,
              label === '简单' && styles.easy,
              label === '普通' && styles.medium,
              label === '困难' && styles.hard,
              label === '不知道' && styles.unknown,
            ]}
            onPress={() => handleResponse(label)}
          >
            <ThemedText style={styles.difficultyText}>{label}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: { width: 40 },

  flashcardContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    marginTop: 40,
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashcardText: {
    fontSize: 60,
    fontWeight: '700',
    color: '#000',
    paddingVertical: 30,
  },
  pinyinText: {
    marginTop: 12,
    fontSize: 22,
    color: '#444',
  },
  revealButton: {
    marginTop: 30,
    alignSelf: 'center',
    backgroundColor: '#E8F0FE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  revealButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGroup: {
    marginTop: 50,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flexBasis: '48%',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  easy: { backgroundColor: '#E8F5E8' },
  medium: { backgroundColor: '#FFF3CD' },
  hard: { backgroundColor: '#F8D7DA' },
  unknown: { backgroundColor: '#E0E0E0' },
  difficultyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
