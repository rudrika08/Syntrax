import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import styles from './ViewBlogs.module.scss';
import SummaryApi from '../../../common';
import { apiGet, apiDelete } from '../../../utils/authUtils';

const ViewBlogs = () => {
  const [posts, setPosts] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await apiGet(SummaryApi.BlogFetchById.url);
        const data = await response.json();
        setPosts(data.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    try {
      await apiDelete(SummaryApi.BlogDelete.url, { id });
      setPosts(posts.filter((post) => post._id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const handleView = (blog) => {
    setCurrentBlog(blog);
    setModalIsOpen(true);
  };

  const confirmDelete = (post) => {
    setDeleteConfirm(post);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'No date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 50) => {
    if (!content) return '';
    // Strip HTML tags
    const strippedContent = content.replace(/<[^>]*>/g, '');
    if (strippedContent.length <= maxLength) return strippedContent;
    return strippedContent.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Your Blog Collection</h2>
        <div className={styles.stats}>
          <span className={styles.count}>{posts.length} Posts</span>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <h3>No blogs yet</h3>
          <p>Start writing your first blog post!</p>
        </div>
      ) : (
        <div className={styles.blogGrid}>
          {posts.map((post, index) => (
            <div key={post._id} className={styles.blogCard}>
              <div className={styles.cardHeader}>
                <span className={styles.blogNumber}>#{index + 1}</span>
                <span className={styles.blogDate}>{formatDate(post.createdAt)}</span>
              </div>
              
              <div className={styles.cardContent}>
                <h3 className={styles.blogTitle}>{post.title}</h3>
                <p className={styles.blogPreview}>
                  {truncateContent(post.content)}
                </p>
              </div>

              <div className={styles.cardActions}>
                <button 
                  className={`${styles.actionBtn} ${styles.viewBtn}`}
                  onClick={() => handleView(post)}
                >
                  <span className={styles.btnIcon}>👁️</span>
                  View
                </button>
                <button 
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => confirmDelete(post)}
                >
                  <span className={styles.btnIcon}>🗑️</span>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Blog Modal */}
      {modalIsOpen && currentBlog && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className={styles.modal}
          overlayClassName={styles.overlay}
        >
          <div className={styles.modalHeader}>
            <h3>{currentBlog.title}</h3>
            <button
              className={styles.closeButton}
              onClick={() => setModalIsOpen(false)}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
          
          <div className={styles.modalContent}>
            <div className={styles.blogMeta}>
              <span className={styles.publishDate}>
                Published: {formatDate(currentBlog.createdAt)}
              </span>
            </div>
            <div className={styles.blogContent}>
              {currentBlog.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal
          isOpen={!!deleteConfirm}
          onRequestClose={() => setDeleteConfirm(null)}
          className={styles.confirmModal}
          overlayClassName={styles.overlay}
        >
          <div className={styles.confirmContent}>
            <div className={styles.warningIcon}>⚠️</div>
            <h3>Delete Blog Post</h3>
            <p>Are you sure you want to delete "<strong>{deleteConfirm.title}</strong>"?</p>
            <p className={styles.warningText}>This action cannot be undone.</p>
            
            <div className={styles.confirmActions}>
              <button 
                className={`${styles.actionBtn} ${styles.cancelBtn}`}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className={`${styles.actionBtn} ${styles.confirmDeleteBtn}`}
                onClick={() => handleDelete(deleteConfirm._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ViewBlogs;