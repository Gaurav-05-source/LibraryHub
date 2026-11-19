
import { useEffect, useState } from 'react';

import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw
} from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout';
import bookService from '../../services/bookService';

import './AdminBooks.css';

const emptyForm = {
  title: '',
  isbn: '',
  author: '',
  publisher: '',
  publicationYear: '',
  description: '',
  categoryId: ''
};

function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [bookData, categoryData] = await Promise.all([
        bookService.getAllBooks(),
        bookService.getCategories()
      ]);

      setBooks(Array.isArray(bookData) ? bookData : []);
      setCategories(
        Array.isArray(categoryData) ? categoryData : []
      );

    } catch (err) {
      console.error('Admin books loading error:', err);
      setError('Unable to load books and categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBooks = books.filter((book) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      !searchValue ||
      book.title?.toLowerCase().includes(searchValue) ||
      book.author?.toLowerCase().includes(searchValue) ||
      book.isbn?.toLowerCase().includes(searchValue);

    const matchesCategory =
      !categoryFilter ||
      String(book.categoryId) === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setNotice('');
    setShowForm(true);
  };

  const openEditForm = (book) => {
    setForm({
      title: book.title || '',
      isbn: book.isbn || '',
      author: book.author || '',
      publisher: book.publisher || '',
      publicationYear: book.publicationYear ?? '',
      description: book.description || '',
      categoryId: book.categoryId
        ? String(book.categoryId)
        : ''
    });

    setEditingId(book.bookId);
    setError('');
    setNotice('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setNotice('');

      const bookData = {
        title: form.title.trim(),
        isbn: form.isbn.trim(),
        author: form.author.trim(),
        publisher: form.publisher.trim() || null,
        publicationYear: form.publicationYear
          ? Number(form.publicationYear)
          : null,
        description: form.description.trim() || null,
        categoryId: Number(form.categoryId)
      };

      if (editingId) {
        await bookService.updateBook(editingId, bookData);
        setNotice('Book updated successfully.');
      } else {
        await bookService.createBook(bookData);
        setNotice('Book added successfully.');
      }

      closeForm();
      await fetchData();

    } catch (err) {
      console.error('Book save error:', err);

      setError(
        err.response?.data?.message ||
        'Unable to save book. Please check the details.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (book) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`
    );

    if (!confirmed) return;

    try {
      setError('');
      setNotice('');

      await bookService.deleteBook(book.bookId);

      setNotice(`"${book.title}" deleted successfully.`);
      await fetchData();

    } catch (err) {
      console.error('Book deletion error:', err);

      setError(
        err.response?.data?.message ||
        'Unable to delete this book. It may have associated copies or borrowing history.'
      );
    }
  };

  return (
    <DashboardLayout>

      <div className="admin-books-heading">
        <div>
          <h2>Manage Books</h2>
          <p>Manage your library catalogue and book details.</p>
        </div>

        <button
          className="admin-add-book-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add New Book
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

      {showForm && (
        <section className="admin-book-form-panel">

          <div className="admin-book-form-heading">
            <div>
              <h4>{editingId ? 'Edit Book' : 'Add New Book'}</h4>
              <p>Enter the book information below.</p>
            </div>

            <button
              type="button"
              className="admin-form-close"
              onClick={closeForm}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="admin-book-form-grid">

              <div className="admin-book-field">
                <label>Book Title *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  maxLength={200}
                  required
                  placeholder="Enter book title"
                />
              </div>

              <div className="admin-book-field">
                <label>ISBN *</label>
                <input
                  name="isbn"
                  value={form.isbn}
                  onChange={handleFormChange}
                  maxLength={20}
                  required
                  placeholder="Enter ISBN"
                />
              </div>

              <div className="admin-book-field">
                <label>Author *</label>
                <input
                  name="author"
                  value={form.author}
                  onChange={handleFormChange}
                  maxLength={150}
                  required
                  placeholder="Enter author name"
                />
              </div>

              <div className="admin-book-field">
                <label>Publisher</label>
                <input
                  name="publisher"
                  value={form.publisher}
                  onChange={handleFormChange}
                  maxLength={150}
                  placeholder="Enter publisher"
                />
              </div>

              <div className="admin-book-field">
                <label>Publication Year</label>
                <input
                  type="number"
                  name="publicationYear"
                  value={form.publicationYear}
                  onChange={handleFormChange}
                  min="1"
                  max="9999"
                  placeholder="e.g. 2024"
                />
              </div>

              <div className="admin-book-field">
                <label>Category *</label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-book-field admin-book-description">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Enter book description"
                />
              </div>

            </div>

            <div className="admin-book-form-actions">
              <button
                type="button"
                className="admin-book-cancel"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-book-save"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Book'
                    : 'Save Book'}
              </button>
            </div>

          </form>
        </section>
      )}

      <div className="admin-book-toolbar">

        <div className="admin-book-search">
          <Search size={19} />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, author or ISBN..."
          />
        </div>

        <select
          className="admin-book-filter"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="">All Categories</option>

          {categories.map((category) => (
            <option
              key={category.categoryId}
              value={category.categoryId}
            >
              {category.categoryName}
            </option>
          ))}
        </select>

        <button
          className="admin-book-refresh"
          onClick={fetchData}
          disabled={loading}
          title="Refresh books"
        >
          <RefreshCw size={18} />
        </button>

      </div>

      <div className="admin-books-table-panel">

        <div className="admin-books-table-heading">
          <h4>Library Catalogue</h4>
          <span>{filteredBooks.length} books found</span>
        </div>

        {loading ? (
          <div className="admin-books-loading">
            <div className="spinner-border text-primary" />
            <p>Loading books...</p>
          </div>
        ) : filteredBooks.length > 0 ? (

          <div className="table-responsive">
            <table className="table admin-books-table align-middle">

              <thead>
                <tr>
                  <th>Book</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Total</th>
                  <th>Available</th>
                  <th>Issued</th>
                  <th>Reserved</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.bookId}>

                    <td>
                      <div className="admin-book-title-cell">
                        <div className="admin-book-small-icon">
                          <BookOpen size={19} />
                        </div>

                        <div>
                          <strong>{book.title}</strong>
                          <small>{book.author}</small>
                        </div>
                      </div>
                    </td>

                    <td>{book.isbn}</td>

                    <td>
                      {book.categoryName || '—'}
                    </td>

                    <td>{book.totalCopies ?? 0}</td>

                    <td>
                      <span className="admin-copy-available">
                        {book.availableCopies ?? 0}
                      </span>
                    </td>

                    <td>{book.issuedCopies ?? 0}</td>

                    <td>{book.reservedCopies ?? 0}</td>

                    <td>
                      <div className="admin-book-actions">

                        <button
                          className="admin-edit-book"
                          onClick={() => openEditForm(book)}
                          title="Edit book"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className="admin-delete-book"
                          onClick={() => handleDelete(book)}
                          title="Delete book"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        ) : (
          <div className="admin-books-empty">
            <BookOpen size={43} />
            <h5>No books found</h5>
            <p>Try changing your search or category filter.</p>
          </div>
        )}

      </div>

    </DashboardLayout>
  );
}

export default AdminBooks;
