import React, { useEffect, useState, useContext } from 'react';
import styles from './UpdateBlog.module.scss';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import SummaryApi from '../../../common';
import { BlogContext } from './../../../context/BlogContext';
import { apiPost, apiPut } from '../../../utils/authUtils';

const UpdateBlog = ({ blogId, onClose }) => {
  const { fetchBlog } = useContext(BlogContext);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const watchContent = watch('content', '');

  // Update character count when content changes
  useEffect(() => {
    setCharCount(watchContent.length);
  }, [watchContent]);

  // Fetch blog data by ID
  const fetchBlogFn = async () => {
    try {
      const response = await apiPost(SummaryApi.BlogFetchByBlogId.url, { id: blogId });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      setValue('title', data.data.title);
      setValue('content', data.data.content);
      setValue('image', data.data.image);

      reset({
        title: data.data.title,
        content: data.data.content,
        image: data.data.image,
      });

      setIsLoaded(true);
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to fetch blog data');
    }
  };

  useEffect(() => {
    if (blogId) {
      fetchBlogFn();
    }
  }, [blogId]);

  const onSubmit = async (data) => {
    console.log('Updated Data:', data);
    setIsSubmitting(true);
    
    try {
      const response = await apiPut(SummaryApi.BlogEdit.url, { ...data, id: blogId });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const updatedData = await response.json();
      console.log(updatedData);

      fetchBlog();
      toast.success('Blog Updated Successfully');
      onClose();
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Failed to update blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading blog data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button onClick={onClose} className={styles.closeButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <div>
              <h1>Update Blog Post</h1>
              <p>Make your changes and save to update</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className={styles.formContent}>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {/* Title Field */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                Blog Title
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                placeholder="Enter your blog title..."
                className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              />
              {errors.title && (
                <p className={styles.error}>
                  <span className={styles.errorIcon}>!</span>
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Content Field */}
            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                  Blog Content
                </label>
                <span className={styles.charCount}>{charCount} characters</span>
              </div>
              <textarea
                {...register('content', { required: 'Content is required' })}
                placeholder="Write your blog content here..."
                rows={12}
                className={`${styles.textarea} ${errors.content ? styles.inputError : ''}`}
              />
              {errors.content && (
                <p className={styles.error}>
                  <span className={styles.errorIcon}>!</span>
                  {errors.content.message}
                </p>
              )}
            </div>

            {/* Image URL Field */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21,15 16,10 5,21"></polyline>
                </svg>
                Featured Image URL
              </label>
              <input
                {...register('image', { required: 'Image URL is required' })}
                type="url"
                placeholder="https://example.com/image.jpg"
                className={`${styles.input} ${errors.image ? styles.inputError : ''}`}
              />
              {errors.image && (
                <p className={styles.error}>
                  <span className={styles.errorIcon}>!</span>
                  {errors.image.message}
                </p>
              )}
              
              {/* Image Preview */}
              {watch('image') && (
                <div className={styles.imagePreview}>
                  <img
                    src={watch('image')}
                    alt="Preview"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className={styles.previewBadge}>Preview</div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            Last updated: {new Date().toLocaleDateString()}
          </div>
          <div className={styles.footerActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className={styles.updateButton}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.spinner}></div>
                  Updating...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                  </svg>
                  Update Blog
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateBlog;