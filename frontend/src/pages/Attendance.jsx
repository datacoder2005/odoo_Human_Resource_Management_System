import React from 'react';
import { CalendarCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';

const Attendance = () => {
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
          <CalendarCheck size={36} />
        </div>
        <h1 className="coming-soon-title">Attendance Module</h1>
        <p className="coming-soon-desc">
          The attendance tracking module is currently under development and will be available soon.
          Check back for daily check-in/out, status reports, and attendance history.
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

export default Attendance;
