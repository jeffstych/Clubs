import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ProfilePage() {
  const itemBg = useThemeColor({ light: '#ffffff', dark: '#151718' }, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedText type="title" style={styles.title}>Profile</ThemedText>

        <View style={[styles.headerCard, { backgroundColor: itemBg }]}>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
          <ThemedText type="subtitle">John Doe</ThemedText>
          <ThemedText style={{ color: textColor, opacity: 0.6, marginTop: 4 }}>john.doe@msu.edu</ThemedText>
        </View>

        <View style={styles.menuSection}>
          <View style={[styles.menuItem, { backgroundColor: itemBg }]}>
            <ThemedText style={styles.menuLabel}>My Clubs</ThemedText>
          </View>
          <View style={[styles.menuItem, { backgroundColor: itemBg }]}>
            <ThemedText style={styles.menuLabel}>My Events</ThemedText>
          </View>
          <View style={[styles.menuItem, { backgroundColor: itemBg }]}>
            <ThemedText style={styles.menuLabel}>Settings</ThemedText>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </TouchableOpacity>
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
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  menuSection: {
    marginTop: 8,
  },
  menuItem: {
    padding: 18,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 20,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ff3b30',
    fontWeight: '600',
    fontSize: 16,
  },
});