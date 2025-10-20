import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function RechargeAdmin() {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecharges();
  }, []);

  const fetchRecharges = async () => {
    try {
      const res = await axios.get(
        "https://theclipstream-backend.onrender.com/api/recharges/history",
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
        `https://theclipstream-backend.onrender.com/api/recharges/admin/approve/${id}`,
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
        `https://theclipstream-backend.onrender.com/api/recharges/admin/reject/${id}`,
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

  // 🔹 Show payment details based on method
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
            <span className="font-mono">
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
                href={recharge.blockchainExplorerUrl}
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
          <div>
            <strong>Network:</strong>{" "}
            {recharge.details?.blockchainNetwork || "N/A"}
          </div>
          <div>
            <strong>Contract:</strong>{" "}
            {recharge.details?.contractAddress || "N/A"}
          </div>
        </div>
      );
    }

    return <span className="text-gray-400">N/A</span>;
  };

  return (
    <div className="withdraw-container">
      <h1 className="withdraw-heading">Recharge Requests</h1>

      {loading ? (
        <p>Loading...</p>
      ) : recharges.length === 0 ? (
        <p>No recharge requests.</p>
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
              {recharges.map((r) => (
                <tr key={r._id}>
                  <td className="withdraw-td">
                    {r.userId?.username || "N/A"}
                    <br />
                    <small>{r.userId?.email}</small>
                  </td>
                  <td className="withdraw-td">{r.method}</td>
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
                      <span className="text-yellow-400">{r.status}</span>
                    ) : r.status === "approved" ? (
                      <span className="text-green-400">{r.status}</span>
                    ) : r.status === "rejected" ? (
                      <span className="text-red-400">{r.status}</span>
                    ) : (
                      <span className="text-gray-400">{r.status}</span>
                    )}
                  </td>
                  <td className="withdraw-td">
                    {new Date(r.requestedAt).toLocaleString()}
                  </td>
                  <td className="withdraw-td">
                    {r.status === "pending" ? (
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
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 🔹 Error Alert */}
          {error && (
            <div className="mt-4 bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* 🔹 Success Alert */}
          {success && (
            <div className="mt-4 bg-green-900/50 border border-green-500 rounded-lg p-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400 whitespace-pre-line">{success}</p>
            </div>
          )}

          {/* Pagination Info */}
          {pagination && pagination.total && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {recharges.length} of {pagination.total} requests
            </div>
          )}
        </div>
      )}
    </div>
  );
}
