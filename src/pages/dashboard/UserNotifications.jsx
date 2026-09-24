// User Notifications Page
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/notificationService';
import { formatTimestamp } from '../../utils/helpers';
import { Bell, Check, CheckCheck } from 'lucide-react';

export default function UserNotifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToNotifications(currentUser.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  const handleMarkRead = async (id) => {
    try { await markNotificationAsRead(id); } catch (e) { console.error(e); }
  };

  const handleMarkAllRead = async () => {
    try { await markAllNotificationsAsRead(currentUser.uid); } catch (e) { console.error(e); }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading notifications...</p></div>;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h1>Notifications</h1>
            <p>{unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn btn-sm btn-outline">
              <CheckCheck size={14} /> Mark All as Read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <h3>No Notifications</h3>
          <p>You'll see booking updates and announcements here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {notifications.map((notif) => (
            <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
              <div className="notif-dot" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>{notif.title}</div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: 4 }}>
                  {notif.message}
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                  {formatTimestamp(notif.createdAt)}
                </div>
              </div>
              {!notif.read && (
                <button onClick={() => handleMarkRead(notif.id)} className="btn btn-ghost btn-sm" title="Mark as read">
                  <Check size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
