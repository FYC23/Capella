import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ResourcesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const resources = [
    {
      id: 1,
      title: t('resources.speechTechniques'),
      description: t('resources.speechTechniquesDesc'),
      icon: 'doc.text.fill',
      color: '#D1D1D6',
    },
    {
      id: 2,
      title: t('resources.practiceGuides'),
      description: t('resources.practiceGuidesDesc'),
      icon: 'play.circle.fill',
      color: '#D1D1D6',
    },
    {
      id: 3,
      title: t('resources.researchArticles'),
      description: t('resources.researchArticlesDesc'),
      icon: 'link.circle.fill',
      color: '#D1D1D6',
    },
    {
      id: 4,
      title: t('resources.supportCommunity'),
      description: t('resources.supportCommunityDesc'),
      icon: 'person.3.fill',
      color: '#D1D1D6',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>{t('resources.title')}</ThemedText>
          <ThemedText style={styles.subtitle}>
            {t('resources.subtitle')}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.resourcesContainer}>
          {resources.map((resource) => (
            <TouchableOpacity
              key={resource.id}
              style={styles.resourceCard}
              activeOpacity={0.7}
              onPress={() => {
                if (resource.id === 1) {
                  router.push('/(tabs)/resources/education');
                }
                else if (resource.id === 2) {
                  router.push('/(tabs)/resources/awareness');
                }
                else if (resource.id === 3) {
                  router.push('/(tabs)/resources/professional-help');
                }
                else if (resource.id === 4) {
                  router.push('/(tabs)/resources/community');
                }
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: resource.color }]}>
                <IconSymbol name="house.fill" size={24} color="white" />
              </View>
              <View style={styles.resourceContent}>
                <ThemedText type="defaultSemiBold" style={styles.resourceTitle}>
                  {resource.title}
                </ThemedText>
                <ThemedText style={styles.resourceDescription}>
                  {resource.description}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#D1D1D6" />
            </TouchableOpacity>
          ))}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t('resources.supportHelp')}
          </ThemedText>
          <TouchableOpacity style={styles.linkButton}>
            <IconSymbol name="questionmark.circle.fill" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>{t('resources.practiceTips')}</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton}>
            <IconSymbol name="envelope.fill" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>{t('resources.getHelp')}</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
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
  resourcesContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000000',
  },
  resourceDescription: {
    fontSize: 15,
    color: '#000000',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000000',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  linkText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    marginLeft: 12,
    color: '#000000',
  },
});
