import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout';
import { getDashboard, registerUser, getUsers, deleteUser, getClasses, createClass } from '../api';
import { Users, GraduationCap, BookOpen, BarChart3, Plus, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Stat Card ─────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon"><Icon size={24} /></div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h3>{title}</h3>
          <button className="btn btn--icon btn--secondary" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

// ── Add User Form ─────────────────────────────────────────
function AddUserForm({ onSuccess, role }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', dob: '', role, grade: '', section: '', roll_number: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setResult(null);
    try {
      const res = await registerUser(form);
      setResult({ success: true, password: res.data.default_password });
      toast.success(`${role} created! Default password: ${res.data.default_password}`);
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user';
      setResult({ success: false, message: msg });
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      {result?.success && (
        <div className="alert alert--success" style={{ marginBottom: 16 }}>
          ✅ {role} created! Default password: <strong style={{ fontFamily: 'var(--font-mono)' }}>{result.password}</strong>
        </div>
      )}
      {result?.success === false && (
        <div className="alert alert--error" style={{ marginBottom: 16 }}>⚠️ {result.message}</div>
      )}
      <div className="form-group">
        <label>Full Name *</label>
        <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full Name" />
      </div>
      <div className="form-group">
        <label>Email *</label>
        <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@school.com" />
      </div>
      <div className="form-group">
        <label>Phone</label>
        <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Phone number" />
      </div>
      <div className="form-group">
        <label>Date of Birth * <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(password generate hogi isse)</span></label>
        <input type="date" required value={form.dob} onChange={e => set('dob', e.target.value)} />
      </div>
      {role === 'student' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Grade</label>
              <input value={form.grade} onChange={e => set('grade', e.target.value)} placeholder="e.g. 10" />
            </div>
            <div className="form-group">
              <label>Section</label>
              <input value={form.section} onChange={e => set('section', e.target.value)} placeholder="e.g. A" />
            </div>
          </div>
          <div className="form-group">
            <label>Roll Number</label>
            <input value={form.roll_number} onChange={e => set('roll_number', e.target.value)} placeholder="Roll number" />
          </div>
        </>
      )}
      <div className="modal__footer">
        <button
          type="submit"
          className="btn btn--primary"
          style={{ width: 'auto', padding: '12px 28px' }}
          disabled={loading}
        >
          {loading ? 'Creating...' : `Create ${role}`}
        </button>
      </div>
    </form>
  );
}

// ── Main Overview ─────────────────────────────────────────
function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'teacher' | 'student' | 'class'

  const load = async () => {
    try { const res = await getDashboard(); setData(res.data.data); }
    catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="loading-dots"><span/><span/><span/></div>;

  const s = data?.stats || {};

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800 }}>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn--secondary btn--sm" onClick={() => setModal('teacher')}><Plus size={14} /> Teacher</button>
          <button className="btn btn--secondary btn--sm" onClick={() => setModal('student')}><Plus size={14} /> Student</button>
          <button className="btn btn--primary btn--sm" style={{ width: 'auto' }} onClick={() => setModal('class')}><Plus size={14} /> Class</button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Total Teachers" value={s.teachers} icon={Users} color="blue" />
        <StatCard label="Total Students" value={s.students} icon={GraduationCap} color="emerald" />
        <StatCard label="Classes Today" value={s.classes} icon={BookOpen} color="amber" />
        <StatCard label="Present Today" value={s.todayPresent} icon={BarChart3} color="emerald" sub={`Absent: ${s.todayAbsent || 0}`} />
      </div>

      <div className="card">
        <div className="card__header">
          <h3>Recent Classes</h3>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Last 7 days</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Class</th><th>Teacher</th><th>Date</th><th>Time</th><th>Present</th><th>Status</th></tr></thead>
            <tbody>
              {data?.recent_classes?.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.class_name}</strong><br/><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.subject}</span></td>
                  <td>{c.teacher_name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{c.class_date}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{c.start_time} – {c.end_time}</td>
                  <td><strong style={{ color: 'var(--accent-primary)' }}>{c.present_count || 0}</strong></td>
                  <td><span className={`badge badge--${c.computed_status}`}>{c.computed_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.recent_classes?.length && <div className="empty-state"><p>No classes in the last 7 days</p></div>}
        </div>
      </div>

      {modal && (
        <Modal
          title={modal === 'class' ? 'Create New Class' : `Add ${modal.charAt(0).toUpperCase() + modal.slice(1)}`}
          onClose={() => setModal(null)}
        >
          {modal !== 'class' ? (
            <AddUserForm role={modal} onSuccess={() => { setModal(null); load(); }} />
          ) : (
            <AddClassForm onSuccess={() => { setModal(null); load(); }} />
          )}
        </Modal>
      )}
    </>
  );
}

