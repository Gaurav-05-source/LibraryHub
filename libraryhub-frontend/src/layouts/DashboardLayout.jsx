
import {
  BookOpen,
  LayoutDashboard,
  Library,
  ClipboardList,
  Users,
  Wallet,
  LogOut,
  Menu,
  X,
  UserCircle,
  Package,
  FolderOpen
} from 'lucide-react';

import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

import './DashboardLayout.css';

function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const navigation = isAdmin
    ? [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Books', path: '/admin/books', icon: Library },
      {
        label: 'Categories',
        path: '/admin/categories',
        icon: FolderOpen
      },
      { label: 'Book Copies', path: '/admin/book-copies', icon: Package },
      { label: 'Members', path: '/admin/members', icon: Users },
      { label: 'Borrow Records', path: '/admin/borrow-records', icon: ClipboardList },
      { label: 'Reservations', path: '/admin/reservations', icon: ClipboardList },
      { label: 'Fines', path: '/admin/fines', icon: Wallet },
    ]
    : [
      { label: 'Dashboard', path: '/member/dashboard', icon: LayoutDashboard },
      {
        label: 'My Profile',
        path: '/member/profile',
        icon: UserCircle
      },
      { label: 'Browse Books', path: '/member/books', icon: Library },
      { label: 'My Reservations', path: '/member/reservations', icon: ClipboardList },
      { label: 'Borrowing History', path: '/member/history', icon: BookOpen },
      { label: 'My Fines', path: '/member/fines', icon: Wallet },
    ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-layout">

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>

        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <BookOpen size={25} />
          </div>

          <span>
            Library<span>Hub</span>
          </span>

          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        <div className="sidebar-section-label">
          MAIN MENU
        </div>

        <nav className="sidebar-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-user">
            <div className="user-avatar">
              <UserCircle size={25} />
            </div>

            <div className="user-details">
              <strong>{user?.name}</strong>
              <span>{isAdmin ? 'Administrator' : 'Member'}</span>
            </div>
          </div>

          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      <div className="dashboard-main">

        <header className="dashboard-header">

          <button
            className="mobile-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={23} />
          </button>

          <div className="header-title">
            <h3>LibraryHub</h3>
            <span>{isAdmin ? 'Admin Portal' : 'Member Portal'}</span>
          </div>

          <div className="header-profile">
            <div className="header-user-info">
              <strong>{user?.name}</strong>
              <span>{user?.role}</span>
            </div>

            <div className="header-avatar">
              <UserCircle size={27} />
            </div>
          </div>

        </header>

        <main className="dashboard-content">
          {children}
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;
