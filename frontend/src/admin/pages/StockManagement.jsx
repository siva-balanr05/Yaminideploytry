import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';

export default function StockManagement() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadMovements();
  }, [filter]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'today' ? '/api/stock-movements?today=true' : '/api/stock-movements';
      const data = await apiRequest(endpoint);
      setMovements(data);
    } catch (error) {
      console.error('Failed to load stock movements:', error);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type) => {
    const isIn = type === 'IN';
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '600',
        background: isIn ? '#DEF7EC' : '#FEE2E2',
        color: isIn ? '#03543F' : '#991B1B',
        border: `1px solid ${isIn ? '#84E1BC' : '#FCA5A5'}`
      }}>
        {type}
      </span>
    );
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>⏳ Loading stock movements...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header Section */}
      <div style={{ padding: '32px 20px', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '32px' }}>📦</span>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#111827' }}>Stock Management</h1>
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
            Track inventory movements and stock changes with real-time updates
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div style={{ padding: '24px 20px', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '10px 18px',
                border: `2px solid ${filter === 'all' ? '#667eea' : '#e5e7eb'}`,
                background: filter === 'all' ? '#667eea' : 'white',
                color: filter === 'all' ? 'white' : '#374151',
                borderRadius: '20px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: filter === 'all' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
              }}
            >
              📋 All Movements
            </button>
            <button
              onClick={() => setFilter('today')}
              style={{
                padding: '10px 18px',
                border: `2px solid ${filter === 'today' ? '#667eea' : '#e5e7eb'}`,
                background: filter === 'today' ? '#667eea' : 'white',
                color: filter === 'today' ? 'white' : '#374151',
                borderRadius: '20px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: filter === 'today' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
              }}
            >
              📅 Today
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '24px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* Stock Movements Table - Desktop & Mobile */}
      {!isMobile ? (
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          border: '1px solid #e5e7eb',
          overflow: 'auto',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📅 Date</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔄 Type</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📦 Item</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔢 Quantity</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📋 Reference</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>✅ Status</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '15px' }}>
                    No stock movements found
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#374151' }}>
                      {new Date(movement.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 20px' }}>{getTypeBadge(movement.movement_type)}</td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>
                      {movement.item_name}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>{movement.quantity}</td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#6b7280' }}>
                      {movement.reference || 'N/A'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#1f2937' }}>
                      {movement.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Mobile Card View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {movements.length === 0 ? (
            <div style={{ 
              background: 'white', 
              padding: '60px 20px', 
              borderRadius: '12px', 
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '15px',
              border: '1px solid #e5e7eb'
            }}>
              No stock movements found
            </div>
          ) : (
            movements.map((movement) => (
              <div
                key={movement.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  padding: '16px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    {movement.item_name}
                  </div>
                  {getTypeBadge(movement.movement_type)}
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '12px',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px', fontWeight: '600', textTransform: 'uppercase' }}>Date</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {new Date(movement.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px', fontWeight: '600', textTransform: 'uppercase' }}>Quantity</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{movement.quantity}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px', fontWeight: '600', textTransform: 'uppercase' }}>Reference</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {movement.reference || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px', fontWeight: '600', textTransform: 'uppercase' }}>Status</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{movement.status}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
