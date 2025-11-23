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
          <ThemedText type="title" style={styles.headerTitle}>{t('resources.community.title')}</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('resources.community.communityGroups')}</ThemedText>
          <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://speechearing.org/')}>
            <IconSymbol name="text.quote" size={20} color="#D1D1D6" />
            <ThemedText style={styles.linkText}>{t('resources.community.link1')}</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

/* styles kept consistent */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#000000' },
  placeholder: { width: 40 },
  section: { paddingHorizontal: 20, marginTop: 30 },
  sectionTitle: { fontSize: 22, fontWeight: '600', marginBottom: 16, color: '#000000' },
  linkButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#F2F2F7' },
  linkText: { flex: 1, fontSize: 17, fontWeight: '500', marginLeft: 12, color: '#000000' },
});