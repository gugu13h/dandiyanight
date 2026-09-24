// Admin Users Page
import { useState, useEffect } from 'react';
import { subscribeToUsers } from '../../services/adminService';
import { formatTimestamp } from '../../utils/helpers';
import { Search, Users, Shield } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsub = subscribeToUsers((data) => { setUsers(data); setLoading(false); });
    return unsub;
  }, []);

  const filtered = users.filter((u) =>
    !searchTerm ||
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.mobile?.includes(searchTerm)
  );

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading users...</p></div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>Users</h1>
        <p>{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input placeholder="Search by name, email, or mobile..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-muted)' }}>
                No users found
              </td></tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600 }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.mobile}</td>
                  <td>
                    {user.role === 'admin' ? (
                      <span className="status-badge" style={{ background: 'rgba(230,57,70,0.15)',
                        color: 'var(--color-primary-light)', border: '1px solid rgba(230,57,70,0.25)' }}>
                        <Shield size={10} /> Admin
                      </span>
                    ) : (
                      <span className="status-badge neutral">User</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{formatTimestamp(user.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
