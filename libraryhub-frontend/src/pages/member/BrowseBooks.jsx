
import { useEffect, useState } from 'react';

import {
  Search,
  BookOpen,
  SlidersHorizontal,
  RefreshCw,
  BookmarkPlus
} from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout';
import bookService from '../../services/bookService';
import reservationService from '../../services/reservationService';

import './BrowseBooks.css';

function BrowseBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [notice, setNotice] = useState('');

  const [reservingBookId, setReservingBookId] = useState(null);

  // Fetch all books
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await bookService.getAllBooks();

      const bookList = Array.isArray(response)
        ? response
        : response.content || [];

      setBooks(bookList);

    } catch (err) {
      console.error('Books loading error:', err);
      setError('Unable to load books. Please try again.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setCategoryError('');

      const response = await bookService.getCategories();

      const categoryList = Array.isArray(response)
        ? response
        : response.content || [];

      setCategories(categoryList);

    } catch (err) {
      console.error('Categories loading error:', err);
      setCategoryError('Unable to load categories.');
      setCategories([]);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  // Filter books immediately when search/category changes
  const filteredBooks = books.filter((book) => {
    const searchTerm = keyword.trim().toLowerCase();

    const title = (book.title || '').toLowerCase();
    const author = (book.author || '').toLowerCase();
    const bookCategory = (book.categoryName || '').toLowerCase();

    const matchesSearch =
      searchTerm === '' ||
      title.includes(searchTerm) ||
      author.includes(searchTerm) ||
      bookCategory.includes(searchTerm);

    const selectedCategory = categories.find(
      (category) => String(category.categoryId) === String(categoryId)
    );

    const matchesCategory =
      categoryId === '' ||
      String(book.categoryId) === String(categoryId) ||
      bookCategory === (selectedCategory?.categoryName || '').toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Search form: filtering already happens live
  const handleSearch = (event) => {
    event.preventDefault();
  };

  // Reset search and category
  const handleReset = () => {
    setKeyword('');
    setCategoryId('');
    setNotice('');
    setError('');
  };

  // Reserve a book
  const handleReserve = async (book) => {
    try {
      setReservingBookId(book.bookId);
      setNotice('');
      setError('');

      const reservation =
        await reservationService.createReservation(book.bookId);

      setNotice(
        `Reservation created successfully for "${book.title}"! Reservation ID: ${reservation.reservationId}.`
      );

      await fetchBooks();

    } catch (err) {
      console.error('Reservation error:', err);

      setError(
        err.response?.data?.message ||
        'Unable to reserve this book. Please try again.'
      );

    } finally {
      setReservingBookId(null);
    }
  };

  return (
    <DashboardLayout>

      <div className="browse-heading">
        <div>
          <h2>Browse Books</h2>
          <p>
            Explore our collection and find your next favourite book.
          </p>
        </div>

        <div className="book-count">
          <BookOpen size={18} />
          {books.length} Books
        </div>
      </div>

      {/* Search and category filters */}
      <form className="book-search-panel" onSubmit={handleSearch}>

        <div className="book-search-input">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search by book title or author..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>

        <div className="book-category-select">
          <SlidersHorizontal size={18} />

          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
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
        </div>

        <button type="submit" className="book-search-button">
          Search
        </button>

        <button
          type="button"
          className="book-reset-button"
          onClick={handleReset}
          title="Reset filters"
        >
          <RefreshCw size={18} />
        </button>

      </form>

      {categoryError && (
        <div className="alert alert-warning mt-3">
          {categoryError}
        </div>
      )}

      {notice && (
        <div className="alert alert-success mt-3" role="status">
          {notice}
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="books-loading">
          <div className="spinner-border text-primary" role="status" />
          <p>Loading books...</p>
        </div>
      ) : (
        <>
          <div className="books-results-heading">
            <h5>Library Collection</h5>
            <span>{filteredBooks.length} results found</span>
          </div>

          {filteredBooks.length > 0 ? (
            <div className="books-grid">

              {filteredBooks.map((book) => (
                <div className="book-card" key={book.bookId}>

                  <div className="book-card-cover">
                    <BookOpen size={48} strokeWidth={1.3} />
                    <span>LIBRARYHUB</span>
                  </div>

                  <div className="book-card-content">

                    <span className="book-category">
                      {book.categoryName || 'General'}
                    </span>

                    <h5>{book.title}</h5>

                    <p className="book-author">
                      By {book.author}
                    </p>

                    <div className="book-card-footer">

                      <span
                        className={`availability-label ${
                          book.availableCopies > 0
                            ? 'available'
                            : 'unavailable'
                        }`}
                      >
                        {book.availableCopies > 0
                          ? 'Available'
                          : 'Unavailable'}
                      </span>

                      <span className="available-count">
                        {book.availableCopies ?? 0} copies
                      </span>

                    </div>

                    <button
                      type="button"
                      className="reserve-book-button"
                      onClick={() => handleReserve(book)}
                      disabled={reservingBookId === book.bookId}
                    >
                      <BookmarkPlus size={17} />

                      {reservingBookId === book.bookId
                        ? 'Reserving...'
                        : 'Reserve Book'}
                    </button>

                  </div>

                </div>
              ))}

            </div>
          ) : (
            <div className="no-books">
              <BookOpen size={45} />
              <h5>No books found</h5>
              <p>Try another search term or category.</p>
            </div>
          )}
        </>
      )}

    </DashboardLayout>
  );
}

export default BrowseBooks;
