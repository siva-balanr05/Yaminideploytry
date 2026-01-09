import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';

export default function CallManagement() {
  const [stats, setStats] = useState(null);
  const [todayCalls, setTodayCalls] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [todayFollowups, setTodayFollowups] = useState([]);
  const [activeTab, setActiveTab] = useState('new-call'); // new-call, history, followups
  const [loading, setLoading] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    product_name: '',
    call_type: 'New Lead',
    notes: '',
    interest_status: 'NOT_INTERESTED',
    follow_up_date: ''
  });

  const [followupForm, setFollowupForm] = useState({
    product_condition: 'WORKING_FINE',
    follow_up_notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, todayData, followupsData, todayFollowupsData] = await Promise.all([
        apiRequest('/api/calls/stats'),
        apiRequest('/api/calls/today'),
        apiRequest('/api/calls/followups'),
        apiRequest('/api/calls/followups/today')
      ]);
      
      setStats(statsData);
      setTodayCalls(todayData);
      setFollowups(followupsData);
      setTodayFollowups(todayFollowupsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Calculate follow-up date if interested (1-2 weeks from today)
      let followUpDate = null;
      if (formData.interest_status === 'INTERESTED') {
        const today = new Date();
        today.setDate(today.getDate() + 7); // Default to 1 week
        followUpDate = today.toISOString().split('T')[0];
      }
      
      await apiRequest('/api/calls/', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          follow_up_date: followUpDate
        })
      });
      
      // Reset form
      setFormData({
        customer_name: '',
        phone: '',
        email: '',
        address: '',
        product_name: '',
        call_type: 'New Lead',
        notes: '',
        interest_status: 'NOT_INTERESTED',
        follow_up_date: ''
      });
      
      // Reload data
      await loadData();
      
      alert('Call recorded successfully!');
    } catch (error) {
      console.error('Failed to create call:', error);
      alert('Failed to record call: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleFollowupSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await apiRequest(`/api/calls/${selectedCall.id}/followup`, {
        method: 'PUT',
        body: JSON.stringify(followupForm)
      });
      
      setShowFollowupModal(false);
      setSelectedCall(null);
      setFollowupForm({
        product_condition: 'WORKING_FINE',
        follow_up_notes: ''
      });
      
      await loadData();
      
      alert('Follow-up completed successfully!');
    } catch (error) {
      console.error('Failed to complete follow-up:', error);
      alert('Failed to complete follow-up: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const openFollowupModal = (call) => {
    setSelectedCall(call);
    setShowFollowupModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const isOverdue = (followUpDate) => {
    if (!followUpDate) return false;
    const today = new Date();
    const fDate = new Date(followUpDate);
    return fDate < today;
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
          📞 Call Management
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
          Track daily calls and follow-ups
        </p>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{ fontSize: '13px', opacity: '0.9', marginBottom: '8px' }}>Today's Calls</div>
            <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '4px' }}>
              {stats.today_calls}/{stats.daily_target}
            </div>
            <div style={{ fontSize: '13px', opacity: '0.9' }}>
              {stats.completion_percentage}% Complete
            </div>
            <div style={{
              marginTop: '12px',
              height: '6px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(stats.completion_percentage, 100)}%`,
                background: 'white',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ fontSize: '13px', opacity: '0.9', marginBottom: '8px' }}>Interested</div>
            <div style={{ fontSize: '36px', fontWeight: '800' }}>
              {stats.interested_count}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            <div style={{ fontSize: '13px', opacity: '0.9', marginBottom: '8px' }}>Not Interested</div>
            <div style={{ fontSize: '36px', fontWeight: '800' }}>
              {stats.not_interested_count}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}>
            <div style={{ fontSize: '13px', opacity: '0.9', marginBottom: '8px' }}>Pending Follow-ups</div>
            <div style={{ fontSize: '36px', fontWeight: '800' }}>
              {stats.pending_followups}
            </div>
          </div>
        </div>
      )}

      {/* Follow-ups Due Today Alert */}
      {todayFollowups.length > 0 && (
        <div style={{
          background: '#fef3c7',
          border: '2px solid #fbbf24',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '28px' }}>⏰</span>
          <div>
            <div style={{ fontWeight: '700', color: '#92400e', fontSize: '16px' }}>
              {todayFollowups.length} Follow-up{todayFollowups.length > 1 ? 's' : ''} Due Today!
            </div>
            <div style={{ fontSize: '14px', color: '#b45309' }}>
              Click on "Follow-ups" tab to view and complete them
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        borderBottom: '2px solid #e2e8f0'
      }}>
        {['new-call', 'history', 'followups'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === tab ? '#667eea' : 'transparent',
              color: activeTab === tab ? 'white' : '#64748b',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              borderRadius: '8px 8px 0 0',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'new-call' && '➕ New Call'}
            {tab === 'history' && '📋 Today\'s Calls'}
            {tab === 'followups' && '📅 Follow-ups'}
          </button>
        ))}
      </div>

      {/* New Call Form */}
      {activeTab === 'new-call' && (
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          maxWidth: '800px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1e293b' }}>
            Record New Call
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>
                  Call Type *
                </label>
                <select
                  required
                  value={formData.call_type}
                  onChange={(e) => setFormData({...formData, call_type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option>New Lead</option>
                  <option>Follow-up</option>
                  <option>Service Call</option>
                  <option>Product Inquiry</option>
                  <option>Complaint</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>
                  Interest Status *
                </label>
                <select
                  required
                  value={formData.interest_status}
                  onChange={(e) => setFormData({...formData, interest_status: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="NOT_INTERESTED">Not Interested</option>
                  <option value="INTERESTED">Interested</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  placeholder="Add any important details about the call..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {formData.interest_status === 'INTERESTED' && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: '#dcfce7',
                borderRadius: '8px',
                border: '2px solid #86efac'
              }}>
                <div style={{ fontWeight: '600', color: '#166534', marginBottom: '4px' }}>
                  ✓ Follow-up will be scheduled
                </div>
                <div style={{ fontSize: '13px', color: '#15803d' }}>
                  System will automatically set follow-up date to 1 week from today
                </div>
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px 32px',
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                {loading ? 'Saving...' : '📞 Record Call'}
              </button>
              <button
                type="button"
                onClick={() => setFormData({
                  customer_name: '',
                  phone: '',
                  email: '',
                  address: '',
                  product_name: '',
                  call_type: 'New Lead',
                  notes: '',
                  interest_status: 'NOT_INTERESTED',
                  follow_up_date: ''
                })}
                style={{
                  padding: '14px 32px',
                  background: 'white',
                  color: '#64748b',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Today's Calls History */}
      {activeTab === 'history' && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#1e293b' }}>
              Today's Call History ({todayCalls.length})
            </h2>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Time</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Customer</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Phone</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Product</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {todayCalls.map((call, index) => (
                  <tr key={call.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#334155' }}>
                      {formatTime(call.call_time)}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#334155', fontWeight: '600' }}>
                      {call.customer_name}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#334155' }}>
                      {call.phone}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#334155' }}>
                      {call.product_name}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#334155' }}>
                      {call.call_type}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: call.interest_status === 'INTERESTED' ? '#dcfce7' : '#fee2e2',
                        color: call.interest_status === 'INTERESTED' ? '#166534' : '#991b1b'
                      }}>
                        {call.interest_status === 'INTERESTED' ? '✓ Interested' : '✗ Not Interested'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#334155' }}>
                      {call.follow_up_date ? formatDate(call.follow_up_date) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {todayCalls.length === 0 && (
              <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📞</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>No calls recorded today</div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>Start recording calls to track your progress</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Follow-ups List */}
      {activeTab === 'followups' && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#1e293b' }}>
              Follow-up Customers ({followups.length})
            </h2>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Customer</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Phone</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Product</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Follow-up Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Original Call</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {followups.map((call) => {
                  const overdue = isOverdue(call.follow_up_date);
                  return (
                    <tr key={call.id} style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      background: overdue ? '#fef2f2' : 'white'
                    }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#334155', fontWeight: '600' }}>
                        {call.customer_name}
                        {overdue && <span style={{ marginLeft: '8px', color: '#dc2626', fontSize: '12px' }}>⚠️ OVERDUE</span>}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#334155' }}>
                        {call.phone}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#334155' }}>
                        {call.product_name}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: overdue ? '#dc2626' : '#334155', fontWeight: overdue ? '600' : '400' }}>
                        {formatDate(call.follow_up_date)}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>
                        {formatDate(call.call_date)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => openFollowupModal(call)}
                          style={{
                            padding: '8px 16px',
                            background: overdue ? '#dc2626' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          📞 Complete Follow-up
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {followups.length === 0 && (
              <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>No pending follow-ups</div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>Follow-ups appear here when customers show interest</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Follow-up Modal */}
      {showFollowupModal && selectedCall && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#1e293b' }}>
              Complete Follow-up Call
            </h2>
            
            <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Customer:</strong> {selectedCall.customer_name}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Phone:</strong> {selectedCall.phone}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Product:</strong> {selectedCall.product_name}
              </div>
              <div>
                <strong>Original Notes:</strong> {selectedCall.notes || 'None'}
              </div>
            </div>

            <form onSubmit={handleFollowupSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>
                  Product Condition *
                </label>
                <select
                  required
                  value={followupForm.product_condition}
                  onChange={(e) => setFollowupForm({...followupForm, product_condition: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="WORKING_FINE">✓ Working Fine</option>
                  <option value="SERVICE_NEEDED">⚠️ Service Needed</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>
                  Follow-up Notes
                </label>
                <textarea
                  value={followupForm.follow_up_notes}
                  onChange={(e) => setFollowupForm({...followupForm, follow_up_notes: e.target.value})}
                  rows={4}
                  placeholder="Add any details from the follow-up call..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: loading ? '#94a3b8' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Saving...' : '✓ Complete Follow-up'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFollowupModal(false);
                    setSelectedCall(null);
                    setFollowupForm({ product_condition: 'WORKING_FINE', follow_up_notes: '' });
                  }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'white',
                    color: '#64748b',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
