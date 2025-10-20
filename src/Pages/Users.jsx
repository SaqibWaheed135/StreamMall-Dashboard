import { useEffect, useState } from 'react';
import axios from 'axios';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("https://theclipstream-backend.onrender.com/api/auth/getUsers");
      const usersData = Array.isArray(res.data.data) ? res.data.data : res.data;
      setUsers(usersData);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://theclipstream-backend.onrender.com/api/auth/deleteUser/${userId}`);
      setUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user");
    }
  };

  return (
    <div className="withdraw-container">
      <h1 className="withdraw-heading">Users List</h1>

      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="withdraw-table">
            <thead>
              <tr>
                <th className="withdraw-th">Avatar</th>
                <th className="withdraw-th">Username</th>
                <th className="withdraw-th">Email</th>
                <th className="withdraw-th">Points</th>
                <th className="withdraw-th">Verified</th>
                <th className="withdraw-th">Provider</th>
                <th className="withdraw-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="withdraw-td">
                    <img
                      src={user.avatar || "https://via.placeholder.com/40"}
                      alt="avatar"
                      style={{
                        height: "40px",
                        width: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td className="withdraw-td">{user.username}</td>
                  <td className="withdraw-td">{user.email}</td>
                  <td className="withdraw-td">{user.points}</td>
                  <td className="withdraw-td">
                    {user.isVerified ? "✅ Yes" : "❌ No"}
                  </td>
                  <td className="withdraw-td">
                    {user.googleId ? "Google" : "Local"}
                  </td>
                  <td className="withdraw-td">
                    <button
                      onClick={() => deleteUser(user._id)}
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
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
