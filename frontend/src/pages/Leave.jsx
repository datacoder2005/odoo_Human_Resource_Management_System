import React from 'react';
import { CalendarOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';

const Leave = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="coming-soon-page">
        <div className="coming-soon-icon">
          <CalendarOff size={36} />
        </div>
        <h1 className="coming-soon-title">Leave Requests Module</h1>
        <p className="coming-soon-desc">
          The leave management module is currently under development. It will allow employees to
          apply for leave and HR to approve or reject requests, with leave balance tracking.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard')}
          style={{ marginTop: 8 }}
        >
          Back to Dashboard
        </button>
      </div>
    </DashboardLayout>
  );
};

export default Leave;
