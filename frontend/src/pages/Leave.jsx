import React, { useState, useEffect } from 'react';
import { Plus, Check, X, ChevronLeft, ChevronRight, Umbrella, Activity } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus } from '../api/leave';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Leave.css';

const Leave = () => {
  const { isAdmin } = useAuth();
  
  // View mode for Admins: 'my' (personal dashboard) or 'team' (approvals)
  const [viewMode, setViewMode] = useState('my');
  
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Form state
  const [formData, setFormData] = useState({
    type: 'Paid Time Off',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      // If admin is in 'team' mode, fetch all leaves. Otherwise, fetch their own.
      const fetchAll = isAdmin && viewMode === 'team';
      const res = await (fetchAll ? getAllLeaves() : getMyLeaves());
      setLeaves(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load leave records');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when view mode changes
  useEffect(() => {
    fetchLeaves();
  }, [isAdmin, viewMode]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      return toast.error('Please fill in all fields');
    }
    
    try {
      setActionLoading(true);
      await applyLeave(formData);
      toast.success('Leave applied successfully!');
      setShowModal(false);
      setFormData({ type: 'Paid Time Off', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply leave');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateLeaveStatus(id, status);
      toast.success(`Leave ${status.toLowerCase()}!`);
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${status.toLowerCase()} leave`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <Badge variant="success">approved</Badge>;
      case 'rejected': return <Badge variant="danger">rejected</Badge>;
      case 'pending': return <Badge variant="warning">pending</Badge>;
      default: return <Badge variant="accent">{status}</Badge>;
    }
  };

  // --- Calendar Logic ---
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Check if a specific date falls within any of the fetched leaves
  const getLeaveStatusForDate = (dateNum) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dateNum);
    // Reset time for accurate comparison
    checkDate.setHours(0,0,0,0);

    for (let leave of leaves) {
      const start = new Date(leave.startDate); start.setHours(0,0,0,0);
      const end = new Date(leave.endDate); end.setHours(23,59,59,999);
      if (checkDate >= start && checkDate <= end) {
        return leave.status; // return 'Approved', 'Pending', etc.
      }
    }
    return null;
  };

  // Build Calendar grid cells
  const renderCalendarDays = () => {
    const cells = [];
    const today = new Date();
    
    // Empty padding days
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }
    
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
      
      const leaveStatus = getLeaveStatusForDate(i);
      let cellClass = "calendar-cell";
      if (isToday) cellClass += " active";
      if (leaveStatus === 'Approved' || leaveStatus === 'Pending') cellClass += " has-leave";

      cells.push(
        <div key={`day-${i}`} className={cellClass}>
          {i}
        </div>
      );
    }
    return cells;
  };

  return (
    <DashboardLayout>
      <div className="section-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: 24, marginBottom: 4 }}>Time Off</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ padding: '8px 16px', background: '#8B5CF6' }}>
          + New
        </button>
      </div>

      {isAdmin && (
        <div className="admin-view-toggle">
          <button className={`admin-view-btn ${viewMode === 'my' ? 'active' : ''}`} onClick={() => setViewMode('my')}>
            My Time Off
          </button>
          <button className={`admin-view-btn ${viewMode === 'team' ? 'active' : ''}`} onClick={() => setViewMode('team')}>
            Team Requests
          </button>
        </div>
      )}

      {viewMode === 'my' ? (
        <div className="leave-dashboard">
          {/* Balance Cards */}
          <div className="balance-cards-row">
            <div className="balance-card">
              <div className="balance-icon-container">
                <Umbrella size={24} color="#F59E0B" />
              </div>
              <div className="balance-info">
                <div className="balance-title">Paid Time Off</div>
                <div className="balance-value-row">
                  <span className="balance-value">21</span>
                  <span className="balance-subtext">/ 24 Days Available</span>
                </div>
              </div>
            </div>
            
            <div className="balance-card">
              <div className="balance-icon-container">
                <Activity size={24} color="#8B5CF6" />
              </div>
              <div className="balance-info">
                <div className="balance-title">Sick Leave</div>
                <div className="balance-value-row">
                  <span className="balance-value">7</span>
                  <span className="balance-subtext">/ 7 Days Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="leave-bottom-row">
            {/* Calendar */}
            <div className="calendar-card">
              <div className="calendar-header">
                <button className="calendar-nav-btn" onClick={handlePrevMonth}><ChevronLeft size={20} /></button>
                <div style={{ color: 'var(--text-primary)' }}>
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <button className="calendar-nav-btn" onClick={handleNextMonth}><ChevronRight size={20} /></button>
              </div>
              
              <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="calendar-day-header">{d}</div>
                ))}
                {renderCalendarDays()}
              </div>
            </div>

            {/* My Requests Table */}
            <div className="requests-card">
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
                My Leave Requests
              </div>
              
              {loading ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}><LoadingSpinner size="md" /></div>
              ) : leaves.length === 0 ? (
                <div style={{ padding: '20px 0' }}>
                  <EmptyState title="No leaves" description="You haven't requested any time off yet." />
                </div>
              ) : (
                <table className="requests-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                      <th>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave._id}>
                        <td style={{ fontWeight: 500 }}>{leave.type}</td>
                        <td>{new Date(leave.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td>{new Date(leave.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td>{getStatusBadge(leave.status)}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{leave.reason || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ADMIN VIEW: Team Requests */
        <div className="requests-card">
           <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
              Team Leave Requests
           </div>
           {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><LoadingSpinner size="lg" /></div>
            ) : leaves.length === 0 ? (
              <EmptyState title="No Records" description="No team leave records found." />
            ) : (
              <div className="table-responsive">
                <table className="table requests-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Duration</th>
                      <th>Comment</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave._id}>
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{leave.employee?.fullName || 'Unknown'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{leave.employee?.employeeLoginId}</div>
                        </td>
                        <td>{leave.type}</td>
                        <td>
                          {new Date(leave.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} 
                          <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>to</span> 
                          {new Date(leave.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{leave.reason}</td>
                        <td>{getStatusBadge(leave.status)}</td>
                        <td>
                          {leave.status === 'Pending' && (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-sm" style={{ background: 'var(--success-light)', color: 'var(--success)', border: 'none' }} onClick={() => handleUpdateStatus(leave._id, 'Approved')}>
                                <Check size={14} />
                              </button>
                              <button className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: 'none' }} onClick={() => handleUpdateStatus(leave._id, 'Rejected')}>
                                <X size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           )}
        </div>
      )}

      {/* Apply Leave Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 100,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 450, padding: 32, animation: 'fadeIn 0.2s ease-out' }}>
            <h2 className="section-title" style={{ fontSize: 20, marginBottom: 24 }}>Apply for Time Off</h2>
            
            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Leave Type</label>
                <select className="form-input" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option value="Paid Time Off">Paid Time Off</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" required value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea className="form-input" rows="3" required placeholder="Add a comment..." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#8B5CF6' }} disabled={actionLoading}>
                  {actionLoading ? <LoadingSpinner size="sm" /> : 'Send Request'}
                </button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Leave;
