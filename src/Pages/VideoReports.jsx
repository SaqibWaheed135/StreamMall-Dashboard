import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ReportedVideos() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await axios.get('https://theclipstream-backend.onrender.com/api/auth/getreportVideo');
            setReports(res.data.reports || []);
        } catch (err) {
            console.error('Failed to fetch reports:', err);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVideo = async (report) => {
        if (!report.videoId) {
            alert('❌ No video found to delete');
            return;
        }

        const videoId = typeof report.videoId === 'object' ? report.videoId._id : report.videoId;
        
        if (!window.confirm("Delete this video permanently? This action cannot be undone.")) return;

        try {
            await axios.delete(`https://theclipstream-backend.onrender.com/api/auth/deleteVideo/${videoId}`);

            setReports((prev) =>
                prev.filter((r) => r._id !== report._id)
            );

            alert('Video deleted successfully.');
            
        } catch (err) {
            console.error('Failed to delete video:', err.response?.data || err.message);
            
            const errorMessage = err.response?.data?.message || 'Failed to delete video';
            alert(`❌ ${errorMessage}`);
        }
    };

    const getReasonBadgeColor = (reason) => {
        switch (reason?.toLowerCase()) {
            case 'spam':
                return 'bg-red-100 text-red-800';
            case 'adult':
                return 'bg-purple-100 text-purple-800';
            case 'violence':
                return 'bg-orange-100 text-orange-800';
            case 'harassment':
                return 'bg-yellow-100 text-yellow-800';
            case 'inappropriate_content':
                return 'bg-pink-100 text-pink-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const truncateText = (text, maxLength = 60) => {
        if (!text) return 'No description available';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const openVideoInModal = (videoUrl, videoId) => {
        if (!videoUrl) {
            alert('Video URL not available');
            return;
        }
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 20px;
            box-sizing: border-box;
        `;

        // Create modal content container
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 20px;
            width: 90%;
            max-width: 900px;
            max-height: 90vh;
            position: relative;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            overflow: hidden;
        `;

        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 20px;
            background: rgba(0, 0, 0, 0.1);
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            transition: background-color 0.2s ease;
        `;

        // Create video container
        const videoContainer = document.createElement('div');
        videoContainer.style.cssText = `
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 15px;
            flex-shrink: 0;
        `;

        // Create video element
        const video = document.createElement('video');
        video.src = videoUrl;
        video.controls = true;
        video.style.cssText = `
            width: 100%;
            max-width: 100%;
            height: auto;
            max-height: 60vh;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;

        // Create video info
        const videoInfo = document.createElement('div');
        videoInfo.style.cssText = `
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            font-family: 'Poppins', sans-serif;
            font-size: 14px;
            line-height: 1.5;
            flex-shrink: 0;
            overflow-y: auto;
        `;
        videoInfo.innerHTML = `
            <div style="margin-bottom: 8px;">
                <strong style="color: #343a40;">Video ID:</strong> 
                <span style="color: #6c757d; word-break: break-all;">${videoId}</span>
            </div>
            <div>
                <strong style="color: #343a40;">URL:</strong> 
                <a href="${videoUrl}" target="_blank" style="color: #5F0A87; text-decoration: none; word-break: break-all;">
                    ${videoUrl}
                </a>
            </div>
        `;

        // Add hover effects to close button
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(0, 0, 0, 0.2)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(0, 0, 0, 0.1)';
        });

        // Assemble modal
        videoContainer.appendChild(video);
        modal.appendChild(closeBtn);
        modal.appendChild(videoContainer);
        modal.appendChild(videoInfo);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';

        // Close handlers
        const closeModal = () => {
            document.body.removeChild(overlay);
            document.body.style.overflow = '';
        };

        closeBtn.onclick = closeModal;
        overlay.onclick = (e) => {
            if (e.target === overlay) closeModal();
        };

        // ESC key handler
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    };

    return (
        <div className="withdraw-container">
            <h1 className="withdraw-heading">Reported Videos</h1>

            {loading ? (
                <p>Loading...</p>
            ) : reports.length === 0 ? (
                <p>No reported videos.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="withdraw-table">
                        <thead>
                            <tr>
                                <th className="withdraw-th">User Email</th>
                                <th className="withdraw-th">Video Info</th>
                                <th className="withdraw-th">Report Reason</th>
                                <th className="withdraw-th">Description</th>
                                <th className="withdraw-th">Date Reported</th>
                                <th className="withdraw-th">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report._id}>
                                    <td className="withdraw2-td">
                                        <div style={{ 
                                            fontSize: '12px',
                                            fontFamily: 'Poppins',
                                           
                                            
                                        }}>
                                            <div style={{ 
                                                fontWeight: '500',
                                                color: '#2c3e50'
                                            }}>
                                                {report.reporterId?.email || 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* Enhanced Video Info Column */}
                                    <td className="withdraw2-td">
                                        <div style={{ 
                                            minWidth: '250px',
                                            maxWidth: '300px'
                                        }}>
                                            {report.videoId ? (
                                                <div style={{
                                                    background: '#f8f9fa',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e9ecef',
                                                    fontFamily: 'Poppins',
                                                    display:'flex',
                                                    flexDirection:'column',
                                                    justifyContent:'center',
                                                    alignItems:'center'
                                                }}>
                                                    {/* Video ID */}
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#6c757d',
                                                        marginBottom: '6px',
                                                        fontWeight: '500'
                                                    }}>
                                                        ID: {report.videoId._id || report.videoId}
                                                    </div>

                                                    {/* Description */}
                                                    <div style={{
                                                        fontSize: '13px',
                                                        color: '#495057',
                                                        marginBottom: '10px',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        <strong style={{ color: '#343a40' }}>Description:</strong><br />
                                                        <span title={report.videoId.description}>
                                                            {truncateText(report.videoId.description)}
                                                        </span>
                                                    </div>

                                                    {/* View Video Button */}
                                                    {report.videoId.uri && (
                                                        <button
                                                            onClick={() => openVideoInModal(
                                                                report.videoId.uri, 
                                                                report.videoId._id || report.videoId
                                                            )}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #5F0A87, #7B1FA2)',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '6px 12px',
                                                                borderRadius: '6px',
                                                                fontSize: '12px',
                                                                fontFamily: 'Poppins',
                                                                fontWeight: '500',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                transition: 'all 0.2s ease',
                                                                boxShadow: '0 2px 4px rgba(95, 10, 135, 0.2)'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.target.style.transform = 'translateY(-1px)';
                                                                e.target.style.boxShadow = '0 4px 8px rgba(95, 10, 135, 0.3)';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.target.style.transform = 'translateY(0)';
                                                                e.target.style.boxShadow = '0 2px 4px rgba(95, 10, 135, 0.2)';
                                                            }}
                                                        >
                                                            <span>🎥</span>
                                                            View Video
                                                        </button>
                                                    )}

                                                    {/* External Link (Alternative) */}
                                                    {report.videoId.uri && (
                                                        <div style={{ marginTop: '6px' }}>
                                                            <a 
                                                                href={report.videoId.uri} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    color: '#5F0A87',
                                                                    fontSize: '11px',
                                                                    textDecoration: 'none',
                                                                    fontFamily: 'Poppins'
                                                                }}
                                                            >
                                                                🔗 Open in new tab
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div style={{
                                                    background: '#f8d7da',
                                                    color: '#721c24',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    fontSize: '13px',
                                                    fontFamily: 'Poppins',
                                                    textAlign: 'center'
                                                }}>
                                                    ⚠️ Video not found
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="withdraw2-td">
                                        <span className={`px-2 py-1 rounded text-xs ${getReasonBadgeColor(report.reason)}`}>
                                            {report.reason?.replace('_', ' ') || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="withdraw2-td">
                                        <div style={{ 
                                            fontSize: '13px',
                                            maxWidth: '200px',
                                            fontFamily: 'Poppins'
                                        }}>
                                            <div style={{ 
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }} title={report.description}>
                                                {report.description || 'No description provided'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="withdraw2-td">
                                        <small style={{ 
                                            color: '#6c757d',
                                            fontFamily: 'Poppins'
                                        }}>
                                            {report.createdAt ? new Date(report.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'N/A'}
                                        </small>
                                    </td>
                                    <td className="withdraw2-td">
                                        <button
                                            onClick={() => handleDeleteVideo(report)}
                                            style={{
                                                background: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontFamily: 'Poppins',
                                                cursor: report.videoId ? 'pointer' : 'not-allowed',
                                                opacity: report.videoId ? 1 : 0.5,
                                                transition: 'background-color 0.2s ease',
                                                width:130
                                            }}
                                            disabled={!report.videoId}
                                            onMouseOver={(e) => {
                                                if (report.videoId) e.target.style.background = '#c82333';
                                            }}
                                            onMouseOut={(e) => {
                                                if (report.videoId) e.target.style.background = '#dc3545';
                                            }}
                                        >
                                            🗑️ Delete Video
                                        </button>
                                        {!report.videoId && (
                                            <span style={{ 
                                                color: '#6c757d',
                                                fontSize: '11px',
                                                marginLeft: '8px',
                                                fontFamily: 'Poppins'
                                            }}>
                                                Video not found
                                            </span>
                                        )}
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