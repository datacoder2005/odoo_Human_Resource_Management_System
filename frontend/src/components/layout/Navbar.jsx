import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, User, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Welcome back!' },
  '/profile': { title: 'Employee Profile', subtitle: 'Manage your profile information' },
  '/payroll': { title: 'Payroll & Salary', subtitle: 'View your salary details' },
  '/attendance': { title: 'Attendance', subtitle: 'Track your attendance' },
  '/leave': { title: 'Leave Requests', subtitle: 'Manage your leave requests' },
};

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'HRMS', subtitle: '' };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="navbar-title">{pageInfo.title}</span>
        <span className="navbar-subtitle">{pageInfo.subtitle}</span>
      </div>

      <div className="navbar-right">
        {/* Notification bell — placeholder */}
        <button className="btn btn-ghost btn-icon" title="Notifications">
          <Bell size={18} />
        </button>

        {/* Avatar + dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            className="avatar-btn"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-expanded={dropdownOpen}
          >
            <Avatar src={user?.avatar} name={user?.name} size="sm" />
            <div>
              <div className="avatar-btn-name">{user?.name}</div>
              <div className="avatar-btn-role">{isAdmin ? 'Admin' : 'Employee'}</div>
            </div>
            <ChevronDown
              size={14}
              style={{
                color: 'var(--text-muted)',
                transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {dropdownOpen && (
            <div className="avatar-dropdown">
              <Link
                to="/profile"
                className="dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <User size={15} />
                My Profile
              </Link>
              <hr className="dropdown-divider" />
              <button className="dropdown-item danger" onClick={handleLogout}>
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
