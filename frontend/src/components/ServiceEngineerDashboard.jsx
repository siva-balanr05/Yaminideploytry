import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';
import './ServiceEngineerDashboard.css';

const ServiceEngineerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Attendance State
  const [attendanceStatus, setAttendanceStatus] = useState({
    checked_in: false,
    loading: true
  });
  const [checkingIn, setCheckingIn] = useState(false);

  // Service Requests State
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    in_progress: 0,
    on_hold: 0,
    completed_today: 0,
    sla_breached: 0,
    sla_warning: 0
  });

  // Performance Analytics State
  const [analytics, setAnalytics] = useState(null);

  // Modals State
  const [statusModal, setStatusModal] = useState({ show: false, service: null });
  const [completionModal, setCompletionModal] = useState({ show: false, service: null });
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [qrModal, setQrModal] = useState({ show: false, qr: null, url: null });

  // Filter state
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    checkAttendanceStatus();
  }, []);

  useEffect(() => {
    if (attendanceStatus.checked_in) {
      fetchServices();
      fetchAnalytics();
      const interval = setInterval(fetchServices, 30000);
      return () => clearInterval(interval);
    }
  }, [attendanceStatus.checked_in]);

  const checkAttendanceStatus = async () => {
    try {
      const data = await apiRequest('/api/attendance/status');
      setAttendanceStatus({
        checked_in: data.checked_in,
        attendance: data.attendance,
        loading: false
      });
    } catch (error) {
      console.error('Failed to check attendance:', error);
      setAttendanceStatus({ checked_in: false, loading: false });
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            const checkInData = {
              time: new Date().toLocaleTimeString(),
              location: "Field Location",
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              photo_path: null,
              status: "Present"
            };

            await apiRequest('/api/attendance/check-in', {
              method: 'POST',
              body: JSON.stringify(checkInData)
            });

            const statusData = await apiRequest('/api/attendance/status');
            
            if (statusData.checked_in) {
              setAttendanceStatus({
                checked_in: true,
                attendance: statusData.attendance,
                loading: false
              });
            }
            setCheckingIn(false);
          } catch (error) {
            alert('❌ Check-in failed: ' + error.message);
            setCheckingIn(false);
          }
        }, (error) => {
          alert('Location permission denied. Please enable location.');
          setCheckingIn(false);
        });
      } else {
        alert('Geolocation not supported');
        setCheckingIn(false);
      }
    } catch (error) {
      alert('❌ Check-in failed');
      setCheckingIn(false);
    }
  };

  const fetchServices = async () => {
    try {
      const data = await apiRequest('/api/service-requests/my-services');
      setServices(data);
      calculateStats(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await apiRequest('/api/feedback/engineer/analytics');
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const calculateStats = (data) => {
    const now = new Date();
    const todayStart = new Date(now.setHours(0,0,0,0));

    const stats = {
      total: data.length,
      assigned: data.filter(s => s.status === 'ASSIGNED').length,
      in_progress: data.filter(s => s.status === 'IN_PROGRESS' || s.status === 'ON_THE_WAY').length,
      on_hold: data.filter(s => s.status === 'ON_HOLD').length,
      completed_today: data.filter(s => 
        s.status === 'COMPLETED' && 
        new Date(s.resolved_at) >= todayStart
      ).length,
      sla_breached: data.filter(s => s.sla_status?.status === 'breached').length,
      sla_warning: data.filter(s => s.sla_status?.status === 'warning').length
    };

    setStats(stats);
  };

  const getSLAColor = (status) => {
    const colors = {
      ok: '#10b981',
      warning: '#f59e0b',
      breached: '#ef4444',
      paused: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0h 0m';
    const hours = Math.floor(Math.abs(seconds) / 3600);
    const minutes = Math.floor((Math.abs(seconds) % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await apiRequest(`/api/service-requests/${statusModal.service.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      setStatusModal({ show: false, service: null });
      fetchServices();
    } catch (error) {
      alert('❌ Failed to update status: ' + error.message);
    }
  };

  const handleComplete = async () => {
    if (!resolutionNotes.trim()) {
      alert('Please provide resolution notes');
      return;
    }

    try {
      const response = await apiRequest(`/api/service-requests/${completionModal.service.id}/complete`, {
        method: 'POST',
        body: JSON.stringify({
          resolution_notes: resolutionNotes,
          parts_replaced: partsReplaced || null
        })
      });

      console.log('Complete response:', response);
      console.log('QR:', response.feedback_qr);
      console.log('URL:', response.feedback_url);

      setCompletionModal({ show: false, service: null });
      setResolutionNotes('');
      setPartsReplaced('');
      
      if (response.feedback_qr && response.feedback_url) {
        setQrModal({
          show: true,
          qr: response.feedback_qr,
          url: response.feedback_url
        });
      } else {
        alert('⚠️ Warning: Feedback QR/URL not generated. Check console logs.');
      }

      fetchServices();
      fetchAnalytics();
    } catch (error) {
      console.error('Completion error:', error);
      alert('❌ Failed to complete service: ' + error.message);
    }
  };

  const getNextStatus = (currentStatus) => {
    const transitions = {
      'ASSIGNED': ['ON_THE_WAY', 'ON_HOLD'],
      'ON_THE_WAY': ['IN_PROGRESS', 'ON_HOLD'],
      'IN_PROGRESS': ['ON_HOLD', 'COMPLETED'],
      'ON_HOLD': ['IN_PROGRESS']
    };
    return transitions[currentStatus] || [];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'CRITICAL': '#dc2626',
      'URGENT': '#f59e0b',
      'NORMAL': '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  const filteredServices = services.filter(service => {
    if (activeFilter === 'all') return service.status !== 'COMPLETED';
    if (activeFilter === 'critical') return service.priority === 'CRITICAL';
    if (activeFilter === 'sla-risk') return service.sla_status?.status === 'warning' || service.sla_status?.status === 'breached';
    return true;
  });

  // Attendance Gate
  if (attendanceStatus.loading) {
    return (
      <div className="se-loading-screen">
        <div className="se-spinner"></div>
        <p>Loading workspace...</p>
      </div>
    );
  }

  if (!attendanceStatus.checked_in) {
    return (
      <div className="se-attendance-gate">
        <div className="se-gate-card">
          <div className="se-gate-icon">🔐</div>
          <h1>Attendance Required</h1>
          <p>Start your workday by checking in</p>
          <div className="se-gate-info">
            <div className="se-gate-info-item">
              <span className="icon">📍</span>
              <span>Location tracking enabled</span>
            </div>
            <div className="se-gate-info-item">
              <span className="icon">⏰</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
          <button 
            className="se-btn-checkin" 
            onClick={handleCheckIn}
            disabled={checkingIn}
          >
            {checkingIn ? '⏳ Checking In...' : '✅ Check In Now'}
          </button>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="se-dashboard">
      {/* Header Section */}
      <div className="se-header">
        <div className="se-header-left">
          <div className="se-header-icon">🔧</div>
          <div className="se-header-text">
            <h1>Service Engineer</h1>
            <p>Welcome back, <strong>{user?.full_name || user?.name}</strong></p>
          </div>
        </div>
        <div className="se-header-right">
          <div className="se-attendance-badge">
            <span className="badge-icon">✅</span>
            <span>Checked in at {new Date(attendanceStatus.attendance.date).toLocaleTimeString()}</span>
          </div>
          <button className="se-btn-refresh" onClick={fetchServices}>
            <span className="icon">🔄</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Performance Analytics */}
      {analytics && (
        <div className="se-analytics-card">
          <h2><span className="icon">📊</span> Your Performance</h2>
          <div className="se-analytics-grid">
            <div className="se-metric">
              <div className="metric-icon">⭐</div>
              <div className="metric-value">{analytics.average_rating?.toFixed(1) || 'N/A'}</div>
              <div className="metric-label">Avg Rating</div>
            </div>
            <div className="se-metric">
              <div className="metric-icon">📈</div>
              <div className="metric-value">{analytics.sla_compliance_percentage?.toFixed(0) || '0'}%</div>
              <div className="metric-label">SLA Compliance</div>
            </div>
            <div className="se-metric">
              <div className="metric-icon">🎯</div>
              <div className="metric-value">{analytics.performance_score?.toFixed(0) || '0'}</div>
              <div className="metric-label">Performance Score</div>
            </div>
            <div className="se-metric">
              <div className="metric-icon">🛠</div>
              <div className="metric-value">{analytics.total_services || 0}</div>
              <div className="metric-label">Total Services</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="se-stats-grid">
        <div className="se-stat-card stat-active">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Active Jobs</div>
          </div>
        </div>
        <div className="se-stat-card stat-completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completed_today}</div>
            <div className="stat-label">Completed Today</div>
          </div>
        </div>
        <div className="se-stat-card stat-warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.sla_warning}</div>
            <div className="stat-label">SLA Warning</div>
          </div>
        </div>
        <div className="se-stat-card stat-critical">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-value">{stats.sla_breached}</div>
            <div className="stat-label">SLA Breached</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="se-filter-tabs">
        <button 
          className={`se-filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          <span className="icon">📋</span>
          All Jobs ({services.filter(s => s.status !== 'COMPLETED').length})
        </button>
        <button 
          className={`se-filter-tab ${activeFilter === 'critical' ? 'active' : ''}`}
          onClick={() => setActiveFilter('critical')}
        >
          <span className="icon">🔥</span>
          Critical ({services.filter(s => s.priority === 'CRITICAL').length})
        </button>
        <button 
          className={`se-filter-tab ${activeFilter === 'sla-risk' ? 'active' : ''}`}
          onClick={() => setActiveFilter('sla-risk')}
        >
          <span className="icon">⏱</span>
          SLA Risk ({services.filter(s => s.sla_status?.status === 'warning' || s.sla_status?.status === 'breached').length})
        </button>
      </div>

      {/* Service Jobs List */}
      <div className="se-jobs-section">
        <div className="se-section-header">
          <h2><span className="icon">🛠</span> My Service Jobs</h2>
        </div>
        
        {loading ? (
          <div className="se-loading">
            <div className="se-spinner"></div>
            <p>Loading jobs...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="se-empty-state">
            <div className="empty-icon">🎉</div>
            <h3>No Jobs Found</h3>
            <p>You're all caught up! Check back later for new assignments.</p>
          </div>
        ) : (
          <div className="se-jobs-grid">
            {filteredServices.map(service => {
              const slaStatus = service.sla_status?.status || 'ok';
              const slaRemaining = service.sla_status?.remaining_seconds || 0;
              
              return (
                <div key={service.id} className={`se-job-card priority-${service.priority?.toLowerCase()}`}>
                  {/* Card Header */}
                  <div className="job-card-header">
                    <div className="job-card-title">
                      <h3>#{service.id}</h3>
                      <span className={`priority-badge priority-${service.priority?.toLowerCase()}`}>
                        {service.priority || 'NORMAL'}
                      </span>
                    </div>
                    <div className={`sla-badge sla-${slaStatus}`}>
                      <div className="sla-label">
                        {slaStatus === 'breached' && '🚨 BREACHED'}
                        {slaStatus === 'warning' && '⚠️ WARNING'}
                        {slaStatus === 'ok' && '✅ ON TRACK'}
                        {slaStatus === 'paused' && '⏸️ PAUSED'}
                      </div>
                      <div className="sla-time">
                        {slaStatus === 'breached' 
                          ? `+${formatTime(slaRemaining)}`
                          : formatTime(slaRemaining)
                        }
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="job-card-body">
                    <div className="job-info">
                      <div className="info-row">
                        <span className="icon">👤</span>
                        <span className="label">Customer:</span>
                        <span className="value">{service.customer_name}</span>
                      </div>
                      <div className="info-row">
                        <span className="icon">📞</span>
                        <span className="label">Phone:</span>
                        <span className="value">{service.customer_phone || service.phone || 'N/A'}</span>
                      </div>
                      <div className="info-row">
                        <span className="icon">📍</span>
                        <span className="label">Address:</span>
                        <span className="value">{service.address || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="job-issue">
                      <div className="issue-label">
                        <span className="icon">🔧</span>
                        <span>Issue Description</span>
                      </div>
                      <p className="issue-text">{service.fault_description || service.complaint_text}</p>
                    </div>

                    {service.product && (
                      <div className="job-product">
                        <span className="icon">🖨️</span>
                        {service.product.name} - {service.product.model}
                      </div>
                    )}

                    <div className="job-meta">
                      <span className={`status-badge status-${service.status?.toLowerCase()}`}>
                        {service.status?.replace('_', ' ')}
                      </span>
                      <span className="created-time">
                        <span className="icon">🕐</span>
                        {new Date(service.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="job-card-actions">
                    {service.status === 'COMPLETED' ? (
                      <button className="se-btn se-btn-disabled">
                        <span className="icon">✅</span>
                        Completed
                      </button>
                    ) : (
                      <>
                        <button 
                          className="se-btn se-btn-secondary"
                          onClick={() => setStatusModal({ show: true, service })}
                        >
                          <span className="icon">🔄</span>
                          Update Status
                        </button>
                        
                        {(service.status === 'IN_PROGRESS' || service.status === 'ON_THE_WAY') && (
                          <button 
                            className="se-btn se-btn-primary"
                            onClick={() => setCompletionModal({ show: true, service })}
                          >
                            <span className="icon">✅</span>
                            Complete Job
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusModal.show && (
        <div className="se-modal-overlay" onClick={() => setStatusModal({ show: false, service: null })}>
          <div className="se-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Job Status</h2>
              <button className="modal-close" onClick={() => setStatusModal({ show: false, service: null })}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle">Job #{statusModal.service.id} - Current: <strong>{statusModal.service.status}</strong></p>
              
              <div className="status-options">
                {getNextStatus(statusModal.service.status).map(status => (
                  <button
                    key={status}
                    className="status-option"
                    onClick={() => handleStatusUpdate(status)}
                  >
                    <span className="icon">➜</span>
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {completionModal.show && (
        <div className="se-modal-overlay" onClick={() => setCompletionModal({ show: false, service: null })}>
          <div className="se-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Complete Service Job</h2>
              <button className="modal-close" onClick={() => setCompletionModal({ show: false, service: null })}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle">Job #{completionModal.service.id}</p>
              
              <div className="form-group">
                <label>Resolution Notes *</label>
                <textarea
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="Describe what was done to resolve the issue..."
                  rows={5}
                  required
                />
              </div>

              <div className="form-group">
                <label>Parts Replaced (Optional)</label>
                <input
                  type="text"
                  value={partsReplaced}
                  onChange={e => setPartsReplaced(e.target.value)}
                  placeholder="e.g., Drum unit, Toner cartridge"
                />
              </div>

              <div className="modal-actions">
                <button className="se-btn se-btn-primary" onClick={handleComplete}>
                  <span className="icon">✅</span>
                  Complete & Generate QR
                </button>
                <button 
                  className="se-btn se-btn-secondary"
                  onClick={() => {
                    setCompletionModal({ show: false, service: null });
                    setResolutionNotes('');
                    setPartsReplaced('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal.show && (
        <div className="se-modal-overlay" onClick={() => setQrModal({ show: false, qr: null, url: null })}>
          <div className="se-modal se-qr-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✅ Service Completed!</h2>
              <button className="modal-close" onClick={() => setQrModal({ show: false, qr: null, url: null })}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle">Show this QR code to customer for feedback</p>
              
              {qrModal.qr && (
                <div className="qr-container">
                  <img src={`data:image/png;base64,${qrModal.qr}`} alt="Feedback QR Code" />
                </div>
              )}

              <div className="feedback-url">
                <strong>Feedback Link:</strong>
                <a href={qrModal.url} target="_blank" rel="noopener noreferrer">
                  {qrModal.url}
                </a>
              </div>

              <button 
                className="se-btn se-btn-primary"
                onClick={() => setQrModal({ show: false, qr: null, url: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceEngineerDashboard;
