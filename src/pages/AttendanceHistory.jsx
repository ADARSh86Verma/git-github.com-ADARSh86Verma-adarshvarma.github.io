import { useState, useEffect } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import { getAttendance } from '../api';
import { useAuth } from '../context/AuthContext';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AttendanceHistory() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    getAttendance()
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load attendance'))
      .finally(() => setLoading(false));
  }, []);

  const records = data?.records || data?.children?.[0]?.records || [];
  const summary = data?.summary || data?.children?.[0] || {};

  const filtered = records.filter(r =>
    !search || r.class_name?.toLowerCase().includes(search.toLowerCase()) || r.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Attendance History">
      {loading ? (
        <div className="loading-dots"><span/><span/><span/></div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Attendance Records</h2>
          </div>

          {/* Summary */}
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            {[
              { label: 'Total Classes', value: data?.summary?.total || summary?.total, color: 'blue' },
              { label: 'Present', value: data?.summary?.present || summary?.present, color: 'emerald' },
              { label: 'Absent', value: data?.summary?.absent || summary?.absent, color: 'red' },
              { label: 'Attendance %', value: `${data?.summary?.percentage || summary?.percentage || 0}%`, color: 'amber' },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className="stat-value">{s.value ?? '—'}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card__header">
              <h3>All Records</h3>
              <div className="input-wrap" style={{ width: 280 }}>
                <Search className="input-icon" size={16} />
                <input placeholder="Search by class or subject..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Scan Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={i}>
                      <td><strong>{r.class_name}</strong></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{r.subject || '—'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{r.class_date || r.date}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{r.scan_time || '—'}</td>
                      <td><span className={`badge badge--${r.status}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filtered.length && (
                <div className="empty-state"><p>{search ? 'No results found' : 'No attendance records yet'}</p></div>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
