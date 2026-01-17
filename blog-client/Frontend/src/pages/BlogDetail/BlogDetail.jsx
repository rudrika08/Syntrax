import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SummaryApi from '../../common';
import './BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const response = await fetch(SummaryApi.BlogFetchByBlogId.url, {
          method: SummaryApi.BlogFetchByBlogId.method,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch blog details.');
        }

        // Handle author - could be string (email/id) or object
        const blogData = result.data;
        if (typeof blogData.author === 'string') {
          const authorStr = blogData.author;
          // If it's an email, take the part before '@' and format it as a name
          if (authorStr.includes('@')) {
            const namePart = authorStr.split('@')[0].replace(/[._]/g, ' ');
            blogData.authorName = namePart
              .split(' ')
              .filter(Boolean)
              .map(part => part.charAt(0).toUpperCase() + part.slice(1))
              .join(' ');
          } else {
            blogData.authorName = authorStr;
          }
        } else if (blogData.author && typeof blogData.author === 'object') {
          blogData.authorName = blogData.author.name || 'Anonymous';
        } else {
          blogData.authorName = 'Anonymous';
        }

        setBlog(blogData);
      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p className="loading-text">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-detail-page">
        <div className="error-container">
          <div className="error-content">
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/blog')} className="back-btn">
              Back to Blogs
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-detail-page">
        <div className="error-container">
          <div className="error-content">
            <h2>Blog not found</h2>
            <button onClick={() => navigate('/blog')} className="back-btn">
              Back to Blogs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      {/* Hero Section with Image */}
      <div className="blog-hero">
        <div className="blog-hero-overlay"></div>
        <img src={blog.image} alt={blog.title} className="blog-hero-image" />
        <div className="blog-hero-content">
          <div className="blog-categories">
            {Array.isArray(blog.category) ? (
              blog.category.map((cat, index) => (
                <span key={index} className="blog-category-tag">{cat}</span>
              ))
            ) : (
              <span className="blog-category-tag">{blog.category || 'All Categories'}</span>
            )}
          </div>
          <h1 className="blog-hero-title">{blog.title}</h1>
          <div className="blog-meta">
            <div className="blog-author-info">
              <div className="author-avatar">
                {blog.authorName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="author-details">
                <span className="author-name">{blog.authorName}</span>
                {blog.createdAt && (
                  <span className="blog-date">{formatDate(blog.createdAt)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="blog-content-wrapper">
        <article className="blog-article">
          <div 
            className="blog-content-body"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>

        {/* Back Button */}
        <div className="blog-actions">
          <button onClick={() => navigate('/blog')} className="back-to-blogs-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Blogs
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
