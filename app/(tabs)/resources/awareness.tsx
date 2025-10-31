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
              Stuttering Pride reframes stuttering from something to be hidden or “fixed” into a natural variation in human speech. It encourages advocacy and asking for needs, supporting mutual respect in communication.
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('resources.awareness.personalStories')}</ThemedText>
          <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://www.mystutteringlife.com/')}> 
            <IconSymbol name="text.quote" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>My Stuttering Life</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://stuttertalk.com/')}> 
            <IconSymbol name="text.quote" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>StutterTalk</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://www.stutteringsociety.com/category/stories/')}> 
            <IconSymbol name="text.quote" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>The Stuttering Society</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://say.org/mystutterblog/')}> 
            <IconSymbol name="text.quote" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>SAY – Storytelling Projects</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('resources.awareness.famousPeople')}</ThemedText>
          <ThemedView style={styles.card}>
            <ThemedText style={styles.body}>• Emily Blunt — Actor</ThemedText>
            <ThemedText style={styles.body}>• James Earl Jones — Actor & Voice Icon</ThemedText>
            <ThemedText style={styles.body}>• President Joe Biden</ThemedText>
            <ThemedText style={styles.body}>• Samuel L. Jackson — Actor</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('resources.awareness.culturalAttitudes')}</ThemedText>
          <ThemedView style={styles.card}>
            <ThemedText style={styles.body}>• Western countries (US/Canada/UK): Growing awareness through advocacy and education; stigma may persist in formal settings.</ThemedText>
            <ThemedText style={styles.body}>• East Asia (China/Japan/Korea): Emphasis on fluent, fast speech can increase pressure on people who stutter.</ThemedText>
            <ThemedText style={styles.body}>• Middle Eastern & South Asian regions: Misunderstandings may frame stuttering as nervousness or lack of confidence.</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('resources.awareness.pride')}</ThemedText>
          <ThemedView style={[styles.card, styles.callout]}> 
            <IconSymbol name="megaphone.fill" size={20} color="#000000" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <ThemedText style={styles.body}>
                Stuttering Pride is a movement that reframes stuttering from something to be hidden or "fixed" into a natural variation in human speech. It encourages individuals to speak up about their needs, whether that means asking for patience, requesting extra time in conversations, or choosing not to hide moments of disfluency. Advocacy strengthens confidence and supports mutual respect in communication.
              </ThemedText>
            </View>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('resources.awareness.additionalResources')}</ThemedText>
          <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://www.stutteringhelp.org')}> 
            <IconSymbol name="link" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>Stuttering Foundation — stutteringhelp.org</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://westutter.org')}> 
            <IconSymbol name="link" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>National Stuttering Association — westutter.org</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://stamma.org')}> 
            <IconSymbol name="link" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>STAMMA — stamma.org</ThemedText>
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


