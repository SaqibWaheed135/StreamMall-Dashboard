import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdList() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('https://theclipstream-backend.onrender.com/api/admin/auth/getAd', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAds(res.data.data);
    } catch (err) {
      console.error('Failed to fetch ads:', err);
      setMessage('Failed to fetch ads');
    } finally {
      setLoading(false);
    }
  };

  const deleteAd = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`https://theclipstream-backend.onrender.com/api/admin/auth/getAd/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAds((prev) => prev.filter((ad) => ad._id !== id));
      setMessage('Ad deleted');
    } catch (err) {
      console.error('Failed to delete ad:', err);
      setMessage('Failed to delete ad');
    }
  };

  const editAd = (id) => {
    navigate(`/ads/edit/${id}`);
  };

  return (
    <div className="withdraw-container">
      <h1 className="withdraw-heading">Ads List</h1>

      {message && <p>{message}</p>}
      {loading ? (
        <p>Loading ads...</p>
      ) : ads.length === 0 ? (
        <p>No ads found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="withdraw-table">
            <thead>
              <tr>
                <th className="withdraw-th">Photo</th>
                <th className="withdraw-th">Title</th>
                <th className="withdraw-th">Link</th>
                <th className="withdraw-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad._id}>
                  <td className="withdraw-td">
                    <img
                      src={ad.displayPhoto}
                      alt={ad.title}
                      style={{
                        width: '100px',
                        height: 'auto',
                        borderRadius: '4px',
                        objectFit: 'cover',
                        alignSelf:'center'
                      }}
                    />
                  </td>
                  <td className="withdraw-td">{ad.title}</td>
                  <td className="withdraw-td">
                    <a href={ad.adLink} target="_blank" rel="noopener noreferrer" style={{color:'#16a34a',alignSelf:'center',fontSize:16, fontWeight:600}}>Visit</a>
                  </td>
                  <td className="withdraw-td">
                    {/* <button
                      onClick={() => editAd(ad._id)}
                      style={{
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        padding: '13px 30px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginRight: '8px'
                      }}
                    >
                      Edit
                    </button> */}
                    <button
                      onClick={() => deleteAd(ad._id)}
                      style={{
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '13px 30px',
                        borderRadius: '5px',
                        cursor: 'pointer',
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