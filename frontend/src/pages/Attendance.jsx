import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { checkIn, checkOut, getMyAttendance, getAllAttendance, getAttendanceSummary } from '../api/attendance';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Attendance = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const [recordsRes, summaryRes] = await Promise.all([
        isAdmin ? getAllAttendance() : getMyAttendance(),
        getAttendanceSummary(),
      ]);
      setAttendanceRecords(recordsRes.data.data);
      setSummary(summaryRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [isAdmin]);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      await checkIn();
      toast.success('Checked in successfully!');
      fetchAttendanceData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      await checkOut();
      toast.success('Checked out successfully!');
      fetchAttendanceData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present': return <Badge variant="success">{status}</Badge>;
      case 'Absent': return <Badge variant="danger">{status}</Badge>;
      case 'Half-Day': return <Badge variant="warning">{status}</Badge>;
      case 'Leave': return <Badge variant="purple">{status}</Badge>;
      default: return <Badge variant="accent">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="section-title" style={{ fontSize: 24, marginBottom: 4 }}>Attendance Management</h1>
          <span className="section-subtitle">Manage and track attendance records</span>
        </div>
        
        {!isAdmin && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={handleCheckIn} disabled={actionLoading}>
              <CheckCircle2 size={16} /> Check In
            </button>
            <button className="btn btn-secondary" onClick={handleCheckOut} disabled={actionLoading}>
              <XCircle size={16} /> Check Out
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Present Days</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{summary.totalPresent}</div>
                </div>
              </div>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, borderRadius: '50%', background: 'rgba(255, 193, 7, 0.1)', color: '#FFC107' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Half Days</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{summary.totalHalfDay}</div>
                </div>
              </div>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, borderRadius: '50%', background: 'var(--danger-light)', color: 'var(--danger)' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Absent</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{summary.totalAbsent}</div>
                </div>
              </div>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)' }}>
                  <Clock size={24} />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Total Working Hours</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{summary.totalWorkingHours}h</div>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Table */}
          <div className="card">
            <h2 className="salary-section-title" style={{ marginBottom: 16 }}>
              {isAdmin ? "All Employees Attendance" : "My Attendance History"}
            </h2>
            
            {attendanceRecords.length === 0 ? (
              <EmptyState title="No Records" description="No attendance records found." />
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Date</th>
                      {isAdmin && <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Employee</th>}
                      <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Check In</th>
                      <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Check Out</th>
                      <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Hours</th>
                      <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record) => (
                      <tr key={record._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px' }}>{new Date(record.date).toLocaleDateString()}</td>
                        {isAdmin && (
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontWeight: 500 }}>{record.employee?.fullName || 'Unknown'}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{record.employee?.employeeLoginId}</div>
                          </td>
                        )}
                        <td style={{ padding: '16px' }}>
                          {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td style={{ padding: '16px' }}>
                          {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td style={{ padding: '16px' }}>{record.workingHours || '-'}</td>
                        <td style={{ padding: '16px' }}>{getStatusBadge(record.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Attendance;
