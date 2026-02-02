import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useHiddenClubs } from '@/context/HiddenClubsContext';
import { getClubs } from '@/lib/supabase';
import { Image } from 'expo-image';

export default function HiddenClubsScreen() {
    const { hiddenClubIds, unhideClub } = useHiddenClubs();
    const [hiddenClubs, setHiddenClubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const itemBg = useThemeColor({ light: '#ffffff', dark: '#151718' }, 'background');
    const borderColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.1)', dark: 'rgba(255, 255, 255, 0.1)' }, 'icon');
    const tintColor = useThemeColor({ light: '#3c823c', dark: '#fff' }, 'tint');
    const secondaryTextColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'text');

    useEffect(() => {
        loadHiddenClubs();
    }, [hiddenClubIds]);

    const loadHiddenClubs = async () => {
        if (hiddenClubIds.length === 0) {
            setHiddenClubs([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const allClubs = await getClubs();
            if (allClubs) {
                const filtered = allClubs
                    .filter((club: any) => hiddenClubIds.includes(club.club_id))
                    .map((club: any) => ({
                        id: club.club_id,
                        name: club.club_name,
                        image: club.club_image,
                        category: club.club_category,
                    }));
                setHiddenClubs(filtered);
            }
        } catch (error) {
            console.error('Error loading hidden clubs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Hidden Clubs', headerTintColor: tintColor }} />

            {hiddenClubs.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <IconSymbol name="eye" size={48} color={secondaryTextColor} />
                    <ThemedText style={[styles.emptyText, { color: secondaryTextColor }]}>
                        No hidden clubs. Clubs you mark as "Not interested" will appear here.
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    data={hiddenClubs}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={[styles.clubItem, { backgroundColor: itemBg, borderColor }]}>
                            <Image source={{ uri: item.image }} style={styles.clubImage} contentFit="cover" />
                            <View style={styles.clubInfo}>
                                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                                <ThemedText style={{ color: secondaryTextColor, fontSize: 12 }}>{item.category}</ThemedText>
                            </View>
                            <TouchableOpacity
                                style={[styles.unhideButton, { backgroundColor: tintColor }]}
                                onPress={() => unhideClub(item.id)}
                            >
                                <ThemedText style={styles.unhideButtonText}>Unhide</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    clubItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    clubImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    clubInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 12,
    },
    unhideButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    unhideButtonText: {
        color: '#062406',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 16,
    },
});
