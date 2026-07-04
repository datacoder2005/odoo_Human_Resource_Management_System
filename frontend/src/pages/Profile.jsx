import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, Save, X, ArrowLeft, Shield, Upload } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import { getMe, updateMe, getUserById, updateUserById } from '../api/users';
import toast from 'react-hot-toast';
import './Profile.css';

const fmt = (val) => val || <span className="profile-info-val-new" style={{ color: 'var(--text-muted)' }}>Not provided</span>;

const InfoRow = ({ label, value }) => (
  <React.Fragment>
    <div className="profile-info-label-new">{label}</div>
    <div className="profile-info-val-new">{value}</div>
  </React.Fragment>
);

const Profile = () => {
  const { user: authUser, isAdmin, updateUser } = useAuth();
  const { id } = useParams(); 
  const navigate = useNavigate();

  const isViewingOther = !!id && id !== authUser?._id;

  const [userData, setUserData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Private Info');

  // Form states
  const [form, setForm] = useState({});
  const [salaryForm, setSalaryForm] = useState({
    monthlyWage: 0,
    workingDaysPerWeek: 5,
    breakTime: 1,
    basicPercent: 50,
    hraPercent: 50,
    standardPercent: 16.67,
    perfPercent: 8.33,
    ltaPercent: 8.33,
    pfEmployeePercent: 12,
    pfEmployerPercent: 12,
    professionalTax: 200,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (isViewingOther) {
        res = await getUserById(id);
      } else {
        res = await getMe();
      }
      setUserData(res.data.user);
      setProfile(res.data.profile);
    } catch {
      toast.error('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  }, [id, isViewingOther]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startEdit = () => {
    setForm({
      name: userData?.name || '',
      email: userData?.email || '',
      role: userData?.role || 'Employee',
      avatar: userData?.avatar || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      department: profile?.department || '',
      designation: profile?.designation || '',
      company: profile?.company || 'HRMS',
      manager: profile?.manager || '',
      location: profile?.location || '',
      joiningDate: profile?.joiningDate
        ? new Date(profile.joiningDate).toISOString().split('T')[0]
        : '',
    });
    
    if (profile?.salaryStructure) {
      setSalaryForm({
        ...profile.salaryStructure
      });
    }
    
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSalaryChange = (e) => {
    setSalaryForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        ...form,
        salaryStructure: salaryForm
      };

      let res;
      if (isAdmin && isViewingOther) {
        res = await updateUserById(id, updateData);
      } else if (isAdmin && !isViewingOther) {
        res = await updateUserById(authUser._id, updateData);
      } else {
        res = await updateMe({ phone: form.phone, address: form.address, avatar: form.avatar });
      }
      setUserData(res.data.user);
      setProfile(res.data.profile);

      if (!isViewingOther) updateUser(res.data.user);

      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout>
        <EmptyState title="Profile not found" description="The employee profile could not be loaded." />
      </DashboardLayout>
    );
  }

  const canEditAll = isAdmin;
  const initial = userData.name ? userData.name.charAt(0).toUpperCase() : '?';

  // --- Salary Calculations ---
  const wage = parseFloat(salaryForm.monthlyWage) || 0;
  const yearlyWage = wage * 12;
  const basicPct = parseFloat(salaryForm.basicPercent) || 0;
  const basicAmt = (wage * basicPct) / 100;
  
  const hraPct = parseFloat(salaryForm.hraPercent) || 0;
  const hraAmt = (basicAmt * hraPct) / 100;
  
  const stdPct = parseFloat(salaryForm.standardPercent) || 0;
  const stdAmt = (basicAmt * stdPct) / 100;
  
  const perfPct = parseFloat(salaryForm.perfPercent) || 0;
  const perfAmt = (basicAmt * perfPct) / 100;
  
  const ltaPct = parseFloat(salaryForm.ltaPercent) || 0;
  const ltaAmt = (basicAmt * ltaPct) / 100;

  const totalComponents = basicAmt + hraAmt + stdAmt + perfAmt + ltaAmt;
  const fixedAmt = Math.max(0, wage - totalComponents);
  const fixedPct = basicAmt > 0 ? (fixedAmt / basicAmt) * 100 : 0;

  const pfEmpPct = parseFloat(salaryForm.pfEmployeePercent) || 0;
  const pfEmpAmt = (basicAmt * pfEmpPct) / 100;

  const pfEmployerPct = parseFloat(salaryForm.pfEmployerPercent) || 0;
  const pfEmployerAmt = (basicAmt * pfEmployerPct) / 100;

  // --- Render Salary Row ---
  const renderSalaryRow = (label, desc, amt, pct, nameAmt, namePct) => (
    <div className="salary-row">
      <div className="salary-col-desc">
        <div className="salary-comp-name">{label}</div>
        <div className="salary-comp-note">{desc}</div>
      </div>
      <div className="salary-col-inputs">
        <div className="salary-input-group">
          {editing ? (
            <input name={nameAmt} type="number" className="salary-calc-amt" value={amt.toFixed(2)} readOnly style={{ opacity: 0.7 }} />
          ) : (
            <div className="salary-calc-amt" style={{border: 'none', background: 'transparent'}}>{amt.toFixed(2)}</div>
          )}
          <span className="salary-unit">₹ / month</span>
        </div>
        <div className="salary-input-group">
          {editing ? (
            <input name={namePct} type="number" step="0.01" className="salary-calc-pct" value={pct} onChange={handleSalaryChange} readOnly={!namePct} style={!namePct ? { opacity: 0.7 } : {}} />
          ) : (
            <div className="salary-calc-pct" style={{border: 'none', background: 'transparent'}}>{pct.toFixed(2)}</div>
          )}
          <span className="salary-unit">%</span>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      {isViewingOther && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      )}

      <div className="profile-page-new">
        
        {/* --- Top Header Section --- */}
        <div className="profile-header-new">
          <div className="profile-header-left">
            <div className="profile-avatar-large">
              {userData.avatar ? (
                <img src={userData.avatar} alt={userData.name} />
              ) : (
                initial
              )}
              {editing && (
                <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: '50%', cursor: 'pointer' }}>
                  <Upload size={14} color="white" />
                </div>
              )}
            </div>
            {(!isViewingOther || isAdmin) && (
              !editing ? (
                <button className="btn btn-secondary btn-sm" onClick={startEdit}>
                  <Pencil size={14} /> Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                  <button className="btn btn-primary btn-sm btn-full" onClick={handleSave} disabled={saving}>
                    {saving ? <LoadingSpinner size="sm" /> : <><Save size={14} /> Save</>}
                  </button>
                  <button className="btn btn-secondary btn-sm btn-full" onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </button>
                </div>
              )
            )}
          </div>

          <div className="profile-header-mid">
            <div className="profile-header-name">{userData.name}</div>
            <div className="profile-info-grid-new">
              <InfoRow label="Login ID" value={fmt(userData.employeeId)} />
              <InfoRow label="Email" value={fmt(userData.email)} />
              <InfoRow label="Mobile" value={fmt(profile?.phone)} />
            </div>
          </div>

          <div className="profile-header-right">
            <div className="profile-info-grid-new">
              <InfoRow label="Company" value={fmt(profile?.company)} />
              <InfoRow label="Department" value={fmt(profile?.department)} />
              <InfoRow label="Manager" value={fmt(profile?.manager)} />
              <InfoRow label="Location" value={fmt(profile?.location)} />
            </div>
          </div>
        </div>

        {/* --- Tab Navigation --- */}
        <div className="profile-tabs">
          <button className={`profile-tab ${activeTab === 'Resume' ? 'active' : ''}`} onClick={() => setActiveTab('Resume')}>Resume</button>
          <button className={`profile-tab ${activeTab === 'Private Info' ? 'active' : ''}`} onClick={() => setActiveTab('Private Info')}>Private Info</button>
          {isAdmin && (
            <button className={`profile-tab ${activeTab === 'Salary Info' ? 'active' : ''}`} onClick={() => setActiveTab('Salary Info')}>Salary Info</button>
          )}
        </div>

        {/* --- Tab Content --- */}
        <div className="profile-tab-content">
          
          {/* RESUME TAB (Stub) */}
          {activeTab === 'Resume' && (
            <div className="card">
              <h2 className="salary-section-title" style={{ marginBottom: 16 }}>About</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
              
              <h2 className="salary-section-title" style={{ marginBottom: 16 }}>What I love about my job</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
            </div>
          )}

          {/* PRIVATE INFO TAB */}
          {activeTab === 'Private Info' && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <h2 className="salary-section-title" style={{ margin: 0 }}>Personal & Account Details</h2>
                {!editing && <Shield size={16} color="var(--text-muted)" />}
              </div>
              
              {!editing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 40px' }}>
                  <div className="profile-info-grid-new" style={{ gridTemplateColumns: '120px 1fr' }}>
                    <InfoRow label="Full Name" value={fmt(userData.name)} />
                    <InfoRow label="Email" value={fmt(userData.email)} />
                    <InfoRow label="Phone" value={fmt(profile?.phone)} />
                    <InfoRow label="Address" value={fmt(profile?.address)} />
                  </div>
                  <div className="profile-info-grid-new" style={{ gridTemplateColumns: '120px 1fr' }}>
                    <InfoRow label="Department" value={fmt(profile?.department)} />
                    <InfoRow label="Designation" value={fmt(profile?.designation)} />
                    <InfoRow label="Role" value={<Badge variant={userData.role === 'Admin' ? 'purple' : 'accent'} dot={false}>{userData.role}</Badge>} />
                    <InfoRow label="Joining Date" value={fmt(profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : '')} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px' }}>
                  {canEditAll && (
                    <>
                      <div className="form-group"><label className="form-label">Full Name</label><input name="name" value={form.name} onChange={handleChange} className="form-input" /></div>
                      <div className="form-group"><label className="form-label">Email</label><input name="email" value={form.email} onChange={handleChange} className="form-input" /></div>
                      <div className="form-group"><label className="form-label">Department</label><input name="department" value={form.department} onChange={handleChange} className="form-input" /></div>
                      <div className="form-group"><label className="form-label">Designation</label><input name="designation" value={form.designation} onChange={handleChange} className="form-input" /></div>
                      <div className="form-group"><label className="form-label">Role</label>
                        <select name="role" value={form.role} onChange={handleChange} className="form-input">
                          <option value="Employee">Employee</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                      <div className="form-group"><label className="form-label">Company</label><input name="company" value={form.company} onChange={handleChange} className="form-input" /></div>
                      <div className="form-group"><label className="form-label">Manager</label><input name="manager" value={form.manager} onChange={handleChange} className="form-input" /></div>
                      <div className="form-group"><label className="form-label">Location</label><input name="location" value={form.location} onChange={handleChange} className="form-input" /></div>
                    </>
                  )}
                  <div className="form-group"><label className="form-label">Phone</label><input name="phone" value={form.phone} onChange={handleChange} className="form-input" /></div>
                  <div className="form-group"><label className="form-label">Address</label><input name="address" value={form.address} onChange={handleChange} className="form-input" /></div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Avatar URL</label>
                    <input name="avatar" value={form.avatar} onChange={handleChange} className="form-input" placeholder="https://..." />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SALARY INFO TAB (Admin Only) */}
          {activeTab === 'Salary Info' && isAdmin && (
            <div className="card">
              
              <div className="salary-info-header">
                <div className="salary-header-item">
                  <div className="salary-header-label">Month Wage</div>
                  <div className="salary-header-input-wrap">
                    {editing ? (
                      <input name="monthlyWage" type="number" className="salary-header-input" value={salaryForm.monthlyWage} onChange={handleSalaryChange} />
                    ) : (
                      <div className="salary-header-input" style={{ border: 'none', background: 'transparent' }}>{salaryForm.monthlyWage || 0}</div>
                    )}
                    <div className="salary-header-unit">/ Month</div>
                  </div>
                </div>
                <div className="salary-header-item">
                  <div className="salary-header-label">No of working days in a week:</div>
                  <div className="salary-header-input-wrap">
                    {editing ? (
                      <input name="workingDaysPerWeek" type="number" className="salary-header-input" value={salaryForm.workingDaysPerWeek} onChange={handleSalaryChange} />
                    ) : (
                      <div className="salary-header-input" style={{ border: 'none', background: 'transparent' }}>{salaryForm.workingDaysPerWeek}</div>
                    )}
                    <div className="salary-header-unit">/ hrs</div>
                  </div>
                </div>
                <div className="salary-header-item">
                  <div className="salary-header-label">Yearly wage</div>
                  <div className="salary-header-input-wrap">
                    <div className="salary-header-input" style={{ border: 'none', background: 'transparent' }}>{yearlyWage}</div>
                    <div className="salary-header-unit">/ Yearly</div>
                  </div>
                </div>
                <div className="salary-header-item">
                  <div className="salary-header-label">Break Time:</div>
                  <div className="salary-header-input-wrap">
                    {editing ? (
                      <input name="breakTime" type="number" className="salary-header-input" value={salaryForm.breakTime} onChange={handleSalaryChange} />
                    ) : (
                      <div className="salary-header-input" style={{ border: 'none', background: 'transparent' }}>{salaryForm.breakTime}</div>
                    )}
                    <div className="salary-header-unit">/ hrs</div>
                  </div>
                </div>
              </div>

              <div className="salary-grid">
                
                {/* Left Column: Salary Components */}
                <div>
                  <h3 className="salary-section-title">Salary Components</h3>
                  
                  {renderSalaryRow(
                    'Basic Salary',
                    'Define Basic salary from company cost compute it based on monthly Wages',
                    basicAmt, basicPct, 'basicAmt', 'basicPercent'
                  )}
                  {renderSalaryRow(
                    'House Rent Allowance',
                    'HRA provided to employees 50% of the basic salary',
                    hraAmt, hraPct, 'hraAmt', 'hraPercent'
                  )}
                  {renderSalaryRow(
                    'Standard Allowance',
                    'A standard allowance is a predetermined, fixed amount provided to employee as part of their salary',
                    stdAmt, stdPct, 'stdAmt', 'standardPercent'
                  )}
                  {renderSalaryRow(
                    'Performance Bonus',
                    'Variable amount paid during payroll. The value defined by the company and calculated as a % of the basic salary',
                    perfAmt, perfPct, 'perfAmt', 'perfPercent'
                  )}
                  {renderSalaryRow(
                    'Leave Travel Allowance',
                    'LTA is paid by the company to employees to cover their travel expenses and calculated as a % of the basic salary',
                    ltaAmt, ltaPct, 'ltaAmt', 'ltaPercent'
                  )}
                  {renderSalaryRow(
                    'Fixed Allowance',
                    'Fixed allowance portion of wages is determined after calculating all salary components',
                    fixedAmt, fixedPct, 'fixedAmt', ''
                  )}

                </div>

                {/* Right Column: PF & Tax */}
                <div>
                  <h3 className="salary-section-title">Provident Fund (PF) Contribution</h3>
                  
                  {renderSalaryRow(
                    'Employee',
                    'PF is calculated based on the basic salary',
                    pfEmpAmt, pfEmpPct, 'pfEmpAmt', 'pfEmployeePercent'
                  )}
                  {renderSalaryRow(
                    'Employer',
                    'PF is calculated based on the basic salary',
                    pfEmployerAmt, pfEmployerPct, 'pfEmployerAmt', 'pfEmployerPercent'
                  )}

                  <h3 className="salary-section-title" style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                    Tax Deductions
                  </h3>
                  
                  <div className="salary-row">
                    <div className="salary-col-desc">
                      <div className="salary-comp-name">Professional Tax</div>
                      <div className="salary-comp-note">Professional Tax deducted from the Gross salary</div>
                    </div>
                    <div className="salary-col-inputs">
                      <div className="salary-input-group">
                        {editing ? (
                          <input name="professionalTax" type="number" className="salary-calc-amt" value={salaryForm.professionalTax} onChange={handleSalaryChange} />
                        ) : (
                          <div className="salary-calc-amt" style={{border: 'none', background: 'transparent'}}>{parseFloat(salaryForm.professionalTax).toFixed(2)}</div>
                        )}
                        <span className="salary-unit">₹ / month</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
