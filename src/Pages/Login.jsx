import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import logo from '../assets/logo.png';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/dashboard');
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('https://streammall-backend-73a4b072d5eb.herokuapp.com/api/admin/admin-login', {
        email,
        password,
      });
      const data = res.data;
      localStorage.setItem('token', data.token);
      login(res);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      {loading && (
        <div style={styles.loaderOverlay}>
          <div style={styles.loaderBox}>
            <div className="spinner" style={styles.spinner}></div>
            <p>Logging in...</p>
          </div>
        </div>
      )}

      {/* LEFT PANEL */}
      <div style={styles.leftPanel}>
        <img src={logo} alt="StreamMall Logo" style={styles.logo} />
        <h2 style={styles.brand}>
          Stream, shop, and connect in the most futuristic live platform.
        </h2>
      </div>

      {/* SEPARATOR */}
      <div style={styles.separator}></div>

      {/* RIGHT PANEL */}
      <div style={styles.rightPanel}>
        <h1 style={styles.welcome}>Welcome</h1>
        <p style={styles.subtext}>Please login to Admin Dashboard</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button}>
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#0F0F12',
    fontFamily: 'Poppins, sans-serif',
    color: '#fff',
  },
  leftPanel: {
    flex: 1,
    background: 'radial-gradient(circle at top left, #1A1A1D 0%, #0F0F12 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 40px',
  },
  logo: {
    width: 130,
    height: 110,
    marginBottom: 30,
    borderRadius: 12,
    boxShadow: '0 0 30px rgba(160, 60, 248, 0.3)',
  },
  brand: {
    color: '#bdbdbd',
    fontSize: '18px',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  rightPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #1C1C22 0%, #111113 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 80px',
  },
  welcome: {
    fontSize: '36px',
    marginBottom: 10,
    background: 'linear-gradient(90deg, #FF355E, #A03CF8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 600,
  },
  subtext: {
    fontSize: '14px',
    marginBottom: 40,
    letterSpacing: '1px',
    color: '#ccc',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  input: {
    padding: '12px 15px',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: '#1F1F23',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  button: {
    padding: '12px',
    background: 'linear-gradient(90deg, #FF355E, #A03CF8)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
    width: '60%',
    borderRadius: 8,
    margin: '40px auto 0',
    boxShadow: '0 0 20px rgba(160, 60, 248, 0.4)',
    transition: 'all 0.3s ease',
  },
  error: {
    color: '#FF355E',
    fontSize: '14px',
  },
  separator: {
    width: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: '80%',
    alignSelf: 'center',
  },
  loaderOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '100vw',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(6px)',
  },
  loaderBox: {
    backgroundColor: '#1C1C22',
    padding: '25px 40px',
    borderRadius: '10px',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 0 20px rgba(160, 60, 248, 0.4)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255,255,255,0.1)',
    borderTop: '4px solid #A03CF8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '10px',
  },
};

export default Login;
