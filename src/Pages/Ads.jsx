import { useState } from 'react';
import axios from 'axios';

export default function AddAdForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [category, setCategory] = useState('');
    const [photo, setPhoto] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('adLink', link);
        formData.append('category', category);
        formData.append('photo', photo);

        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.post(
                'https://theclipstream-backend.onrender.com/api/admin/auth/ad',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setMessage('Ad added successfully!');
            setTitle('');
            setDescription('');
            setLink('');
            setCategory('');
            setPhoto(null);
            setShowModal(true); // ✅ Show modal
        } catch (err) {
            console.error(err);
            setMessage('Failed to add ad.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="withdraw-container">
            <h1 className="withdraw-heading">Add New Ad</h1>
            <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
                <div className="form-group">
                    <label className="withdraw-th">Ad Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="withdraw-input"
                    />
                </div>

                <div className="form-group">
                    <label className="withdraw-th">Ad Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="withdraw-input"
                        rows={4}
                    ></textarea>
                </div>

                <div className="form-group">
                    <label className="withdraw-th">Ad Link</label>
                    <input
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        required
                        className="withdraw-input"
                    />
                </div>

                <div className="form-group">
                    <label className="withdraw-th">Ad Photo</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhoto(e.target.files[0])}
                        required
                        className="withdraw-input"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        backgroundColor: loading ? '#95a5a6' : '#2ecc71',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginTop: '15px',
                    }}
                >
                    {loading ? 'Adding...' : 'Add Ad'}
                </button>

                {message && <p style={{ marginTop: '10px' }}>{message}</p>}
            </form>

            {/* ✅ Modal for success */}
            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '8px',
                            textAlign: 'center',
                        }}
                    >
                        <h2>✅ Ad Added Successfully!</h2>
                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                backgroundColor: '#3498db',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}