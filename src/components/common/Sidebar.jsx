import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, BookOpen, QrCode, ClipboardList,
  BarChart3, LogOut, GraduationCap, UserPlus, Settings, Bell
} from 'lucide-react';

const NAV_CONFIG = {
  admin: [
    { section: 'Main', items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/teachers', icon: Users, label: 'Teachers' },
      { to: '/admin/students', icon: GraduationCap, label: 'Students' },
      { to: '/admin/classes', icon: BookOpen, label: 'Classes' },
    ]},
    { section: 'Reports', items: [
      { to: '/attendance-history', icon: ClipboardList, label: 'Attendance' },
      { to: '/monthly-report', icon: BarChart3, label: 'Monthly Report' },
    ]},
  ],
  teacher: [
    { section: 'Main', items: [
      { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/teacher/classes', icon: BookOpen, label: 'My Classes' },
      { to: '/scanner', icon: QrCode, label: 'QR Scanner' },
    ]},
    { section: 'Reports', items: [
      { to: '/attendance-history', icon: ClipboardList, label: 'Attendance' },
      { to: '/monthly-report', icon: BarChart3, label: 'Monthly Report' },
    ]},
  ],
  student: [
    { section: 'Main', items: [
      { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/student/qr', icon: QrCode, label: 'My QR Code' },
      { to: '/attendance-history', icon: ClipboardList, label: 'Attendance' },
      { to: '/monthly-report', icon: BarChart3, label: 'Monthly Report' },
    ]},
  ],
  parent: [
    { section: 'Main', items: [
      { to: '/parent', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/attendance-history', icon: ClipboardList, label: 'Child Attendance' },
      { to: '/monthly-report', icon: BarChart3, label: 'Monthly Report' },
    ]},
  ],
};

export default function Sidebar({ mobile, onClose }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navGroups = NAV_CONFIG[user?.role] || [];
  const initials = user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${mobile ? (mobile === 'open' ? 'open' : '') : ''}`}>
      <div className="sidebar__header">
        <div className="logo-mark">🎓</div>
        <div className="logo-text">
          <h3>Greenwood Public School</h3>
          <span>{user?.role} Portal</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {navGroups.map((group) => (
          <div className="nav-section" key={group.section}>
            <p className="nav-label">{group.section}</p>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === `/${user?.role}`}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <item.icon className="nav-icon" size={18} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="user-card">
          <div className="avatar">{initials}</div>
          <div className="user-info">
            <p>{user?.name}</p>
            <span>{user?.role}</span>
          </div>
          <button className="btn btn--icon btn--secondary" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
