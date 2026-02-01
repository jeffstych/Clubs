import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useState, useMemo } from 'react';
import { CLUBS } from '@/data/clubs';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ClubDetailPage() {
    const { clubId } = useLocalSearchParams();
    const [isFollowing, setIsFollowing] = useState(false);

    // Find the club from the data
    const club = useMemo(() => {
        return CLUBS.find(c => c.id === clubId);
    }, [clubId]);

    const bgColor = useThemeColor({ light: '#f9fafb', dark: '#0a0a0a' }, 'background');
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#151718' }, 'background');
    const accentColor = useThemeColor({ light: '#3c823c', dark: '#fff' }, 'tint');
    const tagBg = useThemeColor({ light: 'rgba(6, 36, 6, 0.08)', dark: 'rgba(255, 255, 255, 0.1)' }, 'background');
    const tagBorder = useThemeColor({ light: 'rgba(6, 36, 6, 0.15)', dark: 'rgba(255, 255, 255, 0.2)' }, 'icon');
    const eventBg = useThemeColor({ light: 'rgba(60, 130, 60, 0.1)', dark: 'rgba(255, 255, 255, 0.1)' }, 'background');

    if (!club) {
        return (
            <ThemedView style={styles.container}>
                <Stack.Screen options={{ title: 'Club Not Found' }} />
                <View style={styles.errorContainer}>
                    <ThemedText style={styles.errorText}>Club not found</ThemedText>
                </View>
            </ThemedView>
        );
    }

    return (
        <>
            <Stack.Screen options={{ title: club.name }} />
            <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
                {/* Hero Image */}
                <Image source={{ uri: club.image }} style={styles.heroImage} />

                {/* Club Info Card */}
                <ThemedView style={[styles.infoCard, { backgroundColor: cardBg }]}>
                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            <ThemedText type="title">{club.name}</ThemedText>
                            <ThemedText style={styles.category}>{club.category}</ThemedText>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.followButton,
                                {
                                    backgroundColor: isFollowing ? 'transparent' : accentColor,
                                    borderColor: accentColor,
                                    borderWidth: 1,
                                },
                            ]}
                            onPress={() => setIsFollowing(!isFollowing)}
                        >
                            <ThemedText
                                style={[
                                    styles.followButtonText,
                                    { color: isFollowing ? accentColor : '#fff' },
                                ]}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    <ThemedText style={styles.description}>{club.description}</ThemedText>

                    {/* Tags */}
                    {club.tags && club.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {club.tags.map((tag) => (
                                <View
                                    key={tag}
                                    style={[
                                        styles.tag,
                                        { backgroundColor: tagBg, borderColor: tagBorder, borderWidth: 1 },
                                    ]}
                                >
                                    <ThemedText style={styles.tagText}>#{tag}</ThemedText>
                                </View>
                            ))}
                        </View>
                    )}
                </ThemedView>

                {/* Connect Section */}
                <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
                    <View style={styles.sectionHeader}>
                        <IconSymbol name="link" size={20} color={accentColor} />
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            Connect With Us
                        </ThemedText>
                    </View>

                    {/* Discord Link */}
                    <TouchableOpacity style={[styles.linkButton, { backgroundColor: eventBg }]}>
                        <IconSymbol name="bubble.left.and.bubble.right" size={20} color={accentColor} />
                        <View style={styles.linkContent}>
                            <ThemedText style={styles.linkTitle}>Join our Discord</ThemedText>
                            <ThemedText style={styles.linkSubtitle}>Chat with members & get updates</ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={16} color={accentColor} />
                    </TouchableOpacity>

                    {/* Email Link */}
                    <TouchableOpacity style={[styles.linkButton, { backgroundColor: eventBg }]}>
                        <IconSymbol name="envelope.fill" size={20} color={accentColor} />
                        <View style={styles.linkContent}>
                            <ThemedText style={styles.linkTitle}>Email Us</ThemedText>
                            <ThemedText style={styles.linkSubtitle}>contact@{club.name.toLowerCase().replace(/\s+/g, '')}.club</ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={16} color={accentColor} />
                    </TouchableOpacity>
                </ThemedView>

                {/* Next Event Section */}
                {club.nextEvent && (
                    <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
                        <View style={styles.sectionHeader}>
                            <IconSymbol name="calendar" size={20} color={accentColor} />
                            <ThemedText type="subtitle" style={styles.sectionTitle}>
                                Next Meeting
                            </ThemedText>
                        </View>
                        <View style={[styles.eventCard, { backgroundColor: eventBg }]}>
                            <IconSymbol name="clock" size={16} color={accentColor} style={styles.eventIcon} />
                            <View style={styles.eventDetails}>
                                <ThemedText style={styles.eventTime}>{club.nextEvent.time}</ThemedText>
                                <ThemedText style={styles.eventLocation}>{club.nextEvent.location}</ThemedText>
                            </View>
                        </View>
                    </ThemedView>
                )}

                {/* About Section */}
                <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
                    <View style={styles.sectionHeader}>
                        <IconSymbol name="info.circle" size={20} color={accentColor} />
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            About
                        </ThemedText>
                    </View>
                    <ThemedText style={styles.aboutText}>
                        Join our community and be part of something amazing! We welcome members of all
                        skill levels and backgrounds. Whether you're a beginner or an expert, there's a
                        place for you here.
                    </ThemedText>
                </ThemedView>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        opacity: 0.7,
    },
    heroImage: {
        width: '100%',
        height: 250,
        backgroundColor: '#e5e7eb',
    },
    infoCard: {
        margin: 16,
        marginTop: -30,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerText: {
        flex: 1,
        marginRight: 12,
    },
    category: {
        fontSize: 14,
        opacity: 0.6,
        marginTop: 4,
    },
    followButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    followButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
        opacity: 0.9,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '500',
    },
    section: {
        margin: 16,
        marginTop: 0,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        marginLeft: 8,
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
    },
    eventIcon: {
        marginRight: 12,
    },
    eventDetails: {
        flex: 1,
    },
    eventTime: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    eventLocation: {
        fontSize: 13,
        opacity: 0.7,
    },
    aboutText: {
        fontSize: 15,
        lineHeight: 22,
        opacity: 0.8,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    linkContent: {
        flex: 1,
        marginLeft: 12,
    },
    linkTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    linkSubtitle: {
        fontSize: 13,
        opacity: 0.7,
    },
});
