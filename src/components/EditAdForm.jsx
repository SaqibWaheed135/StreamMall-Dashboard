import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EditAdForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [category, setCategory] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAdDetails();
  }, []);

  const fetchAdDetails = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('https://theclipstream-backend.onrender.com/api/admin/auth/getAd', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ad = res.data.data.find(ad => ad._id === id);
      if (!ad) return setMessage("Ad not found");

      setTitle(ad.title);
      setDescription(ad.description);
      setLink(ad.adLink);
      setCategory(ad.category);
      setPhotoUrl(ad.displayPhoto);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load ad");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.put(
        `https://theclipstream-backend.onrender.com/api/admin/auth/getAd/${id}`,
        {
          title,
          description,
          adLink: link,
          category,
          photoUrl
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage('Ad updated successfully!');
      setTimeout(() => navigate('/ads-lists'), 1500);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update ad.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: 'auto', padding: '20px' }}>
      <h2>Edit Ad</h2>
      {message && <p>{message}</p>}

      <label>Ad Title</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <label>Ad Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      ></textarea>

      <label>Ad Link</label>
      <input
        type="url"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        required
      />

      <label>Ad Category</label>
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />

      <label>Ad Photo URL</label>
      <input
        type="url"
        value={photoUrl}
        onChange={(e) => setPhotoUrl(e.target.value)}
        required
      />

      <button type="submit" style={{ marginTop: '15px' }}>Update Ad</button>
    </form>
  );
}