import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Loader2, User, Building, CreditCard, Wallet } from 'lucide-react';

const Withdraw = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = 'https://theclipstream-backend.onrender.com/api';

  const fetchWithdrawals = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/withdrawals/history`, {
        withCredentials: true,
      });

      if (res.data.withdrawals) {
        setWithdrawals(res.data.withdrawals);
        setPagination(res.data.pagination || {});
      } else {
        setWithdrawals([]);
      }
    } catch (err) {
      console.error('Failed to fetch withdrawals:', err.response?.data || err);
      setError('Failed to fetch withdrawal requests ❌');
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleApprove = async (id, userBalance, withdrawalAmount) => {
    if (!window.confirm(`✅ Approve this withdrawal request of $${withdrawalAmount}?`)) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/withdrawals/admin/approve/${id}`,
        { notes: 'Approved by admin' },
        { withCredentials: true }
      );

      if (response.data.msg) {
        setWithdrawals((prev) =>
          prev.map((w) =>
            w._id === id ? { ...w, status: 'approved', approvedAt: new Date().toISOString() } : w
          )
        );
        setSuccess(
          `Withdrawal of $${withdrawalAmount} approved successfully ✅\n` +
          `New balance: ${response.data.newBalance.toLocaleString()} points`
        );
      }
    } catch (err) {
      console.error('Failed to approve:', err.response?.data || err);
      setError(err.response?.data?.msg || 'Failed to approve withdrawal ❌');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/withdrawals/admin/reject/${id}`,
        { reason },
        { withCredentials: true }
      );

      if (response.data.msg) {
        setWithdrawals((prev) =>
          prev.map((w) =>
            w._id === id ? { ...w, status: 'rejected', rejectedAt: new Date().toISOString() } : w
          )
        );
        setSuccess('Withdrawal rejected ❌');
      }
    } catch (err) {
      console.error('Failed to reject:', err.response?.data || err);
      setError(err.response?.data?.msg || 'Failed to reject withdrawal ❌');
    }
  };

  const getWithdrawalLimit = (balance, method) => {
    const minimumLimits = { paypal: 10, bank: 25, card: 5, usdt: 20 };
    const maxWithdrawable = balance / 10; // Assuming 10 points = $1
    return Math.min(maxWithdrawable, minimumLimits[method] || maxWithdrawable);
  };

  const renderPaymentDetails = (withdrawal) => {
    // Log withdrawal details for debugging
    console.log('Withdrawal details:', withdrawal.details);

    if (withdrawal.method === 'bank') {
      return (
        <div className="text-sm">
          <div>
            <strong>Account:</strong> {withdrawal.details?.bankDetails?.accountNumber || 'N/A'}
          </div>
          <div>
            <strong>Bank:</strong> {withdrawal.details?.bankDetails?.bankName || 'N/A'}
          </div>
          <div>
            <strong>IFSC:</strong> {withdrawal.details?.bankDetails?.ifsc || 'N/A'}
          </div>
        </div>
      );
    } else if (withdrawal.method === 'paypal') {
      return <div className="text-sm">{withdrawal.details?.paypalEmail || 'N/A'}</div>;
    } else if (withdrawal.method === 'card') {
      return (
        <div className="text-sm">
          <strong>Card:</strong> {withdrawal.details?.cardDetails?.cardNumber || 'N/A'}
        </div>
      );
    } else if (withdrawal.method === 'usdt') {
      if (!withdrawal.details?.usdtDetails?.walletAddress) {
        console.warn(`USDT wallet address missing for withdrawal ID: ${withdrawal._id}`);
        return (
          <div className="text-sm text-yellow-400">
            <strong>USDT Wallet:</strong> Missing wallet address
          </div>
        );
      }
      return (
        <div className="text-sm">
          <strong>USDT Wallet:</strong>{' '}
          <span className="font-mono truncate">
            {withdrawal.details?.usdtDetails?.walletAddress}
          </span>
        </div>
      );
    }
    return <span className="text-gray-400">N/A</span>;
  };

  return (
    <div className="withdraw-container">
      <h1 className="withdraw-heading">Withdrawal Requests</h1>

      {loading ? (
        <p>Loading...</p>
      ) : withdrawals.length === 0 ? (
        <p>No withdrawal requests.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="withdraw-table">
            <thead>
              <tr>
                <th className="withdraw-th">User</th>
                <th className="withdraw-th">Method</th>
                <th className="withdraw-th">Details</th>
                <th className="withdraw-th">Points</th>
                <th className="withdraw-th">Amount</th>
                <th className="withdraw-th">Balance</th>
                <th className="withdraw-th">Max Withdrawal</th>
                <th className="withdraw-th">Status</th>
                <th className="withdraw-th">Requested At</th>
                <th className="withdraw-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w._id}>
                  <td className="withdraw-td">
                    {w.userId?.username || 'N/A'}
                    <br />
                    <small>{w.userId?.email || 'N/A'}</small>
                  </td>
                  <td className="withdraw-td">
                    <div className="flex items-center space-x-2">
                      <span>{w.method.charAt(0).toUpperCase() + w.method.slice(1)}</span>
                    </div>
                  </td>
                  <td className="withdraw-td">{renderPaymentDetails(w)}</td>
                  <td className="withdraw-td">{w.pointsToDeduct.toLocaleString()}</td>
                  <td className="withdraw-td">${w.amount}</td>
                  <td className="withdraw-td">{w.userBalance?.toLocaleString() || 'N/A'} points</td>
                  <td className="withdraw-td">${getWithdrawalLimit(w.userBalance || 0, w.method).toFixed(2)}</td>
                  <td className="withdraw-td">
                    <span className={`capitalize ${w.status === 'pending' ? 'text-yellow-400' : w.status === 'approved' || w.status === 'completed' ? 'text-green-400' : 'text-red-400'}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="withdraw-td">{new Date(w.requestedAt).toLocaleString()}</td>
                  <td className="withdraw-td">
                    {w.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(w._id, w.userBalance, w.amount)}
                          style={{
                            backgroundColor: '#27ae60',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontFamily: 'poppins',
                            marginRight: '5px',
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(w._id)}
                          style={{
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontFamily: 'poppins',
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {error && (
            <div className="mt-4 bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-900/50 border border-green-500 rounded-lg p-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400">{success}</p>
            </div>
          )}

          {pagination && pagination.total && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {withdrawals.length} of {pagination.total} requests
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Withdraw;