import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  coverImage?: string;
  memberCount: number;
  tags: string[];
  socialLinks?: {
    instagram?: string;
    discord?: string;
    website?: string;
  };
}

interface Event {
  id: string;
  clubId: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  image?: string;
  registrationLink?: string;
}

export default function ClubPage() {
  const { clubId } = useLocalSearchParams();

  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with your actual API calls
    const fetchData = async () => {
      try {
        // Mock data for now
        setClub({
          id: clubId as string,
          name: "Tech Innovation Club",
          description: "A community of students passionate about technology and innovation. We host workshops, hackathons, and networking events.",
          category: "Technology",
          logo: "https://via.placeholder.com/150",
          coverImage: "https://via.placeholder.com/400x200",
          memberCount: 245,
          tags: ["coding", "hackathons", "ai", "networking"],
          socialLinks: {
            instagram: "https://instagram.com/techclub",
            discord: "https://discord.gg/techclub"
          }
        });

        setEvents([
          {
            id: "1",
            clubId: clubId as string,
            title: "AI Workshop: Intro to Machine Learning",
            description: "Learn the basics of machine learning with hands-on examples and real-world applications.",
            date: new Date("2024-02-15"),
            time: "6:00 PM",
            location: "Engineering Building, Room 101",
            image: "https://via.placeholder.com/400x200",
            registrationLink: "https://example.com/register"
          },
          {
            id: "2",
            clubId: clubId as string,
            title: "Spring Hackathon 2024",
            description: "24-hour coding competition with amazing prizes. All skill levels welcome!",
            date: new Date("2024-03-01"),
            time: "9:00 AM",
            location: "Student Union",
            image: "https://via.placeholder.com/400x200"
          }
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [clubId]);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // TODO: Add API call to update following status
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!club) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Club not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Club Header Section */}
      <View style={styles.headerContainer}>
        {/* Cover Image */}
        {club.coverImage && (
          <Image
            source={{ uri: club.coverImage }}
            style={styles.coverImage}
          />
        )}

        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            {/* Club Logo */}
            {club.logo && (
              <Image
                source={{ uri: club.logo }}
                style={styles.logo}
              />
            )}

            <View style={styles.headerInfo}>
              <Text style={styles.clubName}>{club.name}</Text>
              <Text style={styles.category}>{club.category}</Text>

              {/* Follow Button */}
              <TouchableOpacity
                onPress={handleFollowToggle}
                style={[
                  styles.followButton,
                  isFollowing ? styles.followingButton : styles.notFollowingButton
                ]}
              >
                <Text
                  style={[
                    styles.followButtonText,
                    isFollowing ? styles.followingText : styles.notFollowingText
                  ]}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>{club.description}</Text>

          {/* Stats and Tags */}
          <View style={styles.statsContainer}>
            <Text style={styles.memberCount}>
              {club.memberCount.toLocaleString()} members
            </Text>
          </View>

          {club.tags && club.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {club.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Social Links */}
          {club.socialLinks && (
            <View style={styles.socialLinks}>
              {club.socialLinks.instagram && (
                <Text style={styles.socialLink}>Instagram</Text>
              )}
              {club.socialLinks.discord && (
                <Text style={styles.socialLink}>Discord</Text>
              )}
              {club.socialLinks.website && (
                <Text style={styles.socialLink}>Website</Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Events Section */}
      <View style={styles.eventsSection}>
        <View style={styles.eventsSectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <Text style={styles.eventCount}>{events.length} events</Text>
        </View>

        {events.length > 0 ? (
          events.map((event) => {
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            return (
              <View key={event.id} style={styles.eventCard}>
                {/* Event Image */}
                {event.image && (
                  <Image
                    source={{ uri: event.image }}
                    style={styles.eventImage}
                  />
                )}

                {/* Event Details */}
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    {/* Date Badge */}
                    <View style={styles.dateBadge}>
                      <Text style={styles.dateMonth}>
                        {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                      </Text>
                      <Text style={styles.dateDay}>{eventDate.getDate()}</Text>
                    </View>

                    {/* Event Info */}
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>{event.title}</Text>

                      <View style={styles.eventDetails}>
                        <Text style={styles.eventDetail}>
                          📅 {formattedDate} at {event.time}
                        </Text>
                        <Text style={styles.eventDetail}>📍 {event.location}</Text>
                      </View>

                      <Text style={styles.eventDescription} numberOfLines={2}>
                        {event.description}
                      </Text>

                      {/* Registration Button */}
                      {event.registrationLink && (
                        <TouchableOpacity style={styles.registerButton}>
                          <Text style={styles.registerButtonText}>Register</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.noEvents}>
            <Text style={styles.noEventsText}>No upcoming events</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#6B7280',
    fontSize: 16,
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  headerContent: {
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginTop: -40,
    backgroundColor: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  category: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  followButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  notFollowingButton: {
    backgroundColor: '#3B82F6',
  },
  followingButton: {
    backgroundColor: '#E5E7EB',
  },
  followButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  notFollowingText: {
    color: '#FFFFFF',
  },
  followingText: {
    color: '#374151',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    marginTop: 12,
    lineHeight: 20,
  },
  statsContainer: {
    marginTop: 12,
  },
  memberCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  socialLink: {
    fontSize: 12,
    color: '#3B82F6',
  },
  eventsSection: {
    padding: 16,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  eventCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  dateBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  dateMonth: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  dateDay: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  eventDetails: {
    marginTop: 8,
    gap: 4,
  },
  eventDetail: {
    fontSize: 12,
    color: '#6B7280',
  },
  eventDescription: {
    fontSize: 12,
    color: '#374151',
    marginTop: 12,
    lineHeight: 18,
  },
  registerButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  noEvents: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  noEventsText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});