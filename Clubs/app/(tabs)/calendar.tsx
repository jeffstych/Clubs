import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useEvents } from '@/context/EventContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function CalendarScreen() {
    const { events } = useEvents();
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#151718' }, 'background');
    const iconColor = useThemeColor({ light: '#3c823c', dark: '#fff' }, 'tint');

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText type="title" style={styles.title}>Calendar</ThemedText>

                {events.length === 0 ? (
                    <ThemedText style={styles.subtitle}>
                        No events added yet. Add events from club cards on the For You page.
                    </ThemedText>
                ) : (
                    <View style={styles.eventsList}>
                        {events.map((event) => (
                            <View key={event.id} style={[styles.eventCard, { backgroundColor: cardBg }]}>
                                <View style={styles.eventHeader}>
                                    <IconSymbol name="calendar" size={20} color={iconColor} />
                                    <ThemedText type="defaultSemiBold" style={styles.eventClubName}>
                                        {event.clubName}
                                    </ThemedText>
                                </View>
                                <View style={styles.eventDetails}>
                                    <IconSymbol name="clock" size={14} color={iconColor} style={styles.detailIcon} />
                                    <ThemedText style={styles.eventTime}>{event.time}</ThemedText>
                                </View>
                                <View style={styles.eventDetails}>
                                    <IconSymbol name="location" size={14} color={iconColor} style={styles.detailIcon} />
                                    <ThemedText style={styles.eventLocation}>{event.location}</ThemedText>
                                </View>
                            </View>
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
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
    },
    eventsList: {
        marginTop: 16,
        gap: 12,
    },
    eventCard: {
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    eventHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    eventClubName: {
        fontSize: 16,
    },
    eventDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailIcon: {
        marginRight: 8,
    },
    eventTime: {
        fontSize: 14,
        opacity: 0.8,
    },
    eventLocation: {
        fontSize: 14,
        opacity: 0.8,
    },
});
