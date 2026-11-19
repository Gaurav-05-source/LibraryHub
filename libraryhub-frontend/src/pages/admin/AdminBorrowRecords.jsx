
import { useEffect, useMemo, useState } from 'react';
import {
    BookOpen,
    RefreshCw,
    Search,
    RotateCcw,
    Plus,
    X,
    Clock3,
    CheckCircle2,
    AlertTriangle,
    Library,
    UserRound
} from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout';
import borrowRecordService from '../../services/borrowRecordService';
import userService from '../../services/userService';
import bookCopyService from '../../services/bookCopyService';
import './AdminBorrowRecords.css';

function AdminBorrowRecords() {
    const [records, setRecords] = useState([]);
    const [members, setMembers] = useState([]);
    const [copies, setCopies] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [showIssueModal, setShowIssueModal] = useState(false);
    const [userId, setUserId] = useState('');
    const [copyId, setCopyId] = useState('');
    const [reservationId, setReservationId] = useState('');

    const loadData = async () => {
        setLoading(true);
        setError('');

        try {
            const [recordsData, membersData, copiesData] =
                await Promise.all([
                    borrowRecordService.getAllBorrowRecords(),
                    userService.getAllUsers(),
                    bookCopyService.getAllCopies()
                ]);

            setRecords(Array.isArray(recordsData) ? recordsData : []);
            setMembers(
                Array.isArray(membersData)
                    ? membersData.filter(
                        member => member.roleName === 'MEMBER'
                    )
                    : []
            );
            setCopies(Array.isArray(copiesData) ? copiesData : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load borrowing records. Please refresh.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const getDisplayStatus = (record) => {
        if (
            record.status === 'ISSUED' &&
            record.dueDate &&
            new Date(`${record.dueDate}T00:00:00`) <
                new Date(new Date().toDateString())
        ) {
            return 'OVERDUE';
        }

        return record.status;
    };

    const counts = useMemo(() => {
        return {
            total: records.length,
            issued: records.filter(
                record => getDisplayStatus(record) === 'ISSUED'
            ).length,
            returned: records.filter(
                record => record.status === 'RETURNED'
            ).length,
            overdue: records.filter(
                record => getDisplayStatus(record) === 'OVERDUE'
            ).length
        };
    }, [records]);

    const filteredRecords = useMemo(() => {
        return records.filter(record => {
            const status = getDisplayStatus(record);
            const searchText = search.toLowerCase();

            const matchesSearch =
                String(record.borrowId).includes(searchText) ||
                (record.userName || '').toLowerCase().includes(searchText) ||
                (record.bookTitle || '').toLowerCase().includes(searchText) ||
                (record.barcode || '').toLowerCase().includes(searchText);

            const matchesStatus =
                statusFilter === 'ALL' || status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [records, search, statusFilter]);

    const formatDate = (date) => {
        if (!date) return '—';

        return new Date(`${date}T00:00:00`).toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );
    };

    const handleIssue = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!userId || !copyId) {
            setError('Please select a member and a physical book copy.');
            return;
        }

        const issueData = {
            userId: Number(userId),
            copyId: Number(copyId),
            ...(reservationId.trim()
                ? { reservationId: Number(reservationId) }
                : {})
        };

        if (
            reservationId.trim() &&
            (!Number.isInteger(Number(reservationId)) ||
                Number(reservationId) <= 0)
        ) {
            setError('Enter a valid reservation ID.');
            return;
        }

        setSubmitting(true);

        try {
            await borrowRecordService.issueBook(issueData);

            setShowIssueModal(false);
            setUserId('');
            setCopyId('');
            setReservationId('');
            setSuccess('Book issued successfully.');
            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Unable to issue this book. Check the member, copy and reservation.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleReturn = async (record) => {
        const confirmed = window.confirm(
            `Confirm return of "${record.bookTitle}" by ${record.userName}?`
        );

        if (!confirmed) return;

        setError('');
        setSuccess('');

        try {
            await borrowRecordService.returnBook(record.borrowId);
            setSuccess('Book returned successfully.');
            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Unable to process the book return.'
            );
        }
    };

    const openIssueModal = () => {
        setError('');
        setSuccess('');
        setShowIssueModal(true);
    };

    const closeIssueModal = () => {
        if (submitting) return;

        setShowIssueModal(false);
        setUserId('');
        setCopyId('');
        setReservationId('');
    };

    return (
        <DashboardLayout>
            <div className="admin-borrow-page">

                <div className="borrow-page-header">
                    <div>
                        <span className="borrow-eyebrow">
                            LIBRARY OPERATIONS
                        </span>
                        <h1>Borrow Records</h1>
                        <p>
                            Track issued books, manage returns and monitor
                            overdue borrowings.
                        </p>
                    </div>

                    <div className="borrow-header-actions">
                        <button
                            className="borrow-refresh-btn"
                            onClick={loadData}
                            disabled={loading}
                            type="button"
                        >
                            <RefreshCw size={17} />
                            Refresh
                        </button>

                        <button
                            className="borrow-issue-btn"
                            onClick={openIssueModal}
                            type="button"
                        >
                            <Plus size={18} />
                            Issue Book
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="borrow-alert borrow-alert-error">
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => setError('')}
                            aria-label="Close error"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="borrow-alert borrow-alert-success">
                        <CheckCircle2 size={18} />
                        <span>{success}</span>
                        <button
                            type="button"
                            onClick={() => setSuccess('')}
                            aria-label="Close success message"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                <div className="borrow-stats-grid">
                    <div className="borrow-stat-card">
                        <div className="borrow-stat-icon stat-purple">
                            <Library size={21} />
                        </div>
                        <div>
                            <span>Total Records</span>
                            <h2>{counts.total}</h2>
                        </div>
                    </div>

                    <div className="borrow-stat-card">
                        <div className="borrow-stat-icon stat-blue">
                            <BookOpen size={21} />
                        </div>
                        <div>
                            <span>Currently Issued</span>
                            <h2>{counts.issued}</h2>
                        </div>
                    </div>

                    <div className="borrow-stat-card">
                        <div className="borrow-stat-icon stat-green">
                            <CheckCircle2 size={21} />
                        </div>
                        <div>
                            <span>Returned</span>
                            <h2>{counts.returned}</h2>
                        </div>
                    </div>

                    <div className="borrow-stat-card">
                        <div className="borrow-stat-icon stat-red">
                            <Clock3 size={21} />
                        </div>
                        <div>
                            <span>Overdue</span>
                            <h2>{counts.overdue}</h2>
                        </div>
                    </div>
                </div>

                <div className="borrow-records-panel">
                    <div className="borrow-panel-heading">
                        <div>
                            <h2>All Borrowing Records</h2>
                            <p>
                                View and manage member borrowing activity.
                            </p>
                        </div>
                        <span className="borrow-record-count">
                            {filteredRecords.length} records
                        </span>
                    </div>

                    <div className="borrow-toolbar">
                        <div className="borrow-search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search member, book, barcode or ID..."
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                            />
                        </div>

                        <select
                            className="borrow-status-filter"
                            value={statusFilter}
                            onChange={event =>
                                setStatusFilter(event.target.value)
                            }
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="ISSUED">Issued</option>
                            <option value="OVERDUE">Overdue</option>
                            <option value="RETURNED">Returned</option>
                        </select>
                    </div>

                    <div className="borrow-table-wrapper">
                        <table className="borrow-table">
                            <thead>
                                <tr>
                                    <th>Borrow ID</th>
                                    <th>Member</th>
                                    <th>Book Details</th>
                                    <th>Issue Date</th>
                                    <th>Due Date</th>
                                    <th>Return Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="borrow-empty">
                                            Loading borrowing records...
                                        </td>
                                    </tr>
                                ) : filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="borrow-empty">
                                            <BookOpen size={30} />
                                            <strong>No borrowing records found</strong>
                                            <span>
                                                Try changing your search or filter.
                                            </span>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map(record => {
                                        const status = getDisplayStatus(record);

                                        return (
                                            <tr key={record.borrowId}>
                                                <td>
                                                    <span className="borrow-id">
                                                        #{record.borrowId}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="borrow-member-cell">
                                                        <div className="borrow-avatar">
                                                            <UserRound size={17} />
                                                        </div>
                                                        <div>
                                                            <strong>
                                                                {record.userName || '—'}
                                                            </strong>
                                                            <small>
                                                                Member ID: {record.userId}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="borrow-book-cell">
                                                        <strong>
                                                            {record.bookTitle || '—'}
                                                        </strong>
                                                        <small>
                                                            Copy #{record.copyId}
                                                            {record.barcode
                                                                ? ` · ${record.barcode}`
                                                                : ''}
                                                        </small>
                                                    </div>
                                                </td>

                                                <td>{formatDate(record.issueDate)}</td>
                                                <td>{formatDate(record.dueDate)}</td>
                                                <td>{formatDate(record.returnDate)}</td>

                                                <td>
                                                    <span
                                                        className={`borrow-status status-${status.toLowerCase()}`}
                                                    >
                                                        {status.replace('_', ' ')}
                                                    </span>
                                                </td>

                                                <td>
                                                    {record.status !== 'RETURNED' ? (
                                                        <button
                                                            className="borrow-return-btn"
                                                            type="button"
                                                            onClick={() => handleReturn(record)}
                                                        >
                                                            <RotateCcw size={15} />
                                                            Return
                                                        </button>
                                                    ) : (
                                                        <span className="borrow-completed">
                                                            <CheckCircle2 size={16} />
                                                            Completed
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showIssueModal && (
                    <div
                        className="borrow-modal-overlay"
                        onMouseDown={event => {
                            if (event.target === event.currentTarget) {
                                closeIssueModal();
                            }
                        }}
                    >
                        <div className="borrow-modal">
                            <div className="borrow-modal-header">
                                <div>
                                    <span>LIBRARY OPERATIONS</span>
                                    <h2>Issue a Book</h2>
                                    <p>
                                        Select a member and physical book copy.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeIssueModal}
                                    disabled={submitting}
                                    aria-label="Close modal"
                                >
                                    <X size={21} />
                                </button>
                            </div>

                            <form onSubmit={handleIssue}>
                                <div className="borrow-form-group">
                                    <label htmlFor="issue-member">
                                        Select Member
                                    </label>
                                    <select
                                        id="issue-member"
                                        value={userId}
                                        onChange={event =>
                                            setUserId(event.target.value)
                                        }
                                        required
                                    >
                                        <option value="">
                                            Choose a member
                                        </option>
                                        {members.map(member => (
                                            <option
                                                key={member.userId}
                                                value={member.userId}
                                            >
                                                {member.name} — {member.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="borrow-form-group">
                                    <label htmlFor="issue-copy">
                                        Select Physical Book Copy
                                    </label>
                                    <select
                                        id="issue-copy"
                                        value={copyId}
                                        onChange={event =>
                                            setCopyId(event.target.value)
                                        }
                                        required
                                    >
                                        <option value="">
                                            Choose a book copy
                                        </option>
                                        {copies
                                            .filter(copy =>
                                                ['AVAILABLE', 'RESERVED'].includes(
                                                    copy.status
                                                )
                                            )
                                            .map(copy => (
                                                <option
                                                    key={copy.copyId}
                                                    value={copy.copyId}
                                                >
                                                    {copy.bookTitle} — Copy #{copy.copyId}
                                                    {' '}({copy.status})
                                                </option>
                                            ))}
                                    </select>
                                    <small>
                                        AVAILABLE copies support direct issuing.
                                        RESERVED copies require their matching
                                        reservation ID.
                                    </small>
                                </div>

                                <div className="borrow-form-group">
                                    <label htmlFor="issue-reservation">
                                        Reservation ID
                                        <span>Optional</span>
                                    </label>
                                    <input
                                        id="issue-reservation"
                                        type="number"
                                        min="1"
                                        placeholder="Enter reservation ID if applicable"
                                        value={reservationId}
                                        onChange={event =>
                                            setReservationId(event.target.value)
                                        }
                                    />
                                    <small>
                                        For reservation-based issuing, enter the
                                        member's READY_FOR_PICKUP reservation ID.
                                    </small>
                                </div>

                                <div className="borrow-issue-note">
                                    <Clock3 size={17} />
                                    <span>
                                        The borrowing period is 14 days. The
                                        backend will validate availability,
                                        reservation status and member limits.
                                    </span>
                                </div>

                                <div className="borrow-modal-actions">
                                    <button
                                        type="button"
                                        className="borrow-cancel-btn"
                                        onClick={closeIssueModal}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="borrow-confirm-btn"
                                        disabled={submitting}
                                    >
                                        {submitting
                                            ? 'Issuing...'
                                            : 'Confirm Issue'}
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

export default AdminBorrowRecords;
