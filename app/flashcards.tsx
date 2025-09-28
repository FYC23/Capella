import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FlashcardsScreen() {
  const { t } = useTranslation();

  const handleBack = () => {
    router.back();
  };

  const wordBank = [
    { word: 'apple', difficulty: 'easy' },
    { word: 'beautiful', difficulty: 'medium' },
    { word: 'extraordinary', difficulty: 'hard' },
    { word: 'communication', difficulty: 'medium' },
    { word: 'serendipity', difficulty: 'hard' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>{t('home.flashcards')}</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.contentContainer}>
          <ThemedText style={styles.description}>
            {t('home.practiceWithRandomWords')}
          </ThemedText>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>24</ThemedText>
              <ThemedText style={styles.statLabel}>Words Practiced</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>85%</ThemedText>
              <ThemedText style={styles.statLabel}>Accuracy</ThemedText>
            </View>
          </View>

          <View style={styles.wordBankContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Word Bank</ThemedText>
            {wordBank.map((item, index) => (
              <View key={index} style={styles.wordItem}>
                <View style={styles.wordContent}>
                  <ThemedText type="defaultSemiBold" style={styles.wordText}>
                    {item.word}
                  </ThemedText>
                  <View style={[styles.difficultyBadge, 
                    item.difficulty === 'easy' ? styles.easyBadge :
                    item.difficulty === 'medium' ? styles.mediumBadge : styles.hardBadge
                  ]}>
                    <ThemedText style={styles.difficultyText}>
                      {item.difficulty}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.startButton}>
            <ThemedText style={styles.startButtonText}>Start Practice</ThemedText>
            <IconSymbol name="play.fill" size={20} color="white" />
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    textAlign: 'center',
  },
  wordBankContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000000',
  },
  wordItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  wordContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  startButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
