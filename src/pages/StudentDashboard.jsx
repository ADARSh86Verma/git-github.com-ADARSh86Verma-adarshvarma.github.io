import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout';
import { getDashboard, generateQR } from '../api';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { ClipboardList, BookOpen, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

function CircularProgress({ percent, size = 120 }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ - (percent / 100) * circ;
  const color = percent >= 75 ? '#10b981' : percent >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={8} />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={fill}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="inner-text">
        <div className="pct" style={{ color }}>{percent}%</div>
        <div className="lbl">Attendance</div>
      </div>
    </div>
  );
}

function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-dots"><span/><span/><span/></div>;

  const stats = data?.stats || {};
  const classes = data?.classes || [];
  const ongoing = classes.find(c => c.computed_status === 'ongoing');
  const upcoming = classes.filter(c => c.computed_status === 'upcoming').slice(0, 3);

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800 }}>Hello, {user?.name?.split(' ')[0]}! 👋</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 20, marginBottom: 32 }}>
        <div className="stat-card emerald">
          <div className="stat-icon"><CheckCircle size={24} /></div>
          <div className="stat-value">{stats.present || 0}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon"><XCircle size={24} /></div>
          <div className="stat-value">{stats.absent || 0}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-value">{stats.late || 0}</div>
          <div className="stat-label">Late</div>
        </div>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 140 }}>
          <CircularProgress percent={parseFloat(stats.percentage) || 0} />
        </div>
      </div>

      {ongoing && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>● Ongoing Class</p>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>{ongoing.class_name}</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{ongoing.subject} · {ongoing.start_time} – {ongoing.end_time}</p>
          <span style={{ marginTop: 12, display: 'inline-block' }} className={`badge badge--${ongoing.my_attendance || 'absent'}`}>
            You are: {ongoing.my_attendance || 'Not marked yet'}
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card__header"><h3>Upcoming Classes</h3></div>
          <div className="card__body">
            {upcoming.length === 0 ? (
              <div className="empty-state" style={{ padding: 20 }}><p>No upcoming classes</p></div>
            ) : upcoming.map(cls => (
              <div key={cls.id} className="class-card" style={{ marginBottom: 8 }}>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600 }}>{cls.class_name}</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cls.class_date} · {cls.start_time}</p>
                </div>
                <span className="badge badge--upcoming">Upcoming</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card__header"><h3>Recent Attendance</h3></div>
          <div className="card__body">
            {classes.filter(c => c.computed_status === 'completed' && c.my_attendance).slice(0, 5).map(cls => (
              <div key={cls.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{cls.class_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cls.class_date}</p>
                </div>
                <span className={`badge badge--${cls.my_attendance}`}>{cls.my_attendance}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function MyQRCode() {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    generateQR()
      .then(res => setQrData(res.data))
      .catch(() => toast.error('Failed to load QR'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-dots"><span/><span/><span/></div>;

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>My QR Code</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Show this to your teacher to mark attendance</p>

      <div className="qr-display">
        <div className="qr-wrap">
          <QRCodeSVG value={qrData?.qr_data || ''} size={220} level="H" />
        </div>
        <div className="student-name">{user?.name}</div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
          Roll: {qrData?.student?.roll_number} · Grade {qrData?.student?.grade}{qrData?.student?.section}
        </p>
        <div style={{ marginTop: 20, padding: '10px 20px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-secondary)' }}>
          Student ID: #{qrData?.qr_data}
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <DashboardLayout title="Student Dashboard">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="qr" element={<MyQRCode />} />
      </Routes>
    </DashboardLayout>
  );
}
