import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { subscribeToEvent, updateEvent } from '../../services/eventService';

const fields = [
  ['name', 'Event Name'], ['date', 'Event Date'], ['startTime', 'Start Time'],
  ['endTime', 'End Time'], ['venue', 'Venue'], ['city', 'City'],
  ['ticketPrice', 'Ticket Price'], ['bookingStatus', 'Booking Status'],
];

export default function AdminEventSettings() {
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeToEvent('default', (data) => {
    setEvent(data);
    if (data) setForm(data);
  }), []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateEvent('default', {
        ...form,
        ticketPrice: Number(form.ticketPrice) || 0,
      });
      toast.success('Event settings updated');
    } catch {
      toast.error('Failed to update event settings');
    } finally {
      setSaving(false);
    }
  };

  if (!event) return <div className="loading-container"><div className="spinner" /><p>Loading event settings...</p></div>;

  return (
    <div>
      <div className="dashboard-header"><h1>Event Settings</h1><p>Update the event details shown to attendees</p></div>
      <form className="card" onSubmit={handleSave} style={{ maxWidth: 760 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-lg)' }}>
          {fields.map(([key, label]) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              {key === 'bookingStatus' ? (
                <select className="form-input" value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
                  <option value="BOOKING_OPEN">Booking Open</option>
                  <option value="BOOKING_CLOSED">Booking Closed</option>
                </select>
              ) : (
                <input className="form-input" type={key === 'ticketPrice' ? 'number' : key === 'date' ? 'date' : key.includes('Time') ? 'time' : 'text'} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              )}
            </div>
          ))}
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}</button>
      </form>
    </div>
  );
}
