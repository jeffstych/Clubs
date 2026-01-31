import { useState, useMemo } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, FlatList, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ClubCard } from '@/components/club-card';
import { CLUBS, Club } from '@/data/clubs';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ForYouScreen() {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const activeTagColor = useThemeColor({ light: '#0a7ea4', dark: '#fff' }, 'text');
    const inactiveTagColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'text');
    const activeBgColor = useThemeColor({ light: '#d0eef7', dark: '#2f3d44' }, 'background');
    const inactiveBgColor = useThemeColor({ light: '#f0f0f0', dark: '#2A2D2E' }, 'background');

    // Extract all unique tags from clubs
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        CLUBS.forEach((club) => club.tags.forEach((tag) => tags.add(tag)));
        return Array.from(tags).sort();
    }, []);

    // AI Sorting Logic
    const sortedClubs = useMemo(() => {
        if (selectedTags.length === 0) return CLUBS;

        return [...CLUBS].map((club) => {
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
    }, [selectedTags]);

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
        marginBottom: 20,
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
