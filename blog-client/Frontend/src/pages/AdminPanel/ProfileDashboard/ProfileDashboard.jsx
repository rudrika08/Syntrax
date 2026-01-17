import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileDashboard.module.scss';
import SummaryApi from '../../../common';
import { apiGet } from '../../../utils/authUtils';

const ProfileDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user details
        const userResponse = await apiGet(SummaryApi.current_user.url);
        const userData = await userResponse.json();
        
        if (userData.success) {
          // The API returns 'user' not 'data'
          setUser(userData.user);
        } else {
          throw new Error(userData.message || 'Failed to fetch user details');
        }

        // Fetch user's blogs
        const blogsResponse = await apiGet(SummaryApi.BlogFetchById.url);
        const blogsData = await blogsResponse.json();
        
        if (blogsData.success) {
          setBlogs(blogsData.data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const truncateContent = (content, maxLength = 80) => {
    if (!content) return '';
    const strippedContent = content.replace(/<[^>]*>/g, '');
    if (strippedContent.length <= maxLength) return strippedContent;
    return strippedContent.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/login')} className={styles.loginBtn}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user.username} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
        
        <div className={styles.profileInfo}>
          <h1 className={styles.username}>{user?.username || 'User'}</h1>
          <p className={styles.email}>{user?.email }</p>
          <p className={styles.memberSince}>
            Member since {formatDate(user?.createdAt)}
          </p>
        </div>

        <div className={styles.profileStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{blogs.length}</span>
            <span className={styles.statLabel}>Blogs Posted</span>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className={styles.bioSection}>
        <h2 className={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          About Me
        </h2>
        <div className={styles.bioContent}>
          {user?.bio ? (
            <p>{user.bio}</p>
          ) : (
            <p className={styles.noBio}>No bio added yet. Edit your profile to add a bio.</p>
          )}
        </div>
      </div>

      {/* Blogs Section */}
      <div className={styles.blogsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            My Blogs
          </h2>
          <span className={styles.blogCount}>{blogs.length} posts</span>
        </div>

        {blogs.length === 0 ? (
          <div className={styles.emptyBlogs}>
            <div className={styles.emptyIcon}>📝</div>
            <h3>No blogs yet</h3>
            <p>Start sharing your thoughts with the world!</p>
            <button onClick={() => navigate('/blogCreate')} className={styles.createBtn}>
              Create Your First Blog
            </button>
          </div>
        ) : (
          <div className={styles.blogsList}>
            {blogs.map((blog, index) => (
              <div key={blog._id} className={styles.blogItem}>
                <div className={styles.blogImage}>
                  {blog.image ? (
                    <img src={blog.image} alt={blog.title} />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className={styles.blogDetails}>
                  <h3 className={styles.blogTitle}>{blog.title}</h3>
                  <p className={styles.blogPreview}>{truncateContent(blog.content)}</p>
                  <div className={styles.blogMeta}>
                    <span className={styles.blogDate}>{formatDate(blog.createdAt)}</span>
                    {blog.category && (
                      <span className={styles.blogCategory}>
                        {Array.isArray(blog.category) ? blog.category[0] : blog.category}
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  className={styles.viewBtn}
                  onClick={() => navigate(`/blog/${blog._id}`)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDashboard;
