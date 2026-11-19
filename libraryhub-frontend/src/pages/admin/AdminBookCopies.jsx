
import { useEffect, useMemo, useState } from 'react';

import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  X,
  Package
} from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout';
import bookService from '../../services/bookService';
import bookCopyService from '../../services/bookCopyService';

import './AdminBookCopies.css';

const emptyForm = {
  bookId: '',
  barcode: ''
};

function AdminBookCopies() {
  const [books, setBooks] = useState([]);
  const [copies, setCopies] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [bookData, copyData] = await Promise.all([
        bookService.getAllBooks(),
        bookCopyService.getAllCopies()
      ]);

      setBooks(Array.isArray(bookData) ? bookData : []);
      setCopies(Array.isArray(copyData) ? copyData : []);

    } catch (err) {
      console.error('Book copies loading error:', err);
      setError('Unable to load books and physical copies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCopies = useMemo(() => {
    return copies.filter((copy) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        !searchValue ||
        copy.bookTitle?.toLowerCase().includes(searchValue) ||
        copy.barcode?.toLowerCase().includes(searchValue) ||
        String(copy.copyId).includes(searchValue);

      const matchesStatus =
        !statusFilter || copy.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [copies, search, statusFilter]);

  const counts = useMemo(() => ({
    total: copies.length,
    available: copies.filter((copy) => copy.status === 'AVAILABLE').length,
    issued: copies.filter((copy) => copy.status === 'ISSUED').length,
    reserved: copies.filter((copy) => copy.status === 'RESERVED').length
  }), [copies]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const openForm = () => {
    setForm(emptyForm);
    setError('');
    setNotice('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setNotice('');

      const copyData = {
        bookId: Number(form.bookId),
        barcode: form.barcode.trim()
      };

      await bookCopyService.createCopy(copyData);

      setNotice('Physical book copy added successfully.');
      closeForm();

      await fetchData();

    } catch (err) {
      console.error('Book copy creation error:', err);

      setError(
        err.response?.data?.message ||
        'Unable to add physical copy. Check the barcode and book selection.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (copy) => {
    const confirmed = window.confirm(
      `Delete physical copy "${copy.barcode}"?`
    );

    if (!confirmed) return;

    try {
      setError('');
      setNotice('');

      await bookCopyService.deleteCopy(copy.copyId);

      setNotice(`Copy ${copy.barcode} deleted successfully.`);
      await fetchData();

    } catch (err) {
      console.error('Book copy deletion error:', err);

      setError(
        err.response?.data?.message ||
        'Unable to delete this copy. It may be issued, reserved or have borrowing history.'
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'copy-status-available';
      case 'ISSUED':
        return 'copy-status-issued';
      case 'RESERVED':
        return 'copy-status-reserved';
      case 'LOST':
        return 'copy-status-lost';
      case 'DAMAGED':
        return 'copy-status-damaged';
      default:
        return '';
    }
  };

  return (
    <DashboardLayout>

      <div className="admin-copies-heading">
        <div>
          <h2>Manage Book Copies</h2>
          <p>Manage physical inventory and unique book barcodes.</p>
        </div>

        <button
          className="admin-add-copy-button"
          onClick={openForm}
        >
          <Plus size={18} />
          Add Book Copy
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

      <div className="admin-copy-stats">

        <div className="admin-copy-stat">
          <Package />
          <div>
            <span>Total Copies</span>
            <h3>{loading ? '—' : counts.total}</h3>
          </div>
        </div>

        <div className="admin-copy-stat">
          <BookOpen />
          <div>
            <span>Available</span>
            <h3>{loading ? '—' : counts.available}</h3>
          </div>
        </div>

        <div className="admin-copy-stat">
          <BookOpen />
          <div>
            <span>Issued</span>
            <h3>{loading ? '—' : counts.issued}</h3>
          </div>
        </div>

        <div className="admin-copy-stat">
          <Package />
          <div>
            <span>Reserved</span>
            <h3>{loading ? '—' : counts.reserved}</h3>
          </div>
        </div>

      </div>

      {showForm && (
        <section className="admin-copy-form-panel">

          <div className="admin-copy-form-heading">
            <div>
              <h4>Add Physical Book Copy</h4>
              <p>Select a catalogue book and assign its unique barcode.</p>
            </div>

            <button
              type="button"
              className="admin-copy-close"
              onClick={closeForm}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="admin-copy-form-grid">

              <div className="admin-copy-field">
                <label>Select Book *</label>

                <select
                  name="bookId"
                  value={form.bookId}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Choose a book</option>

                  {books.map((book) => (
                    <option
                      key={book.bookId}
                      value={book.bookId}
                    >
                      {book.title} — {book.author}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-copy-field">
                <label>Unique Barcode *</label>

                <input
                  name="barcode"
                  value={form.barcode}
                  onChange={handleFormChange}
                  maxLength={50}
                  required
                  placeholder="e.g. LIB-COPY-010"
                />
              </div>

            </div>

            <p className="admin-copy-help">
              New physical copies are automatically assigned AVAILABLE status.
            </p>

            <div className="admin-copy-form-actions">

              <button
                type="button"
                className="admin-copy-cancel"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-copy-save"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Add Copy'}
              </button>

            </div>

          </form>
        </section>
      )}

      <div className="admin-copy-toolbar">

        <div className="admin-copy-search">
          <Search size={19} />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by book title, barcode or copy ID..."
          />
        </div>

        <select
          className="admin-copy-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="ISSUED">Issued</option>
          <option value="RESERVED">Reserved</option>
          <option value="LOST">Lost</option>
          <option value="DAMAGED">Damaged</option>
        </select>

        <button
          className="admin-copy-refresh"
          onClick={fetchData}
          disabled={loading}
          title="Refresh copies"
        >
          <RefreshCw size={18} />
        </button>

      </div>

      <section className="admin-copies-table-panel">

        <div className="admin-copies-table-heading">
          <h4>Physical Copy Inventory</h4>
          <span>{filteredCopies.length} copies found</span>
        </div>

        {loading ? (
          <div className="admin-copies-loading">
            <div className="spinner-border text-primary" />
            <p>Loading physical copies...</p>
          </div>
        ) : filteredCopies.length > 0 ? (

          <div className="table-responsive">
            <table className="table admin-copies-table align-middle">

              <thead>
                <tr>
                  <th>Copy ID</th>
                  <th>Book Title</th>
                  <th>Barcode</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredCopies.map((copy) => (
                  <tr key={copy.copyId}>

                    <td>#{copy.copyId}</td>

                    <td>
                      <div className="admin-copy-book-cell">
                        <div className="admin-copy-book-icon">
                          <BookOpen size={18} />
                        </div>

                        <strong>{copy.bookTitle || '—'}</strong>
                      </div>
                    </td>

                    <td>{copy.barcode}</td>

                    <td>
                      <span
                        className={`admin-copy-status ${getStatusClass(copy.status)}`}
                      >
                        {copy.status?.replaceAll('_', ' ')}
                      </span>
                    </td>

                    <td>
                      {copy.createdAt
                        ? new Date(copy.createdAt).toLocaleDateString('en-IN')
                        : '—'}
                    </td>

                    <td>
                      <button
                        className="admin-copy-delete"
                        onClick={() => handleDelete(copy)}
                        title="Delete physical copy"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        ) : (
          <div className="admin-copies-empty">
            <Package size={43} />
            <h5>No physical copies found</h5>
            <p>Add a copy or change your search and filters.</p>
          </div>
        )}

      </section>

    </DashboardLayout>
  );
}

export default AdminBookCopies;
