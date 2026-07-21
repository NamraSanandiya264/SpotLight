import React, { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { FiX } from 'react-icons/fi';

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

  const inputClass = "w-full px-3.5 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-slate-500";

  return (
    <div
      className="fixed inset-0 bg-gray-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-notice-title"
      tabIndex={-1}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 id="publish-notice-title" className="text-xl font-bold text-gray-900 dark:text-white">Publish New Notice</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="notice-title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Notice Title
            </label>
            <input
              id="notice-title"
              type="text"
              name="title"
              className={inputClass}
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter notice title..."
              required
            />
          </div>

          <div>
            <label htmlFor="notice-content" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Content
            </label>
            <textarea
              id="notice-content"
              name="content"
              className={`${inputClass} resize-y`}
              rows="5"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write the notice content..."
              required
            />
          </div>

          <div>
            <label htmlFor="notice-expiresAt" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Expiration Date <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              id="notice-expiresAt"
              type="datetime-local"
              name="expiresAt"
              className={inputClass}
              value={formData.expiresAt}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm disabled:opacity-70"
            >
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