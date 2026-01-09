import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
// New UI styles for employee list (full redesign)
import '../styles/employee-list.css';
import { colors, spacing } from '../styles/tokens';

const ROLE_CONFIG = {
  'salesmen': {
    apiRole: 'SALESMAN',
    title: 'Salesmen',
    icon: '💼',
    color: colors.primary
  },
  'engineers': {
    apiRole: 'SERVICE_ENGINEER',
    title: 'Service Engineers',
    icon: '🔧',
    color: colors.success
  },
  'reception': {
    apiRole: 'RECEPTION',
    title: 'Reception Staff',
    icon: '👋',
    color: colors.warning
  }
};

export default function EmployeeList() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const config = ROLE_CONFIG[role] || ROLE_CONFIG['salesmen'];

  useEffect(() => {
    loadEmployees();
  }, [role]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const users = await apiRequest('/api/users/');
      const filtered = users.filter(u => u.role === config.apiRole && u.is_active);
      setEmployees(filtered);
    } catch (error) {
      console.error('Failed to load employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDashboard = (employee) => {
    navigate(`/admin/employees/${role}/${employee.id}/dashboard`);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh'
      }}>
        <div style={{ fontSize: '48px', marginBottom: spacing.md }}>⏳</div>
        <div style={{ color: colors.textSecondary, fontSize: '16px' }}>Loading employees...</div>
      </div>
    );
  }

  return (
    <section className="employee-page">
      {/* Page Header */}
      <header className="page-header">
        <div className="page-title">
          <div className="title-icon" aria-hidden>
            {config.icon}
          </div>
          <div>
            <h1 className="title-text">{config.title}</h1>
            <p className="title-sub">Select an employee to view and manage their dashboard</p>
          </div>
        </div>
        <div className="count-badge" aria-label="employee count">{filteredEmployees.length}</div>
      </header>

      {/* Search */}
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Cards */}
      {filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p className="empty-text">
            {searchTerm ? 'No employees found matching your search' : `No ${config.title.toLowerCase()} found`}
          </p>
        </div>
      ) : (
        <div className="employee-grid">
          {filteredEmployees.map((employee) => {
            const name = employee.full_name || employee.username;
            const initials = name
              .split(' ')
              .map(part => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();
            const roleLabel = (employee.role || '').toLowerCase().replace('_', ' ');

            return (
              <article
                key={employee.id}
                className="employee-card"
                onClick={() => handleViewDashboard(employee)}
                role="button"
                tabIndex={0}
              >
                <div className="employee-card-main">
                  <div className="employee-avatar" aria-label={`avatar ${initials}`}>{initials}</div>
                  <div className="employee-meta">
                    <h2 className="employee-name">{name}</h2>
                    <div className="employee-role">{roleLabel || 'Salesman'}</div>
                    <div className="role-pill">SALESMAN</div>
                  </div>
                </div>
                <div className="employee-actions">
                  <button className="open-btn" type="button">Open Dashboard</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
