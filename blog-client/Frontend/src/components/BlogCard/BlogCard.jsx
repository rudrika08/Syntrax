import React, { useState, useRef } from 'react';
import './BlogCard.css';
import { useNavigate } from 'react-router-dom';

const BlogCard = ({ blog, viewMode = 'grid' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'No date';
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content ? content.split(' ').length : 100;
    const readTime = Math.ceil(words / wordsPerMinute);
    return readTime < 1 ? 1 : readTime;
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    
    const postDate = new Date(dateString);
    if (isNaN(postDate.getTime())) return 'Recently';
    
    const now = new Date();
    const diffTime = Math.abs(now - postDate);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  const handleCardClick = () => {
    // Add navigation logic here
    console.log('Navigate to blog:', blog.id);
  };

  const navigate = useNavigate();
  return (
    <article
      className={`blog-card ${viewMode} ${isHovered ? 'hovered' : ''}`}
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="blog-card-content">
        {/* Enhanced Image Section */}
        <div className="blog-card-image-container">
          {blog.image && !imageError ? (
            <div className="blog-card-image">
              <img
                src={blog.image}
                alt={blog.title}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={imageLoaded ? 'loaded' : ''}
              />
              <div className="blog-card-overlay"></div>
              <div className="image-shine"></div>

              {/* Category Badge */}
              {blog.category && (
                <div className="category-badge">
                  <span>{blog.category}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="blog-card-placeholder">
              <div className="placeholder-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21,15 16,10 5,21" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="blog-card-body">
          {/* Enhanced Meta Information */}
          <div className="blog-card-meta">
            <div className="meta-left">
              <span className="blog-date">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formatDate(blog.createdAt)}
              </span>
            </div>

            <div className="meta-right">
              {blog.featured && (
                <span className="featured-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                  Featured
                </span>
              )}
            </div>
          </div>

          {/* Enhanced Title */}
          <h3 className="blog-card-title">
            <span className="title-text">{truncateText(blog.title, 30)}</span>
            <div className="title-underline"></div>
          </h3>

          {/* One-liner Description from content */}
          <p className="blog-card-description">
            {truncateText(blog.description || (blog.content ? blog.content.replace(/<[^>]*>/g, '') : ''), 80)}
          </p>

          {/* Enhanced Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="blog-card-tags">
              {blog.tags.slice(0, viewMode === 'list' ? 5 : 3).map((tag, index) => (
                <span key={index} className="blog-tag">
                  <span className="tag-hash">#</span>
                  {tag}
                </span>
              ))}
              {blog.tags.length > (viewMode === 'list' ? 5 : 3) && (
                <span className="blog-tag more-tags">
                  +{blog.tags.length - (viewMode === 'list' ? 5 : 3)}
                </span>
              )}
            </div>
          )}

          {/* Enhanced Footer */}
          <div className="blog-card-footer">
            <div className="blog-author">
              {blog.author ? (
                <>
                  <div className="author-avatar-container">
                    {(typeof blog.author === 'object' ? blog.author.avatar : null) ? (
                      <img
                        src={blog.author.avatar}
                        alt={typeof blog.author === 'object' ? blog.author.name : blog.author}
                        className="author-avatar"
                      />
                    ) : (
                      <div className="author-avatar-placeholder">
                        {(typeof blog.author === 'object' ? blog.author.name : blog.author)?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    )}
                    <div className="author-status"></div>
                  </div>
                  <div className="author-info">
                    <span className="author-name">
                      {typeof blog.author === 'object' ? blog.author.name : blog.author || 'Anonymous'}
                    </span>
                    {typeof blog.author === 'object' && blog.author.role && (
                      <span className="author-role">
                        {blog.author.role}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="author-placeholder">
                  <div className="author-avatar-placeholder">A</div>
                  <span className="author-name">Anonymous</span>
                </div>
              )}
            </div>

            {/* Enhanced Read More Button */}
            <button
              className="read-more-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/blog/${blog._id}`);
              }}
            >
              <span className="btn-text">Read Article</span>
              <div className="btn-icon">
                <svg
                  className="arrow-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
              <div className="btn-bg"></div>
            </button>

          </div>

          {/* Engagement Stats */}
          {(blog.likes || blog.comments || blog.views) && (
            <div className="blog-card-stats">
              {blog.views && (
                <div className="stat-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>{blog.views}</span>
                </div>
              )}

              {blog.likes && (
                <div className="stat-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span>{blog.likes}</span>
                </div>
              )}

              {blog.comments && (
                <div className="stat-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>{blog.comments}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Glow Effects */}
      <div className="blog-card-glow"></div>
      <div className="blog-card-border-glow"></div>

      {/* Loading Skeleton for Image */}
      {blog.image && !imageLoaded && !imageError && (
        <div className="image-skeleton">
          <div className="skeleton-shimmer"></div>
        </div>
      )}
    </article>
  );
};

export default BlogCard;