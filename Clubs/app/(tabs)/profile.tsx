import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ProfilePage() {
  // TODO: Replace with actual user data from Supabase
  const user = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@msu.edu',
    avatar_url: 'https://via.placeholder.com/150',
    bio: 'Computer Science student at MSU. Interested in AI and web development.',
    followingCount: 12,
  };

  const itemBg = useThemeColor({ light: '#ffffff', dark: '#151718' }, 'background');
  const borderColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.1)', dark: 'rgba(255, 255, 255, 0.1)' }, 'icon');
  const tintColor = useThemeColor({ light: '#3c823c', dark: '#fff' }, 'tint');
  const secondaryTextColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'text');

  const menuItems = [
    { icon: 'gearshape.fill', label: 'Settings', href: '/settings' },
    { icon: 'slider.horizontal.3', label: 'Edit Preferences', href: '/auth/quiz?edit=true' },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedText type="title" style={styles.title}>Profile</ThemedText>

        <View style={[styles.headerCard, { backgroundColor: itemBg, borderColor }]}>
          <View style={styles.profileInfo}>
            <Image
              source={user.avatar_url}
              style={styles.avatar}
              placeholder="blur"
            />
            <View style={styles.userMeta}>
              <ThemedText type="subtitle">{user.name}</ThemedText>
              <ThemedText style={{ color: secondaryTextColor }}>{user.email}</ThemedText>
            </View>
          </View>

          {user.bio && (
            <ThemedText style={styles.bio}>{user.bio}</ThemedText>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText type="defaultSemiBold">{user.followingCount}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Following</ThemedText>
            </View>
          </View>

          <TouchableOpacity style={[styles.editButton, { borderColor: tintColor }]}>
            <ThemedText style={{ color: tintColor, fontWeight: '600' }}>Edit Profile</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Link key={item.label} href={item.href as any} asChild>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {
                    backgroundColor: itemBg,
                    borderColor,
                    borderTopLeftRadius: index === 0 ? 12 : 0,
                    borderTopRightRadius: index === 0 ? 12 : 0,
                    borderBottomLeftRadius: index === menuItems.length - 1 ? 12 : 0,
                    borderBottomRightRadius: index === menuItems.length - 1 ? 12 : 0,
                    borderTopWidth: index === 0 ? 1 : 0,
                  }
                ]}
              >
                <View style={styles.menuItemLeft}>
                  <IconSymbol name={item.icon as any} size={20} color={tintColor} />
                  <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={16} color={secondaryTextColor} />
              </TouchableOpacity>
            </Link>
          ))}

          <TouchableOpacity
            style={[
              styles.menuItem,
              styles.logoutItem,
              { backgroundColor: itemBg, borderColor }
            ]}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#ff3b30" />
              <ThemedText style={[styles.menuLabel, { color: '#ff3b30' }]}>Log Out</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    marginBottom: 20,
  },
  headerCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  userMeta: {
    flex: 1,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    paddingTop: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  editButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  menuSection: {
    gap: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutItem: {
    marginTop: 12,
    borderRadius: 12,
    borderTopWidth: 1,
  },
});