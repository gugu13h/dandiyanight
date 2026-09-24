import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { subscribeToPaymentSettings, updatePaymentSettings } from '../../services/adminService';

export default function AdminPaymentSettings() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeToPaymentSettings(setForm), []);

  const update = (key, value) => setForm({ ...form, [key]: value });
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePaymentSettings(form);
      toast.success('Payment settings updated');
    } catch {
      toast.error('Failed to update payment settings');
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="loading-container"><div className="spinner" /><p>Loading payment settings...</p></div>;

  return (
    <div>
      <div className="dashboard-header"><h1>Payment Settings</h1><p>Manage payment instructions and account details</p></div>
      <form className="card" onSubmit={handleSave} style={{ maxWidth: 760 }}>
        <div className="form-group"><label className="form-label">UPI ID</label><input className="form-input" value={form.upiId || ''} onChange={(e) => update('upiId', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">QR Code URL</label><input className="form-input" value={form.qrCodeUrl || ''} onChange={(e) => update('qrCodeUrl', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Contact Number</label><input className="form-input" value={form.contactNumber || ''} onChange={(e) => update('contactNumber', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Bank Details</label><textarea className="form-input" rows="3" value={form.bankDetails || ''} onChange={(e) => update('bankDetails', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Payment Instructions</label><textarea className="form-input" rows="4" value={form.instructions || ''} onChange={(e) => update('instructions', e.target.value)} /></div>
        <button className="btn btn-primary" type="submit" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}</button>
      </form>
    </div>
  );
}
