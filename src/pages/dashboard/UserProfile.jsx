// User Profile Page
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';

export default function UserProfile() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    mobile: userProfile?.mobile || '',
    address: userProfile?.address || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: formData.name,
        mobile: formData.mobile,
        address: formData.address,
        updatedAt: serverTimestamp(),
      });
      await refreshProfile();
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1>My Profile</h1>
        <p>View and manage your personal information</p>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 'var(--space-xl)' }}>
          <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.2rem', fontWeight: 700 }}>
            Personal Details
          </h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn btn-sm btn-outline">Edit</button>
          )}
        </div>

        {editing ? (
          <>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">
                <User size={14} style={{ display: 'inline', marginRight: 6 }} /> Full Name
              </label>
              <input id="profile-name" name="name" className="form-input"
                value={formData.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">
                <Mail size={14} style={{ display: 'inline', marginRight: 6 }} /> Email (cannot change)
              </label>
              <input id="profile-email" className="form-input" value={userProfile?.email || ''} disabled
                style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-mobile">
                <Phone size={14} style={{ display: 'inline', marginRight: 6 }} /> Mobile Number
              </label>
              <input id="profile-mobile" name="mobile" className="form-input" type="tel"
                value={formData.mobile} onChange={handleChange} maxLength={10} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-address">
                <MapPin size={14} style={{ display: 'inline', marginRight: 6 }} /> Address
              </label>
              <textarea id="profile-address" name="address" className="form-input"
                value={formData.address} onChange={handleChange} rows={3} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                  : <><Save size={16} /> Save Changes</>}
              </button>
              <button onClick={() => setEditing(false)} className="btn btn-outline">Cancel</button>
            </div>
          </>
        ) : (
          <div className="booking-summary">
            {[
              [<User size={16} />, 'Name', userProfile?.name],
              [<Mail size={16} />, 'Email', userProfile?.email],
              [<Phone size={16} />, 'Mobile', userProfile?.mobile],
              [<MapPin size={16} />, 'Address', userProfile?.address],
            ].map(([icon, label, value]) => (
              <div key={label} className="booking-summary-row">
                <span className="booking-summary-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--color-primary-light)' }}>{icon}</span> {label}
                </span>
                <span className="booking-summary-value">{value || '-'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
