import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { FiInfo, FiTrash2, FiPlus, FiCalendar } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PublishNoticeModal from './PublishNoticeModal';

// Accent colors for notice cards — rotates across cards
const CARD_ACCENTS = [
  { border: 'border-l-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',   dot: 'bg-blue-500',   text: 'text-blue-700 dark:text-blue-300'   },
  { border: 'border-l-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', dot: 'bg-violet-500', text: 'text-violet-700 dark:text-violet-300' },
  { border: 'border-l-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-900/20',dot: 'bg-emerald-500',text: 'text-emerald-700 dark:text-emerald-300'},
  { border: 'border-l-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20',  dot: 'bg-amber-500',  text: 'text-amber-700 dark:text-amber-300'  },
];

const NoticeBoard = ({ user }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

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
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/notices/${id}`);
          if (res.data.success) {
            setNotices(prev => prev.filter(n => n._id !== id));
            fetchNotices();
          }
        } catch (error) {
          console.error('Failed to delete notice:', error);
          Swal.fire({
            title: "Error",
            text: "Failed to delete notice. Please try again.",
            icon: "error",
            background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000',
          });
        }
      }
    });
  };

  let noticeContent = null;

  if (loading) {
    noticeContent = (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  } else if (notices.length === 0) {
    noticeContent = (
      <div className="py-10 text-center bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
        <p className="text-gray-500 dark:text-gray-400">No active notices at this time.</p>
      </div>
    );
  } else {
    noticeContent = (
      <div className="flex flex-col gap-3">
        {notices.map((notice, i) => {
          const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
          return (
            <button
              key={notice._id}
              type="button"
              onClick={() => setSelectedNotice(notice)}
              className={`w-full text-left relative border-l-4 ${accent.border} ${accent.bg} rounded-xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow group border border-gray-100 dark:border-slate-700/60 cursor-pointer`}
            >
              {isSbgCore && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(notice._id);
                  }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors bg-white dark:bg-slate-800 rounded-full p-1.5 opacity-0 group-hover:opacity-100 shadow-sm border border-gray-100 dark:border-slate-700"
                  title="Delete Notice"
                >
                  <FiTrash2 size={14} />
                </button>
              )}

              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 pr-8 text-base">{notice.title}</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-3">{notice.content}</p>
              <div className={`text-xs font-semibold flex items-center gap-1.5 ${accent.text}`}>
                <FiCalendar size={11} />
                {new Date(notice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-6 transition-colors duration-300 w-full mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Notice Board <FiInfo className="text-blue-500 dark:text-indigo-400" />
          </h3>
          {isSbgCore && (
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-600 dark:text-indigo-300 bg-blue-50 dark:bg-indigo-500/10 hover:bg-blue-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors"
              onClick={() => setIsPublishModalOpen(true)}
            >
              <FiPlus size={15} /> Publish
            </button>
          )}
        </div>

        {noticeContent}
      </div>

      {selectedNotice && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-3 sm:p-4"
          onClick={() => setSelectedNotice(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="notice-details-title"
          tabIndex={-1}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-indigo-300">Notice</p>
                <h3 id="notice-details-title" className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedNotice.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-100"
                aria-label="Close notice"
              >
                <FiInfo size={18} />
              </button>
            </div>
            <div className="px-5 py-5 sm:px-6">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <FiCalendar size={13} />
                  {new Date(selectedNotice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700 dark:text-gray-300">
                {selectedNotice.content}
              </p>
            </div>
          </div>
        </div>
      )}

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