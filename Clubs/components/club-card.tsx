import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Club } from '@/data/clubs';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useEvents } from '@/context/EventContext';
import { useFollow } from '@/context/FollowContext';

interface ClubCardProps {
    club: Club;
}

export function ClubCard({ club }: ClubCardProps) {
    const { followClub, unfollowClub, isFollowing } = useFollow();
    const { addEvent, removeEvent, isEventAdded } = useEvents();
    const eventAdded = club.nextEvent ? isEventAdded(club.id) : false;
    const following = isFollowing(club.id);

    const cardBackgroundColor = useThemeColor({ light: '#ffffff', dark: '#151718' }, 'background');
    const tagBackgroundColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.08)', dark: 'rgba(255, 255, 255, 0.1)' }, 'background');
    const tagBorderColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.15)', dark: 'rgba(255, 255, 255, 0.2)' }, 'icon');

    const eventBgColor = useThemeColor({ light: 'rgba(60, 130, 60, 0.1)', dark: 'rgba(255, 255, 255, 0.1)' }, 'background');
    const iconColor = useThemeColor({ light: '#3c823c', dark: '#fff' }, 'text');
    const followBtnBg = useThemeColor({ light: '#3c823c', dark: '#fff' }, 'tint');
    const followBtnText = useThemeColor({ light: '#fff', dark: '#062406' }, 'background');

    const handleFollowPress = (e: any) => {
        e.stopPropagation();
        e.preventDefault();
        if (following) {
            unfollowClub(club.id);
        } else {
            followClub(club.id);
        }
    };

    const handleAddEvent = (e: any) => {
        e.stopPropagation();
        e.preventDefault();
        if (!club.nextEvent) return;

        if (eventAdded) {
            removeEvent(club.id);
        } else {
            const today = new Date();
            const daysUntilTuesday = (2 - today.getDay() + 7) % 7 || 7;
            const nextTuesday = new Date(today);
            nextTuesday.setDate(today.getDate() + daysUntilTuesday);
            const dateStr = nextTuesday.toISOString().split('T')[0];

            addEvent({
                id: club.id,
                clubId: club.id,
                clubName: club.name,
                time: club.nextEvent.time,
                location: club.nextEvent.location,
                date: dateStr,
            });
        }
    };

    return (
        <ThemedView style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
            <Image source={{ uri: club.image }} style={styles.image} contentFit="cover" transition={1000} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <ThemedText type="subtitle">{club.name}</ThemedText>
                    <TouchableOpacity
                        style={[styles.followButton, { backgroundColor: following ? 'transparent' : followBtnBg, borderColor: followBtnBg, borderWidth: 1 }]}
                        onPress={handleFollowPress}
                    >
                        <ThemedText style={[styles.followButtonText, { color: following ? followBtnBg : followBtnText }]}>
                            {following ? 'Following' : 'Follow'}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
                <ThemedText style={styles.category}>{club.category}</ThemedText>
                <ThemedText numberOfLines={2} style={styles.description}>
                    {club.description}
                </ThemedText>
                {club.nextEvent && (
                    <View style={[styles.eventStrip, { backgroundColor: eventBgColor }]}>
                        <IconSymbol name="sparkles" size={14} color={iconColor} style={styles.eventIcon} />
                        <ThemedText style={styles.eventText}>
                            Next: {club.nextEvent.time} @ {club.nextEvent.location}
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.addEventButton, { backgroundColor: eventAdded ? iconColor : 'transparent', borderColor: iconColor, borderWidth: 1 }]}
                            onPress={handleAddEvent}
                        >
                            <IconSymbol
                                name={eventAdded ? "checkmark" : "plus"}
                                size={12}
                                color={eventAdded ? '#fff' : iconColor}
                            />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.tagsContainer}>
                    {club.tags.map((tag) => (
                        <View key={tag} style={[styles.tag, { backgroundColor: tagBackgroundColor, borderColor: tagBorderColor, borderWidth: 1 }]}>
                            <ThemedText style={styles.tagText}>#{tag}</ThemedText>
                        </View>
                    ))}
                </View>
            </View>
        </ThemedView>
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
    followButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
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
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
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
    },
    eventText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
