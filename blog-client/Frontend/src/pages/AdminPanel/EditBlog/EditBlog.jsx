import React, { useEffect, useState, useContext } from 'react';
import SummaryApi from '../../../common';
import './EditBlog.scss';
import { toast } from 'react-toastify';
import { Link, Outlet } from 'react-router-dom';
import { BlogContext } from '../../../context/BlogContext';
import Modal from 'react-modal';
import UpdateBlog from '../UpdateBlog/UpdateBlog';
import { apiGet, apiDelete } from '../../../utils/authUtils';

// Set the app element for accessibility (add this line)
Modal.setAppElement('#root');

const EditBlog = () => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentBlogId, setCurrentBlogId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPosts, setSelectedPosts] = useState(new Set());

    const fetchBlog = async () => {
        setLoading(true);
        try {
            const response = await apiGet(SummaryApi.BlogFetchById.url);

            if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
            const data = await response.json();
            setPosts(data.data);
        } catch (error) {
            setError(error.message);
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBlog(); }, []);

    const handleDelete = async (id) => {
        try {
            const response = await apiDelete(SummaryApi.BlogDelete.url, { id });

            if (!response.ok) throw new Error('Network response was not ok');

            await response.json();
            fetchBlog();
            toast.success('Blog post deleted successfully');
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Failed to delete the blog post');
        }
    };

    const handleEdit = (id) => {
        console.log('Opening modal for blog ID:', id); // Debug log
        setCurrentBlogId(id);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        console.log('Closing modal'); // Debug log
        setModalIsOpen(false);
        setCurrentBlogId(null);
    };

    const handleBulkDelete = async () => {
        if (selectedPosts.size === 0) return toast.warning('Please select posts to delete');
        if (!window.confirm(`Are you sure you want to delete ${selectedPosts.size} posts?`)) return;

        try {
            const deletePromises = Array.from(selectedPosts).map(id =>
                apiDelete(SummaryApi.BlogDelete.url, { id })
            );

            await Promise.all(deletePromises);
            setSelectedPosts(new Set());
            fetchBlog();
            toast.success(`${selectedPosts.size} posts deleted successfully`);
        } catch (error) {
            console.error('Error deleting posts:', error);
            toast.error('Failed to delete some posts');
        }
    };

    const togglePostSelection = (postId) => {
        const newSelected = new Set(selectedPosts);
        newSelected.has(postId) ? newSelected.delete(postId) : newSelected.add(postId);
        setSelectedPosts(newSelected);
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const truncateContent = (content, maxLength = 150) => {
        if (!content) return '';
        return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loadingSpinner">
                    <div className="spinner"></div>
                    <p>Loading your blogs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <BlogContext.Provider value={{ fetchBlog }}>
                <div className="header">
                    <div className="headerContent">
                        <h1 className="titleh1"><span className="titleIcon"></span>Manage Your Blogs</h1>
                        <p className="subtitle">Edit, delete, and organize your blog posts</p>
                    </div>
                </div>

                <div className="controls">
                    <div className="searchContainer">
                        <input
                            type="text"
                            placeholder="Search blogs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="searchInput"
                        />
                        <span className="searchIcon">🔍</span>
                    </div>

                    {selectedPosts.size > 0 && (
                        <div className="bulkActions">
                            <span className="selectedCount">{selectedPosts.size} selected</span>
                            <button className="bulkDeleteButton" onClick={handleBulkDelete}>
                                Delete Selected
                            </button>
                        </div>
                    )}
                </div>

                {error && <div className="errorContainer"><p className="error"> {error}</p></div>}

                <div className="blogGrid">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post, index) => (
                            <div
                                className={`blogCard ${selectedPosts.has(post._id) ? 'selected' : ''}`}
                                key={post._id || index}
                            >
                                <div className="cardHeader">
                                    <input
                                        type="checkbox"
                                        className="selectCheckbox"
                                        checked={selectedPosts.has(post._id)}
                                        onChange={() => togglePostSelection(post._id)}
                                    />
                                    <div className="cardMeta">
                                        <span className="publishDate">{formatDate(post.createdAt || post.publishDate)}</span>
                                    </div>
                                </div>
                                

                                {post.image && (
                                    <div className="imageContainer">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="blogImage"
                                            loading="lazy"
                                        />
                                        <div className="imageOverlay"></div>
                                    </div>
                                )}

                                <div className="cardContent">
                                    <h3 className="blogTitle">{post.title}</h3>
                                    {post.content && (
                                        <p className="blogExcerpt">{truncateContent(post.content)}</p>
                                    )}
                                </div>

                                <div className="cardActions">
                                    <button
                                        className="editButton"
                                        onClick={() => handleEdit(post._id)}
                                        title="Edit blog post"
                                    >
                                        <span className="buttonIcon"></span> Edit
                                    </button>
                                    <button
                                        className="deleteButton"
                                        onClick={() => handleDelete(post._id)}
                                        title="Delete blog post"
                                    >
                                        <span className="buttonIcon"></span> Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="emptyState">
                           
                            <h3>No blog posts found</h3>
                            <p>{searchTerm ? `No blogs match "${searchTerm}".` : "You haven't created any blog posts yet. Start writing your first blog!"}</p>
                        </div>
                    )}
                </div>

                <Outlet />

                {/* Updated Modal with better configuration */}
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Update Blog"
                    className={{
                        base: 'modal-content',
                        afterOpen: 'modal-content--after-open',
                        beforeClose: 'modal-content--before-close'
                    }}
                    overlayClassName={{
                        base: 'modal-overlay',
                        afterOpen: 'modal-overlay--after-open',
                        beforeClose: 'modal-overlay--before-close'
                    }}
                    closeTimeoutMS={300}
                    shouldCloseOnOverlayClick={true}
                    shouldCloseOnEsc={true}
                >
                    {currentBlogId && (
                        <UpdateBlog 
                            blogId={currentBlogId} 
                            onClose={closeModal} 
                        />
                    )}
                </Modal>
            </BlogContext.Provider>
        </div>
    );
};

export default EditBlog;