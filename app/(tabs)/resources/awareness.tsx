import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const href = null;

export default function AwarenessScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const famousPeople = t('resources.awareness.famousPeopleList', { returnObjects: true }) as string[];
  const culturalAttitudes = t('resources.awareness.culturalAttitudesList', { returnObjects: true }) as string[];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/resources')} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>{t('resources.awareness.title')}</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('resources.awareness.overview')}</ThemedText>
          <ThemedView style={styles.card}>
            <ThemedText style={styles.body}>
              {t('resources.awareness.overviewBody')}
            </ThemedText>
          </ThemedView>
          <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://zhuanlan.zhihu.com/p/637629023')}>
            <IconSymbol name="text.quote" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>{t('resources.awareness.chinaDataLink')}</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('resources.awareness.personalStories')}</ThemedText>
          <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://www.mystutteringlife.com/')}>
            <IconSymbol name="text.quote" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>{t('resources.awareness.link_mystutteringlife')}</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://stuttertalk.com/')}>
            <IconSymbol name="text.quote" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>{t('resources.awareness.link_stuttertalk')}</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://www.stutteringsociety.com/category/stories/')}>
            <IconSymbol name="text.quote" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>{t('resources.awareness.link_stutteringsociety')}</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://say.org/mystutterblog/')}>
            <IconSymbol name="text.quote" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>{t('resources.awareness.link_say_storytelling')}</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('resources.awareness.famousPeople')}</ThemedText>
          <ThemedView style={styles.card}>
            {famousPeople.map((p, i) => (
              <ThemedText style={styles.body} key={i}>• {p}</ThemedText>
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('resources.awareness.culturalAttitudes')}</ThemedText>
          <ThemedView style={styles.card}>
            {culturalAttitudes.map((c, i) => (
              <ThemedText style={styles.body} key={i}>• {c}</ThemedText>
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('resources.awareness.pride')}</ThemedText>
          <ThemedView style={[styles.card, styles.callout]}>
            <IconSymbol name="megaphone.fill" size={20} color="#000000" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <ThemedText style={styles.body}>
                {t('resources.awareness.prideBody')}
              </ThemedText>
            </View>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('resources.awareness.additionalResources')}</ThemedText>
          <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://www.stutteringhelp.org')}>
            <IconSymbol name="link" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>{t('resources.awareness.link_stutteringhelp')}</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://westutter.org')}>
            <IconSymbol name="link" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>{t('resources.awareness.link_westutter')}</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://stamma.org')}>
            <IconSymbol name="link" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>{t('resources.awareness.link_stamma')}</ThemedText>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  headerBody: {
    paddingHorizontal: 20,
    paddingTop: 12,
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
  section: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000000',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 8,
  },
  callout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  body: {
    fontSize: 15,
    color: '#000000',
    marginBottom: 8,
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