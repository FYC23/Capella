import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StoryChainScreen() {
  const { t } = useTranslation();
  const [storyText, setStoryText] = useState('');

  const handleBack = () => {
    router.back();
  };

  const promptWords = ['adventure', 'mountain', 'treasure'];

  const exampleStories = [
    {
      id: 1,
      words: ['forest', 'mystery', 'journey'],
      story: 'In the deep forest, a mysterious journey began when the old map was discovered.',
      difficulty: 'easy'
    },
    {
      id: 2,
      words: ['castle', 'dragon', 'princess'],
      story: 'The ancient castle stood tall as the brave knight approached to rescue the princess from the fierce dragon.',
      difficulty: 'medium'
    },
    {
      id: 3,
      words: ['space', 'alien', 'discovery'],
      story: 'The space explorer made an incredible discovery when encountering a friendly alien civilization.',
      difficulty: 'hard'
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>{t('home.storyChain')}</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.contentContainer}>
          <ThemedText style={styles.description}>
            {t('home.createStoriesUsingWords')}
          </ThemedText>

          <View style={styles.currentPromptContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Current Prompt</ThemedText>
            <View style={styles.wordsContainer}>
              {promptWords.map((word, index) => (
                <View key={index} style={styles.wordChip}>
                  <ThemedText style={styles.wordChipText}>{word}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.storyInputContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Your Story</ThemedText>
            <TextInput
              style={styles.storyInput}
              placeholder="Write your story using the words above..."
              placeholderTextColor="#8E8E93"
              value={storyText}
              onChangeText={setStoryText}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.examplesContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Example Stories</ThemedText>
            {exampleStories.map((example) => (
              <View key={example.id} style={styles.exampleCard}>
                <View style={styles.exampleWords}>
                  {example.words.map((word, index) => (
                    <View key={index} style={styles.exampleWordChip}>
                      <ThemedText style={styles.exampleWordText}>{word}</ThemedText>
                    </View>
                  ))}
                </View>
                <ThemedText style={styles.exampleStory}>{example.story}</ThemedText>
                <View style={[styles.difficultyBadge, 
                  example.difficulty === 'easy' ? styles.easyBadge :
                  example.difficulty === 'medium' ? styles.mediumBadge : styles.hardBadge
                ]}>
                  <ThemedText style={styles.difficultyText}>
                    {example.difficulty}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.submitButton}>
            <ThemedText style={styles.submitButtonText}>Submit Story</ThemedText>
            <IconSymbol name="paperplane.fill" size={20} color="white" />
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  description: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 24,
    lineHeight: 22,
  },
  currentPromptContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  wordChipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  storyInputContainer: {
    marginBottom: 24,
  },
  storyInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  examplesContainer: {
    marginBottom: 32,
  },
  exampleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  exampleWords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  exampleWordChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exampleWordText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '500',
  },
  exampleStory: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 8,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  easyBadge: {
    backgroundColor: '#E8F5E8',
  },
  mediumBadge: {
    backgroundColor: '#FFF3CD',
  },
  hardBadge: {
    backgroundColor: '#F8D7DA',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#000000',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
