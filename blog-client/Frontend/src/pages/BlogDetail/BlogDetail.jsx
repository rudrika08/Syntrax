import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SummaryApi from '../../common';
import { apiGet } from '../../utils/authUtils';
import './BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const response = await apiGet(`${SummaryApi.BlogFetchById.url}/${id}`);

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch blog details.');
        }

        setBlog(result.data);
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
    return <div className="blog-detail-loading">Loading blog...</div>;
  }

  if (error) {
    return <div className="blog-detail-error">Error: {error}</div>;
  }

  if (!blog) {
    return <div className="blog-detail-error">No blog data found.</div>;
  }

  return (
    <div className="blog-detail-container">
      <div className="blog-detail-hero">
        <img src={blog.image} alt={blog.title} className="blog-detail-image" />
      </div>

      <div className="blog-detail-content">
        <h1 className="blog-detail-title">{blog.title}</h1>
        
        <p className="blog-detail-category">
          Category: {Array.isArray(blog.category) ? blog.category.join(', ') : 'All Categories'}
        </p>
        
        <p className="blog-detail-author">By: {blog.author}</p>

        <div className="blog-detail-body">
  {(blog.content || '')
    .split('\n')
    .map((para, index) => (
      <p key={index}>{para}</p>
    ))}
</div>
      </div>
    </div>
  );
};

export default BlogDetail;
