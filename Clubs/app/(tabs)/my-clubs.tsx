import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, ActionSheetIOS } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ClubCard } from '@/components/club-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { getFollowedClubs } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function MyClubsScreen() {
    const { session } = useAuth();
    const [followedClubs, setFollowedClubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'latest' | 'alphabetical'>('latest');

    const tintColor = useThemeColor({ light: '#3c823c', dark: '#fff' }, 'tint');

    // Load clubs when the component mounts
    useEffect(() => {
        if (session?.user?.id) {
            loadFollowedClubs();
        } else {
            setLoading(false);
        }
    }, [session]);

    // Reload clubs every time this tab is focused
    useFocusEffect(
        React.useCallback(() => {
            if (session?.user?.id) {
                loadFollowedClubs();
            }
        }, [session])
    );

    const loadFollowedClubs = async () => {
        if (!session?.user?.id) return;

        try {
            const { data: clubs, error } = await getFollowedClubs(session.user.id);
            if (error) {
                console.error('Error loading followed clubs:', error);
            } else if (clubs) {
                // Transform Supabase data to match ClubCard expectations
                const transformedClubs = clubs.map((club: any) => ({
                    id: club.club_id,
                    name: club.club_name,
                    description: club.club_description,
                    tags: club.club_tags || [],
                    category: club.club_category?.charAt(0).toUpperCase() + club.club_category?.slice(1).toLowerCase() || '',
                    image: club.club_image,
                    followedAt: club.followedAt
                }));
                setFollowedClubs(transformedClubs);
            }
        } catch (error) {
            console.error('Error loading followed clubs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = () => {
        ActionSheetIOS.showActionSheetWithOptions(
            {
                options: ['Cancel', 'Latest', 'A-Z'],
                cancelButtonIndex: 0,
                title: 'Sort Clubs',
            },
            (buttonIndex) => {
                if (buttonIndex === 1) setSortBy('latest');
                else if (buttonIndex === 2) setSortBy('alphabetical');
            }
        );
    };

    const sortedClubs = [...followedClubs].sort((a, b) => {
        if (sortBy === 'alphabetical') {
            return a.name.localeCompare(b.name);
        }
        // For latest, we assume higher followedAt (or index if not available) is newer
        return new Date(b.followedAt).getTime() - new Date(a.followedAt).getTime();
    });

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <ThemedText type="title">My Clubs</ThemedText>
                    <TouchableOpacity onPress={handleSort} style={styles.sortButton}>
                        <IconSymbol name="line.3.horizontal" size={24} color={tintColor} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ThemedText style={styles.subtitle}>
                        Loading your clubs...
                    </ThemedText>
                ) : !session ? (
                    <ThemedText style={styles.subtitle}>
                        Please sign in to see your followed clubs.
                    </ThemedText>
                ) : followedClubs.length === 0 ? (
                    <ThemedText style={styles.subtitle}>
                        No clubs followed yet. Follow clubs from the Explore page to see them here.
                    </ThemedText>
                ) : (
                    <View style={styles.clubsList}>
                        {sortedClubs.map(club => (
                            <ClubCard
                                key={club.id}
                                club={club}
                                onFollowChange={loadFollowedClubs}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sortButton: {
        padding: 4,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
    },
    clubsList: {
        gap: 16,
    },
});
