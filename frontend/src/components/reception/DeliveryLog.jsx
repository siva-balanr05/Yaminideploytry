import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';

const DeliveryLog = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'ALL',
    search: '',
    dateFrom: '',
    dateTo: '',
    status: 'ALL'
  });
  const [showLogForm, setShowLogForm] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    movement_type: 'IN',
    item_name: '',
    quantity: 1,
    reference: '',
    notes: ''
  });

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const data = await apiRequest('/api/stock-movements/');
      setDeliveries(data || []);
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const logDelivery = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/api/stock-movements', {
        method: 'POST',
        body: JSON.stringify(deliveryForm)
      });
      setShowLogForm(false);
      setDeliveryForm({
        movement_type: 'IN',
        item_name: '',
        quantity: 1,
        reference: '',
        notes: ''
      });
      fetchDeliveries();
      alert('✅ Delivery logged successfully!');
    } catch (error) {
      alert('❌ Failed to log delivery: ' + (error.message || ''));
    }
  };

  const filteredDeliveries = deliveries.filter(del => {
    if (filters.type !== 'ALL' && del.movement_type !== filters.type) return false;
    if (filters.status !== 'ALL' && del.status !== filters.status) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        del.item_name.toLowerCase().includes(search) ||
        (del.reference || '').toLowerCase().includes(search)
      );
    }
    if (filters.dateFrom) {
      const delDate = new Date(del.created_at || del.date);
      const fromDate = new Date(filters.dateFrom);
      if (delDate < fromDate) return false;
    }
    if (filters.dateTo) {
      const delDate = new Date(del.created_at || del.date);
      const toDate = new Date(filters.dateTo);
      if (delDate > toDate) return false;
    }
    return true;
  });

  const stats = {
    totalIn: deliveries.filter(d => d.movement_type === 'IN').length,
    totalOut: deliveries.filter(d => d.movement_type === 'OUT').length,
    pending: deliveries.filter(d => d.status === 'Pending').length,
    approved: deliveries.filter(d => d.status === 'Approved').length
  };

  if (loading) {
    return <div className="loading">⏳ Loading delivery log...</div>;
  }

  return (
    <div className="reception-page">
      <div className="page-header">
        <div>
          <h1>📦 Delivery IN / OUT Log</h1>
          <p className="subtitle">Replacement of DC notebook</p>
        </div>
        <button className="btn-primary" onClick={() => setShowLogForm(true)}>
          ➕ Log Delivery
        </button>
      </div>

      {/* STATISTICS */}
      <div className="stats-grid">
        <div className="stat-card in">
          <div className="stat-icon">📥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalIn}</div>
            <div className="stat-label">Deliveries IN</div>
          </div>
        </div>
        <div className="stat-card out">
          <div className="stat-icon">📤</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalOut}</div>
            <div className="stat-label">Deliveries OUT</div>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending Approval</div>
          </div>
        </div>
        <div className="stat-card approved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Item name or reference..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        
        <div className="filter-group">
          <label>Type:</label>
          <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
            <option value="ALL">All</option>
            <option value="IN">📥 IN</option>
            <option value="OUT">📤 OUT</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Status:</label>
          <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
            <option value="ALL">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Date From:</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
          />
        </div>
        
        <div className="filter-group">
          <label>Date To:</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
          />
        </div>

        <div className="filter-info">
          Showing {filteredDeliveries.length} of {deliveries.length} records
        </div>
      </div>

      {/* DELIVERY TABLE */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Reference Type</th>
              <th>Reference ID</th>
              <th>Status</th>
              <th>Logged By</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.length === 0 ? (
              <tr><td colSpan="9" className="empty-state">No delivery records found</td></tr>
            ) : (
              filteredDeliveries.map(del => (
                <tr key={del.id}>
                  <td>{new Date(del.created_at || del.date).toLocaleDateString()}</td>
                  <td>{new Date(del.created_at || del.date).toLocaleTimeString()}</td>
                  <td>
                    <span className={`type-badge ${del.movement_type.toLowerCase()}`}>
                      {del.movement_type === 'IN' ? '📥' : '📤'} {del.movement_type}
                    </span>
                  </td>
                  <td><strong>{del.item_name}</strong></td>
                  <td className="quantity">{del.quantity}</td>
                  <td>{del.reference ? 'Service/Order' : '-'}</td>
                  <td>{del.reference || '-'}</td>
                  <td>
                    <span className={`status-badge ${del.status.toLowerCase()}`}>
                      {del.status}
                    </span>
                  </td>
                  <td className="logged-by">Reception</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* LOG DELIVERY MODAL */}
      {showLogForm && (
        <div className="modal-overlay" onClick={() => setShowLogForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📦 Log Delivery IN/OUT</h3>
            <form onSubmit={logDelivery}>
              <div className="form-group">
                <label>Type *</label>
                <select
                  required
                  value={deliveryForm.movement_type}
                  onChange={(e) => setDeliveryForm({...deliveryForm, movement_type: e.target.value})}
                >
                  <option value="IN">📥 Delivery IN</option>
                  <option value="OUT">📤 Delivery OUT</option>
                </select>
              </div>
              <div className="form-group">
                <label>Item Name *</label>
                <input
                  required
                  placeholder="e.g., Printer Toner, Paper Box, Spare Part"
                  value={deliveryForm.item_name}
                  onChange={(e) => setDeliveryForm({...deliveryForm, item_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={deliveryForm.quantity}
                  onChange={(e) => setDeliveryForm({...deliveryForm, quantity: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Reference (Invoice/PO/DO/Service Ticket)</label>
                <input
                  placeholder="e.g., INV-2024-001, TKT-123"
                  value={deliveryForm.reference}
                  onChange={(e) => setDeliveryForm({...deliveryForm, reference: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="3"
                  placeholder="Additional details..."
                  value={deliveryForm.notes}
                  onChange={(e) => setDeliveryForm({...deliveryForm, notes: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowLogForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Log Delivery
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
          padding-bottom: 20px;
          border-bottom: 2px solid #ecf0f1;
        }

        .page-header h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 28px;
        }

        .subtitle {
          margin: 5px 0 0 0;
          color: #7f8c8d;
          font-size: 14px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          gap: 15px;
          border-left: 4px solid;
        }

        .stat-card.in { border-color: #27ae60; }
        .stat-card.out { border-color: #e74c3c; }
        .stat-card.pending { border-color: #f39c12; }
        .stat-card.approved { border-color: #3498db; }

        .stat-icon {
          font-size: 36px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #2c3e50;
        }

        .stat-label {
          font-size: 13px;
          color: #7f8c8d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filters-section {
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          align-items: end;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .filter-group label {
          font-size: 12px;
          font-weight: 600;
          color: #7f8c8d;
          text-transform: uppercase;
        }

        .filter-group input,
        .filter-group select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          min-width: 150px;
        }

        .filter-info {
          margin-left: auto;
          padding: 8px 12px;
          background: #ecf0f1;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #2c3e50;
        }

        .data-table-container {
          background: white;
          border-radius: 12px;
          overflow-x: auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th,
        .data-table td {
          padding: 14px;
          text-align: left;
          border-bottom: 1px solid #ecf0f1;
        }

        .data-table th {
          background: #f8f9fa;
          font-weight: 600;
          font-size: 12px;
          color: #7f8c8d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .data-table tbody tr:hover {
          background: #f8f9fa;
        }

        .type-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .type-badge.in {
          background: #27ae60;
          color: white;
        }

        .type-badge.out {
          background: #e74c3c;
          color: white;
        }

        .quantity {
          font-weight: bold;
          color: #2c3e50;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .status-badge.pending {
          background: #f39c12;
          color: white;
        }

        .status-badge.approved {
          background: #27ae60;
          color: white;
        }

        .status-badge.rejected {
          background: #e74c3c;
          color: white;
        }

        .logged-by {
          color: #7f8c8d;
          font-size: 13px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px !important;
          color: #95a5a6;
          font-style: italic;
          font-size: 16px;
        }

        .btn-primary,
        .btn-secondary {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: #95a5a6;
          color: white;
        }

        .btn-secondary:hover {
          background: #7f8c8d;
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
          border-radius: 12px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h3 {
          margin: 0 0 25px 0;
          color: #2c3e50;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          font-size: 13px;
          color: #2c3e50;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group textarea {
          resize: vertical;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 25px;
        }

        .loading {
          text-align: center;
          padding: 100px;
          font-size: 20px;
          color: #7f8c8d;
        }
      `}</style>
    </div>
  );
};

export default DeliveryLog;
