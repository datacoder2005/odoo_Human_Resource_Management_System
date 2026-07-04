import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import { getAllUsers } from '../api/users';

const Dashboard = () => {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUsers();
        setAllUsers(res.data.users);
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = allUsers.filter((u) => {
    const query = searchQuery.toLowerCase();
    const name = u.fullName || u.name || '';
    const empId = u.employeeLoginId || u.employeeId || '';
    return (
      name.toLowerCase().includes(query) ||
      empId.toLowerCase().includes(query)
    );
  });

  return (
    <DashboardLayout>
      {/* Directory Header */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="section-title" style={{ fontSize: 24, marginBottom: 4 }}>Employee Directory</h1>
          <span className="section-subtitle">
            Welcome back, {user?.fullName?.split(' ')[0] || 'User'} 👋
          </span>
        </div>

        <div style={{ position: 'relative', minWidth: 260 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="No employees found" description="Try adjusting your search query." />
      ) : (
        <div className="directory-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 20,
          marginTop: 24
        }}>
          {filteredUsers.map((emp) => (
            <Link key={emp._id} to={`/profile/${emp._id}`} className="employee-card" style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              transition: 'transform 0.2s, border-color 0.2s',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'none';
            }}>
              
              {/* Status indicator (Mocked to Active for all per UI design) */}
              <div style={{ position: 'absolute', top: 16, right: 16 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 0 3px var(--success-light)' }} title="Active" />
              </div>

              <Avatar src={emp.logoUrl || emp.avatar} name={emp.fullName || emp.name} size="lg" />
              
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 16 }}>{emp.fullName || emp.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{emp.employeeLoginId || emp.employeeId}</div>
              </div>
              
              <div style={{ marginTop: 12 }}>
                <Badge variant={emp.role?.toLowerCase() === 'admin' ? 'purple' : 'accent'} dot={false}>
                  {emp.role}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
