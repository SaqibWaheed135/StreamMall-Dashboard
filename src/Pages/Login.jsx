import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import logo from '../assets/logo.png';
import axios from 'axios';
import '../styles/Login.css'

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

  console.log("🔹 Attempting login with:", { email, password }); // log email & password

  try {
    const res = await axios.post(
      'https://streammall-backend-73a4b072d5eb.herokuapp.com/api/admin/admin-login',
      { email, password }
    );

    console.log("✅ Response from server:", res.data); // log response

    const data = res.data;
    localStorage.setItem('token', data.token);
    login(res);
    navigate('/dashboard');
  } catch (err) {
    console.error("❌ Login error:", err.response?.data || err.message); // log error
    setError(err.response?.data?.message || err.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="login-wrapper">
      {loading && (
        <div className="loader-overlay">
          <div className="loader-box">
            <div className="spinner"></div>
            <p>Logging in...</p>
          </div>
        </div>
      )}

      <div className="left-panel">
        <img src={logo} alt="StreamMall Logo" />
        <h2 className="brand">
          Stream, shop, and connect in the most futuristic live platform.
        </h2>
      </div>

      <div className="separator"></div>

      <div className="right-panel">
        <h1 className="welcome">Welcome</h1>
        <p className="subtext">Please login to Admin Dashboard</p>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="login-button">
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
