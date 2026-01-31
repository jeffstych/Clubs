import { useState, useMemo } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, FlatList, View, TextInput, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ClubCard } from '@/components/club-card';
import { CLUBS, Club } from '@/data/clubs';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ForYouScreen() {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    const activeTagColor = useThemeColor({ light: '#fff', dark: '#fff' }, 'tint'); // White text on active
    const inactiveTagColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'text');

    // Glass effect colors
    const activeBgColor = useThemeColor({ light: '#0A3D0A', dark: '#4CAF50' }, 'tint');
    const inactiveBgColor = useThemeColor({ light: 'rgba(10, 61, 10, 0.05)', dark: 'rgba(255, 255, 255, 0.1)' }, 'background');
    const inputBgColor = useThemeColor({ light: 'rgba(10, 61, 10, 0.03)', dark: 'rgba(255, 255, 255, 0.05)' }, 'background');
    const borderColor = useThemeColor({ light: 'rgba(10, 61, 10, 0.1)', dark: 'rgba(255, 255, 255, 0.2)' }, 'icon');

    // Extract all unique tags and categories from clubs
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        CLUBS.forEach((club) => club.tags.forEach((tag) => tags.add(tag)));
        return Array.from(tags).sort();
    }, []);

    const allCategories = useMemo(() => {
        const categories = new Set<string>(CLUBS.map(c => c.category));
        return Array.from(categories).sort();
    }, []);

    // Sorting and Filtering Logic
    const sortedClubs = useMemo(() => {
        let filtered = CLUBS;

        // Filter by Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(club =>
                club.name.toLowerCase().includes(query) ||
                club.description.toLowerCase().includes(query)
            );
        }

        // Filter by Category
        if (selectedCategory) {
            filtered = filtered.filter(club => club.category === selectedCategory);
        }

        if (selectedTags.length === 0) return filtered;

        return [...filtered].map((club) => {
            // Calculate a relevance score
            let score = 0;
            club.tags.forEach((tag) => {
                if (selectedTags.includes(tag)) {
                    score += 1;
                }
            });
            return { ...club, score };
        }).sort((a, b) => {
            // Sort by score descending
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            // Fallback to name
            return a.name.localeCompare(b.name);
        });
    }, [selectedTags, searchQuery, selectedCategory]);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    return (
        <ThemedView style={styles.container}>
            <FlatList
                data={sortedClubs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ClubCard club={item} />}
                contentContainerStyle={styles.contentContainer}
                ListHeaderComponent={
                    <>
                        <ThemedView style={styles.header}>
                            <ThemedText type="title">For You</ThemedText>
                            <ThemedText style={styles.subtitle}>
                                Select your interests to get personalized club recommendations.
                            </ThemedText>
                        </ThemedView>

                        {/* Search Bar */}
                        <View style={[styles.searchContainer, { backgroundColor: inputBgColor }]}>
                            <IconSymbol name="magnifyingglass" size={20} color={inactiveTagColor} />
                            <TextInput
                                style={[styles.searchInput, { color: activeTagColor }]}
                                placeholder="Search clubs..."
                                placeholderTextColor={inactiveTagColor}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        {/* Category Dropdown */}
                        <View style={styles.controlsSection}>
                            <Pressable
                                style={[
                                    styles.dropdownButton,
                                    { borderColor: borderColor, backgroundColor: inputBgColor }
                                ]}
                                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                            >
                                <ThemedText style={styles.dropdownButtonText}>
                                    {selectedCategory ? selectedCategory : "All Categories"}
                                </ThemedText>
                                <IconSymbol
                                    name="chevron.down"
                                    size={16}
                                    color={inactiveTagColor}
                                    style={{ transform: [{ rotate: showCategoryDropdown ? '180deg' : '0deg' }] }}
                                />
                            </Pressable>

                            {showCategoryDropdown && (
                                <View style={[styles.dropdownMenu, { backgroundColor: inputBgColor, borderColor }]}>
                                    <Pressable
                                        style={[styles.dropdownItem, !selectedCategory && styles.dropdownItemSelected]}
                                        onPress={() => {
                                            setSelectedCategory(null);
                                            setShowCategoryDropdown(false);
                                        }}
                                    >
                                        <ThemedText>All Categories</ThemedText>
                                    </Pressable>
                                    {allCategories.map(cat => (
                                        <Pressable
                                            key={cat}
                                            style={[styles.dropdownItem, selectedCategory === cat && styles.dropdownItemSelected]}
                                            onPress={() => {
                                                setSelectedCategory(cat);
                                                setShowCategoryDropdown(false);
                                            }}
                                        >
                                            <ThemedText>{cat}</ThemedText>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={styles.tagsSection}>
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
                            {selectedTags.length > 0 ? "Recommended Clubs" : "All Clubs"}
                        </ThemedText>
                    </>
                }
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
