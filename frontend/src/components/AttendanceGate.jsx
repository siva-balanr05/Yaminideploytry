import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AttendanceGate.css';

/**
 * Attendance Reminder Component (OPTIONAL - NO BLOCKING)
 * 
 * Displays a friendly reminder to mark attendance (not a gate).
 * User can dismiss and continue working.
 */
const AttendanceReminder = ({ message, onDismiss }) => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="attendance-reminder" style={{
      background: '#FEF3C7',
      border: '1px solid #F59E0B',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <div style={{ fontSize: '32px' }}>⏰</div>
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#92400E' }}>
            Haven't marked attendance yet
          </h4>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#92400E' }}>
            {today} - Consider marking attendance for better tracking
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/salesman/attendance')}
          style={{
            background: '#F59E0B',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          📸 Mark Attendance
        </button>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            style={{
              background: 'transparent',
              border: '1px solid #92400E',
              color: '#92400E',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Continue Without
          </button>
        )}
      </div>
    </div>
  );
};

export default AttendanceReminder;
