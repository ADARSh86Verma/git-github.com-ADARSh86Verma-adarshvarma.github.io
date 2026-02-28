import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout';
import { getClasses, scanAttendance } from '../api';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QRScannerPage() {
  const location = useLocation();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(location.state?.classId || '');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const scannerRef = useRef(null);
  const scannerInstance = useRef(null);

  useEffect(() => {
    getClasses().then(res => {
      const ongoing = (res.data.data || []).filter(c => c.computed_status === 'ongoing');
      setClasses(ongoing);
      if (ongoing.length === 1 && !selectedClass) setSelectedClass(ongoing[0].id);
    });
  }, []);

  useEffect(() => {
    if (scanning && selectedClass && scannerRef.current) {
      scannerInstance.current = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
      }, false);

      scannerInstance.current.render(
        async (decodedText) => {
          const studentId = parseInt(decodedText);
          if (!studentId) return;

          // Pause scanning
          scannerInstance.current?.pause(true);

          try {
            const res = await scanAttendance({ student_id: studentId, class_id: parseInt(selectedClass) });
            const entry = {
              ...res.data,
              time: new Date().toLocaleTimeString(),
              id: Date.now(),
            };
            setResult({ success: true, ...entry });
            setHistory(h => [entry, ...h].slice(0, 20));
            toast.success(`${res.data.student_name} marked ${res.data.status}`);
          } catch (err) {
            const msg = err.response?.data?.message || 'Scan failed';
            setResult({ success: false, message: msg });
            toast.error(msg);
          }

          // Resume after 2 seconds
          setTimeout(() => {
            setResult(null);
            scannerInstance.current?.resume();
          }, 2500);
        },
        (error) => { /* ignore */ }
      );
    }

    return () => {
      scannerInstance.current?.clear().catch(() => {});
    };
  }, [scanning, selectedClass]);

  const toggleScanner = () => {
    if (scanning) {
      scannerInstance.current?.clear().catch(() => {});
      setScanning(false);
    } else {
      if (!selectedClass) { toast.error('Please select a class first'); return; }
      setScanning(true);
    }
  };

  return (
    <DashboardLayout title="QR Scanner">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Scanner Panel */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card__header"><h3><QrCode size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />Select Class</h3></div>
              <div className="card__body">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={scanning}>
                    <option value="">-- Select ongoing class --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.class_name} ({c.start_time}–{c.end_time})</option>
                    ))}
                  </select>
                </div>
                {classes.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>No ongoing classes right now</p>
                )}
              </div>
            </div>

            <button
              className={`btn ${scanning ? 'btn--danger' : 'btn--primary'}`}
              onClick={toggleScanner}
              style={{ width: '100%', marginBottom: 20, padding: 16 }}
            >
              {scanning ? '⏹ Stop Scanner' : '▶ Start Scanner'}
            </button>

            {scanning && (
              <div className="qr-scanner-container">
                <div id="qr-reader" ref={scannerRef} />
              </div>
            )}

            {result && (
              <div className={`scan-result ${result.success ? 'success' : 'error'}`} style={{ marginTop: 16, padding: 20, borderRadius: 'var(--radius-md)', textAlign: 'center', background: result.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${result.success ? 'var(--accent-primary)' : 'var(--accent-danger)'}` }}>
                {result.success ? <CheckCircle size={40} color="var(--accent-primary)" /> : <XCircle size={40} color="var(--accent-danger)" />}
                <p style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>{result.success ? result.student_name : 'Error'}</p>
                {result.success ? (
                  <>
                    <span className={`badge badge--${result.status}`} style={{ marginTop: 8 }}>{result.status}</span>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>Scanned at {result.scan_time}</p>
                  </>
                ) : (
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>{result.message}</p>
                )}
              </div>
            )}
          </div>

          {/* History Panel */}
          <div className="card">
            <div className="card__header">
              <h3>Scan History</h3>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{history.length} scanned</span>
            </div>
            <div className="card__body" style={{ padding: 0, maxHeight: 520, overflowY: 'auto' }}>
              {history.length === 0 ? (
                <div className="empty-state" style={{ padding: 40 }}>
                  <div className="empty-icon"><QrCode size={40} opacity={0.3} /></div>
                  <p>No scans yet</p>
                </div>
              ) : (
                history.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{item.student_name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.time}</p>
                    </div>
                    <span className={`badge badge--${item.status}`}>{item.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
