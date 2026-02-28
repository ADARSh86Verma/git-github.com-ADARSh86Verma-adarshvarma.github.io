import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout';
import { getDashboard, getClasses, createClass } from '../api';
import { BookOpen, Users, Clock, QrCode, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

function StatusBadge({ status }) {
  return <span className={`badge badge--${status}`}>{status}</span>;
}

function ClassCard({ cls, onScan }) {
  const [h, m] = cls.start_time.split(':');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;

  return (
    <div className="class-card">
      <div className="class-time">
        <div className="time">{hour}:{m}</div>
        <div className="period">{ampm}</div>
      </div>
      <div className="divider" />
      <div className="class-info">
        <h4>{cls.class_name}</h4>
        <p>{cls.subject} · Room {cls.room || 'TBA'} · {cls.total_students || 0} students</p>
      </div>
      <StatusBadge status={cls.computed_status} />
      {cls.computed_status === 'ongoing' && (
        <button className="btn btn--primary btn--sm" style={{ width: 'auto', marginLeft: 12 }} onClick={() => onScan(cls)}>
          <QrCode size={14} /> Scan
        </button>
      )}
    </div>
  );
}

function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try { const res = await getDashboard(); setData(res.data.data); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="loading-dots"><span/><span/><span/></div>;

  const classes = data?.classes || [];
  const today = new Date().toISOString().slice(0, 10);
  const todayClasses = classes.filter(c => c.class_date === today);
  const ongoingClass = classes.find(c => c.computed_status === 'ongoing');

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800 }}>Teacher Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn--secondary btn--sm" onClick={() => setShowModal(true)}><Plus size={14} /> New Class</button>
          {ongoingClass && (
            <button className="btn btn--primary btn--sm" style={{ width: 'auto' }} onClick={() => navigate('/scanner', { state: { classId: ongoingClass.id } })}>
              <QrCode size={14} /> Open Scanner
            </button>
          )}
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card emerald">
          <div className="stat-icon"><BookOpen size={24} /></div>
          <div className="stat-value">{data?.stats?.totalClasses || 0}</div>
          <div className="stat-label">Total Classes</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-value">{todayClasses.length}</div>
          <div className="stat-label">Today's Classes</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-value">{ongoingClass?.present_count || 0}</div>
          <div className="stat-label">Present Now</div>
        </div>
      </div>

      {ongoingClass && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>● Live Now</p>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>{ongoingClass.class_name}</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{ongoingClass.subject} · {ongoingClass.start_time} – {ongoingClass.end_time}</p>
            </div>
            <button className="btn btn--primary" style={{ width: 'auto' }} onClick={() => navigate('/scanner', { state: { classId: ongoingClass.id } })}>
              <QrCode size={16} /> Start Scanning
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card__header">
          <h3>Today's Schedule</h3>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{todayClasses.length} classes</span>
        </div>
        <div className="card__body">
          {todayClasses.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📅</div><h3>No classes today</h3></div>
          ) : (
            todayClasses.map(cls => (
              <ClassCard key={cls.id} cls={cls} onScan={(c) => navigate('/scanner', { state: { classId: c.id } })} />
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: 24 }} className="card">
        <div className="card__header"><h3>All Classes</h3></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Class</th><th>Date</th><th>Time</th><th>Students</th><th>Present</th><th>Status</th></tr></thead>
            <tbody>
              {classes.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.class_name}</strong><br/><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.subject}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{c.class_date}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{c.start_time}</td>
                  <td>{c.total_students || 0}</td>
                  <td><strong style={{ color: 'var(--accent-primary)' }}>{c.present_count || 0}</strong></td>
                  <td><StatusBadge status={c.computed_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__header">
              <h3>Create New Class</h3>
              <button className="btn btn--icon btn--secondary" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal__body">
              <AddClassForm onSuccess={() => { setShowModal(false); load(); }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AddClassForm({ onSuccess }) {
  const [form, setForm] = useState({ class_name: '', subject: '', class_date: new Date().toISOString().slice(0, 10), start_time: '', end_time: '', room: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await createClass(form); toast.success('Class created!'); onSuccess(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group"><label>Class Name</label><input required value={form.class_name} onChange={e => set('class_name', e.target.value)} placeholder="e.g. Physics Lab" /></div>
      <div className="form-group"><label>Subject</label><input value={form.subject} onChange={e => set('subject', e.target.value)} /></div>
      <div className="form-group"><label>Date</label><input type="date" required value={form.class_date} onChange={e => set('class_date', e.target.value)} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group"><label>Start</label><input type="time" required value={form.start_time} onChange={e => set('start_time', e.target.value)} /></div>
        <div className="form-group"><label>End</label><input type="time" required value={form.end_time} onChange={e => set('end_time', e.target.value)} /></div>
      </div>
      <div className="form-group"><label>Room</label><input value={form.room} onChange={e => set('room', e.target.value)} /></div>
      <div className="modal__footer">
        <button type="submit" className="btn btn--primary" style={{ width: 'auto', padding: '12px 28px' }} disabled={loading}>
          {loading ? 'Creating...' : 'Create Class'}
        </button>
      </div>
    </form>
  );
}

export default function TeacherDashboard() {
  return (
    <DashboardLayout title="Teacher Dashboard">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="classes" element={<Overview />} />
      </Routes>
    </DashboardLayout>
  );
}
