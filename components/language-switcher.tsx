import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLanguage } from '@/hooks/use-language';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface LanguageSwitcherProps {
  style?: any;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ style }) => {
  const { currentLanguage, changeLanguage, isChangingLanguage } = useLanguage();
  const { t } = useTranslation();

  const toggleLanguage = async () => {
    const newLanguage = currentLanguage === 'en' ? 'zh' : 'en';
    await changeLanguage(newLanguage);
  };

  const getLanguageDisplay = () => {
    return currentLanguage === 'en' ? t('language.chinese') : t('language.english');
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={toggleLanguage}
      disabled={isChangingLanguage}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <IconSymbol name="globe" size={20} color="#D1D1D6" />
        <ThemedText style={styles.text}>{getLanguageDisplay()}</ThemedText>
        <IconSymbol name="chevron.right" size={16} color="#C7C7CC" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    marginLeft: 12,
    color: '#000000',
  },
});
