import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { answerApi, QuestionResult } from '../services/api';

export function useSupabaseRealtime(questionnaireId: string | null) {
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!questionnaireId) return;

    // Load initial results
    const loadResults = async () => {
      try {
        const data = await answerApi.getByQuestionnaire(questionnaireId);
        // Ensure data is always an array
        const resultsArray = Array.isArray(data) ? data : [];
        console.log('Loaded results:', resultsArray);
        setResults(resultsArray);
        setIsConnected(true);
      } catch (error) {
        console.error('Error loading results:', error);
        setResults([]); // Set empty array on error
      }
    };

    loadResults();

    // Get question IDs for this questionnaire to filter real-time updates
    const getQuestionIds = async () => {
      try {
        const { data: questions } = await supabase
          .from('questions')
          .select('id')
          .eq('questionnaire_id', questionnaireId);

        if (!questions) return [];

        return questions.map(q => q.id);
      } catch (error) {
        console.error('Error fetching question IDs:', error);
        return [];
      }
    };

    // Set up real-time subscription
    let subscription: any = null;

    const setupSubscription = async () => {
      const questionIds = await getQuestionIds();
      console.log('Setting up real-time subscription for question IDs:', questionIds);
      
      if (questionIds.length === 0) {
        console.warn('No question IDs found, cannot set up real-time subscription');
        return;
      }
      
      // Subscribe to answers table changes
      // For Supabase Realtime, we'll subscribe to all INSERTs and filter in the callback
      // This is more reliable than using the filter syntax
      subscription = supabase
        .channel(`questionnaire-${questionnaireId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'answers',
          },
          async (payload) => {
            console.log('Real-time update received:', payload);
            const newAnswer = payload.new as any;
            
            // Check if this answer belongs to one of our questions
            if (newAnswer && newAnswer.question_id && questionIds.includes(newAnswer.question_id)) {
              console.log('Answer belongs to this questionnaire, reloading results...');
              // Reload results when a new answer is inserted
              try {
                const data = await answerApi.getByQuestionnaire(questionnaireId);
                // Ensure data is always an array
                const resultsArray = Array.isArray(data) ? data : [];
                console.log('Reloaded results after real-time update:', resultsArray.length, 'questions');
                setResults(resultsArray);
              } catch (error) {
                console.error('Error reloading results:', error);
              }
            } else {
              console.log('Answer does not belong to this questionnaire, ignoring');
            }
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status);
          setIsConnected(status === 'SUBSCRIBED');
          if (status !== 'SUBSCRIBED') {
            console.warn('Real-time subscription failed, status:', status);
          }
        });
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [questionnaireId]);

  return { results, isConnected };
}

