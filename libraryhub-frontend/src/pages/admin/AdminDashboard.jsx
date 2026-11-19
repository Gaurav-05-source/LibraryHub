
import { useEffect, useState } from 'react';

import {
  BookOpen,
  Users,
  ClipboardList,
  Wallet,
  Clock,
  CalendarDays,
  RefreshCw
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import adminDashboardService from '../../services/adminDashboardService';

import './AdminDashboard.css';

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
};

function AdminDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    activeBorrowings: 0,
    pendingFines: 0
  });

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const results = await Promise.allSettled([
        adminDashboardService.getBooks(),
        adminDashboardService.getMembers(),
        adminDashboardService.getBorrowings(),
        adminDashboardService.getFines(),
        adminDashboardService.getReservations()
      ]);

      const failedRequests = results.filter(
        (result) => result.status === 'rejected'
      );

      const getResultData = (index) => {
        const result = results[index];

        return result.status === 'fulfilled'
          ? result.value
          : [];
      };

      const books = getList(getResultData(0));
      const members = getList(getResultData(1));
      const borrowings = getList(getResultData(2));
      const fines = getList(getResultData(3));
      const allReservations = getList(getResultData(4));

      const activeBorrowings = borrowings.filter(
        (record) =>
          ['ISSUED', 'OVERDUE'].includes(record.status)
      );

      const pendingFines = fines
        .filter((fine) => fine.paymentStatus === 'UNPAID')
        .reduce(
          (total, fine) => total + Number(fine.amount || 0),
          0
        );

      setStats({
        totalBooks: books.length,
        totalMembers: members.length,
        activeBorrowings: activeBorrowings.length,
        pendingFines
      });

      const sortedReservations = [...allReservations].sort(
        (a, b) =>
          new Date(b.reservationDate) -
          new Date(a.reservationDate)
      );

      setReservations(sortedReservations.slice(0, 5));

      if (failedRequests.length > 0) {
        setError(
          'Some dashboard information could not be loaded. Try refreshing.'
        );
      }

    } catch (err) {
      console.error('Admin dashboard error:', err);
      setError('Unable to load dashboard information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const cards = [
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: <BookOpen size={23} />,
      description: 'Book titles in catalogue'
    },
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: <Users size={23} />,
      description: 'Registered members'
    },
    {
      title: 'Active Borrowings',
      value: stats.activeBorrowings,
      icon: <ClipboardList size={23} />,
      description: 'Currently issued books'
    },
    {
      title: 'Pending Fines',
      value: `₹${stats.pendingFines.toFixed(2)}`,
      icon: <Wallet size={23} />,
      description: 'Total unpaid fine amount'
    }
  ];

  const getReservationStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'admin-status-pending';
      case 'READY_FOR_PICKUP':
        return 'admin-status-ready';
      case 'FULFILLED':
        return 'admin-status-fulfilled';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'admin-status-inactive';
      default:
        return '';
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '—';

    return new Date(dateValue).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout>

      <div className="admin-dashboard-heading">
        <div>
          <span className="admin-dashboard-label">
            ADMINISTRATION
          </span>

          <h2>Welcome, {user?.name || 'Admin'}!</h2>

          <p>
            Here's an overview of your library operations.
          </p>
        </div>

        <button
          className="admin-refresh-button"
          onClick={fetchDashboardData}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      <div className="admin-stats-grid">
        {cards.map((card) => (
          <div className="admin-stat-card" key={card.title}>
            <div className="admin-stat-icon">
              {card.icon}
            </div>

            <div className="admin-stat-info">
              <span>{card.title}</span>

              <h3>
                {loading ? '—' : card.value}
              </h3>

              <small>{card.description}</small>
            </div>
          </div>
        ))}
      </div>

      <section className="admin-recent-section">

        <div className="admin-section-heading">
          <div>
            <h4>Recent Reservations</h4>
            <p>Latest reservation activity in your library.</p>
          </div>

          <CalendarDays size={21} />
        </div>

        {loading ? (
          <div className="admin-dashboard-loading">
            <div className="spinner-border text-primary" />
            <p>Loading dashboard...</p>
          </div>
        ) : reservations.length > 0 ? (

          <div className="table-responsive">
            <table className="table admin-reservations-table align-middle">
              <thead>
                <tr>
                  <th>Reservation ID</th>
                  <th>Member</th>
                  <th>Book</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.reservationId}>
                    <td>
                      #{reservation.reservationId}
                    </td>

                    <td>
                      {reservation.userName || '—'}
                    </td>

                    <td>
                      {reservation.bookTitle || '—'}
                    </td>

                    <td>
                      {formatDate(reservation.reservationDate)}
                    </td>

                    <td>
                      <span
                        className={`admin-reservation-status ${getReservationStatusClass(
                          reservation.status
                        )}`}
                      >
                        {reservation.status?.replaceAll('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : (
          <div className="admin-no-reservations">
            <Clock size={35} />
            <h5>No reservations found</h5>
            <p>New reservations will appear here.</p>
          </div>
        )}

      </section>

    </DashboardLayout>
  );
}

export default AdminDashboard;
