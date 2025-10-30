import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { incrementRating } from '@/utils/usageStats';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


// --- Load your JSON word bank (replace path as needed) ---
import wordBankData from '@/assets/word-bank/word-bank.json';

export default function PracticeScreen() {
  const { t } = useTranslation();
  
  const [wordBank, setWordBank] = useState<any[]>([]);
  const [currentWord, setCurrentWord] = useState<any | null>(null);
  const [isPinyinShown, setShowPinyin] = useState(false);
  
  const handleBack = () => {
    router.back();
  };

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

  const handleResponse = async (difficulty: string) => {
    if (!currentWord) return;
    // Adjust score based on performance
    await incrementRating('flashcards');
    const newBank = wordBank.map(w => {
      if (w.simplified_chinese === currentWord["simplified_chinese"]) {
        let delta = 0;
        if (difficulty === t('difficulty.easy')) delta = 1.0;
        else if (difficulty === t('difficulty.medium')) delta = 0.3;
        else if (difficulty === t('difficulty.hard')) delta = -0.7;
        else if (difficulty === t('difficulty.doNotKnow')) delta = -1.0;
        return { ...w, score: Math.max(-3, Math.min(3, w.score + delta)) };
      }
      return w;
    });

    setWordBank(newBank);
    setShowPinyin(false);
    setCurrentWord(getNextWord(newBank));
  };

  const handleReveal = () => setShowPinyin(!isPinyinShown);

  if (!currentWord) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>{t('home.flashcards')}</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ThemedView style={styles.contentContainer}>
        {/* Flashcard */}
        <ThemedText style={styles.description}>
          {t('home.practiceWithRandomWords')}
        </ThemedText>
        <ThemedView style={styles.flashcardContainer}>
          <ThemedText style={styles.flashcardText}>
            {currentWord["simplified_chinese"]}
          </ThemedText>
          {isPinyinShown && (
            <ThemedText style={styles.pinyinText}>
              {currentWord.pinyin}
            </ThemedText>
          )}
        </ThemedView>

        {/* Reveal Button */}
        <TouchableOpacity onPress={handleReveal} style={styles.revealButton}>
          <ThemedText style={styles.revealButtonText}>
            {isPinyinShown ? t('flashcards.hidePinyin') : t('flashcards.showPinyin')}
          </ThemedText>
        </TouchableOpacity>

        {/* Difficulty Buttons */}
        <View style={styles.buttonGroup}>
          {[t('difficulty.easy'), t('difficulty.medium'), t('difficulty.hard'), t('difficulty.doNotKnow')].map((label, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.difficultyButton,
                label === t('difficulty.easy') && styles.easy,
                label === t('difficulty.medium') && styles.medium,
                label === t('difficulty.hard') && styles.hard,
                label === t('difficulty.doNotKnow') && styles.unknown,
              ]}
              onPress={() => handleResponse(label)}
            >
              <ThemedText style={styles.difficultyText}>{label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
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
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flex: 1,
  },

  
  description: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 24,
    lineHeight: 22,
  },

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
