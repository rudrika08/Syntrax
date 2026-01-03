import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './CreateBlog.scss';
import { apiPost } from '../../utils/authUtils'; 

const categories = [
    'All Categories',
    'Tech & Programming',
    'Business & Finance',
    'Health & Fitness',
    'Travel & Adventure',
    'Lifestyle & Fashion',
    'Food & Cooking',
];

const CreateBlog = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await apiPost(`${import.meta.env.VITE_BACKEND_URI}/api/blogCreate`, {
                title,
                content,
                image,
                category: selectedCategory,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create blog');
            }

            toast.success('Blog created successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.message || 'Error creating blog');
        }
    };

    return (
        <div className="create-blog-container">
            {/* Background decorative elements */}
            <div className="bg-decoration bg-decoration-1"></div>
            <div className="bg-decoration bg-decoration-2"></div>
            <div className="bg-decoration bg-decoration-3"></div>
            
            <div className="create-blog-content">
                <div className="header-section">
                    <h1 className="main-title">Create New</h1>
                    <h2 className="sub-title">Blog</h2>
                    <p className="description">Share your thoughts and insights with the community</p>
                </div>

                <form onSubmit={handleSubmit} className="blog-form">
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label htmlFor="title">Article Title</label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter your blog title..."
                                required
                                className="input-field"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <div className="select-wrapper">
                                <select
                                    id="category"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="select-field"
                                >
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="image">Featured Image</label>
                            <input
                                id="image"
                                type="url"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                required
                                className="input-field"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="content">Content</label>
                            <div className="editor-wrapper">
                                <ReactQuill
                                    value={content}
                                    onChange={setContent}
                                    className="quill-editor"
                                    placeholder="Start writing your blog content here..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            <span>Publish Blog</span>
                            <div className="btn-glow"></div>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBlog;