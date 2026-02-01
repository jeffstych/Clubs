import { StyleSheet, View, Pressable, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Club } from '@/data/clubs';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { followClub, unfollowClub, isFollowingClub, getSoonestEventForClub, signUpForEvent, removeFromEvent, isSignedUpForEvent } from '@/lib/supabase';
import { useState, useEffect } from 'react';

interface ClubCardProps {
    club: Club;
    onFollowChange?: () => void; // Callback when follow status changes
}

export function ClubCard({ club, onFollowChange }: ClubCardProps) {
    const { session } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [soonestEvent, setSoonestEvent] = useState<any>(null);
    const [isSignedUp, setIsSignedUp] = useState(false);
    const [eventLoading, setEventLoading] = useState(false);

    // Check if user is following this club and load event data on mount
    useEffect(() => {
        if (session?.user?.id) {
            checkFollowStatus();
        }
        loadSoonestEvent();
    }, [session, club.id]);

    const loadSoonestEvent = async () => {
        try {
            const { data: event } = await getSoonestEventForClub(club.id);
            if (event) {
                setSoonestEvent(event);
                if (session?.user?.id) {
                    checkEventSignUpStatus(event.event_id);
                }
            }
        } catch (error) {
            console.error('Error loading soonest event:', error);
        }
    };

    const checkEventSignUpStatus = async (eventId: string) => {
        if (!session?.user?.id) return;

        try {
            const { data: signedUp } = await isSignedUpForEvent(session.user.id, eventId);
            setIsSignedUp(signedUp || false);
        } catch (error) {
            console.error('Error checking event signup status:', error);
        }
    };

    const checkFollowStatus = async () => {
        if (!session?.user?.id) return;

        try {
            const { data: following } = await isFollowingClub(session.user.id, club.id);
            setIsFollowing(following || false);
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    };

    const cardBackgroundColor = useThemeColor({ light: '#ffffff', dark: '#151718' }, 'background');
    // Translucent bubble effect for tags
    const tagBackgroundColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.08)', dark: 'rgba(255, 255, 255, 0.1)' }, 'background');
    const tagBorderColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.15)', dark: 'rgba(255, 255, 255, 0.2)' }, 'icon');

    const eventBgColor = useThemeColor({ light: 'rgba(60, 130, 60, 0.1)', dark: 'rgba(255, 255, 255, 0.1)' }, 'background');
    const iconColor = useThemeColor({ light: '#3c823c', dark: '#fff' }, 'text');
    const followBtnBg = useThemeColor({ light: '#3c823c', dark: '#fff' }, 'tint');
    const followBtnText = useThemeColor({ light: '#fff', dark: '#062406' }, 'background');
    const checkmarkColor = useThemeColor({ light: '#fff', dark: '#062406' }, 'background');

    const handleFollowPress = async (e: any) => {
        e.stopPropagation();
        e.preventDefault();

        if (!session?.user?.id) {
            // Could navigate to login or show alert
            console.log('User must be logged in to follow clubs');
            return;
        }

        setFollowLoading(true);

        try {
            if (isFollowing) {
                const { error } = await unfollowClub(session.user.id, club.id);
                if (!error) {
                    setIsFollowing(false);
                    onFollowChange?.(); // Notify parent of change
                }
            } else {
                const { error } = await followClub(session.user.id, club.id);
                if (!error) {
                    setIsFollowing(true);
                    onFollowChange?.(); // Notify parent of change
                }
            }
        } catch (error) {
            console.error('Error updating follow status:', error);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleEventSignUp = async (e: any) => {
        e.stopPropagation();
        e.preventDefault();

        if (!session?.user?.id) {
            console.log('User must be logged in to sign up for events');
            return;
        }

        if (!soonestEvent) return;

        setEventLoading(true);

        try {
            if (isSignedUp) {
                const { error } = await removeFromEvent(session.user.id, soonestEvent.event_id);
                if (!error) {
                    setIsSignedUp(false);
                }
            } else {
                const { error } = await signUpForEvent(session.user.id, soonestEvent.event_id);
                if (!error) {
                    setIsSignedUp(true);
                }
            }
        } catch (error) {
            console.error('Error updating event signup status:', error);
        } finally {
            setEventLoading(false);
        }
    };

    return (
        <Pressable
            onPress={() => router.push(`/clubs/${club.id}` as any)}
            style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
        >
            <ThemedView style={{ ...styles.card, backgroundColor: cardBackgroundColor }}>
                <Image source={{ uri: club.image }} style={styles.image} contentFit="cover" transition={1000} />
                <View style={styles.content}>
                    <View style={styles.header}>
                        <ThemedText type="subtitle" style={styles.clubName}>{club.name}</ThemedText>
                        <View style={styles.buttonGroup}>
                            <TouchableOpacity
                                style={{
                                    ...styles.followButton,
                                    backgroundColor: isFollowing ? 'transparent' : followBtnBg,
                                    borderColor: followBtnBg,
                                    borderWidth: 1,
                                    opacity: followLoading ? 0.7 : 1,
                                }}
                                onPress={handleFollowPress}
                                disabled={followLoading}
                            >
                                <ThemedText style={{
                                    ...styles.followButtonText,
                                    color: isFollowing ? followBtnBg : followBtnText,
                                }}>
                                    {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ThemedText style={styles.category}>{club.category}</ThemedText>
                    <ThemedText numberOfLines={2} style={styles.description}>
                        {club.description}
                    </ThemedText>
                    {soonestEvent && (
                        <View style={{ ...styles.eventStrip, backgroundColor: eventBgColor }}>
                            <IconSymbol name="sparkles" size={14} color={iconColor} style={styles.eventIcon} />
                            <View style={styles.eventInfo}>
                                <ThemedText style={styles.eventTitle}>
                                    {soonestEvent.event_title}
                                </ThemedText>
                                <ThemedText style={styles.eventDetails}>
                                    {new Date(soonestEvent.event_date).toLocaleDateString()} at {soonestEvent.event_time}
                                </ThemedText>
                                <ThemedText style={styles.eventDetails}>
                                    {soonestEvent.location}
                                </ThemedText>
                            </View>
                            <TouchableOpacity
                                style={{
                                    ...styles.addEventButton,
                                    backgroundColor: isSignedUp ? iconColor : 'transparent',
                                    borderColor: iconColor,
                                    borderWidth: 1,
                                    opacity: eventLoading ? 0.7 : 1,
                                }}
                                onPress={handleEventSignUp}
                                disabled={eventLoading}
                            >
                                <IconSymbol
                                    name={eventLoading ? "ellipsis" : isSignedUp ? "checkmark" : "plus"}
                                    size={12}
                                    color={isSignedUp ? checkmarkColor : iconColor}
                                />
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.tagsContainer}>
                        {club.tags.map((tag) => (
                            <View key={tag} style={{
                                ...styles.tag,
                                backgroundColor: tagBackgroundColor,
                                borderColor: tagBorderColor,
                                borderWidth: 1,
                            }}>
                                <ThemedText style={styles.tagText}>#{tag}</ThemedText>
                            </View>
                        ))}
                    </View>
                </View>
            </ThemedView>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 150,
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    clubName: {
        flex: 1,
        marginRight: 12,
    },
    buttonGroup: {
        flexDirection: 'row',
        flexShrink: 0,
    },
    followButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
    },
    followButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    category: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 8,
    },
    description: {
        marginBottom: 12,
        fontSize: 14,
        opacity: 0.8,
    },
    tagsContainer: {
        marginTop: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '500',
    },
    eventStrip: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    eventInfo: {
        flex: 1,
        marginRight: 8,
    },
    eventTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 2,
    },
    eventDetails: {
        fontSize: 11,
        opacity: 0.8,
        marginBottom: 1,
    },
    addEventButton: {
        marginLeft: 'auto',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventIcon: {
        marginRight: 6,
        marginTop: 1,
    },
});
