import {
  Home,
  Users,
  Settings,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  List,
  UploadCloud,
  Coins,
  ListOrdered,
  Menu,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.png';
import { useContext, useState } from 'react';
import { AuthContext } from '../Context/AuthContext';
import '../styles/Sidebar.css'; 

export default function Sidebar() {
  const { logout } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [adMenuOpen, setAdMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const confirmLogout = () => setShowModal(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-header">
        <img src={Logo} alt="Logo" className="mobile-logo" />
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="menu-btn">
          {sidebarOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
        {/* Logout Modal */}
        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h3>Are you sure you want to logout?</h3>
              <div style={styles.modalButtons}>
                <button onClick={handleLogout} style={styles.confirmBtn}>Yes</button>
                <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>No</button>
              </div>
            </div>
          </div>
        )}

        {/* Logo */}
        <div className="sidebar-logo">
          <img src={Logo} alt="EarnKar Logo" />
        </div>

        {/* Navigation */}
        <nav>
          <ul>
            <li><Link to="/dashboard"><Home size={18} /> Dashboard</Link></li>
            <li><Link to="/live-orders"><ListOrdered size={18} /> Live Orders</Link></li>
            <li><Link to="/withdraw"><Coins size={18} /> Withdraw Requests</Link></li>
            <li><Link to="/recharge"><Coins size={18} /> Recharge Requests</Link></li>
            <li><Link to="/users"><Users size={18} /> Users</Link></li>

            <li
              className="dropdown"
              onClick={() => setAdMenuOpen(!adMenuOpen)}
            >
              <div className="dropdown-header">
                <LayoutDashboard size={18} /> Ad System
                {adMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {adMenuOpen && (
                <ul className="dropdown-menu">
                  <li><Link to="/ads"><UploadCloud size={16} /> Add Ad</Link></li>
                  <li><Link to="/ads-lists"><List size={16} /> Ad Lists</Link></li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="logout-section">
          <button onClick={confirmLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Overlay (for mobile when sidebar is open) */}
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}
    </>
  );
}

const styles = {
  logoutBtn: {
    background: 'linear-gradient(90deg, #FF355E 0%, #A03CF8 100%)',
    color: '#fff',
    border: '1px solid white',
    padding: '8px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    width: '100%',
    height: 40,
    fontFamily: 'Poppins',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#0F0F12',
    padding: '30px 20px',
    borderRadius: '12px',
    textAlign: 'center',
    width: '320px',
    boxShadow: '0 0 30px rgba(160, 60, 248, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontFamily: 'Poppins',
  },
  modalButtons: {
    marginTop: '25px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
  },
  confirmBtn: {
    background: 'linear-gradient(90deg, #FF355E 0%, #A03CF8 100%)',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'Poppins',
    fontWeight: 500,
  },
  cancelBtn: {
    backgroundColor: '#1C1C22',
    color: '#ccc',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '10px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'Poppins',
    fontWeight: 500,
  },
};
