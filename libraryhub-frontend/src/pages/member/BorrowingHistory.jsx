
import { useEffect, useState } from 'react';

import {
  BookOpen,
  CalendarDays,
  Clock,
  RefreshCw
} from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout';
import borrowingService from '../../services/borrowingService';

import './BorrowingHistory.css';

function BorrowingHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await borrowingService.getMyBorrowingHistory();

      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Borrowing history error:', err);
      setError('Unable to load your borrowing history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not returned yet';

    return new Date(dateValue).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'ISSUED':
        return 'borrow-status-issued';

      case 'RETURNED':
        return 'borrow-status-returned';

      case 'OVERDUE':
        return 'borrow-status-overdue';

      default:
        return '';
    }
  };

  return (
    <DashboardLayout>

      <div className="borrowing-heading">
        <div>
          <h2>Borrowing History</h2>
          <p>Track your issued, returned and overdue books.</p>
        </div>

        <button
          className="borrowing-refresh-button"
          onClick={fetchHistory}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="borrowing-summary">
        <div className="borrowing-summary-card">
          <BookOpen size={21} />
          <div>
            <span>Total Records</span>
            <h4>{records.length}</h4>
          </div>
        </div>

        <div className="borrowing-summary-card">
          <Clock size={21} />
          <div>
            <span>Currently Issued</span>
            <h4>
              {records.filter((record) => record.status === 'ISSUED').length}
            </h4>
          </div>
        </div>

        <div className="borrowing-summary-card">
          <CalendarDays size={21} />
          <div>
            <span>Returned Books</span>
            <h4>
              {records.filter((record) => record.status === 'RETURNED').length}
            </h4>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="borrowing-loading">
          <div className="spinner-border text-primary" />
          <p>Loading borrowing history...</p>
        </div>
      ) : records.length > 0 ? (

        <div className="borrowing-records">

          {records.map((record) => (
            <div className="borrowing-record-card" key={record.borrowId}>

              <div className="borrowing-book-icon">
                <BookOpen size={27} />
              </div>

              <div className="borrowing-record-content">

                <div className="borrowing-title-row">
                  <div>
                    <span className="borrowing-id">
                      BORROWING #{record.borrowId}
                    </span>

                    <h5>{record.bookTitle}</h5>

                    <span className="borrowing-copy-id">
                      Copy ID: {record.copyId}
                    </span>
                  </div>

                  <span
                    className={`borrow-status ${getStatusClass(record.status)}`}
                  >
                    {record.status?.replaceAll('_', ' ')}
                  </span>
                </div>

                <div className="borrowing-dates">

                  <div>
                    <CalendarDays size={16} />
                    <span>Issued: {formatDate(record.issueDate)}</span>
                  </div>

                  <div>
                    <Clock size={16} />
                    <span>Due: {formatDate(record.dueDate)}</span>
                  </div>

                  <div>
                    <CalendarDays size={16} />
                    <span>Returned: {formatDate(record.returnDate)}</span>
                  </div>

                </div>

              </div>

            </div>
          ))}

        </div>

      ) : (
        <div className="borrowing-empty">
          <BookOpen size={48} />
          <h5>No borrowing records yet</h5>
          <p>Your borrowing history will appear here.</p>
        </div>
      )}

    </DashboardLayout>
  );
}

export default BorrowingHistory;
