import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { FiInfo } from 'react-icons/fi';
import PublishNoticeModal from './PublishNoticeModal';
import './DashboardComponents.css';

const NoticeBoard = ({ user }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const isSbgCore = user?.role === 'sbg_core';

  useEffect(() => {
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
    fetchNotices();
  }, []);

  const handlePublishSuccess = (newNotice) => {
    setNotices((prev) => [newNotice, ...prev].slice(0, 4));
  };

  let noticeContent = null;

  if (loading) {
    noticeContent = <p>Loading notices...</p>;
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
          <div key={notice._id} className="notice-item">
            <h4 className="notice-title">{notice.title}</h4>
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