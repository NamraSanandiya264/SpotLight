import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiInfo } from 'react-icons/fi';

const NoticeBoard = ({ user }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const isSbgCore = user?.role === 'sbg_core';

  // Fallback quotes
  const quotes = [
    "“The beautiful thing about learning is that no one can take it away from you.” – B.B. King",
    "“Success is the sum of small efforts, repeated day in and day out.” – Robert Collier",
    "“There is no elevator to success, you have to take the stairs.”"
  ];
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get('/notices'); // Adjust if your endpoint differs
        if (res.data && res.data.notices) {
          setNotices(res.data.notices.slice(0, 4)); // Get top 4
        }
      } catch (error) {
        console.error("Failed to fetch notices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  return (
    <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Notice Board <FiInfo color="#2563EB" />
        </h3>
        {/*Publish Button for SBG Core */}
        {isSbgCore && (
          <button 
            onClick={() => alert("Open Notice Modal/Page")} // Replace with your actual navigation or modal state
            style={{ fontSize: '0.8rem', backgroundColor: '#2563EB', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            + Publish
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Loading notices...</p>
      ) : notices.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #E2E8F0' }}>
          <p style={{ fontStyle: 'italic', color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            {quote}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notices.map((notice) => (
            <div key={notice._id} style={{ padding: '12px', borderLeft: '3px solid #2563EB', backgroundColor: '#F8FAFC', borderRadius: '0 8px 8px 0' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#1F2937' }}>{notice.title}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#4B5563', lineHeight: '1.4' }}>{notice.content}</p>
              <span style={{ display: 'block', marginTop: '8px', fontSize: '0.75rem', color: '#9CA3AF' }}>
                {new Date(notice.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;