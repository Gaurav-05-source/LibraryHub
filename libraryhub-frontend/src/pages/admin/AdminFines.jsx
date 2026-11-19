
import { useEffect, useMemo, useState } from 'react';
import {
    RefreshCw,
    Search,
    Wallet,
    CheckCircle2,
    Clock3,
    Ban,
    X,
    AlertTriangle,
    UserRound,
    BookOpen,
    Plus
} from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout';
import fineService from '../../services/fineService';
import './AdminFines.css';

function AdminFines() {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [borrowId, setBorrowId] = useState('');
    const [generating, setGenerating] = useState(false);

    const loadFines = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await fineService.getAllFines();
            setFines(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load fine records.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFines();
    }, []);

    const counts = useMemo(() => ({
        total: fines.length,
        unpaid: fines.filter(f => f.paymentStatus === 'UNPAID').length,
        paid: fines.filter(f => f.paymentStatus === 'PAID').length,
        waived: fines.filter(f => f.paymentStatus === 'WAIVED').length,
        totalAmount: fines.reduce(
            (sum, fine) => sum + Number(fine.amount || 0), 0
        ),
        unpaidAmount: fines
            .filter(f => f.paymentStatus === 'UNPAID')
            .reduce((sum, fine) => sum + Number(fine.amount || 0), 0)
    }), [fines]);

    const filteredFines = useMemo(() => {
        const term = search.toLowerCase();

        return fines.filter(fine => {
            const matchesSearch =
                String(fine.fineId).includes(term) ||
                String(fine.borrowId).includes(term) ||
                String(fine.userId).includes(term) ||
                (fine.userName || '').toLowerCase().includes(term) ||
                (fine.bookTitle || '').toLowerCase().includes(term);

            const matchesStatus =
                statusFilter === 'ALL' ||
                fine.paymentStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [fines, search, statusFilter]);

    const formatDate = (value) => {
        if (!value) return '—';

        return new Date(value).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return Number(amount || 0).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        });
    };

    const handlePayment = async (fine) => {
        const confirmed = window.confirm(
            `Confirm payment of ${formatCurrency(fine.amount)} for Fine #${fine.fineId}?`
        );

        if (!confirmed) return;

        setProcessingId(fine.fineId);
        setError('');
        setSuccess('');

        try {
            await fineService.markFineAsPaid(fine.fineId);

            setSuccess(`Fine #${fine.fineId} marked as paid successfully.`);
            await loadFines();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Unable to mark this fine as paid.'
            );
        } finally {
            setProcessingId(null);
        }
    };

    const handleWaive = async (fine) => {
        const confirmed = window.confirm(
            `Are you sure you want to waive Fine #${fine.fineId} (${formatCurrency(fine.amount)})?`
        );

        if (!confirmed) return;

        setProcessingId(fine.fineId);
        setError('');
        setSuccess('');

        try {
            await fineService.waiveFine(fine.fineId);

            setSuccess(`Fine #${fine.fineId} waived successfully.`);
            await loadFines();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Unable to waive this fine.'
            );
        } finally {
            setProcessingId(null);
        }
    };

    const handleGenerateFine = async (event) => {
        event.preventDefault();

        if (!borrowId || !Number.isInteger(Number(borrowId)) || Number(borrowId) <= 0) {
            setError('Enter a valid borrowing record ID.');
            return;
        }

        setGenerating(true);
        setError('');
        setSuccess('');

        try {
            await fineService.generateFine(Number(borrowId));

            setShowGenerateModal(false);
            setBorrowId('');
            setSuccess('Fine generated successfully.');
            await loadFines();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Unable to generate fine. Check the borrowing record.'
            );
        } finally {
            setGenerating(false);
        }
    };

    const closeGenerateModal = () => {
        if (generating) return;

        setShowGenerateModal(false);
        setBorrowId('');
    };

    return (
        <DashboardLayout>
            <div className="admin-fines-page">

                <div className="fines-page-header">
                    <div>
                        <span className="fines-eyebrow">
                            LIBRARY FINANCIAL OPERATIONS
                        </span>
                        <h1>Fine Management</h1>
                        <p>
                            Track overdue fines, record payments and manage
                            fine waivers.
                        </p>
                    </div>

                    <div className="fines-header-actions">
                        <button
                            type="button"
                            className="fines-refresh-btn"
                            onClick={loadFines}
                            disabled={loading}
                        >
                            <RefreshCw size={17} />
                            Refresh
                        </button>

                        <button
                            type="button"
                            className="fines-generate-btn"
                            onClick={() => {
                                setError('');
                                setSuccess('');
                                setShowGenerateModal(true);
                            }}
                        >
                            <Plus size={18} />
                            Generate Fine
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="fines-alert fines-alert-error">
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                        <button type="button" onClick={() => setError('')}>
                            <X size={17} />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="fines-alert fines-alert-success">
                        <CheckCircle2 size={18} />
                        <span>{success}</span>
                        <button type="button" onClick={() => setSuccess('')}>
                            <X size={17} />
                        </button>
                    </div>
                )}

                <div className="fines-stats-grid">
                    <div className="fines-stat-card">
                        <div className="fines-stat-icon stat-purple">
                            <Wallet size={21} />
                        </div>
                        <div>
                            <span>Total Fine Records</span>
                            <h2>{counts.total}</h2>
                            <small>{formatCurrency(counts.totalAmount)} total</small>
                        </div>
                    </div>

                    <div className="fines-stat-card">
                        <div className="fines-stat-icon stat-orange">
                            <Clock3 size={21} />
                        </div>
                        <div>
                            <span>Unpaid Fines</span>
                            <h2>{counts.unpaid}</h2>
                            <small>{formatCurrency(counts.unpaidAmount)} pending</small>
                        </div>
                    </div>

                    <div className="fines-stat-card">
                        <div className="fines-stat-icon stat-green">
                            <CheckCircle2 size={21} />
                        </div>
                        <div>
                            <span>Paid Fines</span>
                            <h2>{counts.paid}</h2>
                        </div>
                    </div>

                    <div className="fines-stat-card">
                        <div className="fines-stat-icon stat-gray">
                            <Ban size={21} />
                        </div>
                        <div>
                            <span>Waived Fines</span>
                            <h2>{counts.waived}</h2>
                        </div>
                    </div>
                </div>

                <div className="fines-records-panel">
                    <div className="fines-panel-heading">
                        <div>
                            <h2>All Fine Records</h2>
                            <p>
                                Review member fines and manage their payment status.
                            </p>
                        </div>

                        <span className="fines-record-count">
                            {filteredFines.length} records
                        </span>
                    </div>

                    <div className="fines-toolbar">
                        <div className="fines-search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search member, book, fine ID or borrow ID..."
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                            />
                        </div>

                        <select
                            className="fines-status-filter"
                            value={statusFilter}
                            onChange={event => setStatusFilter(event.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="UNPAID">Unpaid</option>
                            <option value="PAID">Paid</option>
                            <option value="WAIVED">Waived</option>
                        </select>
                    </div>

                    <div className="fines-table-wrapper">
                        <table className="fines-table">
                            <thead>
                                <tr>
                                    <th>Fine ID</th>
                                    <th>Member</th>
                                    <th>Book Details</th>
                                    <th>Borrow ID</th>
                                    <th>Fine Amount</th>
                                    <th>Created At</th>
                                    <th>Paid At</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="fines-empty">
                                            Loading fine records...
                                        </td>
                                    </tr>
                                ) : filteredFines.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="fines-empty">
                                            <Wallet size={30} />
                                            <strong>No fine records found</strong>
                                            <span>
                                                Try changing your search or status filter.
                                            </span>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFines.map(fine => (
                                        <tr key={fine.fineId}>
                                            <td>
                                                <strong className="fine-id">
                                                    #{fine.fineId}
                                                </strong>
                                            </td>

                                            <td>
                                                <div className="fine-member-cell">
                                                    <div className="fine-avatar">
                                                        <UserRound size={17} />
                                                    </div>
                                                    <div>
                                                        <strong>{fine.userName || '—'}</strong>
                                                        <small>Member ID: {fine.userId ?? '—'}</small>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="fine-book-cell">
                                                    <strong>{fine.bookTitle || '—'}</strong>
                                                    <small>Copy ID: {fine.copyId ?? '—'}</small>
                                                </div>
                                            </td>

                                            <td>#{fine.borrowId}</td>

                                            <td>
                                                <strong className="fine-amount">
                                                    {formatCurrency(fine.amount)}
                                                </strong>
                                            </td>

                                            <td>{formatDate(fine.createdAt)}</td>
                                            <td>{formatDate(fine.paidAt)}</td>

                                            <td>
                                                <span className={`fine-status status-${fine.paymentStatus.toLowerCase()}`}>
                                                    {fine.paymentStatus}
                                                </span>
                                            </td>

                                            <td>
                                                {fine.paymentStatus === 'UNPAID' ? (
                                                    <div className="fine-action-buttons">
                                                        <button
                                                            type="button"
                                                            className="fine-pay-btn"
                                                            disabled={processingId === fine.fineId}
                                                            onClick={() => handlePayment(fine)}
                                                        >
                                                            {processingId === fine.fineId
                                                                ? 'Processing...'
                                                                : 'Mark Paid'}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="fine-waive-btn"
                                                            disabled={processingId === fine.fineId}
                                                            onClick={() => handleWaive(fine)}
                                                        >
                                                            Waive
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="fine-no-action">
                                                        <CheckCircle2 size={15} />
                                                        Completed
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

                {showGenerateModal && (
                    <div
                        className="fines-modal-overlay"
                        onMouseDown={event => {
                            if (event.target === event.currentTarget) {
                                closeGenerateModal();
                            }
                        }}
                    >
                        <div className="fines-modal">
                            <div className="fines-modal-header">
                                <div>
                                    <span>LIBRARY FINANCIAL OPERATIONS</span>
                                    <h2>Generate Fine</h2>
                                    <p>
                                        Enter a returned borrowing record ID.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeGenerateModal}
                                    disabled={generating}
                                    aria-label="Close modal"
                                >
                                    <X size={21} />
                                </button>
                            </div>

                            <form onSubmit={handleGenerateFine}>
                                <div className="fines-form-group">
                                    <label htmlFor="fine-borrow-id">
                                        Borrowing Record ID
                                    </label>
                                    <input
                                        id="fine-borrow-id"
                                        type="number"
                                        min="1"
                                        placeholder="Enter borrowing record ID"
                                        value={borrowId}
                                        onChange={event => setBorrowId(event.target.value)}
                                        required
                                    />
                                    <small>
                                        Only returned books with overdue days
                                        qualify for manual fine generation.
                                        The backend calculates the amount at ₹5 per day.
                                    </small>
                                </div>

                                <div className="fines-modal-note">
                                    <BookOpen size={17} />
                                    <span>
                                        A fine can only be generated once for
                                        each borrowing record.
                                    </span>
                                </div>

                                <div className="fines-modal-actions">
                                    <button
                                        type="button"
                                        className="fines-cancel-btn"
                                        onClick={closeGenerateModal}
                                        disabled={generating}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="fines-confirm-btn"
                                        disabled={generating}
                                    >
                                        {generating ? 'Generating...' : 'Generate Fine'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default AdminFines;
