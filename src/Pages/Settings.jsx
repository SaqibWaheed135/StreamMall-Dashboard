import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, RefreshCw, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSetting, setEditingSetting] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://theclipstream-backend.onrender.com/api/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(res.data.data || []);
    } catch (err) {
      console.error('Error fetching settings:', err);
      showNotification('Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://theclipstream-backend.onrender.com/api/settings/${key}`,
        { value: Number(value) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification('Setting updated successfully', 'success');
      fetchSettings();
      setEditingSetting(null);
      setEditValue('');
    } catch (err) {
      console.error('Error updating setting:', err);
      showNotification('Failed to update setting', 'error');
    }
  };

  const initializeSettings = async () => {
    const confirmInit = window.confirm('Are you sure you want to initialize default settings? This will create or update default values.');
    if (!confirmInit) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://theclipstream-backend.onrender.com/api/settings/init',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification('Settings initialized successfully', 'success');
      fetchSettings();
    } catch (err) {
      console.error('Error initializing settings:', err);
      showNotification('Failed to initialize settings', 'error');
    }
  };

  const startEdit = (setting) => {
    setEditingSetting(setting.key);
    setEditValue(setting.value);
  };

  const cancelEdit = () => {
    setEditingSetting(null);
    setEditValue('');
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'rewards':
        return '#f39c12';
      case 'limits':
        return '#e74c3c';
      case 'features':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const getCategoryBadgeStyle = (category) => ({
    backgroundColor: getCategoryColor(category),
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
    fontFamily: 'Poppins, sans-serif'
  });

  return (
    <div className="withdraw-container">
      {/* Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            backgroundColor: notification.type === 'success' ? '#27ae60' : '#e74c3c',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'Poppins, sans-serif',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          {notification.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {notification.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Settings size={32} color="#f39c12" />
          <h1 className="withdraw-heading" style={{ margin: 0 }}>
            Admin Settings
          </h1>
        </div>
        <button
          onClick={initializeSettings}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
        >
          <RefreshCw size={18} />
          Initialize Defaults
        </button>
      </div>

      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#7f8c8d',
          fontFamily: 'Poppins, sans-serif'
        }}>
          <RefreshCw size={40} className="spin" style={{ marginBottom: '10px' }} />
          <p>Loading settings...</p>
          <style>{`
            .spin {
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : settings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#34495e',
          borderRadius: '12px',
          fontFamily: 'Poppins, sans-serif'
        }}>
          <AlertCircle size={48} color="#e74c3c" style={{ marginBottom: '15px' }} />
          <p style={{ color: '#ecf0f1', fontSize: '16px', marginBottom: '20px' }}>
            No settings found. Initialize default settings to get started.
          </p>
          <button
            onClick={initializeSettings}
            style={{
              backgroundColor: '#27ae60',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Initialize Settings
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="withdraw-table">
            <thead>
              <tr>
                <th className="withdraw-th" style={{ width: '25%' }}>Setting Name</th>
                <th className="withdraw-th" style={{ width: '35%' }}>Description</th>
                <th className="withdraw-th" style={{ width: '12%' }}>Category</th>
                <th className="withdraw-th" style={{ width: '12%' }}>Value</th>
                <th className="withdraw-th" style={{ width: '16%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((setting) => (
                <tr key={setting._id}>
                  <td className="withdraw-td">
                    <div style={{
                      fontWeight: '600',
                      color: '#ecf0f1',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px'
                    }}>
                      {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#95a5a6',
                      marginTop: '4px',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      Last updated: {new Date(setting.updatedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="withdraw-td">
                    <div style={{
                      color: '#bdc3c7',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      {setting.description}
                    </div>
                  </td>
                  <td className="withdraw-td">
                    <span style={getCategoryBadgeStyle(setting.category)}>
                      {setting.category}
                    </span>
                  </td>
                  <td className="withdraw-td">
                    {editingSetting === setting.key ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                          backgroundColor: '#34495e',
                          border: '2px solid #3498db',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          color: '#ecf0f1',
                          width: '80px',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                        autoFocus
                      />
                    ) : (
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#f39c12',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        {setting.value}
                      </div>
                    )}
                  </td>
                  <td className="withdraw-td">
                    {editingSetting === setting.key ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => updateSetting(setting.key, editValue)}
                          style={{
                            backgroundColor: '#27ae60',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontFamily: 'Poppins, sans-serif',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                        >
                          <Save size={14} />
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            backgroundColor: '#95a5a6',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontFamily: 'Poppins, sans-serif',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                        >
                          <X size={14} />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(setting)}
                        style={{
                          backgroundColor: '#3498db',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: '600',
                          fontSize: '13px',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Card */}
      {settings.length > 0 && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#34495e',
          borderRadius: '12px',
          borderLeft: '4px solid #3498db'
        }}>
          <h3 style={{
            color: '#ecf0f1',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '16px',
            marginBottom: '10px',
            fontWeight: '600'
          }}>
            💡 Settings Information
          </h3>
          <ul style={{
            color: '#bdc3c7',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '13px',
            lineHeight: '1.8',
            paddingLeft: '20px'
          }}>
            <li>Changes take effect immediately after saving</li>
            <li>All reward values are in coins/points</li>
            <li>Set limits to 0 for unlimited</li>
            <li>Initialize defaults will not overwrite existing settings</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;