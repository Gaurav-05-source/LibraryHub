
import { useEffect, useMemo, useState } from 'react';
import {
    RefreshCw, Search, CalendarDays, Clock3, BookOpen,
    CheckCircle2, XCircle, AlertTriangle, Package,
    RotateCcw, X, UserRound
} from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout';
import reservationService from '../../services/reservationService';
import borrowRecordService from '../../services/borrowRecordService';
import './AdminReservations.css';

function AdminReservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadReservations = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await reservationService.getAllReservations();
            setReservations(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load reservations.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReservations();
    }, []);

    const counts = useMemo(() => ({
        total: reservations.length,
        pending: reservations.filter(r => r.status === 'PENDING').length,
        ready: reservations.filter(r => r.status === 'READY_FOR_PICKUP').length,
        fulfilled: reservations.filter(r => r.status === 'FULFILLED').length,
        expired: reservations.filter(r => r.status === 'EXPIRED').length,
        cancelled: reservations.filter(r => r.status === 'CANCELLED').length
    }), [reservations]);

    const filteredReservations = useMemo(() => {
        const term = search.toLowerCase();

        return reservations.filter(reservation => {
            const matchesSearch =
                String(reservation.reservationId).includes(term) ||
                String(reservation.userId).includes(term) ||
                String(reservation.bookId).includes(term) ||
                (reservation.userName || '').toLowerCase().includes(term) ||
                (reservation.bookTitle || '').toLowerCase().includes(term) ||
                (reservation.assignedCopyBarcode || '').toLowerCase().includes(term);

            const matchesStatus =
                statusFilter === 'ALL' ||
                reservation.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [reservations, search, statusFilter]);

    const formatDateTime = (value) => {
        if (!value) return '—';

        return new Date(value).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCancel = async (reservation) => {
        const confirmed = window.confirm(
            `Cancel reservation #${reservation.reservationId} for ${reservation.userName}?`
        );

        if (!confirmed) return;

        setProcessingId(reservation.reservationId);
        setError('');
        setSuccess('');

        try {
            await reservationService.cancelReservation(
                reservation.reservationId
            );

            setSuccess(
                `Reservation #${reservation.reservationId} cancelled successfully.`
            );

            await loadReservations();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Unable to cancel this reservation.'
            );
        } finally {
            setProcessingId(null);
        }
    };

    const handleIssue = async (reservation) => {
        if (!reservation.assignedCopyId) {
            setError('This reservation does not have an assigned physical copy.');
            return;
        }

        const confirmed = window.confirm(
            `Issue "${reservation.bookTitle}" to ${reservation.userName} using reservation #${reservation.reservationId}?`
        );

        if (!confirmed) return;

        setProcessingId(reservation.reservationId);
        setError('');
        setSuccess('');

        try {
            await borrowRecordService.issueBook({
                userId: reservation.userId,
                copyId: reservation.assignedCopyId,
                reservationId: reservation.reservationId
            });

            setSuccess(
                `Book issued successfully for reservation #${reservation.reservationId}.`
            );

            await loadReservations();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Unable to issue this reservation. Check its status and expiry.'
            );
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusClass = (status) => {
        return `reservation-status status-${status.toLowerCase()}`;
    };

    return (
        <DashboardLayout>
            <div className="admin-reservations-page">

                <div className="reservation-page-header">
                    <div>
                        <span className="reservation-eyebrow">
                            LIBRARY OPERATIONS
                        </span>
                        <h1>Reservations</h1>
                        <p>
                            Manage member reservations, pickup allocation
                            and reservation fulfilment.
                        </p>
                    </div>

                    <button
                        className="reservation-refresh-btn"
                        onClick={loadReservations}
                        disabled={loading}
                        type="button"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="reservation-alert reservation-alert-error">
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                        <button type="button" onClick={() => setError('')}>
                            <X size={17} />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="reservation-alert reservation-alert-success">
                        <CheckCircle2 size={18} />
                        <span>{success}</span>
                        <button type="button" onClick={() => setSuccess('')}>
                            <X size={17} />
                        </button>
                    </div>
                )}

                <div className="reservation-stats-grid">
                    <div className="reservation-stat-card">
                        <div className="reservation-stat-icon stat-purple">
                            <Package size={21} />
                        </div>
                        <div>
                            <span>Total Reservations</span>
                            <h2>{counts.total}</h2>
                        </div>
                    </div>

                    <div className="reservation-stat-card">
                        <div className="reservation-stat-icon stat-orange">
                            <Clock3 size={21} />
                        </div>
                        <div>
                            <span>Pending</span>
                            <h2>{counts.pending}</h2>
                        </div>
                    </div>

                    <div className="reservation-stat-card">
                        <div className="reservation-stat-icon stat-blue">
                            <BookOpen size={21} />
                        </div>
                        <div>
                            <span>Ready for Pickup</span>
                            <h2>{counts.ready}</h2>
                        </div>
                    </div>

                    <div className="reservation-stat-card">
                        <div className="reservation-stat-icon stat-green">
                            <CheckCircle2 size={21} />
                        </div>
                        <div>
                            <span>Fulfilled</span>
                            <h2>{counts.fulfilled}</h2>
                        </div>
                    </div>

                    <div className="reservation-stat-card">
                        <div className="reservation-stat-icon stat-red">
                            <AlertTriangle size={21} />
                        </div>
                        <div>
                            <span>Expired</span>
                            <h2>{counts.expired}</h2>
                        </div>
                    </div>

                    <div className="reservation-stat-card">
                        <div className="reservation-stat-icon stat-gray">
                            <XCircle size={21} />
                        </div>
                        <div>
                            <span>Cancelled</span>
                            <h2>{counts.cancelled}</h2>
                        </div>
                    </div>
                </div>

                <div className="reservation-records-panel">
                    <div className="reservation-panel-heading">
                        <div>
                            <h2>All Reservations</h2>
                            <p>
                                Review reservation status and assigned copies.
                            </p>
                        </div>
                        <span className="reservation-record-count">
                            {filteredReservations.length} records
                        </span>
                    </div>

                    <div className="reservation-toolbar">
                        <div className="reservation-search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search member, book, barcode or ID..."
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={event => setStatusFilter(event.target.value)}
                            className="reservation-status-filter"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                            <option value="FULFILLED">Fulfilled</option>
                            <option value="EXPIRED">Expired</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <div className="reservation-table-wrapper">
                        <table className="reservation-table">
                            <thead>
                                <tr>
                                    <th>Reservation</th>
                                    <th>Member</th>
                                    <th>Book</th>
                                    <th>Assigned Copy</th>
                                    <th>Reserved On</th>
                                    <th>Pickup Expiry</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="reservation-empty">
                                            Loading reservations...
                                        </td>
                                    </tr>
                                ) : filteredReservations.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="reservation-empty">
                                            <CalendarDays size={30} />
                                            <strong>No reservations found</strong>
                                            <span>
                                                Try changing your search or status filter.
                                            </span>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReservations.map(reservation => (
                                        <tr key={reservation.reservationId}>
                                            <td>
                                                <strong className="reservation-id">
                                                    #{reservation.reservationId}
                                                </strong>
                                            </td>

                                            <td>
                                                <div className="reservation-member-cell">
                                                    <div className="reservation-avatar">
                                                        <UserRound size={17} />
                                                    </div>
                                                    <div>
                                                        <strong>
                                                            {reservation.userName || '—'}
                                                        </strong>
                                                        <small>
                                                            Member ID: {reservation.userId}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="reservation-book-cell">
                                                    <strong>
                                                        {reservation.bookTitle || '—'}
                                                    </strong>
                                                    <small>
                                                        Book ID: {reservation.bookId}
                                                    </small>
                                                </div>
                                            </td>

                                            <td>
                                                {reservation.assignedCopyId ? (
                                                    <div className="reservation-copy-cell">
                                                        <strong>
                                                            Copy #{reservation.assignedCopyId}
                                                        </strong>
                                                        <small>
                                                            {reservation.assignedCopyBarcode || 'Barcode unavailable'}
                                                        </small>
                                                    </div>
                                                ) : (
                                                    <span className="reservation-no-copy">
                                                        Not assigned
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                {formatDateTime(reservation.reservationDate)}
                                            </td>

                                            <td>
                                                {reservation.expiryDate
                                                    ? formatDateTime(reservation.expiryDate)
                                                    : '—'}
                                            </td>

                                            <td>
                                                <span className={getStatusClass(reservation.status)}>
                                                    {reservation.status.replaceAll('_', ' ')}
                                                </span>
                                            </td>

                                            <td>
                                                {reservation.status === 'PENDING' && (
                                                    <button
                                                        type="button"
                                                        className="reservation-cancel-btn"
                                                        disabled={processingId === reservation.reservationId}
                                                        onClick={() => handleCancel(reservation)}
                                                    >
                                                        <XCircle size={15} />
                                                        Cancel
                                                    </button>
                                                )}

                                                {reservation.status === 'READY_FOR_PICKUP' && (
                                                    <button
                                                        type="button"
                                                        className="reservation-issue-btn"
                                                        disabled={
                                                            processingId === reservation.reservationId ||
                                                            !reservation.assignedCopyId
                                                        }
                                                        onClick={() => handleIssue(reservation)}
                                                    >
                                                        <BookOpen size={15} />
                                                        {processingId === reservation.reservationId
                                                            ? 'Processing...'
                                                            : 'Issue Book'}
                                                    </button>
                                                )}

                                                {['FULFILLED', 'EXPIRED', 'CANCELLED'].includes(
                                                    reservation.status
                                                ) && (
                                                    <span className="reservation-no-action">
                                                        <CheckCircle2 size={15} />
                                                        No action
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default AdminReservations;
