import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { FiInfo, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PublishNoticeModal from './PublishNoticeModal';
import './DashboardComponents.css';

const NoticeBoard = ({ user }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const isSbgCore = user?.role === 'sbg_core';

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      if (res?.data?.notices) {
        setNotices(res.data.notices.slice(0, 4));
      }
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePublishSuccess = (newNotice) => {
    setNotices((prev) => [newNotice, ...prev].slice(0, 4));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Notice?",
      text: "Are you sure you want to permanently delete this notice?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626", 
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      background: "#ffffff"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/notices/${id}`);
          if (res.data.success) {
            setNotices(prev => prev.filter(n => n._id !== id));
            // Automatically fetch again to backfill if there are older notices
            fetchNotices(); 
          }
        } catch (error) {
          console.error('Failed to delete notice:', error);
          Swal.fire("Error", "Failed to delete notice. Please try again.", "error");
        }
      }
    });
  };

  let noticeContent = null;

  if (loading) {
    noticeContent = <p className="loading-text">Loading notices...</p>;
  } else if (notices.length === 0) {
    noticeContent = (
      <div className="empty-state">
        <p>No active notices at this time.</p>
      </div>
    );
  } else {
    noticeContent = (
      <div>
        {notices.map((notice) => (
          <div key={notice._id} className="notice-item" style={{ position: 'relative' }}>
            {isSbgCore && (
              <button 
                onClick={() => handleDelete(notice._id)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#DC2626'}
                onMouseOut={(e) => e.currentTarget.style.color = '#94A3B8'}
                title="Delete Notice"
              >
                <FiTrash2 size={18} />
              </button>
            )}
            
            <h4 className="notice-title" style={{ paddingRight: '24px' }}>{notice.title}</h4>
            <p className="notice-content">{notice.content}</p>
            <span className="notice-date">
              {new Date(notice.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="widget-card">
        <div className="widget-header">
          <h3 className="widget-title">
            Notice Board <FiInfo color="#2563EB" />
          </h3>
          {isSbgCore && (
            <button className="btn-primary" onClick={() => setIsPublishModalOpen(true)}>
              + Publish
            </button>
          )}
        </div>

        {noticeContent}
      </div>

      <PublishNoticeModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublishSuccess={handlePublishSuccess}
      />
    </>
  );
};

NoticeBoard.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string,
  }),
};

export default NoticeBoard;