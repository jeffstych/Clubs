import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Theme colors matching explore page
  const activeTagColor = useThemeColor({ light: '#fff', dark: '#062406' }, 'tint');
  const inactiveTagColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'text');
  const activeBgColor = useThemeColor({ light: '#3c823c', dark: '#ffffff' }, 'tint');
  const inactiveBgColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.05)', dark: 'rgba(255, 255, 255, 0.1)' }, 'background');
  const borderColor = useThemeColor({ light: 'rgba(6, 36, 6, 0.1)', dark: 'rgba(255, 255, 255, 0.2)' }, 'icon');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('question_id, question_text')
        .order('created_at', { ascending: true });

      if (questionsError) throw questionsError;

      // Fetch all options
      const { data: optionsData, error: optionsError } = await supabase
        .from('quiz_question_options')
        .select('option_id, question_id, option_text, tags');

      if (optionsError) throw optionsError;

      // Group options by question
      const questionsWithOptions = questionsData.map((q) => ({
        ...q,
        options: optionsData.filter((o) => o.question_id === q.question_id),
      }));

      setQuestions(questionsWithOptions);

      // If edit mode, load existing responses
      if (isEditMode && session?.user?.id) {
        const { data: existingResponses, error: responsesError } = await supabase
          .from('quiz_responses')
          .select('question_id, option_id')
          .eq('user_id', session.user.id);

        if (responsesError) throw responsesError;

        // Build selected options map from existing responses
        const existingSelections: Record<string, string[]> = {};
        existingResponses?.forEach((r) => {
          if (!existingSelections[r.question_id]) {
            existingSelections[r.question_id] = [];
          }
          existingSelections[r.question_id].push(r.option_id);
        });

        setSelectedOptions(existingSelections);
      }
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

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    // Check if at least one option is selected for each question
    const unanswered = questions.filter(
      (q) => !selectedOptions[q.question_id] || selectedOptions[q.question_id].length === 0
    );

    if (unanswered.length > 0) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);

    try {
      // If edit mode, delete existing responses first
      if (isEditMode) {
        const { error: deleteError } = await supabase
          .from('quiz_responses')
          .delete()
          .eq('user_id', session.user.id);

        if (deleteError) throw deleteError;
      }

      // Prepare new responses
      const responses: { user_id: string; question_id: string; option_id: string }[] = [];
      
      Object.entries(selectedOptions).forEach(([questionId, optionIds]) => {
        optionIds.forEach((optionId) => {
          responses.push({
            user_id: session.user.id,
            question_id: questionId,
            option_id: optionId,
          });
        });
      });

      // Insert responses
      const { error: responseError } = await supabase
        .from('quiz_responses')
        .insert(responses);

      if (responseError) throw responseError;

      // Update profile to mark quiz as taken (in case it wasn't already)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ took_quiz: true })
        .eq('user_id', session.user.id);

      if (profileError) throw profileError;

      // Refresh the auth context to update tookQuiz
      await refreshProfile();

      // Navigate appropriately
      if (isEditMode) {
        router.replace('/(tabs)/profile');
      } else {
        router.replace('/(tabs)/explore');
      }

    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Loading quiz...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">
            {isEditMode ? 'Edit Your Preferences' : 'Find Your Perfect Clubs'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {isEditMode 
              ? 'Update your answers to get better club recommendations.'
              : 'Answer these questions to help us recommend clubs that match your interests.'}
          </ThemedText>
        </ThemedView>

        {questions.map((question, index) => (
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
        ))}

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

        {isEditMode && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
        )}
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
