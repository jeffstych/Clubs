import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, ActivityIndicator, Alert, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { CLUBS } from '@/data/clubs';
import { IconSymbol } from '@/components/ui/icon-symbol';

type QuizQuestion = {
  question_id: string;
  question_text: string;
  options: QuizOption[];
};

type QuizOption = {
  option_id: string;
  question_id: string;
  option_text: string;
  tags: string[];
};

export default function QuizScreen() {
  const { session, refreshProfile } = useAuth();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditMode = edit === 'true';

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Theme colors
  const activeTagColor = useThemeColor({ light: '#fff', dark: '#ffffff' }, 'tint');
  const inactiveTagColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'text');
  const activeBgColor = useThemeColor({ light: '#3c823c', dark: '#3c823c' }, 'tint');
  const inactiveBgColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.05)', dark: 'rgba(255, 255, 255, 0.1)' }, 'background');
  const borderColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.1)', dark: 'rgba(255, 255, 255, 0.2)' }, 'icon');
  const inputBgColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.03)', dark: 'rgba(255, 255, 255, 0.05)' }, 'background');
  const textInputColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');

  // Extract all unique tags and categories from clubs
  const allAvailableInterests = useMemo(() => {
    const interests = new Set<string>();
    CLUBS.forEach((club) => {
      interests.add(club.category);
      club.tags.forEach((tag) => interests.add(tag));
    });
    return Array.from(interests).sort();
  }, []);

  const filteredInterests = useMemo(() => {
    if (!searchQuery) return allAvailableInterests;
    const query = searchQuery.toLowerCase();
    return allAvailableInterests.filter(interest =>
      interest.toLowerCase().includes(query)
    );
  }, [allAvailableInterests, searchQuery]);

  useEffect(() => {
    if (isEditMode) {
      fetchUserPreferences();
    } else {
      fetchQuestions();
    }
  }, [isEditMode]);

  const fetchUserPreferences = async () => {
    try {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('preference_tags')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      setSelectedTags(data?.preference_tags || []);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      Alert.alert('Error', 'Failed to load your preferences');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('question_id, question_text')
        .order('created_at', { ascending: true });

      if (questionsError) throw questionsError;

      const { data: optionsData, error: optionsError } = await supabase
        .from('quiz_question_options')
        .select('option_id, question_id, option_text, tags');

      if (optionsError) throw optionsError;

      const questionsWithOptions = questionsData.map((q) => ({
        ...q,
        options: optionsData.filter((o) => o.question_id === q.question_id),
      }));

      setQuestions(questionsWithOptions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      Alert.alert('Error', 'Failed to load quiz questions');
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (questionId: string, optionId: string) => {
    setSelectedOptions((prev) => {
      const current = prev[questionId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
      } else {
        return { ...prev, [questionId]: [...current, optionId] };
      }
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setSubmitting(true);

    try {
      if (isEditMode) {
        // Save direct tag selections to profile
        const { error } = await supabase
          .from('profiles')
          .update({ preference_tags: selectedTags })
          .eq('user_id', session.user.id);

        if (error) throw error;
      } else {
        // Handle quiz submission (initial flow)
        const unanswered = questions.filter(
          (q) => !selectedOptions[q.question_id] || selectedOptions[q.question_id].length === 0
        );

        if (unanswered.length > 0) {
          Alert.alert('Incomplete', 'Please answer all questions before submitting');
          setSubmitting(false);
          return;
        }

        // Prepare new responses
        const responses: { user_id: string; question_id: string; option_id: string }[] = [];
        const tags = new Set<string>();

        Object.entries(selectedOptions).forEach(([questionId, optionIds]) => {
          optionIds.forEach((optionId) => {
            responses.push({
              user_id: session.user.id,
              question_id: questionId,
              option_id: optionId,
            });
            // Extract tags from selected options to populate preference_tags
            const option = questions.find(q => q.question_id === questionId)?.options.find(o => o.option_id === optionId);
            option?.tags?.forEach(tag => tags.add(tag));
          });
        });

        // Insert responses
        const { error: responseError } = await supabase
          .from('quiz_responses')
          .insert(responses);

        if (responseError) throw responseError;

        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            took_quiz: true,
            preference_tags: Array.from(tags)
          })
          .eq('user_id', session.user.id);

        if (profileError) throw profileError;
      }

      await refreshProfile();

      if (isEditMode) {
        router.back();
      } else {
        router.replace('/(tabs)/explore');
      }

    } catch (error) {
      console.error('Error submitting preferences:', error);
      Alert.alert('Error', 'Failed to save your preferences');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3c823c" />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">
            {isEditMode ? 'Edit Your Interests' : 'Find Your Perfect Clubs'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {isEditMode
              ? 'Select the categories and tags that interest you to get better recommendations.'
              : 'Answer these questions to help us recommend clubs that match your interests.'}
          </ThemedText>
        </ThemedView>

        {isEditMode ? (
          <View style={styles.editInterface}>
            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: inputBgColor }]}>
              <IconSymbol name="magnifyingglass" size={20} color={inactiveTagColor} />
              <TextInput
                style={[styles.searchInput, { color: textInputColor }]}
                placeholder="Search interests (coding, sports...)"
                placeholderTextColor={inactiveTagColor}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.tagsGrid}>
              {filteredInterests.map((interest) => {
                const isSelected = selectedTags.includes(interest);
                return (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.interestChip,
                      {
                        backgroundColor: isSelected ? activeBgColor : inactiveBgColor,
                        borderColor: isSelected ? activeBgColor : borderColor,
                      },
                    ]}
                    onPress={() => toggleTag(interest)}
                  >
                    <ThemedText
                      style={[
                        styles.interestText,
                        {
                          color: isSelected ? activeTagColor : inactiveTagColor,
                          fontWeight: isSelected ? '600' : '400',
                        },
                      ]}
                    >
                      {interest}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          questions.map((question, index) => (
            <View key={question.question_id} style={[styles.questionCard, { borderColor }]}>
              <ThemedText type="subtitle" style={styles.questionNumber}>
                Question {index + 1} of {questions.length}
              </ThemedText>
              <ThemedText style={styles.questionText}>
                {question.question_text}
              </ThemedText>
              <ThemedText style={styles.selectHint}>Select all that apply</ThemedText>

              <View style={styles.optionsContainer}>
                {question.options.map((option) => {
                  const isSelected = selectedOptions[question.question_id]?.includes(option.option_id);
                  return (
                    <TouchableOpacity
                      key={option.option_id}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: isSelected ? activeBgColor : inactiveBgColor,
                          borderColor: isSelected ? activeBgColor : borderColor,
                        },
                      ]}
                      onPress={() => toggleOption(question.question_id, option.option_id)}
                    >
                      <ThemedText
                        style={[
                          styles.optionText,
                          {
                            color: isSelected ? activeTagColor : inactiveTagColor,
                            fontWeight: isSelected ? '600' : '400',
                          },
                        ]}
                      >
                        {option.option_text}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        )}

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.submitButtonText}>
              {isEditMode ? 'Save Changes' : 'Submit & Continue'}
            </ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => isEditMode ? router.back() : router.replace('/(tabs)/explore')}
        >
          <ThemedText style={styles.cancelButtonText}>
            {isEditMode ? 'Cancel' : 'Skip for now'}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 22,
  },
  editInterface: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  interestText: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  questionCard: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  questionNumber: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 26,
  },
  selectHint: {
    fontSize: 13,
    opacity: 0.5,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 15,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#3c823c',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelButton: {
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    opacity: 0.7,
  },
});
