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
      
      // Subscribe to answers table changes
      subscription = supabase
        .channel(`questionnaire-${questionnaireId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'answers',
            filter: `question_id=in.(${questionIds.join(',')})`,
          },
          async () => {
            // Reload results when a new answer is inserted
            try {
              const data = await answerApi.getByQuestionnaire(questionnaireId);
              // Ensure data is always an array
              const resultsArray = Array.isArray(data) ? data : [];
              setResults(resultsArray);
            } catch (error) {
              console.error('Error reloading results:', error);
            }
          }
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
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

