import { useEffect, useState } from 'react';
import { subscribeToAdminLogs } from '../../services/adminService';
import { formatTimestamp } from '../../utils/helpers';

export default function AdminLogs() {
  const [logs, setLogs] = useState(null);
  useEffect(() => subscribeToAdminLogs(setLogs), []);
  if (!logs) return <div className="loading-container"><div className="spinner" /><p>Loading admin logs...</p></div>;
  return <div><div className="dashboard-header"><h1>Admin Logs</h1><p>Recent administrative actions</p></div><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Action</th><th>Description</th><th>Booking</th><th>Time</th></tr></thead><tbody>{logs.length === 0 ? <tr><td colSpan={4}>No admin actions recorded</td></tr> : logs.map((log) => <tr key={log.id}><td>{log.action}</td><td>{log.description}</td><td>{log.bookingId || '-'}</td><td>{formatTimestamp(log.timestamp)}</td></tr>)}</tbody></table></div></div>;
}
