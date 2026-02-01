import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CLUBS, Club } from '@/data/clubs';

export default function ClubDetailPage() {
    const { clubId } = useLocalSearchParams();
    const [club, setClub] = useState<Club | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    const bgColor = useThemeColor({ light: '#f9fafb', dark: '#0a0a0a' }, 'background');
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#151718' }, 'background');
    const tintColor = useThemeColor({ light: '#3c823c', dark: '#3c823c' }, 'tint');
    const secondaryTextColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'text');
    const borderColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.1)', dark: 'rgba(255, 255, 255, 0.1)' }, 'icon');

    useEffect(() => {
        // Find the club in the local data
        const foundClub = CLUBS.find(c => c.id === clubId);
        if (foundClub) {
            setClub(foundClub);
        }
        setLoading(false);
    }, [clubId]);

    if (loading) {
        return (
            <ThemedView style={styles.centerContainer}>
                <ActivityIndicator size="large" color={tintColor} />
            </ThemedView>
        );
    }

    if (!club) {
        return (
            <ThemedView style={styles.centerContainer}>
                <ThemedText>Club not found</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: club.name, headerShadowVisible: false }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image source={{ uri: club.image }} style={styles.coverImage} contentFit="cover" />

                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <View style={styles.titleInfo}>
                            <ThemedText type="title">{club.name}</ThemedText>
                            <ThemedText style={[styles.category, { color: tintColor }]}>{club.category}</ThemedText>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.followButton,
                                { backgroundColor: isFollowing ? 'transparent' : tintColor, borderColor: tintColor }
                            ]}
                            onPress={() => setIsFollowing(!isFollowing)}
                        >
                            <ThemedText style={{ color: isFollowing ? tintColor : '#fff', fontWeight: '600' }}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>About</ThemedText>
                        <ThemedText style={styles.description}>{club.description}</ThemedText>
                    </View>

                    <View style={styles.tagsContainer}>
                        {club.tags.map((tag) => (
                            <View key={tag} style={[styles.tag, { backgroundColor: borderColor }]}>
                                <ThemedText style={styles.tagText}>#{tag}</ThemedText>
                            </View>
                        ))}
                    </View>

                    {club.nextEvent && (
                        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
                            <View style={styles.sectionHeader}>
                                <IconSymbol name="calendar" size={18} color={tintColor} />
                                <ThemedText type="subtitle" style={styles.sectionTitle}>Next Event</ThemedText>
                            </View>
                            <ThemedText style={styles.eventInfo}>{club.nextEvent.time}</ThemedText>
                            <ThemedText style={[styles.eventLocation, { color: secondaryTextColor }]}>📍 {club.nextEvent.location}</ThemedText>
                            <TouchableOpacity style={[styles.rsvpButton, { backgroundColor: tintColor }]}>
                                <ThemedText style={styles.rsvpButtonText}>RSVP via Email</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.socialSection}>
                        <ThemedText style={[styles.socialTitle, { color: secondaryTextColor }]}>Connect</ThemedText>
                        <View style={styles.socialIcons}>
                            <TouchableOpacity style={[styles.socialIcon, { backgroundColor: cardBg, borderColor }]}>
                                <IconSymbol name="globe" size={20} color={secondaryTextColor} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.socialIcon, { backgroundColor: cardBg, borderColor }]}>
                                <IconSymbol name="message" size={20} color={secondaryTextColor} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    coverImage: {
        width: '100%',
        height: 200,
    },
    content: {
        padding: 20,
        marginTop: -20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: 'transparent',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        paddingTop: 10,
    },
    titleInfo: {
        flex: 1,
        marginRight: 12,
    },
    category: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
        textTransform: 'uppercase',
    },
    followButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    section: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 20,
    },
    sectionTitle: {
        marginBottom: 8,
        fontSize: 18,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        opacity: 0.9,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 13,
        fontWeight: '500',
    },
    eventInfo: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    eventLocation: {
        fontSize: 14,
        marginBottom: 16,
    },
    rsvpButton: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    rsvpButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
    socialSection: {
        marginTop: 10,
    },
    socialTitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 12,
        letterSpacing: 1,
    },
    socialIcons: {
        flexDirection: 'row',
        gap: 12,
    },
    socialIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
