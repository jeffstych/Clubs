import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase, getUserPreferenceTags, getFollowedClubs } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { session } = useAuth();
  const [userPreferences, setUserPreferences] = useState<string[]>([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      loadUserData();
    }
  }, [session]);

  const loadUserData = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      
      // Get user preferences
      const { data: prefsData } = await getUserPreferenceTags(session.user.id);
      if (prefsData) {
        setUserPreferences(prefsData.preferenceTags);
      }

      // Get following count
      const { data: followedClubs } = await getFollowedClubs(session.user.id);
      if (followedClubs) {
        setFollowingCount(followedClubs.length);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const performLogout = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Error', error.message);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to log out?')) {
        performLogout();
      }
    } else {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log Out', style: 'destructive', onPress: performLogout },
        ]
      );
    }
  };

  // Use real user data from session
  const user = {
    id: session?.user?.id || '',
    name: session?.user?.user_metadata?.name || session?.user?.email?.split('@')[0] || 'User',
    email: session?.user?.email || '',
    avatar_url: session?.user?.user_metadata?.avatar_url || 'https://via.placeholder.com/150',
    bio: userPreferences.length > 0 ? `Interested in: ${userPreferences.slice(0, 3).join(', ')}${userPreferences.length > 3 ? '...' : ''}` : 'No interests selected yet',
    followingCount,
  };

  const itemBg = useThemeColor({ light: '#ffffff', dark: '#151718' }, 'background');
  const borderColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.1)', dark: 'rgba(255, 255, 255, 0.1)' }, 'icon');
  const tintColor = useThemeColor({ light: '#3c823c', dark: '#fff' }, 'tint');
  const secondaryTextColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'text');

  const menuItems = [
    { icon: 'gearshape.fill', label: 'Settings', href: '/settings' },
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
            <View style={styles.statItem}>
              <ThemedText type="defaultSemiBold">{userPreferences.length}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Interests</ThemedText>
            </View>
          </View>

          <TouchableOpacity style={[styles.editButton, { borderColor: tintColor }]}>
            <ThemedText style={{ color: tintColor, fontWeight: '600' }}>Edit Profile</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === menuItems.length - 1;
            return (
              <TouchableOpacity
                key={item.label}
                onPress={() => router.push(item.href as any)}
                style={{
                  ...styles.menuItem,
                  backgroundColor: itemBg,
                  borderTopColor: borderColor,
                  borderBottomColor: borderColor,
                  borderLeftColor: borderColor,
                  borderRightColor: borderColor,
                  borderTopLeftRadius: isFirst ? 12 : 0,
                  borderTopRightRadius: isFirst ? 12 : 0,
                  borderBottomLeftRadius: isLast ? 12 : 0,
                  borderBottomRightRadius: isLast ? 12 : 0,
                  borderTopWidth: isFirst ? 1 : 0,
                }}
              >
                <View style={styles.menuItemLeft}>
                  <IconSymbol name={item.icon as any} size={20} color={tintColor} />
                  <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={16} color={secondaryTextColor} />
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={() => router.push('/edit-preferences')}
            style={{
              ...styles.menuItem,
              backgroundColor: itemBg,
              borderTopColor: borderColor,
              borderBottomColor: borderColor,
              borderLeftColor: borderColor,
              borderRightColor: borderColor,
            }}
          >
            <View style={styles.menuItemLeft}>
              <ThemedText style={styles.emojiIcon}>🎯</ThemedText>
              <ThemedText style={styles.menuLabel}>Edit Preferences</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={secondaryTextColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              ...styles.menuItem,
              ...styles.logoutItem,
              backgroundColor: itemBg,
              borderTopColor: borderColor,
              borderBottomColor: borderColor,
              borderLeftColor: borderColor,
              borderRightColor: borderColor,
            }}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#ff3b30" />
              <ThemedText style={styles.logoutLabel}>Log Out</ThemedText>
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
  emojiIcon: {
    fontSize: 18,
  },
  logoutLabel: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
    color: '#ff3b30',
  },
});