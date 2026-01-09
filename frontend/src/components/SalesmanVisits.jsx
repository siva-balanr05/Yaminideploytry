import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';
import VoiceInputButton from './VoiceInputButton';

const SalesmanVisits = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    shop_name: '',
    shop_address: '',
    customer_contact: '',
    location: '',
    requirements: '',
    product_interest: '',
    expected_closing: '',
    follow_up_date: '',
    visit_type: 'New',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  
  // ❌ REMOVED ATTENDANCE CHECK - No blocking

  useEffect(() => {
    // Fetch visits when component mounts
    if (user) {
      fetchVisits();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchVisits = async () => {
    // ❌ REMOVED ATTENDANCE GUARD - No blocking

    try {
      const data = await apiRequest('/api/sales/my-visits');
      setVisits(data || []);
    } catch (error) {
      console.error('Failed to fetch visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Helper to convert date string (YYYY-MM-DD) to ISO datetime string
      const formatDateTime = (dateStr) => {
        if (!dateStr) return null;
        // Date input returns "YYYY-MM-DD", convert to ISO datetime
        // Add time component (midnight UTC) to make it a valid datetime
        return `${dateStr}T00:00:00.000Z`;
      };
      
      // Prepare data with proper datetime formatting
      const visitData = {
        customer_name: formData.customer_name,
        location: formData.location,
        requirements: formData.requirements,
        visit_type: formData.visit_type,
        // Optional fields - send null if empty
        shop_name: formData.shop_name || null,
        shop_address: formData.shop_address || null,
        customer_contact: formData.customer_contact || null,
        product_interest: formData.product_interest || null,
        notes: formData.notes || null,
        // Date fields - convert to datetime or send null
        expected_closing: formatDateTime(formData.expected_closing),
        follow_up_date: formatDateTime(formData.follow_up_date)
      };
      
      await apiRequest('/api/sales/visits', {
        method: 'POST',
        body: JSON.stringify(visitData)
      });
      
      alert('Visit recorded successfully!');
      setShowForm(false);
      setFormData({
        customer_name: '',
        shop_name: '',
        shop_address: '',
        customer_contact: '',
        location: '',
        requirements: '',
        product_interest: '',
        expected_closing: '',
        follow_up_date: '',
        visit_type: 'New',
        notes: ''
      });
      fetchVisits();
    } catch (error) {
      console.error('Failed to create visit:', error);
      alert(`Failed to record visit: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ❌ REMOVED ATTENDANCE LOADING CHECK - No blocking

  if (loading) {
    return <div className="loading">⏳ Loading visits...</div>;
  }

  // ❌ REMOVED ATTENDANCE GATE - No blocking anymore

  return (
    <div className="visits-page">
      <div className="page-header">
        <div>
          <h1>🏢 Field Visits</h1>
          <p>Track customer visits and field work</p>
        </div>
        <div className="header-actions">
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Visit'}
          </button>
          <button className="btn-back" onClick={() => navigate('/salesman/dashboard')}>
            ← Back
          </button>
        </div>
      </div>

      {showForm && (
        <div className="visit-form-container">
          <h2>📝 Record New Visit</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Customer Name *</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required
                    style={{ flex: 1 }}
                  />
                  <VoiceInputButton 
                    fieldContext="customer_name"
                    onTranscript={(text) => setFormData({...formData, customer_name: text})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Shop Name</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={formData.shop_name}
                    onChange={(e) => setFormData({...formData, shop_name: e.target.value})}
                    style={{ flex: 1 }}
                  />
                  <VoiceInputButton 
                    fieldContext="shop_name"
                    onTranscript={(text) => setFormData({...formData, shop_name: text})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Contact Number</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="tel"
                    value={formData.customer_contact}
                    onChange={(e) => setFormData({...formData, customer_contact: e.target.value})}
                    style={{ flex: 1 }}
                  />
                  <VoiceInputButton 
                    fieldContext="phone"
                    onTranscript={(text) => setFormData({...formData, customer_contact: text})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group full-width">
                <label>Shop Address</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <textarea
                    value={formData.shop_address}
                    onChange={(e) => setFormData({...formData, shop_address: e.target.value})}
                    rows="2"
                    style={{ flex: 1 }}
                  />
                  <VoiceInputButton 
                    fieldContext="address"
                    onTranscript={(text) => setFormData({...formData, shop_address: text})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Product Interest</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={formData.product_interest}
                    onChange={(e) => setFormData({...formData, product_interest: e.target.value})}
                    style={{ flex: 1 }}
                  />
                  <VoiceInputButton 
                    fieldContext="product_name"
                    onTranscript={(text) => setFormData({...formData, product_interest: text})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Visit Type</label>
                <select
                  value={formData.visit_type}
                  onChange={(e) => setFormData({...formData, visit_type: e.target.value})}
                >
                  <option value="New">New Visit</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Demo">Product Demo</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Expected Closing *</label>
                <input
                  type="date"
                  value={formData.expected_closing}
                  onChange={(e) => setFormData({...formData, expected_closing: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Next Follow-up *</label>
                <input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({...formData, follow_up_date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group full-width">
                <label>Requirements *</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                    rows="3"
                    required
                    style={{ flex: 1 }}
                  />
                  <VoiceInputButton 
                    fieldContext="remarks"
                    onTranscript={(text) => {
                      setFormData(prev => ({
                        ...prev,
                        requirements: prev.requirements + (prev.requirements ? ' ' : '') + text
                      }));
                    }}
                  />
                </div>
              </div>
              
              <div className="form-group full-width">
                <label>Visit Notes</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    placeholder="Additional notes, observations, or action items..."
                    style={{ flex: 1 }}
                  />
                  <VoiceInputButton 
                    fieldContext="notes"
                    onTranscript={(text) => {
                      setFormData(prev => ({
                        ...prev,
                        notes: prev.notes + (prev.notes ? ' ' : '') + text
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
            
            <button type="submit" className="btn-submit">
              ✓ Save Visit Record
            </button>
          </form>
        </div>
      )}

      <div className="visits-container">
        <h2>📋 Visit History ({visits.length})</h2>
        {visits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No visits recorded</h3>
            <p>Start by adding your first customer visit</p>
          </div>
        ) : (
          <div className="visits-list">
            {visits.map(visit => (
              <div key={visit.id} className="visit-card">
                <div className="visit-header">
                  <div>
                    <h3>{visit.customer_name}</h3>
                    {visit.shop_name && <p className="shop-name">{visit.shop_name}</p>}
                  </div>
                  <span className="visit-type">{visit.visit_type}</span>
                </div>
                
                <div className="visit-body">
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">📍 Location:</span>
                      <span>{visit.location}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">📅 Visit Date:</span>
                      <span>{formatDate(visit.visit_date)}</span>
                    </div>
                    {visit.product_interest && (
                      <div className="info-item">
                        <span className="label">📦 Product:</span>
                        <span>{visit.product_interest}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <span className="label">🎯 Expected Closing:</span>
                      <span>{new Date(visit.expected_closing).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="requirements-section">
                    <span className="label">📋 Requirements:</span>
                    <p>{visit.requirements}</p>
                  </div>
                  
                  {visit.notes && (
                    <div className="notes-section">
                      <span className="label">📝 Notes:</span>
                      <p>{visit.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .visits-page {
          padding: 20px;
          background: #f5f7fa;
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .page-header h1 {
          margin: 0 0 5px 0;
        }

        .page-header p {
          margin: 0;
          color: #666;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .btn-add,
        .btn-back {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-add {
          background: #28a745;
          color: white;
        }

        .btn-back {
          background: #6c757d;
          color: white;
        }

        .visit-form-container {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .visit-form-container h2 {
          margin: 0 0 20px 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 8px;
          color: #1a1a1a;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .btn-submit {
          width: 100%;
          padding: 14px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-submit:hover {
          background: #5568d3;
        }

        .visits-container {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .visits-container h2 {
          margin: 0 0 20px 0;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          margin: 0 0 10px 0;
        }

        .empty-state p {
          color: #666;
          margin: 0;
        }

        .visits-list {
          display: grid;
          gap: 20px;
        }

        .visit-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          border-left: 4px solid #28a745;
        }

        .visit-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 15px;
        }

        .visit-header h3 {
          margin: 0;
          color: #1a1a1a;
        }

        .shop-name {
          margin: 5px 0 0 0;
          color: #666;
          font-size: 14px;
        }

        .visit-type {
          background: #28a745;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
        }

        .visit-body {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .label {
          font-weight: 600;
          color: #666;
          font-size: 13px;
        }

        .requirements-section,
        .notes-section {
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
        }

        .requirements-section p,
        .notes-section p {
          margin: 8px 0 0 0;
          color: #1a1a1a;
          line-height: 1.6;
        }

        .loading {
          text-align: center;
          padding: 100px 20px;
          font-size: 24px;
          color: #666;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;
            gap: 15px;
          }

          .header-actions {
            width: 100%;
            flex-direction: column;
          }

          .btn-add,
          .btn-back {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SalesmanVisits;
