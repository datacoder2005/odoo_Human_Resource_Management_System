import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Pencil, X, Save, DollarSign, TrendingUp,
  TrendingDown, CheckCircle, Users, Banknote,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Badge, { statusVariant } from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';
import {
  getMyPayroll,
  getPayrollByUserId,
  getAllPayroll,
  createPayroll,
  updatePayroll,
} from '../api/payroll';
import { getAllUsers } from '../api/users';
import toast from 'react-hot-toast';

const fmt = (n) =>
  n != null
    ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
    : '—';

// ---- Payroll form modal ----
const PayrollModal = ({ initial, employeeId, users, onClose, onSaved }) => {
  const isEdit = !!initial?._id;
  const [form, setForm] = useState({
    userId: initial?.userId?._id || initial?.userId || employeeId || '',
    basicSalary: initial?.basicSalary || '',
    allowances: initial?.allowances || '',
    deductions: initial?.deductions || '',
    bonus: initial?.bonus || '',
    payPeriod: initial?.payPeriod || '',
    status: initial?.status || 'Pending',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.userId || !form.basicSalary || !form.payPeriod) {
      toast.error('Employee, Basic Salary, and Pay Period are required.');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        const res = await updatePayroll(initial._id, form);
        toast.success('Payroll record updated!');
        onSaved(res.data.payroll);
      } else {
        const res = await createPayroll(form);
        toast.success('Payroll record created!');
        onSaved(res.data.payroll);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save payroll record.');
    } finally {
      setSaving(false);
    }
  };

  const preview = {
    net: (
      parseFloat(form.basicSalary || 0) +
      parseFloat(form.allowances || 0) +
      parseFloat(form.bonus || 0) -
      parseFloat(form.deductions || 0)
    ).toFixed(0),
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">{isEdit ? 'Edit Payroll Record' : 'Add Payroll Record'}</h2>

        <div className="modal-form">
          {/* Employee selector (only when creating) */}
          {!isEdit && users && (
            <div className="form-group modal-form-full">
              <label className="form-label">Employee <span>*</span></label>
              <select name="userId" value={form.userId} onChange={handleChange} className="form-input">
                <option value="">Select employee...</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.employeeId})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Pay Period <span>*</span></label>
            <input name="payPeriod" value={form.payPeriod} onChange={handleChange}
              placeholder="e.g. July 2025" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="form-input">
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Basic Salary ($) <span>*</span></label>
            <input name="basicSalary" type="number" min="0" value={form.basicSalary}
              onChange={handleChange} placeholder="0" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Allowances ($)</label>
            <input name="allowances" type="number" min="0" value={form.allowances}
              onChange={handleChange} placeholder="0" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Deductions ($)</label>
            <input name="deductions" type="number" min="0" value={form.deductions}
              onChange={handleChange} placeholder="0" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Bonus ($)</label>
            <input name="bonus" type="number" min="0" value={form.bonus}
              onChange={handleChange} placeholder="0" className="form-input" />
          </div>

          {/* Live preview */}
          <div className="form-group modal-form-full">
            <div style={{
              background: 'var(--accent-light)', border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)', padding: '12px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Calculated Net Salary</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-hover)' }}>
                {fmt(preview.net)}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
            <X size={15} /> Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="payroll-save-btn">
            {saving ? <LoadingSpinner size="sm" /> : <><Save size={15} /> {isEdit ? 'Update' : 'Create'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Breakdown Card ----
const BreakdownCard = ({ record }) => {
  if (!record) return null;
  return (
    <div className="breakdown-card">
      <h3 className="breakdown-title">Salary Breakdown — {record.payPeriod}</h3>
      <div className="breakdown-grid">
        <div className="breakdown-item">
          <div className="breakdown-item-label">Basic Salary</div>
          <div className="breakdown-item-value">{fmt(record.basicSalary)}</div>
        </div>
        <div className="breakdown-item">
          <div className="breakdown-item-label">Allowances</div>
          <div className="breakdown-item-value positive">+{fmt(record.allowances)}</div>
        </div>
        <div className="breakdown-item">
          <div className="breakdown-item-label">Bonus</div>
          <div className="breakdown-item-value positive">+{fmt(record.bonus)}</div>
        </div>
        <div className="breakdown-item">
          <div className="breakdown-item-label">Deductions</div>
          <div className="breakdown-item-value negative">-{fmt(record.deductions)}</div>
        </div>
        <div className="breakdown-item" style={{ background: 'var(--accent-light)', border: '1px solid var(--border-strong)' }}>
          <div className="breakdown-item-label">Net Salary</div>
          <div className="breakdown-item-value net-value">{fmt(record.netSalary)}</div>
        </div>
      </div>
    </div>
  );
};

// ---- Main Payroll Page ----
const Payroll = () => {
  const { user: authUser, isAdmin } = useAuth();
  const { userId } = useParams(); // admin can view specific employee's payroll
  const navigate = useNavigate();

  const [payrollList, setPayrollList] = useState([]);
  const [targetUser, setTargetUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(userId || '');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const isViewingSpecific = isAdmin && !!selectedUserId;

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        if (selectedUserId) {
          const res = await getPayrollByUserId(selectedUserId);
          setPayrollList(res.data.payroll);
          setTargetUser(res.data.user);
        } else {
          const res = await getAllPayroll();
          setPayrollList(res.data.payroll);
          setTargetUser(null);
        }
        // Load all users for the selector
        const usersRes = await getAllUsers();
        setAllUsers(usersRes.data.users.filter((u) => u.role === 'Employee'));
      } else {
        const res = await getMyPayroll();
        setPayrollList(res.data.payroll);
        setTargetUser(authUser);
      }
    } catch {
      toast.error('Failed to load payroll data.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, selectedUserId, authUser]);

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  const handleSaved = (saved) => {
    fetchPayroll(); // refresh list
  };

  // Summary stats from current list
  const totalNet = payrollList.reduce((acc, p) => acc + (p.netSalary || 0), 0);
  const latestRecord = payrollList[0] || null;
  const paidCount = payrollList.filter((p) => p.status === 'Paid').length;

  // The "breakdown" always shows the latest record
  const breakdownRecord = latestRecord;

  return (
    <DashboardLayout>
      {/* Back to dashboard */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        id="payroll-back-btn"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Admin employee switcher */}
      {isAdmin && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div className="employee-selector">
            <Users size={16} color="var(--text-muted)" />
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              id="payroll-employee-select"
            >
              <option value="">All Employees</option>
              {allUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.employeeId})
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => { setEditRecord(null); setModalOpen(true); }}
            id="payroll-add-btn"
          >
            <Plus size={15} /> Add Record
          </button>
        </div>
      )}

      {/* If viewing specific user — show their info */}
      {targetUser && isViewingSpecific && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--surface-1)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 20,
        }}>
          <Avatar src={targetUser.avatar} name={targetUser.name} size="md" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{targetUser.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {targetUser.employeeId} · {targetUser.email}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* ---- Payroll Summary Header ---- */}
          <div className="payroll-summary-header">
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 20 }}>
              {isViewingSpecific
                ? `Payroll Summary — ${targetUser?.name}`
                : isAdmin
                ? 'Overall Payroll Summary'
                : 'My Payroll Summary'}
            </h2>
            <div className="payroll-summary-grid">
              <div className="payroll-summary-item">
                <div className="payroll-summary-label">Total Net (All records)</div>
                <div className="payroll-summary-value net">{fmt(totalNet)}</div>
              </div>
              <div className="payroll-summary-item">
                <div className="payroll-summary-label">Records</div>
                <div className="payroll-summary-value">{payrollList.length}</div>
              </div>
              <div className="payroll-summary-item">
                <div className="payroll-summary-label">Paid</div>
                <div className="payroll-summary-value" style={{ color: 'var(--success)' }}>{paidCount}</div>
              </div>
              <div className="payroll-summary-item">
                <div className="payroll-summary-label">Latest Period</div>
                <div className="payroll-summary-value" style={{ fontSize: 16 }}>
                  {latestRecord?.payPeriod || '—'}
                </div>
              </div>
              {latestRecord && (
                <div className="payroll-summary-item">
                  <div className="payroll-summary-label">Latest Status</div>
                  <div className="payroll-summary-value" style={{ fontSize: 16 }}>
                    <Badge variant={statusVariant(latestRecord.status)}>
                      {latestRecord.status}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ---- Breakdown of latest record ---- */}
          {breakdownRecord && <BreakdownCard record={breakdownRecord} />}

          {/* ---- Payroll Table ---- */}
          <div className="table-card">
            <div className="table-header">
              <h3 className="table-title">
                {isAdmin && !isViewingSpecific ? 'All Payroll Records' : 'Salary History'}
              </h3>
              {isAdmin && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {payrollList.length} record{payrollList.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {payrollList.length === 0 ? (
              <EmptyState
                icon={Banknote}
                title="No payroll records"
                description={isAdmin ? 'Add a payroll record using the button above.' : 'No salary records have been added yet.'}
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {isAdmin && !isViewingSpecific && <th>Employee</th>}
                      <th>Pay Period</th>
                      <th>Basic Salary</th>
                      <th>Allowances</th>
                      <th>Deductions</th>
                      <th>Bonus</th>
                      <th>Net Salary</th>
                      <th>Status</th>
                      {isAdmin && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {payrollList.map((record) => (
                      <tr key={record._id}>
                        {isAdmin && !isViewingSpecific && (
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Avatar
                                src={record.userId?.avatar}
                                name={record.userId?.name || '?'}
                                size="xs"
                              />
                              <div>
                                <div style={{ fontWeight: 500, fontSize: 13 }}>
                                  {record.userId?.name}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                  {record.userId?.employeeId}
                                </div>
                              </div>
                            </div>
                          </td>
                        )}
                        <td>
                          <span style={{ fontWeight: 600 }}>{record.payPeriod}</span>
                        </td>
                        <td className="amount">{fmt(record.basicSalary)}</td>
                        <td className="amount" style={{ color: 'var(--success)' }}>
                          +{fmt(record.allowances)}
                        </td>
                        <td className="amount" style={{ color: 'var(--danger)' }}>
                          -{fmt(record.deductions)}
                        </td>
                        <td className="amount" style={{ color: 'var(--info)' }}>
                          +{fmt(record.bonus)}
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--accent-hover)', fontSize: 15 }}>
                            {fmt(record.netSalary)}
                          </span>
                        </td>
                        <td>
                          <Badge variant={statusVariant(record.status)}>
                            {record.status}
                          </Badge>
                        </td>
                        {isAdmin && (
                          <td>
                            <button
                              className="btn btn-ghost btn-sm btn-icon"
                              onClick={() => { setEditRecord(record); setModalOpen(true); }}
                              title="Edit record"
                            >
                              <Pencil size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Payroll modal */}
      {modalOpen && (
        <PayrollModal
          initial={editRecord}
          employeeId={selectedUserId}
          users={allUsers}
          onClose={() => { setModalOpen(false); setEditRecord(null); }}
          onSaved={handleSaved}
        />
      )}
    </DashboardLayout>
  );
};

export default Payroll;
