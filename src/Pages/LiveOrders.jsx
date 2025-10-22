import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, CheckCircle, Clock, XCircle, Download, Eye } from 'lucide-react';
import '../styles/LiveOrders.css';

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
      return { color: '#34c759' };
    case 'pending':
      return { color: '#f1c40f' };
    case 'cancelled':
      return { color: '#e74c3c' };
    default:
      return { color: '#9ca3af' };
  }
};

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="icon-small" />;
      case 'pending':
        return <Clock className="icon-small" />;
      case 'cancelled':
        return <XCircle className="icon-small" />;
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
        <div className="error-message">
          <XCircle className="icon-small error-icon" />
          <p>{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stats-card">
            <div className="stats-header">
              <span className="stats-label">Total Orders</span>
              <Package className="icon-small" />
            </div>
            <p className="stats-value">{stats.totalOrders}</p>
          </div>
          <div className="stats-card">
            <div className="stats-header">
              <span className="stats-label">Completed</span>
              <CheckCircle className="icon-small completed-icon" />
            </div>
            <p className="stats-value completed-value">{stats.completedOrders}</p>
          </div>
          <div className="stats-card">
            <div className="stats-header">
              <span className="stats-label">Pending</span>
              <Clock className="icon-small pending-icon" />
            </div>
            <p className="stats-value pending-value">{stats.pendingOrders}</p>
          </div>
          <div className="stats-card">
            <div className="stats-header">
              <span className="stats-label">Cancelled</span>
              <XCircle className="icon-small cancelled-icon" />
            </div>
            <p className="stats-value cancelled-value">{stats.cancelledOrders}</p>
          </div>
          <div className="stats-card">
            <div className="stats-header">
              <span className="stats-label">Total Revenue</span>
              <TrendingUp className="icon-small" />
            </div>
            <p className="stats-value">{Math.floor(stats.totalRevenue / 100)} coins</p>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="filters-container">
        <div className="filter-buttons">
          <button
            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
            className={statusFilter === 'all' ? 'filter-button active' : 'filter-button'}
          >
            All Orders
          </button>
          <button
            onClick={() => { setStatusFilter('completed'); setCurrentPage(1); }}
            className={statusFilter === 'completed' ? 'filter-button active' : 'filter-button'}
          >
            Completed
          </button>
          <button
            onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
            className={statusFilter === 'pending' ? 'filter-button pending' : 'filter-button'}
          >
            Pending
          </button>
          <button
            onClick={() => { setStatusFilter('cancelled'); setCurrentPage(1); }}
            className={statusFilter === 'cancelled' ? 'filter-button cancelled' : 'filter-button'}
          >
            Cancelled
          </button>
        </div>
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search by buyer, product, email, or stream..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="value">Sort by Value</option>
            <option value="buyer">Sort by Buyer</option>
          </select>
          <button
            onClick={exportOrders}
            className="export-button"
          >
            <Download className="icon-small inline" />
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
        <div className="table-container">
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
                    <span style={{ display: 'flex', alignItems: 'center', ...getStatusColor(order.status) }}>
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
                      className="view-button"
                    >
                      <Eye className="icon-small inline" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <p className="pagination-info">
              Showing {filteredOrders.length} orders
            </p>
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={currentPage === 1 ? 'pagination-button disabled' : 'pagination-button'}
              >
                Previous
              </button>
              <span className="pagination-page">
                Page {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Order Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h3 className="modal-section-title">Order Information</h3>
                <div className="modal-info">
                  <div className="info-row">
                    <span className="info-label">Order ID:</span>
                    <span>{selectedOrder.orderId}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Status:</span>
                    <span style={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Date:</span>
                    <span>{new Date(selectedOrder.orderedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="modal-section">
                <h3 className="modal-section-title">Product</h3>
                <div className="modal-info">
                  <div className="info-row">
                    <span className="info-label">Name:</span>
                    <span>{selectedOrder.productName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Price:</span>
                    <span>${selectedOrder.productPrice}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Quantity:</span>
                    <span>{selectedOrder.quantity}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Total Value:</span>
                    <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>{selectedOrder.coinValue} coins</span>
                  </div>
                </div>
              </div>
              <div className="modal-section">
                <h3 className="modal-section-title">Buyer Information</h3>
                <div className="modal-info">
                  <div className="info-row">
                    <span className="info-label">Username:</span>
                    <span>{selectedOrder.buyerUsername}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span style={{ wordBreak: 'break-all' }}>{selectedOrder.buyerEmail}</span>
                  </div>
                </div>
              </div>
              <div className="modal-section">
                <h3 className="modal-section-title">Stream Information</h3>
                <div className="modal-info">
                  <div className="info-row">
                    <span className="info-label">Title:</span>
                    <span style={{ wordBreak: 'break-all' }}>{selectedOrder.streamTitle}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Streamer:</span>
                    <span>{selectedOrder.streamerUsername}</span>
                  </div>
                </div>
              </div>
              {selectedOrder.deliveryInfo && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Delivery Address</h3>
                  <div className="delivery-info">
                    <p className="delivery-name">
                      {selectedOrder.deliveryInfo.firstName} {selectedOrder.deliveryInfo.lastName}
                    </p>
                    <p className="delivery-address">{selectedOrder.deliveryInfo.address}</p>
                    <p className="delivery-address">
                      {selectedOrder.deliveryInfo.city}, {selectedOrder.deliveryInfo.state} {selectedOrder.deliveryInfo.zipCode}
                    </p>
                    <p className="delivery-address">{selectedOrder.deliveryInfo.country}</p>
                    <div className="delivery-contact">
                      <p className="delivery-contact-item">Email: {selectedOrder.deliveryInfo.email}</p>
                      <p className="delivery-contact-item">Phone: {selectedOrder.deliveryInfo.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="modal-close-button"
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