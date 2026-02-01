import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import { getUserSignedUpEvents } from '@/lib/supabase';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useFocusEffect } from '@react-navigation/native';

export default function CalendarScreen() {
    const { session } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    // Load user's signed up events
    const loadUserEvents = async () => {
        if (!session?.user?.id) {
            setEvents([]);
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            const { data: userEvents } = await getUserSignedUpEvents(session.user.id);
            if (userEvents) {
                // Transform events to match calendar format
                const transformedEvents = userEvents.map((event: any) => ({
                    id: event.event_id,
                    clubName: event.club_name,
                    title: event.event_title,
                    time: event.event_time,
                    location: event.location,
                    date: event.event_date,
                    description: event.event_description
                }));
                setEvents(transformedEvents);
            }
        } catch (error) {
            console.error('Error loading user events:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load events when component mounts
    useEffect(() => {
        loadUserEvents();
    }, [session]);

    // Reload events when tab is focused
    useFocusEffect(
        React.useCallback(() => {
            loadUserEvents();
        }, [session])
    );

    const cardBg = useThemeColor({ light: '#ffffff', dark: '#151718' }, 'background');
    const iconColor = useThemeColor({ light: '#3c823c', dark: '#fff' }, 'tint');
    const textColor = useThemeColor({ light: '#062406', dark: '#fff' }, 'text');
    const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
    const dotColor = useThemeColor({ light: '#3c823c', dark: '#fff' }, 'tint');
    const selectedBg = useThemeColor({ light: '#3c823c', dark: '#3c823c' }, 'tint');

    // Get current month info
    const now = new Date();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
        setSelectedDate(null);
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
        setSelectedDate(null);
    };

    // Create calendar grid
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    // Helper to format date as YYYY-MM-DD
    const formatDate = (year: number, month: number, day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    // Check if a date has events
    const hasEvents = (day: number) => {
        const dateStr = formatDate(currentYear, currentMonth, day);
        return events.some(e => e.date === dateStr);
    };

    // Get events for selected date
    const selectedEvents = selectedDate
        ? events
            .filter(e => e.date === selectedDate)
            .sort((a, b) => a.time.localeCompare(b.time)) // Sort by time
        : [];

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText type="title" style={styles.title}>My Calendar</ThemedText>
                
                {loading ? (
                    <ThemedText style={styles.loadingText}>Loading your events...</ThemedText>
                ) : !session ? (
                    <ThemedText style={styles.noEventsText}>Please sign in to see your calendar</ThemedText>
                ) : (
                    <>


                {/* Month Header */}
                <View style={[styles.monthHeader, { backgroundColor: cardBg }]}>
                    <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
                        <IconSymbol name="chevron.left" size={20} color={iconColor} />
                    </TouchableOpacity>
                    <ThemedText type="subtitle">{monthNames[currentMonth]} {currentYear}</ThemedText>
                    <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                        <IconSymbol name="chevron.right" size={20} color={iconColor} />
                    </TouchableOpacity>
                </View>

                {/* Day Labels */}
                <View style={styles.dayLabels}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <View key={day} style={styles.dayLabel}>
                            <ThemedText style={styles.dayLabelText}>{day}</ThemedText>
                        </View>
                    ))}
                </View>

                {/* Calendar Grid */}
                <View style={styles.calendarGrid}>
                    {calendarDays.map((day, index) => {
                        if (day === null) {
                            return <View key={`empty-${index}`} style={styles.dayCell} />;
                        }

                        const dateStr = formatDate(currentYear, currentMonth, day);
                        const isSelected = selectedDate === dateStr;
                        const isToday = day === now.getDate() && currentMonth === now.getMonth();
                        const hasDot = hasEvents(day);

                        return (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.dayCell,
                                    isSelected && { backgroundColor: selectedBg },
                                    isToday && !isSelected && { borderColor: iconColor, borderWidth: 1 },
                                    hasDot && !isSelected && { borderColor: '#fff', borderWidth: 1 }
                                ]}
                                onPress={() => setSelectedDate(dateStr)}
                            >
                                <Text style={[
                                    styles.dayText,
                                    { color: isSelected ? '#fff' : textColor },
                                    isToday && !isSelected && { color: iconColor, fontWeight: '600' }
                                ]}>
                                    {day}
                                </Text>
                                {hasDot && !isSelected && (
                                    <View style={[styles.eventDot, { backgroundColor: dotColor }]} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Selected Date Events */}
                {selectedDate && (
                    <View style={styles.eventsSection}>
                        <ThemedText type="defaultSemiBold" style={styles.eventsHeader}>
                            Events on {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </ThemedText>

                        {selectedEvents.length === 0 ? (
                            <ThemedText style={styles.noEvents}>No events on this date</ThemedText>
                        ) : (
                            <View style={styles.eventsList}>
                                {selectedEvents.map((event) => (
                                    <View key={event.id} style={[styles.eventCard, { backgroundColor: cardBg }]}>
                                        <View style={styles.eventHeader}>
                                            <IconSymbol name="calendar" size={20} color={iconColor} />
                                            <View style={styles.eventHeaderText}>
                                                <ThemedText type="defaultSemiBold" style={styles.eventTitle}>
                                                    {event.title}
                                                </ThemedText>
                                                <ThemedText style={styles.eventClubName}>
                                                    {event.clubName}
                                                </ThemedText>
                                            </View>
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
                    </View>
                )}
                    </>
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
    loadingText: {
        textAlign: 'center',
        opacity: 0.7,
        marginTop: 40,
    },
    noEventsText: {
        textAlign: 'center',
        opacity: 0.7,
        marginTop: 40,
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    navButton: {
        padding: 8,
    },
    dayLabels: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    dayLabel: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    dayLabelText: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.6,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        marginBottom: 4,
        position: 'relative',
    },
    dayText: {
        fontSize: 14,
    },
    eventDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        position: 'absolute',
        bottom: 8,
    },
    eventsSection: {
        marginTop: 8,
    },
    eventsHeader: {
        marginBottom: 12,
        fontSize: 16,
    },
    noEvents: {
        opacity: 0.6,
        fontSize: 14,
    },
    eventsList: {
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
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 8,
    },
    eventHeaderText: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        marginBottom: 2,
    },
    eventClubName: {
        fontSize: 14,
        opacity: 0.8,
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
