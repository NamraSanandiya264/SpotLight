import React, { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { FiX } from 'react-icons/fi';
import './DashboardComponents.css';

const PublishNoticeModal = ({ isOpen, onClose, onPublishSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    expiresAt: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim()
      };
      
      if (formData.expiresAt) {
        payload.expiresAt = formData.expiresAt;
      }

      const res = await api.post('/notices', payload);
      if (res.data.success) {
        onPublishSuccess(res.data.notice);
        setFormData({ title: '', content: '', expiresAt: '' });
        onClose();
      }
    } catch (error) {
      console.error('Failed to publish notice:', error);
      alert('Failed to publish notice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="widget-header">
          <h3 className="widget-title">Publish New Notice</h3>
          <button onClick={onClose} className="modal-close-button">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="notice-title" className="form-label">Notice Title</label>
            <input id="notice-title" type="text" name="title" className="form-input" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="notice-content" className="form-label">Content</label>
            <textarea id="notice-content" name="content" className="form-input" rows="4" value={formData.content} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="notice-expiresAt" className="form-label">Expiration Date (Optional)</label>
            <input id="notice-expiresAt" type="datetime-local" name="expiresAt" className="form-input" value={formData.expiresAt} onChange={handleChange} />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-link">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Publishing...' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

PublishNoticeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPublishSuccess: PropTypes.func.isRequired,
};

export default PublishNoticeModal;