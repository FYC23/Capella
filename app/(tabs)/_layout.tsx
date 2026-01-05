import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#D1D1D6',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingTop: 8,
          paddingBottom: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: t('tabs.resources'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />
      {/** Hide nested awareness route from the tab bar */}
      <Tabs.Screen
        name="resources/education"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="resources/awareness"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="resources/professional-help"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="resources/community"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="metronome"
        options={{
          title: t('tabs.metronome'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="dot.radiowaves.left.and.right" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
