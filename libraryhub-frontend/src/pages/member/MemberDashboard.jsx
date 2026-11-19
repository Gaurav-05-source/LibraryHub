
import { useEffect, useState } from 'react';

import {
  BookOpen,
  Clock,
  CalendarDays,
  Wallet
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import dashboardService from '../../services/dashboardService';

function MemberDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState({
    borrowedBooks: 0,
    pendingReservations: 0,
    dueSoon: 0,
    pendingFines: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await dashboardService.getMemberDashboard();

        setDashboard(data);
      } catch (error) {
        console.error('Dashboard loading error:', error);
        setError('Unable to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const cards = [
    {
      title: 'Borrowed Books',
      icon: BookOpen,
      value: dashboard.borrowedBooks
    },
    {
      title: 'Pending Reservations',
      icon: Clock,
      value: dashboard.pendingReservations
    },
    {
      title: 'Due Soon',
      icon: CalendarDays,
      value: dashboard.dueSoon
    },
    {
      title: 'Pending Fines',
      icon: Wallet,
      value: `₹${Number(dashboard.pendingFines).toFixed(2)}`
    }
  ];

  return (
    <DashboardLayout>

      <div className="dashboard-heading">
        <div>
          <h2>Welcome, {user?.name}!</h2>
          <p>Here's an overview of your library activity.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mt-3">
          {error}
        </div>
      )}

      <div className="row g-4 mt-2">
        {cards.map((item) => {
          const Icon = item.icon;

          return (
            <div className="col-sm-6 col-xl-3" key={item.title}>
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">

                <div className="dashboard-card-icon">
                  <Icon size={23} />
                </div>

                <h6 className="text-secondary mt-3">
                  {item.title}
                </h6>

                <h3 className="fw-bold mb-0">
                  {loading ? '...' : item.value}
                </h3>

              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-section card border-0 shadow-sm rounded-4 mt-4 p-4">
        <h5 className="fw-semibold">Your Library Activity</h5>

        <p className="text-secondary mb-0">
          Your borrowing records, reservations and upcoming due dates
          will appear here.
        </p>
      </div>

    </DashboardLayout>
  );
}

export default MemberDashboard;
