import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getClubEvents, followClub, unfollowClub, isFollowingClub, signUpForEvent, removeFromEvent, isSignedUpForEvent, getClubs } from '@/lib/supabase';

export default function ClubDetailScreen() {
    const { clubId } = useLocalSearchParams();
    const { session } = useAuth();
    const [club, setClub] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [eventSignUps, setEventSignUps] = useState<{[key: string]: boolean}>({});
    const [eventLoading, setEventLoading] = useState<{[key: string]: boolean}>({});

    // Get the club ID as a string
    const clubIdString = Array.isArray(clubId) ? clubId[0] : clubId;

    useEffect(() => {
        if (clubIdString) {
            loadClubData();
        }
    }, [clubIdString, session]);

    const loadClubData = async () => {
        if (!clubIdString) return;
        
        try {
            setLoading(true);
            
            // Load club data from Supabase
            const clubs = await getClubs();
            const foundClub = clubs?.find((c: any) => c.club_id === clubIdString);
            if (foundClub) {
                // Transform Supabase data to match our format
                setClub({
                    id: foundClub.club_id,
                    name: foundClub.club_name,
                    description: foundClub.club_description,
                    category: foundClub.club_category,
                    tags: foundClub.club_tags || [],
                    image: foundClub.club_image
                });
            }
            
            // Load events
            await loadEvents();
            
            // Check follow status if user is logged in
            if (session?.user?.id) {
                const { data: following } = await isFollowingClub(session.user.id, clubIdString);
                setIsFollowing(following || false);
            }
            
        } catch (error) {
            console.error('Error loading club data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadEvents = async () => {
        if (!clubIdString) return;
        
        try {
            const { data: clubEvents } = await getClubEvents(clubIdString);
            if (clubEvents) {
                setEvents(clubEvents);
                
                // Check signup status for each event if user is logged in
                if (session?.user?.id) {
                    const signUpStatuses: {[key: string]: boolean} = {};
                    for (const event of clubEvents) {
                        const { data: signedUp } = await isSignedUpForEvent(session.user.id, event.event_id);
                        signUpStatuses[event.event_id] = signedUp || false;
                    }
                    setEventSignUps(signUpStatuses);
                }
            }
        } catch (error) {
            console.error('Error loading events:', error);
        }
    };

    const handleFollowPress = async () => {
        if (!session?.user?.id || !clubIdString) {
            console.log('User must be logged in to follow clubs');
            return;
        }
        
        setFollowLoading(true);
        
        try {
            if (isFollowing) {
                const { error } = await unfollowClub(session.user.id, clubIdString);
                if (!error) {
                    setIsFollowing(false);
                }
            } else {
                const { error } = await followClub(session.user.id, clubIdString);
                if (!error) {
                    setIsFollowing(true);
                }
            }
        } catch (error) {
            console.error('Error updating follow status:', error);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleEventSignUp = async (eventId: string) => {
        if (!session?.user?.id) {
            console.log('User must be logged in to sign up for events');
            return;
        }
        
        setEventLoading(prev => ({ ...prev, [eventId]: true }));
        
        try {
            const isCurrentlySignedUp = eventSignUps[eventId];
            
            if (isCurrentlySignedUp) {
                const { error } = await removeFromEvent(session.user.id, eventId);
                if (!error) {
                    setEventSignUps(prev => ({ ...prev, [eventId]: false }));
                }
            } else {
                const { error } = await signUpForEvent(session.user.id, eventId);
                if (!error) {
                    setEventSignUps(prev => ({ ...prev, [eventId]: true }));
                }
            }
        } catch (error) {
            console.error('Error updating event signup status:', error);
        } finally {
            setEventLoading(prev => ({ ...prev, [eventId]: false }));
        }
    };

    const cardBg = useThemeColor({ light: '#ffffff', dark: '#151718' }, 'background');
    const iconColor = useThemeColor({ light: '#3c823c', dark: '#fff' }, 'tint');
    const textColor = useThemeColor({ light: '#062406', dark: '#fff' }, 'text');
    const followBtnBg = useThemeColor({ light: '#3c823c', dark: '#fff' }, 'tint');
    const followBtnText = useThemeColor({ light: '#fff', dark: '#062406' }, 'background');
    const eventBgColor = useThemeColor({ light: 'rgba(60, 130, 60, 0.1)', dark: 'rgba(255, 255, 255, 0.1)' }, 'background');
    const tagBackgroundColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.08)', dark: 'rgba(255, 255, 255, 0.1)' }, 'background');
    const tagBorderColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.15)', dark: 'rgba(255, 255, 255, 0.2)' }, 'icon');

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.errorContainer}>
                    <ThemedText>Loading club...</ThemedText>
                </View>
            </ThemedView>
        );
    }

    if (!club) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.errorContainer}>
                    <ThemedText type="title">Club not found</ThemedText>
                    <ThemedText style={styles.errorText}>
                        Looking for club with ID: {clubIdString}
                    </ThemedText>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView>
                {/* Club Header */}
                <View style={styles.header}>
                    <Image source={{ uri: club.image }} style={styles.bannerImage} contentFit="cover" />
                    <View style={[styles.headerContent, { backgroundColor: cardBg }]}>
                        <View style={styles.titleRow}>
                            <View style={styles.titleColumn}>
                                <ThemedText type="title">{club.name}</ThemedText>
                                <ThemedText style={[styles.category, { color: textColor }]}>{club.category}</ThemedText>
                            </View>
                            {session?.user?.id && (
                                <TouchableOpacity
                                    style={[
                                        styles.followButton,
                                        {
                                            backgroundColor: isFollowing ? 'transparent' : followBtnBg,
                                            borderColor: followBtnBg,
                                            opacity: followLoading ? 0.7 : 1,
                                        }
                                    ]}
                                    onPress={handleFollowPress}
                                    disabled={followLoading}
                                >
                                    <ThemedText style={[
                                        styles.followButtonText,
                                        { color: isFollowing ? followBtnBg : followBtnText }
                                    ]}>
                                        {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                        
                        <ThemedText style={[styles.description, { color: textColor }]}>
                            {club.description}
                        </ThemedText>

                        {/* Tags */}
                        <View style={styles.tagsContainer}>
                            {club.tags.map((tag: string) => (
                                <View key={tag} style={[
                                    styles.tag,
                                    {
                                        backgroundColor: tagBackgroundColor,
                                        borderColor: tagBorderColor,
                                    }
                                ]}>
                                    <ThemedText style={styles.tagText}>#{tag}</ThemedText>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Events Section */}
                <View style={[styles.eventsSection, { backgroundColor: cardBg }]}>
                    <ThemedText type="subtitle" style={styles.eventsTitle}>Upcoming Events</ThemedText>
                    
                    {loading ? (
                        <ThemedText style={styles.loadingText}>Loading events...</ThemedText>
                    ) : events.length === 0 ? (
                        <ThemedText style={[styles.noEventsText, { color: textColor }]}>
                            No upcoming events at this time.
                        </ThemedText>
                    ) : (
                        events.map((event) => {
                            const isSignedUp = eventSignUps[event.event_id] || false;
                            const isLoading = eventLoading[event.event_id] || false;
                            
                            return (
                                <View key={event.event_id} style={[styles.eventCard, { backgroundColor: eventBgColor }]}>
                                    <IconSymbol name="sparkles" size={16} color={iconColor} style={styles.eventIcon} />
                                    <View style={styles.eventInfo}>
                                        <ThemedText style={styles.eventTitle}>
                                            {event.event_title}
                                        </ThemedText>
                                        <ThemedText style={[styles.eventDetails, { color: textColor }]}>
                                            {new Date(event.event_date).toLocaleDateString()} at {event.event_time}
                                        </ThemedText>
                                        <ThemedText style={[styles.eventDetails, { color: textColor }]}>
                                            {event.location}
                                        </ThemedText>
                                        {event.event_description && (
                                            <ThemedText style={[styles.eventDescription, { color: textColor }]}>
                                                {event.event_description}
                                            </ThemedText>
                                        )}
                                    </View>
                                    {session?.user?.id && (
                                        <TouchableOpacity
                                            style={[
                                                styles.addEventButton,
                                                {
                                                    backgroundColor: isSignedUp ? iconColor : 'transparent',
                                                    borderColor: iconColor,
                                                    opacity: isLoading ? 0.7 : 1,
                                                }
                                            ]}
                                            onPress={() => handleEventSignUp(event.event_id)}
                                            disabled={isLoading}
                                        >
                                            <IconSymbol
                                                name={isLoading ? "ellipsis" : isSignedUp ? "checkmark" : "plus"}
                                                size={14}
                                                color={isSignedUp ? '#fff' : iconColor}
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginBottom: 16,
    },
    bannerImage: {
        width: '100%',
        height: 200,
    },
    headerContent: {
        padding: 20,
        marginHorizontal: 16,
        marginTop: -30,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    titleColumn: {
        flex: 1,
        marginRight: 12,
    },
    category: {
        fontSize: 14,
        opacity: 0.7,
        marginTop: 4,
    },
    followButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    followButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
        opacity: 0.8,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '500',
    },
    eventsSection: {
        margin: 16,
        marginTop: 0,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    eventsTitle: {
        marginBottom: 16,
    },
    loadingText: {
        textAlign: 'center',
        opacity: 0.7,
        padding: 20,
    },
    noEventsText: {
        textAlign: 'center',
        opacity: 0.7,
        padding: 20,
        fontStyle: 'italic',
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    eventIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    eventInfo: {
        flex: 1,
        marginRight: 10,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    eventDetails: {
        fontSize: 13,
        opacity: 0.8,
        marginBottom: 2,
    },
    eventDescription: {
        fontSize: 13,
        opacity: 0.8,
        marginTop: 4,
        lineHeight: 18,
    },
    addEventButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        marginTop: 2,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        textAlign: 'center',
        marginTop: 8,
        opacity: 0.7,
    },
});