import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { apiRequest } from '../../utils/api';

const CallsHistory = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [todayCalls, setTodayCalls] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [todayFollowups, setTodayFollowups] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('new-call'); // new-call, today, purchased-followups, interested-followups
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  
  const [callForm, setCallForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    product_name: '',
    call_type: 'New Lead',
    notes: '',
    call_outcome: 'NOT_INTERESTED'
  });

  const [followupForm, setFollowupForm] = useState({
    product_condition: '',
    call_outcome: '',
    notes: ''
  });

  const DAILY_TARGET = 40;

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const [statsData, todayData, followupsData, todayFollowupsData] = await Promise.all([
        apiRequest('/api/calls/stats'),
        apiRequest('/api/calls/today'),
        apiRequest('/api/calls/monthly-followups'),
        apiRequest('/api/calls/monthly-followups/today')
      ]);
      
      setStats(statsData);
      setTodayCalls(todayData || []);
      setFollowups(followupsData || []);
      setTodayFollowups(todayFollowupsData || []);
    } catch (error) {
      console.error('Failed to fetch calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const logCall = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/api/calls/', {
        method: 'POST',
        body: JSON.stringify(callForm)
      });
      
      setCallForm({
        customer_name: '',
        phone: '',
        email: '',
        address: '',
        product_name: '',
        call_type: 'New Lead',
        notes: '',
        call_outcome: 'NOT_INTERESTED'
      });
      fetchCalls();
      alert('✅ Call logged successfully!');
    } catch (error) {
      console.error('Failed to log call:', error);
      alert('❌ Failed to log call');
    }
  };

  const openFollowupModal = (call) => {
    setSelectedCall(call);
    setFollowupForm({
      product_condition: call.call_outcome === 'PURCHASED' ? 'WORKING_FINE' : '',
      call_outcome: call.call_outcome === 'INTERESTED_BUY_LATER' ? 'INTERESTED_BUY_LATER' : '',
      notes: ''
    });
    setShowFollowupModal(true);
  };

  const completeFollowup = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        parent_call_id: selectedCall.id,
        notes: followupForm.notes
      };

      if (selectedCall.call_outcome === 'PURCHASED') {
        payload.product_condition = followupForm.product_condition;
      } else if (selectedCall.call_outcome === 'INTERESTED_BUY_LATER') {
        payload.call_outcome = followupForm.call_outcome;
      }

      await apiRequest('/api/calls/monthly-followup', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setShowFollowupModal(false);
      setSelectedCall(null);
      fetchCalls();
      
      if (followupForm.product_condition === 'SERVICE_NEEDED') {
        alert('✅ Follow-up logged and service complaint created!');
      } else {
        alert('✅ Follow-up logged successfully!');
      }
    } catch (error) {
      console.error('Failed to complete follow-up:', error);
      alert('❌ Failed to complete follow-up');
    }
  };

  const getDaysOverdue = (nextFollowupDate) => {
    const today = new Date();
    const followupDate = new Date(nextFollowupDate);
    const diffTime = today - followupDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const getOutcomeBadgeClass = (outcome) => {
    switch (outcome) {
      case 'PURCHASED':
        return 'outcome-purchased';
      case 'INTERESTED_BUY_LATER':
        return 'outcome-interested';
      case 'NOT_INTERESTED':
        return 'outcome-not-interested';
      default:
        return '';
    }
  };

  const getOutcomeLabel = (outcome) => {
    switch (outcome) {
      case 'PURCHASED':
        return 'Purchased';
      case 'INTERESTED_BUY_LATER':
        return 'Interested (Buy Later)';
      case 'NOT_INTERESTED':
        return 'Not Interested';
      default:
        return outcome;
    }
  };

  const purchasedFollowups = followups.filter(f => f.call_outcome === 'PURCHASED');
  const interestedFollowups = followups.filter(f => f.call_outcome === 'INTERESTED_BUY_LATER');

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className="reception-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>📞 Call Management & Follow-ups</h2>
          <p style={{ color: '#666', marginTop: '8px' }}>Daily target: {DAILY_TARGET} calls</p>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            📊
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.today_calls || 0} / {DAILY_TARGET}</div>
            <div className="stat-label">Today's Calls</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(stats?.completion_percentage || 0, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            🛒
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.purchased_count || 0}</div>
            <div className="stat-label">Purchased Today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            💡
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.interested_buy_later_count || 0}</div>
            <div className="stat-label">Interested (Buy Later)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            📅
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.todays_followups || 0}</div>
            <div className="stat-label">Due Today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }}>
            🔔
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.pending_monthly_followups || 0}</div>
            <div className="stat-label">Total Pending Follow-ups</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'new-call' ? 'active' : ''}`}
            onClick={() => setActiveTab('new-call')}
          >
            📞 Log New Call
          </button>
          <button 
            className={`tab ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            📋 Today's Calls ({todayCalls.length})
          </button>
          <button 
            className={`tab ${activeTab === 'purchased-followups' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchased-followups')}
          >
            🛒 Purchased Follow-ups ({purchasedFollowups.length})
          </button>
          <button 
            className={`tab ${activeTab === 'interested-followups' ? 'active' : ''}`}
            onClick={() => setActiveTab('interested-followups')}
          >
            💡 Interested Follow-ups ({interestedFollowups.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'new-call' && (
          <div className="form-container">
            <h3>📞 Log New Call</h3>
            <form onSubmit={logCall} className="call-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    required
                    value={callForm.customer_name}
                    onChange={(e) => setCallForm({...callForm, customer_name: e.target.value})}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    required
                    type="tel"
                    value={callForm.phone}
                    onChange={(e) => setCallForm({...callForm, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={callForm.email}
                    onChange={(e) => setCallForm({...callForm, email: e.target.value})}
                    placeholder="Enter email (optional)"
                  />
                </div>
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    required
                    value={callForm.product_name}
                    onChange={(e) => setCallForm({...callForm, product_name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  rows="2"
                  value={callForm.address}
                  onChange={(e) => setCallForm({...callForm, address: e.target.value})}
                  placeholder="Enter customer address (optional)"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Call Type *</label>
                  <select
                    required
                    value={callForm.call_type}
                    onChange={(e) => setCallForm({...callForm, call_type: e.target.value})}
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Referral">Referral</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Call Outcome *</label>
                  <select
                    required
                    value={callForm.call_outcome}
                    onChange={(e) => setCallForm({...callForm, call_outcome: e.target.value})}
                  >
                    <option value="NOT_INTERESTED">Not Interested</option>
                    <option value="INTERESTED_BUY_LATER">Interested (Buy Later)</option>
                    <option value="PURCHASED">Purchased</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="3"
                  value={callForm.notes}
                  onChange={(e) => setCallForm({...callForm, notes: e.target.value})}
                  placeholder="Any additional notes or next action..."
                />
              </div>

              <div className="info-box">
                {callForm.call_outcome === 'PURCHASED' && (
                  <p>✅ Monthly follow-ups will be automatically scheduled to check product status.</p>
                )}
                {callForm.call_outcome === 'INTERESTED_BUY_LATER' && (
                  <p>💡 Customer will be added to monthly follow-up list until purchase or rejection.</p>
                )}
                {callForm.call_outcome === 'NOT_INTERESTED' && (
                  <p>⚠️ No follow-up will be scheduled.</p>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Log Call
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'today' && (
          <div>
            <h3>Today's Calls ({todayCalls.length})</h3>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Product</th>
                    <th>Call Type</th>
                    <th>Outcome</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {todayCalls.length === 0 ? (
                    <tr><td colSpan="7" className="empty-state">No calls logged today</td></tr>
                  ) : (
                    todayCalls.map(call => (
                      <tr key={call.id}>
                        <td>{formatTime(call.call_time)}</td>
                        <td>{call.customer_name}</td>
                        <td>{call.phone}</td>
                        <td>{call.product_name}</td>
                        <td><span className="badge-info">{call.call_type}</span></td>
                        <td>
                          <span className={`outcome-badge ${getOutcomeBadgeClass(call.call_outcome)}`}>
                            {getOutcomeLabel(call.call_outcome)}
                          </span>
                        </td>
                        <td>{call.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'purchased-followups' && (
          <div>
            <h3>🛒 Purchased Customers - Monthly Follow-ups ({purchasedFollowups.length})</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Call customers monthly to check product status. If service is needed, a complaint will be auto-created.
            </p>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Product</th>
                    <th>Next Follow-up</th>
                    <th>Follow-up Count</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchasedFollowups.length === 0 ? (
                    <tr><td colSpan="7" className="empty-state">No purchased customers to follow up</td></tr>
                  ) : (
                    purchasedFollowups.map(call => {
                      const daysOverdue = getDaysOverdue(call.next_followup_date);
                      const isDue = daysOverdue >= 0;
                      return (
                        <tr key={call.id} className={isDue ? 'highlight-row' : ''}>
                          <td>{call.customer_name}</td>
                          <td>{call.phone}</td>
                          <td>{call.product_name}</td>
                          <td>
                            {formatDate(call.next_followup_date)}
                            {isDue && <span className="badge-danger" style={{ marginLeft: '8px' }}>Due!</span>}
                          </td>
                          <td>{call.followup_count}</td>
                          <td>
                            {call.product_condition && (
                              <span className={call.product_condition === 'WORKING_FINE' ? 'badge-success' : 'badge-warning'}>
                                {call.product_condition === 'WORKING_FINE' ? '✅ Working Fine' : '⚠️ Service Needed'}
                              </span>
                            )}
                          </td>
                          <td>
                            <button 
                              className="btn-action"
                              onClick={() => openFollowupModal(call)}
                            >
                              📞 Call Now
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'interested-followups' && (
          <div>
            <h3>💡 Interested Customers - Monthly Follow-ups ({interestedFollowups.length})</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Follow up monthly until customer purchases or loses interest.
            </p>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Product</th>
                    <th>Next Follow-up</th>
                    <th>Follow-up Count</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {interestedFollowups.length === 0 ? (
                    <tr><td colSpan="6" className="empty-state">No interested customers to follow up</td></tr>
                  ) : (
                    interestedFollowups.map(call => {
                      const daysOverdue = getDaysOverdue(call.next_followup_date);
                      const isDue = daysOverdue >= 0;
                      return (
                        <tr key={call.id} className={isDue ? 'highlight-row' : ''}>
                          <td>{call.customer_name}</td>
                          <td>{call.phone}</td>
                          <td>{call.product_name}</td>
                          <td>
                            {formatDate(call.next_followup_date)}
                            {isDue && <span className="badge-danger" style={{ marginLeft: '8px' }}>Due!</span>}
                          </td>
                          <td>{call.followup_count}</td>
                          <td>
                            <button 
                              className="btn-action"
                              onClick={() => openFollowupModal(call)}
                            >
                              📞 Call Now
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Follow-up Modal */}
      {showFollowupModal && selectedCall && (
        <div className="modal-overlay" onClick={() => setShowFollowupModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📞 Complete Follow-up Call</h3>
            <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <p><strong>Customer:</strong> {selectedCall.customer_name}</p>
              <p><strong>Phone:</strong> {selectedCall.phone}</p>
              <p><strong>Product:</strong> {selectedCall.product_name}</p>
              <p><strong>Type:</strong> {getOutcomeLabel(selectedCall.call_outcome)}</p>
            </div>

            <form onSubmit={completeFollowup}>
              {selectedCall.call_outcome === 'PURCHASED' && (
                <div className="form-group">
                  <label>Product Status *</label>
                  <select
                    required
                    value={followupForm.product_condition}
                    onChange={(e) => setFollowupForm({...followupForm, product_condition: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="WORKING_FINE">✅ Working Fine</option>
                    <option value="SERVICE_NEEDED">⚠️ Service Needed</option>
                  </select>
                  {followupForm.product_condition === 'SERVICE_NEEDED' && (
                    <div className="alert-warning" style={{ marginTop: '10px' }}>
                      ⚠️ A service complaint will be automatically created
                    </div>
                  )}
                </div>
              )}

              {selectedCall.call_outcome === 'INTERESTED_BUY_LATER' && (
                <div className="form-group">
                  <label>Call Outcome *</label>
                  <select
                    required
                    value={followupForm.call_outcome}
                    onChange={(e) => setFollowupForm({...followupForm, call_outcome: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="PURCHASED">🛒 Purchased Now</option>
                    <option value="INTERESTED_BUY_LATER">💡 Still Interested (Buy Later)</option>
                    <option value="NOT_INTERESTED">❌ Not Interested Anymore</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Follow-up Notes</label>
                <textarea
                  rows="3"
                  value={followupForm.notes}
                  onChange={(e) => setFollowupForm({...followupForm, notes: e.target.value})}
                  placeholder="Enter notes from this follow-up call..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowFollowupModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Complete Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .reception-page {
          padding: 20px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .page-header h2 {
          font-size: 28px;
          color: #2c3e50;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 15px;
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #2c3e50;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
          margin-top: 4px;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #e0e0e0;
          border-radius: 3px;
          margin-top: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
        }

        .tabs-container {
          margin-bottom: 20px;
        }

        .tabs {
          display: flex;
          gap: 10px;
          border-bottom: 2px solid #e0e0e0;
          overflow-x: auto;
        }

        .tab {
          padding: 12px 24px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 15px;
          font-weight: 500;
          color: #666;
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .tab:hover {
          color: #667eea;
          background: #f5f5f5;
        }

        .tab.active {
          color: #667eea;
          border-bottom-color: #667eea;
        }

        .tab-content {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          min-height: 400px;
        }

        .form-container h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
        }

        .call-form {
          max-width: 800px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 8px;
          font-weight: 500;
          color: #2c3e50;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .info-box {
          background: #f0f4ff;
          border-left: 4px solid #667eea;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
        }

        .info-box p {
          margin: 0;
          color: #2c3e50;
        }

        .alert-warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 12px;
          border-radius: 6px;
          color: #856404;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: #e0e0e0;
          color: #2c3e50;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #d0d0d0;
        }

        .btn-action {
          background: #667eea;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-action:hover {
          background: #5568d3;
          transform: scale(1.05);
        }

        .data-table-container {
          overflow-x: auto;
          margin-top: 20px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          background: #f8f9fa;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #2c3e50;
          border-bottom: 2px solid #e0e0e0;
        }

        .data-table td {
          padding: 12px;
          border-bottom: 1px solid #e0e0e0;
        }

        .data-table tr:hover {
          background: #f8f9fa;
        }

        .highlight-row {
          background: #fff3cd !important;
        }

        .highlight-row:hover {
          background: #ffe69c !important;
        }

        .empty-state {
          text-align: center;
          padding: 40px !important;
          color: #999;
        }

        .outcome-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          display: inline-block;
        }

        .outcome-purchased {
          background: #d4edda;
          color: #155724;
        }

        .outcome-interested {
          background: #d1ecf1;
          color: #0c5460;
        }

        .outcome-not-interested {
          background: #f8d7da;
          color: #721c24;
        }

        .badge-info {
          background: #e7f3ff;
          color: #004085;
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 12px;
        }

        .badge-success {
          background: #d4edda;
          color: #155724;
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 12px;
        }

        .badge-warning {
          background: #fff3cd;
          color: #856404;
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 12px;
        }

        .badge-danger {
          background: #f8d7da;
          color: #721c24;
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 12px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default CallsHistory;
