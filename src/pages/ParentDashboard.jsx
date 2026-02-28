import { useState, useEffect } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import { getDashboard } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

function ChildCard({ child }) {
  const { info, stats, classes } = child;
  const ongoing  = classes.find(c => c.computed_status === 'ongoing');
  const upcoming = classes.find(c => c.computed_status === 'upcoming');
  const last     = classes.find(c => c.computed_status === 'completed');
  const pct = parseFloat(stats.percentage) || 0;
  const pctColor = pct >= 75 ? 'var(--accent-primary)' : pct >= 50 ? 'var(--accent-secondary)' : 'var(--accent-danger)';

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-info))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>
          {info.name?.[0]}
        </div>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>{info.name}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Grade {info.grade}{info.section} · Roll {info.roll_number}</p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: pctColor }}>{pct}%</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Attendance</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card emerald">
          <div className="stat-icon"><CheckCircle size={20} /></div>
          <div className="stat-value">{stats.present || 0}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon"><XCircle size={20} /></div>
          <div className="stat-value">{stats.total - stats.present || 0}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon"><Clock size={20} /></div>
          <div className="stat-value">{stats.total || 0}</div>
          <div className="stat-label">Total Classes</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {[
          { label: 'Ongoing Class', cls: ongoing, color: 'var(--accent-primary)' },
          { label: 'Upcoming Class', cls: upcoming, color: 'var(--accent-info)' },
          { label: 'Last Completed', cls: last, color: 'var(--accent-purple)' },
        ].map(({ label, cls, color }) => (
          <div key={label} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color, marginBottom: 10 }}>{label}</p>
            {cls ? (
              <>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{cls.class_name}</h4>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cls.subject}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{cls.start_time} – {cls.end_time}</p>
                {cls.child_attendance && (
                  <span style={{ marginTop: 8, display: 'inline-block' }} className={`badge badge--${cls.child_attendance}`}>{cls.child_attendance}</span>
                )}
              </>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>None</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ParentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Parent Dashboard">
      {loading ? (
        <div className="loading-dots"><span/><span/><span/></div>
      ) : !data?.children?.length ? (
        <div className="empty-state">
          <div className="empty-icon">👨‍👩‍👧</div>
          <h3>No Children Linked</h3>
          <p>Contact admin to link your child's account</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800 }}>Parent Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>

          {data.children.map((child, i) => (
            <ChildCard key={i} child={child} />
          ))}
        </>
      )}
    </DashboardLayout>
  );
}
