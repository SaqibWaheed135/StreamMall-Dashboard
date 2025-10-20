import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, CheckCircle, Clock, XCircle, Download, Eye, MoreVertical } from 'lucide-react';

const LiveOrders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sortBy, setSortBy] = useState('date');

  const API_URL = 'https://streammall-backend-73a4b072d5eb.herokuapp.com/api';

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/live/admin/all-orders?page=${currentPage}&limit=20&status=${statusFilter}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders);
      } else {
        setError(data.msg || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Error fetching orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/live/admin/order-stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const filteredOrders = orders
    .filter(order =>
      order.buyerUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.streamTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.orderedAt) - new Date(a.orderedAt);
      if (sortBy === 'value') return b.coinValue - a.coinValue;
      if (sortBy === 'buyer') return a.buyerUsername.localeCompare(b.buyerUsername);
      return 0;
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const exportOrders = () => {
    const csv = [
      ['Order ID', 'Product', 'Buyer', 'Email', 'Stream', 'Quantity', 'Coin Value', 'Status', 'Date', 'Address', 'City', 'State', 'ZIP', 'Country', 'Phone', 'Streamer'],
      ...filteredOrders.map(order => [
        order.orderId,
        order.productName,
        order.buyerUsername,
        order.buyerEmail,
        order.streamTitle,
        order.quantity,
        order.coinValue,
        order.status,
        new Date(order.orderedAt).toLocaleDateString(),
        order.deliveryInfo?.address || 'N/A',
        order.deliveryInfo?.city || 'N/A',
        order.deliveryInfo?.state || 'N/A',
        order.deliveryInfo?.zipCode || 'N/A',
        order.deliveryInfo?.country || 'N/A',
        order.deliveryInfo?.phone || 'N/A',
        order.streamerUsername || 'N/A'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="withdraw-container">
      <h1 className="withdraw-heading">Orders Management</h1>

      {error && (
        <div className="mt-4 bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center space-x-2">
          <XCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Orders</span>
              <Package className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </div>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Completed</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.completedOrders}</p>
          </div>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Pending</span>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.pendingOrders}</p>
          </div>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Cancelled</span>
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.cancelledOrders}</p>
          </div>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Revenue</span>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold">{Math.floor(stats.totalRevenue / 100)} coins</p>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
            style={{
              backgroundColor: statusFilter === 'all' ? '#27ae60' : '#4b5563',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: 'poppins',
            }}
          >
            All Orders
          </button>
          <button
            onClick={() => { setStatusFilter('completed'); setCurrentPage(1); }}
            style={{
              backgroundColor: statusFilter === 'completed' ? '#27ae60' : '#4b5563',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: 'poppins',
            }}
          >
            Completed
          </button>
          <button
            onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
            style={{
              backgroundColor: statusFilter === 'pending' ? '#f1c40f' : '#4b5563',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: 'poppins',
            }}
          >
            Pending
          </button>
          <button
            onClick={() => { setStatusFilter('cancelled'); setCurrentPage(1); }}
            style={{
              backgroundColor: statusFilter === 'cancelled' ? '#e74c3c' : '#4b5563',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: 'poppins',
            }}
          >
            Cancelled
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by buyer, product, email, or stream..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: '#2d3748',
              color: 'white',
              border: '1px solid #4b5563',
              padding: '6px 12px',
              borderRadius: '5px',
              fontFamily: 'poppins',
            }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              backgroundColor: '#2d3748',
              color: 'white',
              border: '1px solid #4b5563',
              padding: '6px 12px',
              borderRadius: '5px',
              fontFamily: 'poppins',
            }}
          >
            <option value="date">Sort by Date</option>
            <option value="value">Sort by Value</option>
            <option value="buyer">Sort by Buyer</option>
          </select>
          <button
            onClick={exportOrders}
            style={{
              backgroundColor: '#27ae60',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: 'poppins',
            }}
          >
            <Download className="w-4 h-4 inline mr-1" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="withdraw-table">
            <thead>
              <tr>
                <th className="withdraw-th">Buyer</th>
                <th className="withdraw-th">Product</th>
                <th className="withdraw-th">Stream</th>
                <th className="withdraw-th">Value</th>
                <th className="withdraw-th">Status</th>
                <th className="withdraw-th">Date</th>
                <th className="withdraw-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, idx) => (
                <tr key={idx}>
                  <td className="withdraw-td">
                    {order.buyerUsername}
                    <br />
                    <small>{order.buyerEmail}</small>
                  </td>
                  <td className="withdraw-td">
                    {order.productName}
                    <br />
                    <small>Qty: {order.quantity}</small>
                  </td>
                  <td className="withdraw-td">{order.streamTitle}</td>
                  <td className="withdraw-td">{order.coinValue} coins</td>
                  <td className="withdraw-td">
                    <span className={`capitalize ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                  </td>
                  <td className="withdraw-td">{new Date(order.orderedAt).toLocaleDateString()}</td>
                  <td className="withdraw-td">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetailsModal(true);
                      }}
                      style={{
                        backgroundColor: '#27ae60',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontFamily: 'poppins',
                      }}
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredOrders.length} orders
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  backgroundColor: currentPage === 1 ? '#6b7280' : '#4b5563',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '5px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontFamily: 'poppins',
                }}
              >
                Previous
              </button>
              <span
                style={{
                  backgroundColor: '#4b5563',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '5px',
                  fontFamily: 'poppins',
                }}
              >
                Page {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                style={{
                  backgroundColor: '#4b5563',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontFamily: 'poppins',
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-600 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-600 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Order Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  color: '#9ca3af',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                }}
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-white mb-3">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order ID:</span>
                    <span>{selectedOrder.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`capitalize ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span>{new Date(selectedOrder.orderedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-white mb-3">Product</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span>{selectedOrder.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span>${selectedOrder.productPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quantity:</span>
                    <span>{selectedOrder.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Value:</span>
                    <span className="font-bold text-yellow-400">{selectedOrder.coinValue} coins</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-white mb-3">Buyer Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Username:</span>
                    <span>{selectedOrder.buyerUsername}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="truncate">{selectedOrder.buyerEmail}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-white mb-3">Stream Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Title:</span>
                    <span className="truncate">{selectedOrder.streamTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Streamer:</span>
                    <span>{selectedOrder.streamerUsername}</span>
                  </div>
                </div>
              </div>
              {selectedOrder.deliveryInfo && (
                <div>
                  <h3 className="font-bold text-white mb-3">Delivery Address</h3>
                  <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 space-y-2 text-sm">
                    <p className="font-medium">
                      {selectedOrder.deliveryInfo.firstName} {selectedOrder.deliveryInfo.lastName}
                    </p>
                    <p className="text-gray-300">{selectedOrder.deliveryInfo.address}</p>
                    <p className="text-gray-300">
                      {selectedOrder.deliveryInfo.city}, {selectedOrder.deliveryInfo.state} {selectedOrder.deliveryInfo.zipCode}
                    </p>
                    <p className="text-gray-300">{selectedOrder.deliveryInfo.country}</p>
                    <div className="pt-2 border-t border-gray-600">
                      <p className="text-gray-400 text-xs">Email: {selectedOrder.deliveryInfo.email}</p>
                      <p className="text-gray-400 text-xs">Phone: {selectedOrder.deliveryInfo.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-600">
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  backgroundColor: '#27ae60',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontFamily: 'poppins',
                  width: '100%',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveOrders;