import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Club } from '@/data/clubs';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ClubCardProps {
    club: Club;
}

export function ClubCard({ club }: ClubCardProps) {

    const cardBackgroundColor = useThemeColor({ light: '#ffffff', dark: '#151718' }, 'background');
    const tagBackgroundColor = useThemeColor({ light: '#f0f0f0', dark: '#2A2D2E' }, 'background');
    const eventBgColor = useThemeColor({ light: 'rgba(60, 130, 60, 0.1)', dark: 'rgba(255, 255, 255, 0.1)' }, 'background');
    const iconColor = useThemeColor({ light: '#3c823c', dark: '#fff' }, 'text');

    return (
        <ThemedView style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
            <Image source={{ uri: club.image }} style={styles.image} contentFit="cover" transition={1000} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <ThemedText type="subtitle">{club.name}</ThemedText>
                    <ThemedText style={styles.category}>{club.category}</ThemedText>
                </View>
                <ThemedText numberOfLines={2} style={styles.description}>
                    {club.description}
                </ThemedText>
                <View style={styles.tagsContainer}>
                    {club.tags.map((tag) => (
                        <View key={tag} style={[styles.tag, { backgroundColor: tagBackgroundColor }]}>
                            <ThemedText style={styles.tagText}>{tag}</ThemedText>
                        </View>
                    ))}
                </View>

                {club.nextEvent && (
                    <View style={[styles.eventStrip, { backgroundColor: eventBgColor }]}>
                        <IconSymbol name="sparkles" size={14} color={iconColor} style={styles.eventIcon} />
                        <ThemedText style={styles.eventText}>
                            Next: {club.nextEvent.time} @ {club.nextEvent.location}
                        </ThemedText>
                    </View>
                )}
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
        alignItems: 'center',
        marginBottom: 8,
    },
    category: {
        fontSize: 12,
        opacity: 0.7,
    },
    description: {
        marginBottom: 12,
        fontSize: 14,
        opacity: 0.8,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 10,
    },
    eventStrip: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    eventIcon: {
        marginRight: 6,
    },
    eventText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
