import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { questionnaireApi, Questionnaire } from '../../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  const loadQuestionnaires = async () => {
    try {
      const data = await questionnaireApi.getAll();
      setQuestionnaires(data);
    } catch (error) {
      console.error('Error loading questionnaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFormUrl = (id: string) => {
    return `${window.location.origin}/form/${id}`;
  };

  const getDashboardUrl = (id: string) => {
    return `${window.location.origin}/dashboard/${id}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="admin-header">
        <h1>Questionnaires</h1>
        <Link to="/admin/create" className="btn btn-primary">
          Create New Questionnaire
        </Link>
      </div>

      {questionnaires.length === 0 ? (
        <div className="empty-state">
          <p>No questionnaires yet. Create your first one!</p>
        </div>
      ) : (
        <div className="questionnaire-list">
          {questionnaires.map((questionnaire) => (
            <div key={questionnaire.id} className="questionnaire-card">
              <div className="questionnaire-header">
                <h2>{questionnaire.title}</h2>
                <span className="date">
                  Created: {new Date(questionnaire.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="questionnaire-actions">
                <div className="link-group">
                  <label>Participant Link:</label>
                  <div className="link-input-group">
                    <input
                      type="text"
                      readOnly
                      value={getFormUrl(questionnaire.id)}
                      className="link-input"
                    />
                    <button
                      onClick={() => copyToClipboard(getFormUrl(questionnaire.id))}
                      className="btn btn-secondary"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="link-group">
                  <label>Dashboard Link:</label>
                  <div className="link-input-group">
                    <input
                      type="text"
                      readOnly
                      value={getDashboardUrl(questionnaire.id)}
                      className="link-input"
                    />
                    <button
                      onClick={() => copyToClipboard(getDashboardUrl(questionnaire.id))}
                      className="btn btn-secondary"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <Link
                  to={`/dashboard/${questionnaire.id}`}
                  className="btn btn-primary"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

