import {
  Home,
  Users,
  Settings,
  Banknote,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  List,
  Video,
  UploadCloud,
  Coins,
  Flag,
  ListOrdered
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.png';
import { useContext, useState } from 'react';
import { AuthContext } from '../Context/AuthContext';

export default function Sidebar() {
  const { logout } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [adMenuOpen, setAdMenuOpen] = useState(false);
  const [videoMenuOpen, setVideoMenuOpen] = useState(false); // ✅ Videos dropdown
  const navigate = useNavigate();

  const confirmLogout = () => setShowModal(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="sidebar">
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
      <img
        src={Logo}
        alt="EarnKar Logo"
        style={{ width: '110px', height: '90px', margin: 20, marginLeft: 40, borderRadius: 10 }}
      />

      {/* Navigation Menu */}
      <nav>
        <ul>
          <li><Link to="/dashboard"><Home size={18} /> Dashboard</Link></li>
          <li><Link to="/live-orders"><ListOrdered size={18} /> Live Orders</Link></li>
          <li><Link to="/withdraw"><Coins size={18} /> Withdraw Requests</Link></li>
          <li><Link to="/recharge"><Coins size={18} /> Recharge Requests</Link></li>
          <li><Link to="/users"><Users size={18} /> Users</Link></li>

         {/* ✅ Ad System Dropdown */}
          <li
            onClick={() => setAdMenuOpen(!adMenuOpen)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LayoutDashboard size={18} /> Ad System
            </div>
            {adMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </li>



          {adMenuOpen && (
            <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
              <li>
                <Link to="/ads" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <UploadCloud size={16} /> Add Ad
                </Link>
              </li>
              <li>
                <Link to="/ads-lists" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <List size={16} /> Ad Lists
                </Link>
              </li>


            </ul>
          )}
          {/* <li><Link to="/reported-videos"><Flag size={18} />Reported Videos</Link></li> */}

          <li>
            <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
              <Settings size={16} /> Settings
            </Link>
          </li>

        </ul>
      </nav>

      {/* Logout Button */}
      <div className="bottom">
        <button onClick={confirmLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </div>
  );
}

const styles = {
  logoutBtn: {
    background: 'linear-gradient(90deg, #FF355E 0%, #A03CF8 100%)',
    color: '#fff',
    border: '1px solid white',
    padding: '6px 12px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 14,
    transition: 'backgroundColor 0.2s ease',
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
    backgroundColor: '#0F0F12', // dark futuristic background
    padding: '30px 20px',
    borderRadius: '12px',
    textAlign: 'center',
    width: '320px',
    boxShadow: '0 0 30px rgba(160, 60, 248, 0.3)', // subtle glowing effect
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
    transition: 'all 0.3s ease',
    boxShadow: '0 0 15px rgba(160, 60, 248, 0.4)',
  },
  confirmBtnHover: {
    background: 'linear-gradient(90deg, #FF4673 0%, #B568F9 100%)',
    boxShadow: '0 0 25px rgba(160, 60, 248, 0.6)',
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
    transition: 'all 0.3s ease',
  },
  cancelBtnHover: {
    backgroundColor: '#2A2A31',
    color: '#fff',
    borderColor: 'rgba(255,255,255,0.2)',
  },

};