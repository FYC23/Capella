import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { t } = useTranslation();
  
  const navigateToScreen = (screenName: string) => {
    router.push(`/${screenName}` as any);
  };
  
  const quickActions = [
    {
      id: 1,
      title: t('home.flashcards'),
      subtitle: t('home.usedHoursAgo', { hours: 2 }),
      icon: 'house.fill',
      color: '#D1D1D6',
      screen: 'flashcards',
    },
    {
      id: 2,
      title: t('home.storyChain'),
      subtitle: t('home.usedYesterday'),
      icon: 'book.fill',
      color: '#D1D1D6',
      screen: 'story-chain',
    },
    {
      id: 3,
      title: t('home.delayedFeedback'),
      subtitle: t('home.usedWeekAgo'),
      icon: 'person.fill',
      color: '#D1D1D6',
      screen: 'delayed-feedback',
    },
    {
      id: 4,
      title: t('home.pacedSpeaking'),
      subtitle: t('home.usedDaysAgo', { days: 3 }),
      icon: 'house.fill',
      color: '#D1D1D6',
      screen: 'paced-speaking',
    },
  ];

  const recentItems = [
    { id: 1, title: t('home.flashcards'), subtitle: t('home.practiceWithRandomWords'), icon: 'house.fill', screen: 'flashcards' },
    { id: 2, title: t('home.storyChain'), subtitle: t('home.createStoriesUsingWords'), icon: 'book.fill', screen: 'story-chain' },
    { id: 3, title: t('home.pacedSpeaking'), subtitle: t('home.rhythmBasedSpeaking'), icon: 'person.fill', screen: 'paced-speaking' },
    { id: 4, title: t('home.delayedFeedback'), subtitle: t('home.audioFeedbackTraining'), icon: 'house.fill', screen: 'delayed-feedback' },
    { id: 5, title: t('common.comingSoon'), subtitle: t('common.newToolsInDevelopment'), icon: 'house.fill' },
    { id: 6, title: t('common.comingSoon'), subtitle: t('common.newToolsInDevelopment'), icon: 'book.fill' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>{t('home.title')}</ThemedText>
          <ThemedText style={styles.subtitle}>
            {t('home.subtitle')}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.statsContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('home.todaysProgress')}</ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>12</ThemedText>
              <ThemedText style={styles.statLabel}>{t('home.sessionsFinished')}</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>3</ThemedText>
              <ThemedText style={styles.statLabel}>{t('home.gamesPlayed')}</ThemedText>
            </View>
          </View>
        </ThemedView>

        <ThemedView style={styles.quickActionsContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('home.recentPractice')}</ThemedText>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                activeOpacity={0.7}
                onPress={() => navigateToScreen(action.screen)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <IconSymbol name="house.fill" size={24} color="white" />
                </View>
                <ThemedText type="defaultSemiBold" style={styles.quickActionTitle}>
                  {action.title}
                </ThemedText>
                <ThemedText style={styles.quickActionSubtitle}>
                  {action.subtitle}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={styles.recentContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('home.allTools')}</ThemedText>
          {recentItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recentItem}
              activeOpacity={0.7}
              onPress={() => item.screen ? navigateToScreen(item.screen) : null}
            >
              <View style={styles.recentIcon}>
                <IconSymbol name="house.fill" size={20} color="#D1D1D6" />
              </View>
              <View style={styles.recentContent}>
                <ThemedText type="defaultSemiBold" style={styles.recentTitle}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.recentSubtitle}>
                  {item.subtitle}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#D1D1D6" />
            </TouchableOpacity>
          ))}
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000000',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    color: '#000000',
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: '#000000',
    textAlign: 'center',
  },
  recentContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
    color: '#000000',
  },
  recentSubtitle: {
    fontSize: 14,
    color: '#000000',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginHorizontal: 4,
    minHeight: 100,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    textAlign: 'center',
  },
});
