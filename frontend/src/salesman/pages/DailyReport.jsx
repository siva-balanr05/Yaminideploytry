import React, { useState, useEffect, useRef } from 'react';
import { submitDailyReport, getTodayReport } from '../hooks/useSalesmanApi';
import '../styles/salesman.css';

/**
 * DailyReport Page - Enhanced end of day report submission with voice input
 */
export default function DailyReport() {
  const [todayReport, setTodayReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    calls_made: '',
    meetings_done: '',
    orders_closed: '',
    challenges: '',
    achievements: '',
    tomorrow_plan: '',
  });
  
  // Voice input states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState(null);
  const recognitionRef = useRef(null);
  const recordingFieldRef = useRef(null);

  useEffect(() => {
    checkTodayReport();
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const field = recordingFieldRef.current;
        
        if (field) {
          setFormData(prev => ({
            ...prev,
            [field]: prev[field] ? prev[field] + ' ' + transcript : transcript
          }));
        }
        setIsRecording(false);
        setRecordingField(null);
        recordingFieldRef.current = null;
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setRecordingField(null);
        recordingFieldRef.current = null;
        
        let errorMsg = 'Voice input failed. ';
        if (event.error === 'no-speech') {
          errorMsg += 'No speech detected. Please try again.';
        } else if (event.error === 'not-allowed') {
          errorMsg += 'Microphone access denied. Please allow microphone access.';
        } else {
          errorMsg += 'Please try again.';
        }
        alert(errorMsg);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
        setRecordingField(null);
        recordingFieldRef.current = null;
      };

      recognitionRef.current = recognitionInstance;
    }
  }, []);

  const toggleVoiceInput = (field) => {
    if (!recognitionRef.current) {
      alert('Voice input not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setRecordingField(null);
      recordingFieldRef.current = null;
    } else {
      try {
        setIsRecording(true);
        setRecordingField(field);
        recordingFieldRef.current = field;
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
        alert('Failed to start voice input. Please check microphone permissions.');
        setIsRecording(false);
        setRecordingField(null);
        recordingFieldRef.current = null;
      }
    }
  };

  const checkTodayReport = async () => {
    try {
      const report = await getTodayReport();
      setTodayReport(report);
    } catch (error) {
      // No report for today is fine
      console.log('No report for today yet');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        calls_made: parseInt(formData.calls_made) || 0,
        meetings_done: parseInt(formData.meetings_done) || 0,
        orders_closed: parseInt(formData.orders_closed) || 0
      };
      
      await submitDailyReport(submitData);
      alert('✅ Daily report submitted successfully!');
      await checkTodayReport();
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert(error.response?.data?.detail || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-header"><h2 className="page-title">Loading...</h2></div>;
  }

  // Already submitted
  if (todayReport) {
    return (
      <div>
        <div className="page-header">
          <h2 className="page-title">Daily Report</h2>
          <p className="page-description">Your report for today</p>
        </div>

        <div className="attendance-banner marked">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
              Daily Report Already Submitted
            </div>
            <div style={{ fontSize: '14px', color: '#059669' }}>
              Submitted at: {new Date(todayReport.created_at).toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="form-card">
          <h3 className="section-title">Report Summary</h3>
          <div className="report-summary">
            <div className="report-stat">
              <div className="report-stat-label">Calls Made</div>
              <div className="report-stat-value">{todayReport.calls_made}</div>
            </div>
            <div className="report-stat">
              <div className="report-stat-label">Meetings Done</div>
              <div className="report-stat-value">{todayReport.meetings_done}</div>
            </div>
            <div className="report-stat">
              <div className="report-stat-label">Orders Closed</div>
              <div className="report-stat-value">{todayReport.orders_closed}</div>
            </div>
          </div>
          {todayReport.achievements && (
            <div className="report-field">
              <div className="report-field-label">Achievements</div>
              <div className="report-field-value">{todayReport.achievements}</div>
            </div>
          )}
          {todayReport.challenges && (
            <div className="report-field">
              <div className="report-field-label">Challenges</div>
              <div className="report-field-value">{todayReport.challenges}</div>
            </div>
          )}
          {todayReport.tomorrow_plan && (
            <div className="report-field">
              <div className="report-field-label">Tomorrow's Plan</div>
              <div className="report-field-value">{todayReport.tomorrow_plan}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Submit form
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">📝 Daily Report</h2>
        <p className="page-description">Submit your end-of-day report</p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            border: '2px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '16px', color: '#6B7280', marginBottom: '12px', fontWeight: '500' }}>Calls Made *</div>
            <input
              type="number"
              value={formData.calls_made}
              onChange={(e) => setFormData({ ...formData, calls_made: e.target.value })}
              min="0"
              required
              style={{
                background: 'white',
                border: '2px solid #D1D5DB',
                color: '#1F2937',
                fontSize: '48px',
                fontWeight: '700',
                padding: '16px',
                borderRadius: '12px',
                width: '100%',
                textAlign: 'center'
              }}
              placeholder="0"
            />
          </div>

          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            border: '2px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '16px', color: '#6B7280', marginBottom: '12px', fontWeight: '500' }}>Meetings Done *</div>
            <input
              type="number"
              value={formData.meetings_done}
              onChange={(e) => setFormData({ ...formData, meetings_done: e.target.value })}
              min="0"
              required
              style={{
                background: 'white',
                border: '2px solid #D1D5DB',
                color: '#1F2937',
                fontSize: '48px',
                fontWeight: '700',
                padding: '16px',
                borderRadius: '12px',
                width: '100%',
                textAlign: 'center'
              }}
              placeholder="0"
            />
          </div>

          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            border: '2px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '16px', color: '#6B7280', marginBottom: '12px', fontWeight: '500' }}>Orders Closed *</div>
            <input
              type="number"
              value={formData.orders_closed}
              onChange={(e) => setFormData({ ...formData, orders_closed: e.target.value })}
              min="0"
              required
              style={{
                background: 'white',
                border: '2px solid #D1D5DB',
                color: '#1F2937',
                fontSize: '48px',
                fontWeight: '700',
                padding: '16px',
                borderRadius: '12px',
                width: '100%',
                textAlign: 'center'
              }}
              placeholder="0"
            />
          </div>
        </div>

        {/* Text Fields with Voice Input */}
        <div className="form-card" style={{ padding: '40px', width: '100%', maxWidth: '100%' }}>
          <div className="form-group" style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <label className="form-label" style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>
                🎯 Today's Achievements
              </label>
              <button
                type="button"
                onClick={() => toggleVoiceInput('achievements')}
                style={{
                  background: isRecording && recordingField === 'achievements' ? '#EF4444' : 'white',
                  color: isRecording && recordingField === 'achievements' ? 'white' : '#374151',
                  border: '2px solid #D1D5DB',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isRecording && recordingField === 'achievements' ? '⏹ Stop' : '🎤 Voice'}
              </button>
            </div>
            <textarea
              className="form-control"
              rows="8"
              value={formData.achievements}
              onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
              placeholder="What went well today? Any major wins or milestones..."
              style={{
                fontSize: '16px',
                padding: '20px',
                borderRadius: '16px',
                border: '2px solid #D1D5DB',
                resize: 'vertical',
                lineHeight: '1.8',
                width: '100%',
                minHeight: '200px'
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <label className="form-label" style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>
                ⚠️ Challenges Faced
              </label>
              <button
                type="button"
                onClick={() => toggleVoiceInput('challenges')}
                style={{
                  background: isRecording && recordingField === 'challenges' ? '#EF4444' : 'white',
                  color: isRecording && recordingField === 'challenges' ? 'white' : '#374151',
                  border: '2px solid #D1D5DB',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isRecording && recordingField === 'challenges' ? '⏹ Stop' : '🎤 Voice'}
              </button>
            </div>
            <textarea
              className="form-control"
              rows="8"
              value={formData.challenges}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
              placeholder="Any difficulties, obstacles, or issues you faced..."
              style={{
                fontSize: '16px',
                padding: '20px',
                borderRadius: '16px',
                border: '2px solid #D1D5DB',
                resize: 'vertical',
                lineHeight: '1.8',
                width: '100%',
                minHeight: '200px'
              }}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <label className="form-label" style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>
                📅 Tomorrow's Plan
              </label>
              <button
                type="button"
                onClick={() => toggleVoiceInput('tomorrow_plan')}
                style={{
                  background: isRecording && recordingField === 'tomorrow_plan' ? '#EF4444' : 'white',
                  color: isRecording && recordingField === 'tomorrow_plan' ? 'white' : '#374151',
                  border: '2px solid #D1D5DB',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isRecording && recordingField === 'tomorrow_plan' ? '⏹ Stop' : '🎤 Voice'}
              </button>
            </div>
            <textarea
              className="form-control"
              rows="8"
              value={formData.tomorrow_plan}
              onChange={(e) => setFormData({ ...formData, tomorrow_plan: e.target.value })}
              placeholder="What will you focus on tomorrow? Key priorities..."
              style={{
                fontSize: '16px',
                padding: '20px',
                borderRadius: '16px',
                border: '2px solid #D1D5DB',
                resize: 'vertical',
                lineHeight: '1.8',
                width: '100%',
                minHeight: '200px'
              }}
            />
          </div>

          <div className="form-actions" style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
            <button 
              type="submit" 
              disabled={submitting}
              style={{
                background: '#1F2937',
                color: 'white',
                border: 'none',
                padding: '18px 60px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                opacity: submitting ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="spinner-small"></span>
                  Submitting...
                </span>
              ) : (
                '✓ Submit Daily Report'
              )}
            </button>
          </div>

          <div style={{ 
            marginTop: '28px', 
            padding: '18px', 
            background: '#F9FAFB', 
            borderRadius: '12px',
            border: '2px solid #E5E7EB',
            textAlign: 'center',
            fontSize: '15px',
            color: '#374151'
          }}>
            ⚠️ <strong>Important:</strong> You can only submit one daily report per day. Make sure all information is accurate before submitting.
          </div>
        </div>
      </form>
    </div>
  );
}
