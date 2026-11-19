
import { useEffect, useMemo, useState } from 'react';
import {
    Search,
    Plus,
    RefreshCw,
    Pencil,
    Trash2,
    FolderOpen,
    X,
    Layers,
    AlertTriangle,
    CheckCircle2,
    BookOpen
} from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout';
import categoryService from '../../services/categoryService';
import './AdminCategories.css';

function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [formData, setFormData] = useState({
        categoryName: '',
        description: ''
    });

    const loadCategories = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await categoryService.getAllCategories();
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Unable to load categories.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const filteredCategories = useMemo(() => {
        const term = search.toLowerCase().trim();

        if (!term) return categories;

        return categories.filter(category =>
            (category.categoryName || '').toLowerCase().includes(term) ||
            (category.description || '').toLowerCase().includes(term) ||
            String(category.categoryId).includes(term)
        );
    }, [categories, search]);

    const openAddModal = () => {
        setEditingCategory(null);
        setFormData({
            categoryName: '',
            description: ''
        });
        setError('');
        setSuccess('');
        setShowModal(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            categoryName: category.categoryName || '',
            description: category.description || ''
        });
        setError('');
        setSuccess('');
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingCategory(null);
        setFormData({
            categoryName: '',
            description: ''
        });
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const categoryName = formData.categoryName.trim();
        const description = formData.description.trim();

        if (!categoryName) {
            setError('Category name is required.');
            return;
        }

        if (categoryName.length > 100) {
            setError('Category name cannot exceed 100 characters.');
            return;
        }

        if (description.length > 255) {
            setError('Description cannot exceed 255 characters.');
            return;
        }

        const categoryData = {
            categoryName,
            description: description || null
        };

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            if (editingCategory) {
                await categoryService.updateCategory(
                    editingCategory.categoryId,
                    categoryData
                );

                setSuccess('Category updated successfully.');
            } else {
                await categoryService.createCategory(categoryData);
                setSuccess('Category added successfully.');
            }

            setShowModal(false);
            setEditingCategory(null);
            setFormData({
                categoryName: '',
                description: ''
            });

            await loadCategories();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Unable to save category. Please check the details.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (category) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${category.categoryName}"?`
        );

        if (!confirmed) return;

        setDeletingId(category.categoryId);
        setError('');
        setSuccess('');

        try {
            await categoryService.deleteCategory(category.categoryId);

            setSuccess(
                `"${category.categoryName}" deleted successfully.`
            );

            await loadCategories();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Unable to delete this category. It may be associated with existing books.'
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="admin-categories-page">

                <div className="categories-page-header">
                    <div>
                        <span className="categories-eyebrow">
                            LIBRARY ORGANIZATION
                        </span>
                        <h1>Category Management</h1>
                        <p>
                            Organize your library books into categories.
                        </p>
                    </div>

                    <div className="categories-header-actions">
                        <button
                            type="button"
                            className="categories-refresh-btn"
                            onClick={loadCategories}
                            disabled={loading}
                        >
                            <RefreshCw size={17} />
                            Refresh
                        </button>

                        <button
                            type="button"
                            className="categories-add-btn"
                            onClick={openAddModal}
                        >
                            <Plus size={18} />
                            Add Category
                        </button>
                    </div>
                </div>

                {error && !showModal && (
                    <div className="categories-alert categories-alert-error">
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => setError('')}
                            aria-label="Dismiss error"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="categories-alert categories-alert-success">
                        <CheckCircle2 size={18} />
                        <span>{success}</span>
                        <button
                            type="button"
                            onClick={() => setSuccess('')}
                            aria-label="Dismiss success"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                <div className="categories-summary-grid">
                    <div className="categories-summary-card">
                        <div className="categories-summary-icon">
                            <Layers size={22} />
                        </div>
                        <div>
                            <span>Total Categories</span>
                            <h2>{categories.length}</h2>
                            <small>Available in your library</small>
                        </div>
                    </div>

                    <div className="categories-summary-card">
                        <div className="categories-summary-icon summary-icon-blue">
                            <BookOpen size={22} />
                        </div>
                        <div>
                            <span>Showing Categories</span>
                            <h2>{filteredCategories.length}</h2>
                            <small>
                                {search ? 'Based on your search' : 'All categories displayed'}
                            </small>
                        </div>
                    </div>
                </div>

                <div className="categories-records-panel">
                    <div className="categories-panel-heading">
                        <div>
                            <h2>All Categories</h2>
                            <p>
                                Create, update and organize your book categories.
                            </p>
                        </div>

                        <span className="categories-record-count">
                            {filteredCategories.length} records
                        </span>
                    </div>

                    <div className="categories-toolbar">
                        <div className="categories-search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search category name or description..."
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                            />
                        </div>
                    </div>

                    <div className="categories-table-wrapper">
                        <table className="categories-table">
                            <thead>
                                <tr>
                                    <th>Category ID</th>
                                    <th>Category Name</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="categories-empty">
                                            Loading categories...
                                        </td>
                                    </tr>
                                ) : filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="categories-empty">
                                            <FolderOpen size={32} />
                                            <strong>No categories found</strong>
                                            <span>
                                                Try another search or add a new category.
                                            </span>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map(category => (
                                        <tr key={category.categoryId}>
                                            <td>
                                                <strong className="category-id">
                                                    #{category.categoryId}
                                                </strong>
                                            </td>

                                            <td>
                                                <div className="category-name-cell">
                                                    <div className="category-name-icon">
                                                        <FolderOpen size={18} />
                                                    </div>
                                                    <strong>
                                                        {category.categoryName}
                                                    </strong>
                                                </div>
                                            </td>

                                            <td className="category-description">
                                                {category.description || 'No description provided'}
                                            </td>

                                            <td>
                                                <div className="category-action-buttons">
                                                    <button
                                                        type="button"
                                                        className="category-edit-btn"
                                                        onClick={() => openEditModal(category)}
                                                        title="Edit category"
                                                    >
                                                        <Pencil size={15} />
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="category-delete-btn"
                                                        onClick={() => handleDelete(category)}
                                                        disabled={deletingId === category.categoryId}
                                                        title="Delete category"
                                                    >
                                                        <Trash2 size={15} />
                                                        {deletingId === category.categoryId
                                                            ? 'Deleting...'
                                                            : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showModal && (
                    <div
                        className="categories-modal-overlay"
                        onMouseDown={event => {
                            if (event.target === event.currentTarget) {
                                closeModal();
                            }
                        }}
                    >
                        <div className="categories-modal">
                            <div className="categories-modal-header">
                                <div>
                                    <span>LIBRARY ORGANIZATION</span>
                                    <h2>
                                        {editingCategory
                                            ? 'Edit Category'
                                            : 'Add New Category'}
                                    </h2>
                                    <p>
                                        {editingCategory
                                            ? 'Update the category information.'
                                            : 'Enter the details for your new category.'}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    aria-label="Close modal"
                                >
                                    <X size={21} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {error && (
                                    <div className="categories-modal-error">
                                        <AlertTriangle size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className="categories-form-group">
                                    <label htmlFor="categoryName">
                                        Category Name <span>*</span>
                                    </label>

                                    <input
                                        id="categoryName"
                                        name="categoryName"
                                        type="text"
                                        placeholder="e.g. Programming"
                                        value={formData.categoryName}
                                        onChange={handleInputChange}
                                        maxLength={100}
                                        required
                                    />

                                    <small>
                                        Maximum 100 characters.
                                    </small>
                                </div>

                                <div className="categories-form-group">
                                    <label htmlFor="categoryDescription">
                                        Description
                                    </label>

                                    <textarea
                                        id="categoryDescription"
                                        name="description"
                                        rows="4"
                                        placeholder="Enter a short category description..."
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        maxLength={255}
                                    />

                                    <small>
                                        Maximum 255 characters.
                                        {formData.description.length}/255
                                    </small>
                                </div>

                                <div className="categories-modal-actions">
                                    <button
                                        type="button"
                                        className="categories-cancel-btn"
                                        onClick={closeModal}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="categories-save-btn"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? 'Saving...'
                                            : editingCategory
                                                ? 'Update Category'
                                                : 'Save Category'}
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

export default AdminCategories;
