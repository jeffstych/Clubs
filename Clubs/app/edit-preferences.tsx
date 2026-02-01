import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getAllTags, getUserPreferenceTags, updateUserPreferences } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function EditPreferencesScreen() {
  const { session } = useAuth();
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Theme colors
  const activeTagColor = useThemeColor({ light: '#fff', dark: '#ffffff' }, 'tint');
  const inactiveTagColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'text');
  const activeBgColor = useThemeColor({ light: '#3c823c', dark: '#3c823c' }, 'tint');
  const inactiveBgColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.05)', dark: 'rgba(255, 255, 255, 0.1)' }, 'background');
  const borderColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.1)', dark: 'rgba(255, 255, 255, 0.2)' }, 'icon');
  const inputBgColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.03)', dark: 'rgba(255, 255, 255, 0.05)' }, 'background');
  const textInputColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');

  useEffect(() => {
    if (session?.user?.id) {
      loadData();
    }
  }, [session]);

  const loadData = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      
      // Get all available tags
      console.log('Loading tags...');
      const { data: tagsData, error: tagsError } = await getAllTags();
      console.log('Tags data received:', tagsData, 'Error:', tagsError);
      
      if (tagsData) {
        setAllTags(tagsData);
        console.log('Set all tags:', tagsData.length, 'tags');
      }

      // Get user's current preferences
      console.log('Loading user preferences for:', session.user.id);
      const { data: prefsData, error: prefsError } = await getUserPreferenceTags(session.user.id);
      console.log('Preferences data received:', prefsData, 'Error:', prefsError);
      
      if (prefsData) {
        setSelectedTags(prefsData.preferenceTags);
        console.log('Set selected tags:', prefsData.preferenceTags);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;

    try {
      setSaving(true);
      
      const { error } = await updateUserPreferences(session.user.id, selectedTags);
      
      if (error) {
        Alert.alert('Error', 'Failed to update preferences');
      } else {
        Alert.alert('Success', 'Preferences updated successfully!', [
          { text: 'OK', onPress: () => router.push('/(tabs)/profile') }
        ]);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3c823c" />
        <ThemedText style={styles.loadingText}>Loading preferences...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Edit Your Preferences</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <ThemedText style={styles.subtitle}>
          Select the categories and tags that interest you to get better recommendations.
        </ThemedText>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: inputBgColor }]}>
          <IconSymbol name="magnifyingglass" size={20} color={inactiveTagColor} />
          <TextInput
            style={[styles.searchInput, { color: textInputColor }]}
            placeholder="Search interests (coding, sports...)"
            placeholderTextColor={inactiveTagColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Selected Count */}
        <ThemedText style={[styles.selectedCount, { color: inactiveTagColor }]}>
          {selectedTags.length} interests selected
        </ThemedText>

        {/* Debug info - temporary */}
        <View style={{ marginBottom: 16, padding: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
          <ThemedText style={{ fontSize: 12, color: '#fff' }}>
            Debug: All tags loaded: {allTags.length}, Filtered: {filteredTags.length}
          </ThemedText>
          {allTags.length > 0 && (
            <ThemedText style={{ fontSize: 10, color: '#ccc', marginTop: 4 }}>
              First 5 tags: {allTags.slice(0, 5).join(', ')}
            </ThemedText>
          )}
          {allTags.length === 0 && (
            <ThemedText style={{ fontSize: 12, color: '#ff6666', marginTop: 4 }}>
              No tags loaded - check console for errors
            </ThemedText>
          )}
        </View>

        {/* Tags Grid */}
        <View style={styles.tagsContainer}>
          {filteredTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[
                  styles.tagButton,
                  {
                    backgroundColor: isSelected ? activeBgColor : inactiveBgColor,
                    borderColor: isSelected ? activeBgColor : borderColor,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.tagText,
                    { color: isSelected ? activeTagColor : inactiveTagColor },
                  ]}
                >
                  {tag}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredTags.length === 0 && searchQuery && (
          <ThemedText style={[styles.noResults, { color: inactiveTagColor }]}>
            No interests found for "{searchQuery}"
          </ThemedText>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, { backgroundColor: activeBgColor }]}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile')}
          style={styles.cancelButton}
        >
          <ThemedText style={[styles.cancelButtonText, { color: inactiveTagColor }]}>
            Cancel
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 0,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    opacity: 0.8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  selectedCount: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  footer: {
    padding: 16,
    paddingBottom: 34,
    gap: 12,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
  },
});