import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLanguage } from '@/hooks/use-language';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
  ];
  
  const profileOptions = [
    {
      id: 1,
      title: t('profile.accountSettings'),
      icon: 'person.circle.fill',
      color: '#D1D1D6',
    },
    {
      id: 2,
      title: t('profile.notifications'),
      icon: 'bell.fill',
      color: '#D1D1D6',
    },
    {
      id: 3,
      title: t('profile.privacySecurity'),
      icon: 'lock.fill',
      color: '#D1D1D6',
    },
    {
      id: 4,
      title: t('profile.helpSupport'),
      icon: 'questionmark.circle.fill',
      color: '#D1D1D6',
    },
    {
      id: 5,
      title: t('profile.about'),
      icon: 'info.circle.fill',
      color: '#D1D1D6',
    },
  ];

  const handleLanguageSelect = async (languageCode: string) => {
    await changeLanguage(languageCode);
    setShowLanguageModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <IconSymbol name="person.fill" size={40} color="#8E8E93" />
            </View>
            <TouchableOpacity style={styles.editButton}>
              <IconSymbol name="camera.fill" size={16} color="#D1D1D6" />
            </TouchableOpacity>
          </View>
          <ThemedText type="title" style={styles.name}>{t('profile.name')}</ThemedText>
          <ThemedText style={styles.email}>{t('profile.email')}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>24</ThemedText>
            <ThemedText style={styles.statLabel}>{t('profile.projects')}</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>156</ThemedText>
            <ThemedText style={styles.statLabel}>{t('profile.tasks')}</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>89%</ThemedText>
            <ThemedText style={styles.statLabel}>{t('profile.complete')}</ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => setShowLanguageModal(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#D1D1D6' }]}>
              <IconSymbol name="globe" size={20} color="white" />
            </View>
            <ThemedText style={styles.optionTitle}>{t('language.selectLanguage')}</ThemedText>
            <ThemedText style={styles.languageValue}>
              {currentLanguage === 'en' ? 'English' : '中文'}
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#D1D1D6" />
          </TouchableOpacity>
          
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                <IconSymbol name={option.icon as any} size={20} color="white" />
              </View>
              <ThemedText style={styles.optionTitle}>{option.title}</ThemedText>
              <IconSymbol name="chevron.right" size={16} color="#D1D1D6" />
            </TouchableOpacity>
          ))}
        </ThemedView>

        <TouchableOpacity style={styles.signOutButton}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#D1D1D6" />
          <ThemedText style={styles.signOutText}>{t('common.signOut')}</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                {t('language.selectLanguage')}
              </ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowLanguageModal(false)}
              >
                <IconSymbol name="xmark" size={20} color="#D1D1D6" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.languageList}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    currentLanguage === language.code && styles.selectedLanguage
                  ]}
                  onPress={() => handleLanguageSelect(language.code)}
                >
                  <ThemedText style={[
                    styles.languageOptionText,
                    currentLanguage === language.code && styles.selectedLanguageText
                  ]}>
                    {language.name}
                  </ThemedText>
                  {currentLanguage === language.code && (
                    <IconSymbol name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    color: '#000000',
  },
  email: {
    fontSize: 16,
    color: '#000000',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 30,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 8,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
  },
  languageValue: {
    fontSize: 16,
    color: '#8E8E93',
    marginRight: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#D1D1D6',
  },
  signOutText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '50%',
    width: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageList: {
    maxHeight: 300,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  selectedLanguage: {
    backgroundColor: '#F0F8FF',
  },
  languageOptionText: {
    fontSize: 17,
    color: '#000000',
  },
  selectedLanguageText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
