import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';

export default function CallTrackerWidget({ targetCalls = 40 }) {
  const [callStats, setCallStats] = useState({
    total: 0,
    hot: 0,
    warm: 0,
    cold: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCallStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchCallStats, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchCallStats = async () => {
    try {
      // Try to fetch from backend API
      const stats = await apiRequest('/api/service-requests/reception/call-stats');
      setCallStats(stats);
    } catch (error) {
      console.warn('Call stats API not available, using mock data:', error);
      // Fallback to mock data if API not implemented yet
      setCallStats({
        total: 32,
        hot: 12,
        warm: 15,
        cold: 5
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = (callStats.total / targetCalls) * 100;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      padding: '24px',
      color: 'white',
      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '800',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📞 Calls Made Today
        </h3>
        <button
          onClick={fetchCallStats}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            color: 'white',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        >
          🔄
        </button>
      </div>

      {/* MAIN COUNT */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '12px'
      }}>
        <div style={{
          fontSize: '48px',
          fontWeight: '900',
          lineHeight: 1
        }}>
          {loading ? '—' : callStats.total}
        </div>
        <div style={{
          fontSize: '20px',
          opacity: 0.9,
          fontWeight: '600'
        }}>
          / {targetCalls}
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div style={{
        width: '100%',
        height: '12px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '999px',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(progress, 100)}%`,
          background: progress >= 100 
            ? 'linear-gradient(90deg, #10b981, #059669)' 
            : 'linear-gradient(90deg, #fff, rgba(255,255,255,0.8))',
          borderRadius: '999px',
          transition: 'width 0.5s ease',
          boxShadow: '0 0 10px rgba(255,255,255,0.5)'
        }} />
      </div>

      {/* CALL CATEGORIES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginTop: 'auto'
      }}>
        {[
          { label: 'HOT', count: callStats.hot, icon: '🔥', color: '#ef4444' },
          { label: 'WARM', count: callStats.warm, icon: '☀️', color: '#f59e0b' },
          { label: 'COLD', count: callStats.cold, icon: '❄️', color: '#60a5fa' }
        ].map(category => (
          <div key={category.label} style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>
              {category.icon}
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '900',
              marginBottom: '2px'
            }}>
              {loading ? '—' : category.count}
            </div>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '700',
              opacity: 0.9
            }}>
              {category.label}
            </div>
          </div>
        ))}
      </div>

      {/* TARGET MESSAGE */}
      <div style={{
        fontSize: '12px',
        textAlign: 'center',
        opacity: 0.85,
        fontWeight: '600',
        padding: '8px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '8px'
      }}>
        {progress >= 100 
          ? '🎉 Target achieved! Great work!' 
          : `${Math.round(progress)}% of daily target`
        }
      </div>
    </div>
  );
}