// ── Add Class Form ────────────────────────────────────────
function AddClassForm({ onSuccess }) {
  const [form, setForm] = useState({ class_name: '', subject: '', class_date: '', start_time: '', end_time: '', room: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createClass(form);
      toast.success('Class created!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group"><label>Class Name</label><input required value={form.class_name} onChange={e => set('class_name', e.target.value)} placeholder="e.g. Mathematics Grade 10" /></div>
      <div className="form-group"><label>Subject</label><input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Subject" /></div>
      <div className="form-group"><label>Date</label><input type="date" required value={form.class_date} onChange={e => set('class_date', e.target.value)} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group"><label>Start Time</label><input type="time" required value={form.start_time} onChange={e => set('start_time', e.target.value)} /></div>
        <div className="form-group"><label>End Time</label><input type="time" required value={form.end_time} onChange={e => set('end_time', e.target.value)} /></div>
      </div>
      <div className="form-group"><label>Room</label><input value={form.room} onChange={e => set('room', e.target.value)} placeholder="Room number/name" /></div>
      <div className="modal__footer">
        <button type="submit" className="btn btn--primary" style={{ width: 'auto', padding: '12px 28px' }} disabled={loading}>
          {loading ? 'Creating...' : 'Create Class'}
        </button>
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Panel">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="teachers" element={<UsersTable role="teacher" />} />
        <Route path="students" element={<UsersTable role="student" />} />
        <Route path="classes" element={<ClassesTable />} />
      </Routes>
    </DashboardLayout>
  );
}

function UsersTable({ role }) {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getUsers(role);
      setUsers(res.data.data || []);
    } catch (err) {
      toast.error(`Failed to load ${role}s: ` + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [role]);

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`"${name}" ko deactivate karna chahte ho?`)) return;
    try {
      await deleteUser(userId);
      toast.success(`${name} deactivated`);
      load();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="loading-dots"><span/><span/><span/></div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, textTransform: 'capitalize' }}>{role}s</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{users.length} total {role}s</p>
        </div>
        <button className="btn btn--primary btn--sm" style={{ width: 'auto' }} onClick={() => setModal(true)}>
          <Plus size={14} /> Add {role}
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                {role === 'student' && <><th>Grade</th><th>Section</th><th>Roll No</th></>}
                <th>DOB</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id || u.user_id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                  <td><strong>{u.name}</strong></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.email}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.phone || '—'}</td>
                  {role === 'student' && (
                    <>
                      <td>{u.grade || '—'}</td>
                      <td>{u.section || '—'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{u.roll_number || '—'}</td>
                    </>
                  )}
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{u.dob || '—'}</td>
                  <td>
                    <span className={`badge badge--${u.is_active ? 'present' : 'absent'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => handleDelete(u.id || u.user_id, u.name)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users.length && (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <h3>No {role}s found</h3>
              <p>Click "Add {role}" to create one</p>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <Modal title={`Add ${role}`} onClose={() => setModal(false)}>
          <AddUserForm role={role} onSuccess={() => { setModal(false); load(); }} />
        </Modal>
      )}
    </>
  );
}

function ClassesTable() {
  const [classes, setClasses] = useState([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const res = await getClasses(); setClasses(res.data.data || []); }
    catch { toast.error('Failed to load classes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="loading-dots"><span/><span/><span/></div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>All Classes</h2>
        <button className="btn btn--primary btn--sm" style={{ width: 'auto' }} onClick={() => setModal(true)}>
          <Plus size={14} /> New Class
        </button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Class</th><th>Teacher</th><th>Date</th><th>Time</th><th>Room</th><th>Status</th></tr></thead>
            <tbody>
              {classes.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.class_name}</strong><br/><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.subject}</span></td>
                  <td>{c.teacher_name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{c.class_date}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{c.start_time} – {c.end_time}</td>
                  <td>{c.room}</td>
                  <td><span className={`badge badge--${c.computed_status}`}>{c.computed_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!classes.length && <div className="empty-state"><p>No classes yet</p></div>}
        </div>
      </div>
      {modal && (
        <Modal title="Create Class" onClose={() => setModal(false)}>
          <AddClassForm onSuccess={() => { setModal(false); load(); }} />
        </Modal>
      )}
    </>
  );
}
