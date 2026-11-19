
import { useEffect, useState } from 'react';

import {
  Wallet,
  CalendarDays,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout';
import fineService from '../../services/fineService';

import './MyFines.css';

function MyFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFines = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await fineService.getMyFines();

      setFines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fine loading error:', err);
      setError('Unable to load your fine records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not available';

    return new Date(dateValue).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalUnpaid = fines
    .filter((fine) => fine.paymentStatus === 'UNPAID')
    .reduce((total, fine) => total + Number(fine.amount), 0);

  const totalPaid = fines
    .filter((fine) => fine.paymentStatus === 'PAID')
    .reduce((total, fine) => total + Number(fine.amount), 0);

  const getStatusClass = (status) => {
    switch (status) {
      case 'UNPAID':
        return 'fine-status-unpaid';

      case 'PAID':
        return 'fine-status-paid';

      case 'WAIVED':
        return 'fine-status-waived';

      default:
        return '';
    }
  };

  return (
    <DashboardLayout>

      <div className="fines-heading">
        <div>
          <h2>My Fines</h2>
          <p>View your library fines and payment records.</p>
        </div>

        <button
          className="fine-refresh-button"
          onClick={fetchFines}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="fine-summary-grid">

        <div className="fine-summary-card">
          <Wallet size={23} />
          <div>
            <span>Total Fine Records</span>
            <h4>{fines.length}</h4>
          </div>
        </div>

        <div className="fine-summary-card">
          <Clock size={23} />
          <div>
            <span>Pending Amount</span>
            <h4>₹{totalUnpaid.toFixed(2)}</h4>
          </div>
        </div>

        <div className="fine-summary-card">
          <CheckCircle size={23} />
          <div>
            <span>Total Paid</span>
            <h4>₹{totalPaid.toFixed(2)}</h4>
          </div>
        </div>

      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="fines-loading">
          <div className="spinner-border text-primary" />
          <p>Loading fine records...</p>
        </div>
      ) : fines.length > 0 ? (

        <div className="fines-list">

          {fines.map((fine) => (
            <div className="fine-card" key={fine.fineId}>

              <div className="fine-icon">
                <Wallet size={27} />
              </div>

              <div className="fine-content">

                <div className="fine-title-row">

                  <div>
                    <span className="fine-id">
                      FINE #{fine.fineId}
                    </span>

                    <h5>Borrowing #{fine.borrowId}</h5>

                    <span className="fine-description">
                      Library overdue fine
                    </span>
                  </div>

                  <div className="fine-amount-status">
                    <h4>₹{Number(fine.amount).toFixed(2)}</h4>

                    <span
                      className={`fine-status ${getStatusClass(
                        fine.paymentStatus
                      )}`}
                    >
                      {fine.paymentStatus}
                    </span>
                  </div>

                </div>

                <div className="fine-dates">

                  <div>
                    <CalendarDays size={16} />
                    <span>
                      Created: {formatDate(fine.createdAt)}
                    </span>
                  </div>

                  <div>
                    <CheckCircle size={16} />
                    <span>
                      Paid: {formatDate(fine.paidAt)}
                    </span>
                  </div>

                </div>

              </div>

            </div>
          ))}

        </div>

      ) : (
        <div className="fines-empty">
          <Wallet size={48} />
          <h5>No fine records</h5>
          <p>You currently have no fine records in your account.</p>
        </div>
      )}

    </DashboardLayout>
  );
}

export default MyFines;
