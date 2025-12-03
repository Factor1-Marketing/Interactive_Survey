import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { questionnaireApi } from '../../services/api';
import { useSupabaseRealtime } from '../../hooks/useSupabaseRealtime';
import MultipleChoiceChart from '../Charts/MultipleChoiceChart';
import WordCloud from '../Charts/WordCloud';
import './Dashboard.css';

export default function Dashboard() {
  const { questionnaireId } = useParams<{ questionnaireId: string }>();
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Use Supabase Realtime for real-time updates
  const { results, isConnected } = useSupabaseRealtime(questionnaireId || null);

  useEffect(() => {
    if (questionnaireId) {
      loadQuestionnaire();
      setLoading(false);
    }
  }, [questionnaireId]);

  const loadQuestionnaire = async () => {
    try {
      const data = await questionnaireApi.getById(questionnaireId!);
      setQuestionnaire(data);
    } catch (error) {
      console.error('Error loading questionnaire:', error);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="container">
        <div className="error">Questionnaire not found</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>{questionnaire.title}</h1>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Live Updates Active' : 'Connecting...'}</span>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <p>No answers submitted yet. Share the participant link to start collecting responses.</p>
        </div>
      ) : (
        <div className="results-container">
          {results.map((result) => (
            <div key={result.question.id}>
              {result.question.type === 'multiple_choice' ? (
                <MultipleChoiceChart
                  stats={result.stats || []}
                  questionText={result.question.questionText}
                />
              ) : (
                <WordCloud
                  data={result.wordCloudData || []}
                  questionText={result.question.questionText}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

