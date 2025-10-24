import React, { useState, useEffect } from 'react';
import { Settings, Coins, Save, RefreshCw, AlertCircle, CheckCircle, Users, TrendingUp, DollarSign, Gift, XCircle } from 'lucide-react';
import '../styles/AdminSettings.css';

const AdminSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalInvites: 0,
    currentReferralPoints: 10
  });

  const [settings, setSettings] = useState({
    referralPoints: 10,
    signupBonus: 5,
    dailyLoginBonus: 1,
    videoUploadBonus: 2,
    streamViewBonus: 1
  });

  const API_BASE_URL = 'https://streammall-backend-73a4b072d5eb.herokuapp.com/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const settingsObj = {};
          result.data.forEach(setting => {
            settingsObj[setting.key] = setting.value;
          });
          setSettings(prev => ({ ...prev, ...settingsObj }));
        }
      } else {
        console.error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/admin/settings/${key}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          value: Number(value),
          description: getSettingDescription(key)
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showMessage('success', `${formatSettingName(key)} updated successfully!`);
          await fetchSettings();
          await fetchStats(); // Refresh stats after update
        } else {
          showMessage('error', result.msg || 'Failed to update setting');
        }
      } else {
        const error = await response.json();
        showMessage('error', error.msg || 'Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      showMessage('error', 'Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const getSettingDescription = (key) => {
    const descriptions = {
      referralPoints: 'Points awarded per successful referral',
      signupBonus: 'Points awarded on user signup',
      dailyLoginBonus: 'Points earned for daily app visits',
      videoUploadBonus: 'Points earned for uploading content',
      streamViewBonus: 'Points earned per stream view'
    };
    return descriptions[key] || `${key} setting`;
  };

  const formatSettingName = (key) => {
    return key.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const handleInputChange = (key, value) => {
    // Only allow positive numbers
    if (value === '' || Number(value) >= 0) {
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const handleSave = async (key) => {
    const value = settings[key];
    if (value === '' || Number(value) < 0) {
      showMessage('error', 'Please enter a valid positive number');
      return;
    }
    await updateSetting(key, value);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    for (const [key, value] of Object.entries(settings)) {
      if (value !== '' && Number(value) >= 0) {
        try {
          const response = await fetch(`${API_BASE_URL}/admin/settings/${key}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
              value: Number(value),
              description: getSettingDescription(key)
            })
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }
    }

    setSaving(false);
    
    if (errorCount === 0) {
      showMessage('success', 'All settings updated successfully!');
    } else if (successCount > 0) {
      showMessage('warning', `${successCount} settings updated, ${errorCount} failed`);
    } else {
      showMessage('error', 'Failed to update settings');
    }

    await fetchSettings();
    await fetchStats();
  };

  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="withdraw-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <RefreshCw className="icon-small" style={{ width: '48px', height: '48px', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '18px' }}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const SettingCard = ({ icon: Icon, title, settingKey, value, description, iconColor }) => (
    <div className="stats-card" style={{ marginBottom: '16px' }}>
      <div className="stats-header" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Icon className="icon-small" style={{ color: iconColor, width: '24px', height: '24px' }} />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>{title}</h3>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>{description}</p>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => handleInputChange(settingKey, e.target.value)}
          className="search-input"
          style={{ flex: 1 }}
          disabled={saving}
          placeholder="Enter points"
        />
        <button
          onClick={() => handleSave(settingKey)}
          disabled={saving || value === '' || Number(value) < 0}
          className="export-button"
          style={{
            opacity: (saving || value === '' || Number(value) < 0) ? 0.5 : 1,
            cursor: (saving || value === '' || Number(value) < 0) ? 'not-allowed' : 'pointer'
          }}
        >
          <Save className="icon-small inline" />
          Save
        </button>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, iconColor, subtitle }) => (
    <div className="stats-card">
      <div className="stats-header">
        <span className="stats-label">{title}</span>
        <Icon className="icon-small" style={{ color: iconColor }} />
      </div>
      <p className="stats-value">{value}</p>
      {subtitle && <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{subtitle}</p>}
    </div>
  );

  return (
    <div className="withdraw-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="withdraw-heading">Admin Dashboard</h1>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>Manage platform settings and rewards</p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="export-button"
          style={{
            opacity: saving ? 0.7 : 1,
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? (
            <>
              <RefreshCw className="icon-small inline" style={{ animation: 'spin 1s linear infinite' }} />
              Saving...
            </>
          ) : (
            <>
              <Save className="icon-small inline" />
              Save All
            </>
          )}
        </button>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className="error-message" style={{
          backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(220, 38, 38, 0.2)',
          borderColor: message.type === 'success' ? '#22c55e' : '#e74c3c',
          marginBottom: '24px'
        }}>
          {message.type === 'success' ? (
            <CheckCircle className="icon-small" style={{ color: '#22c55e' }} />
          ) : (
            <XCircle className="error-icon" />
          )}
          <p style={{ fontWeight: '500' }}>{message.text}</p>
        </div>
      )}

      {/* Stats Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Platform Statistics</h2>
        <div className="stats-grid">
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers?.toLocaleString() || '0'}
            iconColor="#3b82f6"
            subtitle="Registered accounts"
          />
          <StatCard
            icon={CheckCircle}
            title="Verified Users"
            value={stats.verifiedUsers?.toLocaleString() || '0'}
            iconColor="#10b981"
            subtitle="Verified accounts"
          />
          <StatCard
            icon={TrendingUp}
            title="Total Invites"
            value={stats.totalInvites?.toLocaleString() || '0'}
            iconColor="#a855f7"
            subtitle="Successful referrals"
          />
          <StatCard
            icon={Gift}
            title="Current Referral Points"
            value={stats.currentReferralPoints?.toLocaleString() || '10'}
            iconColor="#f59e0b"
            subtitle="Points per referral"
          />
        </div>
      </div>

      {/* Settings Section */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Reward Settings</h2>
        
        <SettingCard
          icon={Gift}
          title="Referral Reward"
          settingKey="referralPoints"
          value={settings.referralPoints}
          description="Points earned when someone signs up using invite code"
          iconColor="#ef4444"
        />
        
        <SettingCard
          icon={Users}
          title="Signup Bonus"
          settingKey="signupBonus"
          value={settings.signupBonus}
          description="Points given to new users upon registration"
          iconColor="#10b981"
        />
        
        <SettingCard
          icon={DollarSign}
          title="Daily Login Bonus"
          settingKey="dailyLoginBonus"
          value={settings.dailyLoginBonus}
          description="Points earned for daily app visits"
          iconColor="#3b82f6"
        />
        
        <SettingCard
          icon={TrendingUp}
          title="Video Upload Bonus"
          settingKey="videoUploadBonus"
          value={settings.videoUploadBonus}
          description="Points earned for uploading content"
          iconColor="#a855f7"
        />
        
        <SettingCard
          icon={Coins}
          title="Stream View Bonus"
          settingKey="streamViewBonus"
          value={settings.streamViewBonus}
          description="Points earned per stream view"
          iconColor="#f59e0b"
        />
      </div>

      {/* Info Box */}
      <div className="stats-card" style={{ marginTop: '32px', backgroundColor: '#2d3748' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <AlertCircle className="icon-small" style={{ color: '#f59e0b', width: '24px', height: '24px', flexShrink: 0, marginTop: '4px' }} />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#f59e0b' }}>Important Notes</h3>
            <ul style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.8', listStyle: 'none', padding: 0 }}>
              <li>• Changes take effect immediately for new transactions</li>
              <li>• Existing user points will not be affected</li>
              <li>• All values must be positive numbers (0 or greater)</li>
              <li>• Monitor the impact of changes on user engagement</li>
              <li>• Consider balanced reward values to maintain platform economy</li>
              <li>• Settings are stored in the database and persist across sessions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;