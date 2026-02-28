import { useState, useEffect } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import { getMonthlyReport } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const COLORS = {
  present: '#10b981',
  late:    '#f59e0b',
  absent:  '#ef4444',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '10px 16px' }}>
      <p style={{ fontWeight: 700, marginBottom: 6 }}>Day {label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontSize: 13 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function MonthlyGraphPage() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMonthlyReport({ year, month });
      setData(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [year, month]);

  // Build daily chart data (1–31)
  const dailyData = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const entries = data?.daily?.[day] || [];
    return {
      day,
      present: entries.filter(e => e.status === 'present').length,
      late:    entries.filter(e => e.status === 'late').length,
      absent:  entries.filter(e => e.status === 'absent').length,
    };
  }).filter(d => Object.values(d).some((v, i) => i > 0 && v > 0));

  const pieData = data ? [
    { name: 'Present', value: data.summary.present, color: COLORS.present },
    { name: 'Late',    value: data.summary.late,    color: COLORS.late    },
    { name: 'Absent',  value: data.summary.absent,  color: COLORS.absent  },
  ].filter(p => p.value > 0) : [];

  const total = data ? data.summary.present + data.summary.late + data.summary.absent : 0;
  const pct   = total > 0 ? Math.round(((data.summary.present + data.summary.late) / total) * 100) : 0;

  return (
    <DashboardLayout title="Monthly Report">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800 }}>Monthly Attendance Report</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{MONTHS[month - 1]} {year}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select
            value={month}
            onChange={e => setMonth(+e.target.value)}
            style={{ width: 120 }}
          >
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)} style={{ width: 100 }}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-dots"><span/><span/><span/></div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="stat-grid" style={{ marginBottom: 28 }}>
            <div className="stat-card emerald">
              <div className="stat-value">{data?.summary?.present || 0}</div>
              <div className="stat-label">Present Days</div>
            </div>
            <div className="stat-card amber">
              <div className="stat-value">{data?.summary?.late || 0}</div>
              <div className="stat-label">Late Entries</div>
            </div>
            <div className="stat-card red">
              <div className="stat-value">{data?.summary?.absent || 0}</div>
              <div className="stat-label">Absent Days</div>
            </div>
            <div className="stat-card blue">
              <div className="stat-value">{pct}%</div>
              <div className="stat-label">Attendance Rate</div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card__header"><h3>Daily Breakdown</h3></div>
            <div className="card__body chart-container">
              {dailyData.length === 0 ? (
                <div className="empty-state"><p>No data for this month</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dailyData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} label={{ value: 'Day', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: 'var(--text-secondary)', paddingTop: 12 }} />
                    <Bar dataKey="present" fill={COLORS.present} radius={[4,4,0,0]} />
                    <Bar dataKey="late"    fill={COLORS.late}    radius={[4,4,0,0]} />
                    <Bar dataKey="absent"  fill={COLORS.absent}  radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Pie Chart + Records */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
            <div className="card">
              <div className="card__header"><h3>Summary</h3></div>
              <div className="card__body chart-container" style={{ textAlign: 'center' }}>
                {pieData.length === 0 ? (
                  <div className="empty-state" style={{ padding: 20 }}><p>No data</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8 }} />
                      <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card__header"><h3>Records</h3></div>
              <div className="table-wrap" style={{ maxHeight: 280, overflowY: 'auto' }}>
                <table>
                  <thead><tr><th>Day</th><th>Class</th><th>Subject</th><th>Status</th></tr></thead>
                  <tbody>
                    {data?.records?.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{r.day}</td>
                        <td>{r.class_name}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{r.subject}</td>
                        <td><span className={`badge badge--${r.status}`}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!data?.records?.length && <div className="empty-state" style={{ padding: 20 }}><p>No records this month</p></div>}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
