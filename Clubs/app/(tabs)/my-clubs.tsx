import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Modal, Pressable } from 'react-native';
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
    const [sortBy, setSortBy] = useState<'default' | 'latest' | 'alphabetical'>('default');
    const [showSortMenu, setShowSortMenu] = useState(false);

    const tintColor = useThemeColor({ light: '#3c823c', dark: '#fff' }, 'tint');
    const menuBg = useThemeColor({ light: '#fff', dark: '#2c2c2e' }, 'background');
    const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#48484a' }, 'icon');
    const secondaryTextColor = useThemeColor({ light: '#666', dark: '#8E8E93' }, 'text');

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
        setShowSortMenu(!showSortMenu);
    };

    const sortedClubs = [...followedClubs].sort((a, b) => {
        if (sortBy === 'alphabetical') {
            return a.name.localeCompare(b.name);
        }
        if (sortBy === 'latest') {
            return new Date(b.followedAt).getTime() - new Date(a.followedAt).getTime();
        }
        // Default: original order from database
        return 0;
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

                {showSortMenu && (
                    <Modal
                        transparent={true}
                        visible={showSortMenu}
                        onRequestClose={() => setShowSortMenu(false)}
                        animationType="none"
                    >
                        <Pressable
                            style={styles.modalOverlay}
                            onPress={() => setShowSortMenu(false)}
                        >
                            <View style={[styles.dropdown, { backgroundColor: menuBg, borderColor }]}>
                                <TouchableOpacity
                                    style={styles.menuOption}
                                    onPress={() => { setSortBy('default'); setShowSortMenu(false); }}
                                >
                                    <ThemedText style={{ color: sortBy === 'default' ? tintColor : undefined }}>Default</ThemedText>
                                    {sortBy === 'default' && <IconSymbol name="checkmark" size={16} color={tintColor} />}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.menuOption}
                                    onPress={() => { setSortBy('latest'); setShowSortMenu(false); }}
                                >
                                    <ThemedText style={{ color: sortBy === 'latest' ? tintColor : undefined }}>Latest</ThemedText>
                                    {sortBy === 'latest' && <IconSymbol name="checkmark" size={16} color={tintColor} />}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.menuOption}
                                    onPress={() => { setSortBy('alphabetical'); setShowSortMenu(false); }}
                                >
                                    <ThemedText style={{ color: sortBy === 'alphabetical' ? tintColor : undefined }}>A-Z</ThemedText>
                                    {sortBy === 'alphabetical' && <IconSymbol name="checkmark" size={16} color={tintColor} />}
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </Modal>
                )}

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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    dropdown: {
        position: 'absolute',
        top: 105,
        right: 16,
        width: 150,
        borderRadius: 12,
        borderWidth: 1,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    menuOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
});
