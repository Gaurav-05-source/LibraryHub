
import { useEffect, useState } from 'react';

import {
  BookOpen,
  CalendarDays,
  Clock,
  RefreshCw,
  XCircle
} from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout';
import reservationService from '../../services/reservationService';

import './MyReservations.css';

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await reservationService.getMyReservations();

      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Reservations loading error:', err);
      setError('Unable to load your reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not assigned';

    return new Date(dateValue).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancel = async (reservation) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel your reservation for "${reservation.bookTitle}"?`
    );

    if (!confirmed) return;

    try {
      setCancellingId(reservation.reservationId);
      setError('');
      setNotice('');

      await reservationService.cancelReservation(
        reservation.reservationId
      );

      setNotice(
        `Reservation #${reservation.reservationId} cancelled successfully.`
      );

      await fetchReservations();

    } catch (err) {
      console.error('Reservation cancellation error:', err);

      setError(
        err.response?.data?.message ||
        'Unable to cancel this reservation.'
      );
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'reservation-pending';

      case 'READY_FOR_PICKUP':
        return 'reservation-ready';

      case 'FULFILLED':
        return 'reservation-fulfilled';

      case 'CANCELLED':
        return 'reservation-cancelled';

      case 'EXPIRED':
        return 'reservation-expired';

      default:
        return '';
    }
  };

  const canCancel = (status) =>
    ['PENDING', 'READY_FOR_PICKUP'].includes(status);

  return (
    <DashboardLayout>

      <div className="reservations-heading">
        <div>
          <h2>My Reservations</h2>
          <p>Track and manage your reserved books.</p>
        </div>

        <button
          className="reservation-refresh-button"
          onClick={fetchReservations}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {notice && (
        <div className="alert alert-success" role="status">
          {notice}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="reservations-loading">
          <div className="spinner-border text-primary" />
          <p>Loading reservations...</p>
        </div>
      ) : reservations.length > 0 ? (

        <div className="reservations-list">

          {reservations.map((reservation) => (
            <div
              className="reservation-card"
              key={reservation.reservationId}
            >

              <div className="reservation-book-icon">
                <BookOpen size={28} />
              </div>

              <div className="reservation-main">

                <div className="reservation-title-row">
                  <div>
                    <span className="reservation-id">
                      RESERVATION #{reservation.reservationId}
                    </span>

                    <h5>{reservation.bookTitle}</h5>

                    <span className="reservation-book-id">
                      Book ID: {reservation.bookId}
                    </span>
                  </div>

                  <span
                    className={`reservation-status ${getStatusClass(
                      reservation.status
                    )}`}
                  >
                    {reservation.status?.replaceAll('_', ' ')}
                  </span>
                </div>

                <div className="reservation-dates">

                  <div>
                    <CalendarDays size={16} />
                    <span>
                      Reserved: {formatDate(reservation.reservationDate)}
                    </span>
                  </div>

                  <div>
                    <Clock size={16} />
                    <span>
                      Expiry: {formatDate(reservation.expiryDate)}
                    </span>
                  </div>

                </div>

                {canCancel(reservation.status) && (
                  <button
                    className="cancel-reservation-button"
                    onClick={() => handleCancel(reservation)}
                    disabled={
                      cancellingId === reservation.reservationId
                    }
                  >
                    <XCircle size={16} />

                    {cancellingId === reservation.reservationId
                      ? 'Cancelling...'
                      : 'Cancel Reservation'}
                  </button>
                )}

              </div>

            </div>
          ))}

        </div>

      ) : (
        <div className="reservations-empty">
          <BookOpen size={48} />
          <h5>No reservations yet</h5>
          <p>Your reserved books will appear here.</p>
        </div>
      )}

    </DashboardLayout>
  );
}

export default MyReservations;
