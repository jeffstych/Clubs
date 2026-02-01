import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';

export const unstable_settings = {
  anchor: '(tabs)',
  initialRouteName: 'explore',
};
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} colorScheme={colorScheme} />}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="globe" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-clubs"
        options={{
          title: 'My Clubs',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ask"
        options={{
          title: 'Ask',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message" color={color} />,
        }}
      />
    </Tabs>

  );

}

function CustomTabBar({ state, descriptors, navigation, colorScheme }: { state: any, descriptors: any, navigation: any, colorScheme: 'light' | 'dark' | null | undefined }) {
  const insets = useSafeAreaInsets();
  const themeColors = Colors[colorScheme ?? 'light'];

  // Define icons mapping for safety
  const iconMap: Record<string, string> = {
    'explore': 'globe',
    'my-clubs': 'list.bullet',
    'calendar': 'calendar',
    'profile': 'person.fill',
    'ask': 'message',
  };

  const visibleRoutes = state.routes.filter((route: any) => {
    const { options } = descriptors[route.key];
    return options.href !== null;
  });

  const mainRoutes = visibleRoutes.filter((r: any) => r.name !== 'ask');
  const askRoute = visibleRoutes.find((r: any) => r.name === 'ask');

  const renderTab = (route: any, isMain: boolean) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === state.routes.indexOf(route);
    const label = options.title !== undefined ? options.title : route.name;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        style={[styles.tabItem, !isMain && styles.askTabItem]}
        activeOpacity={0.7}
      >
        <IconSymbol
          size={24}
          name={iconMap[route.name] as any || 'questionmark'}
          color={isFocused ? themeColors.tint : '#8E8E93'}
        />
        <ThemedText style={[styles.tabLabel, { color: isFocused ? themeColors.tint : '#8E8E93' }]}>
          {label}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
      <View style={styles.mainBubble}>
        {mainRoutes.map(route => renderTab(route, true))}
      </View>
      {askRoute && (
        <View style={styles.askBubble}>
          {renderTab(askRoute, false)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  mainBubble: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 22, 23, 0.9)',
    borderRadius: 35,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  askBubble: {
    backgroundColor: 'rgba(20, 22, 23, 0.9)',
    borderRadius: 35,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    minWidth: 70,
  },
  askTabItem: {
    minWidth: 60,
    paddingHorizontal: 5,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
});
