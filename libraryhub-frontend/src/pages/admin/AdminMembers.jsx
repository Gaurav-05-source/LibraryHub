
import { useEffect, useMemo, useState } from 'react';

import {
  Users,
  Search,
  RefreshCw,
  Eye,
  X,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck
} from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout';
import userService from '../../services/userService';

import './AdminMembers.css';

function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await userService.getAllUsers();

      setMembers(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error('Members loading error:', err);
      setError(
        err.response?.data?.message ||
        'Unable to load member information.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return members.filter((member) => {
      return (
        !searchValue ||
        member.name?.toLowerCase().includes(searchValue) ||
        member.email?.toLowerCase().includes(searchValue) ||
        member.phone?.toLowerCase().includes(searchValue)
      );
    });
  }, [members, search]);

  const registeredMembers = members.filter(
    (member) => member.roleName === 'MEMBER'
  ).length;

  const administrators = members.filter(
    (member) => member.roleName === 'ADMIN'
  ).length;

  const formatDate = (dateValue) => {
    if (!dateValue) return '—';

    return new Date(dateValue).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleViewMember = async (member) => {
    try {
      setError('');

      const details = await userService.getUserById(member.userId);
      setSelectedMember(details);

    } catch (err) {
      console.error('Member details error:', err);
      setError(
        err.response?.data?.message ||
        'Unable to load member details.'
      );
    }
  };

  return (
    <DashboardLayout>

      <div className="admin-members-heading">
        <div>
          <h2>Manage Members</h2>
          <p>View and manage registered LibraryHub accounts.</p>
        </div>

        <button
          className="admin-members-refresh"
          onClick={fetchMembers}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="admin-members-stats">

        <div className="admin-member-stat">
          <div className="admin-member-stat-icon">
            <Users size={22} />
          </div>

          <div>
            <span>Total Accounts</span>
            <h3>{loading ? '—' : members.length}</h3>
          </div>
        </div>

        <div className="admin-member-stat">
          <div className="admin-member-stat-icon">
            <Users size={22} />
          </div>

          <div>
            <span>Registered Members</span>
            <h3>{loading ? '—' : registeredMembers}</h3>
          </div>
        </div>

        <div className="admin-member-stat">
          <div className="admin-member-stat-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <span>Administrators</span>
            <h3>{loading ? '—' : administrators}</h3>
          </div>
        </div>

      </div>

      <div className="admin-members-toolbar">

        <div className="admin-members-search">
          <Search size={19} />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email or phone..."
          />
        </div>

        <span className="admin-members-count">
          {filteredMembers.length} accounts found
        </span>

      </div>

      <section className="admin-members-table-panel">

        <div className="admin-members-table-heading">
          <h4>Registered Accounts</h4>
        </div>

        {loading ? (
          <div className="admin-members-loading">
            <div className="spinner-border text-primary" />
            <p>Loading members...</p>
          </div>
        ) : filteredMembers.length > 0 ? (

          <div className="table-responsive">
            <table className="table admin-members-table align-middle">

              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Registered On</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.userId}>

                    <td>
                      <div className="admin-member-name-cell">
                        <div className="admin-member-avatar">
                          {member.name?.charAt(0).toUpperCase() || '?'}
                        </div>

                        <div>
                          <strong>{member.name}</strong>
                          <small>ID: #{member.userId}</small>
                        </div>
                      </div>
                    </td>

                    <td>{member.email}</td>

                    <td>{member.phone || '—'}</td>

                    <td>
                      <span
                        className={
                          member.roleName === 'ADMIN'
                            ? 'admin-role-badge'
                            : 'member-role-badge'
                        }
                      >
                        {member.roleName}
                      </span>
                    </td>

                    <td>{formatDate(member.createdAt)}</td>

                    <td>
                      <button
                        className="admin-member-view"
                        onClick={() => handleViewMember(member)}
                        title="View member details"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        ) : (
          <div className="admin-members-empty">
            <Users size={42} />
            <h5>No accounts found</h5>
            <p>Try changing your search.</p>
          </div>
        )}

      </section>

      {selectedMember && (
        <div
          className="admin-member-modal-overlay"
          onClick={() => setSelectedMember(null)}
        >
          <section
            className="admin-member-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="admin-member-modal-heading">
              <div>
                <span>ACCOUNT DETAILS</span>
                <h4>Member Information</h4>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                aria-label="Close details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="admin-member-modal-profile">
              <div className="admin-member-large-avatar">
                {selectedMember.name?.charAt(0).toUpperCase() || '?'}
              </div>

              <h3>{selectedMember.name}</h3>
              <span>{selectedMember.roleName}</span>
            </div>

            <div className="admin-member-detail-list">

              <div>
                <Mail size={18} />
                <section>
                  <small>Email Address</small>
                  <strong>{selectedMember.email}</strong>
                </section>
              </div>

              <div>
                <Phone size={18} />
                <section>
                  <small>Phone Number</small>
                  <strong>{selectedMember.phone || 'Not provided'}</strong>
                </section>
              </div>

              <div>
                <ShieldCheck size={18} />
                <section>
                  <small>Account ID</small>
                  <strong>#{selectedMember.userId}</strong>
                </section>
              </div>

              <div>
                <CalendarDays size={18} />
                <section>
                  <small>Registration Date</small>
                  <strong>{formatDate(selectedMember.createdAt)}</strong>
                </section>
              </div>

            </div>

            <button
              className="admin-member-modal-close"
              onClick={() => setSelectedMember(null)}
            >
              Close
            </button>

          </section>
        </div>
      )}

    </DashboardLayout>
  );
}

export default AdminMembers;
