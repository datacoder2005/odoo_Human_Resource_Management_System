import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Hash, Eye, EyeOff } from 'lucide-react';
import { registerUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    role: 'Employee',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const setRole = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { employeeId, name, email, password } = formData;

    if (!employeeId || !name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser(formData);
      const { token, user } = res.data;
      login(user, token);
      toast.success(`Account created! Welcome, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const iconStyle = {
    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
    color: 'var(--text-muted)', pointerEvents: 'none',
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>HRMS</div>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Fill in your details to get started</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Role selector */}
          <div className="form-group">
            <label className="form-label">Account type</label>
            <div className="role-toggle">
              <button
                type="button"
                className={`role-toggle-btn${formData.role === 'Employee' ? ' active' : ''}`}
                onClick={() => setRole('Employee')}
                id="role-employee-btn"
              >
                Employee
              </button>
              <button
                type="button"
                className={`role-toggle-btn${formData.role === 'Admin' ? ' active' : ''}`}
                onClick={() => setRole('Admin')}
                id="role-admin-btn"
              >
                Admin / HR
              </button>
            </div>
          </div>

          {/* Employee ID */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-empid">Employee ID <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <Hash size={16} style={iconStyle} />
              <input
                id="signup-empid"
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="e.g. EMP001"
                className="form-input"
                style={{ paddingLeft: 38 }}
                required
              />
            </div>
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-name">Full name <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={iconStyle} />
              <input
                id="signup-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="form-input"
                style={{ paddingLeft: 38 }}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email address <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={iconStyle} />
              <input
                id="signup-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="form-input"
                style={{ paddingLeft: 38 }}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">Password <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={iconStyle} />
              <input
                id="signup-password"
                type={showPw ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="form-input"
                style={{ paddingLeft: 38, paddingRight: 42 }}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 0,
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span className="form-hint">Password must be at least 6 characters</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            id="signup-submit-btn"
            style={{ marginTop: 4 }}
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-link-row">
          Already have an account?
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
