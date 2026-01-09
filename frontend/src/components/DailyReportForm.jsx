import { useState } from 'react';
import axios from 'axios';
import VoiceInputButton from './VoiceInputButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DailyReportForm = () => {
  const [formData, setFormData] = useState({
    report_date: new Date().toISOString().split('T')[0],
    calls_made: 0,
    shops_visited: 0,
    enquiries_generated: 0,
    sales_closed: 0,
    report_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/reports/daily`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage({ 
        type: 'success', 
        text: '✅ Daily report submitted successfully!' 
      });
      
      // Reset form
      setFormData({
        ...formData,
        calls_made: 0,
        shops_visited: 0,
        enquiries_generated: 0,
        sales_closed: 0,
        report_notes: ''
      });

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to submit report' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('_') && name !== 'report_notes' && name !== 'report_date' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  return (
    <div className="daily-report-form">
      <div className="form-card">
        <h2>📊 Daily Report Submission</h2>
        <p className="form-subtitle">Submit your daily activities and achievements</p>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="report_date">Date</label>
            <input
              type="date"
              id="report_date"
              name="report_date"
              value={formData.report_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="stats-grid">
            <div className="form-group">
              <label htmlFor="calls_made">
                📞 Calls Made
              </label>
              <input
                type="number"
                id="calls_made"
                name="calls_made"
                value={formData.calls_made}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="shops_visited">
                🏪 Shops Visited
              </label>
              <input
                type="number"
                id="shops_visited"
                name="shops_visited"
                value={formData.shops_visited}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="enquiries_generated">
                📋 Enquiries Generated
              </label>
              <input
                type="number"
                id="enquiries_generated"
                name="enquiries_generated"
                value={formData.enquiries_generated}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sales_closed">
                💰 Sales Closed
              </label>
              <input
                type="number"
                id="sales_closed"
                name="sales_closed"
                value={formData.sales_closed}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="report_notes">
              📝 Notes / Highlights
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <textarea
                id="report_notes"
                name="report_notes"
                value={formData.report_notes}
                onChange={handleChange}
                rows="4"
                placeholder="Describe key activities, challenges, or achievements..."
                style={{ flex: 1 }}
              />
              <VoiceInputButton 
                onTranscript={(text) => {
                  setFormData(prev => ({
                    ...prev,
                    report_notes: prev.report_notes + (prev.report_notes ? ' ' : '') + text
                  }));
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? '⏳ Submitting...' : '📤 Submit Report'}
          </button>
        </form>

        <div className="info-box">
          <p><strong>⏰ Reminder:</strong> Daily reports must be submitted by 7:00 PM.</p>
          <p>If not submitted, reception will be notified automatically.</p>
        </div>
      </div>

      <style jsx>{`
        .daily-report-form {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .form-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        h2 {
          margin: 0 0 10px 0;
          color: #1a1a1a;
          font-size: 24px;
        }

        .form-subtitle {
          color: #666;
          margin: 0 0 25px 0;
        }

        .message {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1.5px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,123,255,0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .info-box {
          margin-top: 25px;
          padding: 15px;
          background: #e7f3ff;
          border-left: 4px solid #007bff;
          border-radius: 6px;
          font-size: 13px;
          line-height: 1.6;
        }

        .info-box p {
          margin: 5px 0;
          color: #004085;
        }

        .info-box strong {
          color: #002752;
        }
      `}</style>
    </div>
  );
};

export default DailyReportForm;
