import { useState, useMemo, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, FlatList, View, TextInput, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ClubCard } from '@/components/club-card';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { getUserPreferenceTags, getRecommendedClubs, getAllTags, getClubs } from '@/lib/supabase';

export default function ExploreScreen() {
  const { session } = useAuth();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'default'>('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [userPreferences, setUserPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<any[]>([]);
  const [clubsLoading, setClubsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const activeTagColor = useThemeColor({ light: '#fff', dark: '#062406' }, 'tint'); // Text on active tag
  const inactiveTagColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'text');

  // Glass effect colors
  const activeBgColor = useThemeColor({ light: '#3c823c', dark: '#ffffff' }, 'tint');
  const inactiveBgColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.05)', dark: 'rgba(255, 255, 255, 0.1)' }, 'background');
  const inputBgColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.03)', dark: 'rgba(255, 255, 255, 0.05)' }, 'background');
  const borderColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.1)', dark: 'rgba(255, 255, 255, 0.2)' }, 'icon');
  const searchTextColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');

  // Load user preferences on mount
  useEffect(() => {
    if (session?.user?.id) {
      loadUserPreferences();
    } else {
      setLoading(false);
    }
    loadClubs();
  }, [session]);

  const loadClubs = async () => {
    try {
      setClubsLoading(true);
      const clubsData = await getClubs();
      if (clubsData) {
        // Transform Supabase data to match expected structure
        const transformedClubs = clubsData.map((club: any) => ({
          id: club.club_id,
          name: club.club_name,
          description: club.club_description,
          tags: club.club_tags || [],
          category: club.club_category,
          image: club.club_image,
          // Add any other fields that ClubCard expects
        }));
        setClubs(transformedClubs);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(
          clubsData
            .map((club: any) => club.club_category)
            .filter((category: any) => category && typeof category === 'string')
        )].sort();
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setClubsLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    if (!session?.user?.id) return;
    
    try {
      const { data: prefsData } = await getUserPreferenceTags(session.user.id);
      if (prefsData) {
        setUserPreferences(prefsData.preferenceTags);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all available tags from Supabase
  const [allTags, setAllTags] = useState<string[]>([]);
  
  useEffect(() => {
    loadAllTags();
  }, []);

  const loadAllTags = async () => {
    try {
      const { data: tagsData } = await getAllTags();
      if (tagsData) {
        setAllTags(tagsData);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
      // Fallback to extracting from loaded clubs
      const tags = new Set<string>();
      clubs.forEach((club) => {
        if (club.tags && Array.isArray(club.tags)) {
          club.tags.forEach((tag: string) => tags.add(tag));
        }
      });
      setAllTags(Array.from(tags).sort());
    }
  };

  // Sorting and Filtering Logic with User Preference Prioritization
  const sortedClubs = useMemo(() => {
    let filtered = clubs;

    // Filter by Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(query) ||
        club.description.toLowerCase().includes(query)
      );
    }

    // Filter by Selected Categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(club =>
        selectedCategories.includes(club.category)
      );
    }

    // Calculate relevance scores for each club
    const clubsWithScores = filtered.map((club) => {
      let userPreferenceScore = 0;
      let selectedTagsScore = 0;

      // Calculate user preference overlap score
      if (userPreferences.length > 0 && club.tags) {
        club.tags.forEach((tag: string) => {
          if (userPreferences.includes(tag)) {
            userPreferenceScore += 1;
          }
        });
      }

      // Calculate selected tags score (for manual filtering)
      if (selectedTags.length > 0 && club.tags) {
        club.tags.forEach((tag: string) => {
          if (selectedTags.includes(tag)) {
            selectedTagsScore += 1;
          }
        });
      }

      return {
        ...club,
        userPreferenceScore,
        selectedTagsScore,
        totalScore: selectedTagsScore > 0 ? selectedTagsScore : userPreferenceScore
      };
    });

    // Sort logic
    return clubsWithScores.sort((a, b) => {
      // Apply primary sort based on sortBy selection
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'category') {
        const categorySort = a.category.localeCompare(b.category);
        if (categorySort !== 0) return categorySort;
        // If categories are the same, sort by name
        return a.name.localeCompare(b.name);
      } else {
        // Default sorting: prioritize tag/preference overlap
        // If tags are manually selected, prioritize selected tags score
        if (selectedTags.length > 0) {
          if (b.selectedTagsScore !== a.selectedTagsScore) {
            return b.selectedTagsScore - a.selectedTagsScore;
          }
        } else {
          // Default: prioritize user preference overlap
          if (b.userPreferenceScore !== a.userPreferenceScore) {
            return b.userPreferenceScore - a.userPreferenceScore;
          }
        }
        // If scores are equal, sort by name
        return a.name.localeCompare(b.name);
      }
    });
  }, [selectedTags, selectedCategories, searchQuery, sortBy, userPreferences, clubs]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  return (
    <ThemedView style={styles.container}>
      {clubsLoading ? (
        <View style={styles.loadingContainer}>
          <ThemedText>Loading clubs...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={sortedClubs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ClubCard club={item} />}
          contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <>
            <ThemedView style={styles.header}>
              <ThemedText type="title">Explore</ThemedText>
              <ThemedText style={styles.subtitle}>
                Select your interests to get personalized club recommendations.
              </ThemedText>
            </ThemedView>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: inputBgColor }]}>
              <IconSymbol name="magnifyingglass" size={20} color={inactiveTagColor} />
              <TextInput
                style={[styles.searchInput, { color: searchTextColor }]}
                placeholder="Search clubs..."
                placeholderTextColor={inactiveTagColor}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Controls Section */}
            <View style={styles.controlsSection}>
              {/* Sort Dropdown */}
              <Pressable
                style={[
                  styles.dropdownButton,
                  { borderColor: borderColor, backgroundColor: inputBgColor }
                ]}
                onPress={() => setShowSortDropdown(!showSortDropdown)}
              >
                <ThemedText style={styles.dropdownButtonText}>
                  Sort: {sortBy === 'name' ? 'A-Z' : sortBy === 'category' ? 'Category' : 'Default'}
                </ThemedText>
                <IconSymbol
                  name={showSortDropdown ? "chevron.up" : "chevron.down"}
                  size={16}
                  color={inactiveTagColor}
                />
              </Pressable>

              {showSortDropdown && (
                <View style={[styles.dropdownMenu, { backgroundColor: inputBgColor, borderColor }]}>
                  <Pressable
                    style={[styles.dropdownItem, sortBy === 'default' && styles.dropdownItemSelected]}
                    onPress={() => {
                      setSortBy('default');
                      setShowSortDropdown(false);
                    }}
                  >
                    <ThemedText>Default</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.dropdownItem, sortBy === 'name' && styles.dropdownItemSelected]}
                    onPress={() => {
                      setSortBy('name');
                      setShowSortDropdown(false);
                    }}
                  >
                    <ThemedText>A-Z</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.dropdownItem, sortBy === 'category' && styles.dropdownItemSelected]}
                    onPress={() => {
                      setSortBy('category');
                      setShowSortDropdown(false);
                    }}
                  >
                    <ThemedText>Category</ThemedText>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Categories Section */}
            <View style={styles.categoriesSection}>
              <ThemedText type="defaultSemiBold" style={styles.filterLabel}>Categories</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
                {categories.map((category) => {
                  const isActive = selectedCategories.includes(category);
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        { 
                          backgroundColor: isActive ? activeBgColor : inactiveBgColor,
                          borderColor: isActive ? activeBgColor : borderColor,
                        },
                      ]}
                      onPress={() => toggleCategory(category)}>
                      <ThemedText
                        style={[
                          styles.categoryText,
                          { color: isActive ? activeTagColor : inactiveTagColor, fontWeight: isActive ? '600' : '400' },
                        ]}>
                        {category}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Tags Section */}
            <View style={styles.tagsSection}>
              <ThemedText type="defaultSemiBold" style={styles.filterLabel}>Tags</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
                {allTags.map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tag,
                        { backgroundColor: isActive ? activeBgColor : inactiveBgColor },
                      ]}
                      onPress={() => toggleTag(tag)}>
                      <ThemedText
                        style={[
                          styles.tagText,
                          { color: isActive ? activeTagColor : inactiveTagColor, fontWeight: isActive ? '600' : '400' },
                        ]}>
                        {tag}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {(selectedTags.length > 0 || selectedCategories.length > 0)
                ? "Filtered Clubs" 
                : userPreferences.length > 0 
                  ? "Recommended for You" 
                  : "All Clubs"
              }
            </ThemedText>
          </>
        }
      />
      )}
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
    paddingTop: 60,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 60, // Add padding for status bar / header
  },
  header: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  controlsSection: {
    marginBottom: 20,
    zIndex: 10, // Ensure dropdown flows over other elements if absolute (but we are using stacking flow)
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  dropdownMenu: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(60, 130, 60, 0.1)', // Lighter green tint
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    opacity: 0.7,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  filterLabel: {
    marginBottom: 12,
    fontSize: 16,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsScroll: {
    gap: 8,
    paddingRight: 16,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    marginBottom: 12,
  },
});
