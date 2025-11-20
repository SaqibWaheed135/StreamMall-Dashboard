import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

export default function RechargeAdmin() {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, pending, approved, rejected

  useEffect(() => {
    fetchRecharges();
  }, []);

  const fetchRecharges = async () => {
    try {
      const res = await axios.get(
        "https://streammall-backend-73a4b072d5eb.herokuapp.com/api/recharges/history",
        { withCredentials: true }
      );

      if (res.data.recharges) {
        setRecharges(res.data.recharges);
        setPagination(res.data.pagination || {});
      } else {
        setRecharges([]);
      }
    } catch (err) {
      console.error("Failed to fetch recharges:", err.response?.data || err);
      setError("Failed to fetch recharge requests ❌");
      setRecharges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("✅ Approve this recharge request?")) return;

    try {
      const response = await axios.post(
        `https://streammall-backend-73a4b072d5eb.herokuapp.com/api/recharges/admin/approve/${id}`,
        { notes: "Approved by admin" },
        { withCredentials: true }
      );

      if (response.data.msg) {
        setRecharges((prev) =>
          prev.map((r) =>
            r._id === id
              ? {
                  ...r,
                  status: "approved",
                  approvedAt: new Date().toISOString(),
                  userBalance: response.data.newBalance,
                }
              : r
          )
        );
        setSuccess(
          `Recharge approved successfully ✅\nNew balance: ${response.data.newBalance?.toLocaleString()} points`
        );
      }
    } catch (err) {
      console.error("Failed to approve:", err.response?.data || err);
      setError(err.response?.data?.msg || "Failed to approve recharge ❌");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const response = await axios.post(
        `https://streammall-backend-73a4b072d5eb.herokuapp.com/api/recharges/admin/reject/${id}`,
        { reason },
        { withCredentials: true }
      );

      if (response.data.msg) {
        setRecharges((prev) =>
          prev.map((r) =>
            r._id === id
              ? {
                  ...r,
                  status: "rejected",
                  rejectedAt: new Date().toISOString(),
                }
              : r
          )
        );
        setSuccess("Recharge rejected ❌");
      }
    } catch (err) {
      console.error("Failed to reject:", err.response?.data || err);
      setError(err.response?.data?.msg || "Failed to reject recharge ❌");
    }
  };

  // Show payment details based on method
  const renderPaymentDetails = (recharge) => {
    if (recharge.method === "bank") {
      return (
        <div className="text-sm">
          <div>
            <strong>Transaction ID:</strong>{" "}
            {recharge.details?.transactionId || "N/A"}
          </div>
          <div>
            <strong>Screenshot:</strong>{" "}
            {recharge.screenshotUrl ? (
              <a
                href={recharge.screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View
              </a>
            ) : (
              "N/A"
            )}
          </div>
        </div>
      );
    }

    if (recharge.method === "usdt") {
      return (
        <div className="text-sm">
          <div>
            <strong>Wallet:</strong>{" "}
            <span className="font-mono text-xs">
              {recharge.details?.walletAddress || "N/A"}
            </span>
          </div>
          <div>
            <strong>Amount:</strong>{" "}
            {recharge.details?.usdtAmount
              ? `${recharge.details.usdtAmount} USDT`
              : "N/A"}
          </div>
          <div>
            <strong>Tx Hash:</strong>{" "}
            {recharge.details?.transactionHash ? (
              <a
                href={`https://tronscan.org/#/transaction/${recharge.details.transactionHash}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {recharge.details.transactionHash.slice(0, 10)}...
              </a>
            ) : (
              "N/A"
            )}
          </div>
          {recharge.metadata?.autoApproved && (
            <div className="mt-2 text-green-600 font-medium">
              ✅ Auto-approved
            </div>
          )}
        </div>
      );
    }

    return <span className="text-gray-400">N/A</span>;
  };

  // Filter recharges
  const filteredRecharges = recharges.filter(r => {
    if (filterStatus === "all") return true;
    return r.status === filterStatus;
  });

  // Separate pending bank transfers (require action)
  const pendingBankTransfers = filteredRecharges.filter(
    r => r.status === "pending" && r.method === "bank"
  );

  return (
    <div className="withdraw-container">
      <h1 className="withdraw-heading">Recharge Requests</h1>

      {/* Info Banner */}
      <div className="mb-4 bg-blue-900/50 border border-blue-500 rounded-lg p-4 flex items-start space-x-2">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-blue-200 text-sm">
          <strong>Note:</strong> USDT payments are automatically verified and approved. 
          Bank transfers require manual review and approval.
        </div>
      </div>

      {/* Pending Bank Transfers Alert */}
      {pendingBankTransfers.length > 0 && (
        <div className="mb-4 bg-yellow-900/50 border border-yellow-500 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <p className="text-yellow-200">
            <strong>{pendingBankTransfers.length}</strong> bank transfer{pendingBankTransfers.length > 1 ? 's' : ''} 
            {' '}awaiting approval
          </p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-recharge-buttons" style={{gap:10}}>
        {['all', 'pending', 'approved', 'rejected'].map(status => (
       
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === status
                ? 'filter-button active'
                : 'filter-button'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'pending' && pendingBankTransfers.length > 0 && (
              <span className="ml-2 bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs">
                {pendingBankTransfers.length}
              </span>
            )}
          </button>
        
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredRecharges.length === 0 ? (
        <p>No {filterStatus !== 'all' ? filterStatus : ''} recharge requests.</p>
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
                <th className="withdraw-th">Status</th>
                <th className="withdraw-th">Requested At</th>
                <th className="withdraw-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecharges.map((r) => (
                <tr key={r._id} className={r.status === "pending" && r.method === "bank" ? "bg-yellow-900/20" : ""}>
                  <td className="withdraw-td">
                    {r.userId?.username || "N/A"}
                    <br />
                    <small>{r.userId?.email}</small>
                  </td>
                  <td className="withdraw-td">
                    <span className="capitalize">{r.method}</span>
                    {r.method === "usdt" && (
                      <div className="text-xs text-green-400 mt-1">Auto-approved</div>
                    )}
                    {r.method === "bank" && r.status === "pending" && (
                      <div className="text-xs text-yellow-400 mt-1">Needs review</div>
                    )}
                  </td>
                  <td className="withdraw-td">{renderPaymentDetails(r)}</td>
                  <td className="withdraw-td">
                    {r.pointsToAdd?.toLocaleString() || 0}
                  </td>
                  <td className="withdraw-td">${r.amount}</td>
                  <td className="withdraw-td">
                    {r.userBalance?.toLocaleString() || "N/A"} points
                  </td>
                  <td className="withdraw-td capitalize">
                    {r.status === "pending" ? (
                      <span className="text-yellow-400 flex items-center gap-1">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                        {r.status}
                      </span>
                    ) : r.status === "approved" ? (
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {r.status}
                      </span>
                    ) : r.status === "rejected" ? (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {r.status}
                      </span>
                    ) : (
                      <span className="text-gray-400">{r.status}</span>
                    )}
                  </td>
                  <td className="withdraw-td">
                    {new Date(r.requestedAt).toLocaleString()}
                    {r.approvedAt && (
                      <div className="text-xs text-green-400 mt-1">
                        Approved: {new Date(r.approvedAt).toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="withdraw-td">
                    {r.status === "pending" && r.method === "bank" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(r._id)}
                          style={{
                            backgroundColor: "#27ae60",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontFamily: "poppins",
                            marginRight: "5px",
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(r._id)}
                          style={{
                            backgroundColor: "#e74c3c",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontFamily: "poppins",
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : r.status === "pending" && r.method === "usdt" ? (
                      <span className="text-blue-400 text-sm">Auto-processing...</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Error Alert */}
          {error && (
            <div className="mt-4 bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mt-4 bg-green-900/50 border border-green-500 rounded-lg p-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400 whitespace-pre-line">{success}</p>
            </div>
          )}

          {/* Pagination Info */}
          {pagination && pagination.total && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredRecharges.length} of {pagination.total} requests
              {filterStatus !== 'all' && ` (filtered by ${filterStatus})`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}