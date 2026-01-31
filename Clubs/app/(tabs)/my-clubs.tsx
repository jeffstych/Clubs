import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useFollow } from '@/context/FollowContext';
import { CLUBS } from '@/data/clubs';
import { ClubCard } from '@/components/club-card';

export default function MyClubsScreen() {
    const { followedClubs } = useFollow();

    const myClubs = CLUBS.filter(club => followedClubs.has(club.id));

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText type="title" style={styles.title}>My Clubs</ThemedText>

                {myClubs.length === 0 ? (
                    <ThemedText style={styles.subtitle}>
                        No clubs followed yet. Follow clubs from the Explore page to see them here.
                    </ThemedText>
                ) : (
                    <View style={styles.clubsList}>
                        {myClubs.map(club => (
                            <ClubCard key={club.id} club={club} />
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
    title: {
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
    },
    clubsList: {
        gap: 16,
    },
});
