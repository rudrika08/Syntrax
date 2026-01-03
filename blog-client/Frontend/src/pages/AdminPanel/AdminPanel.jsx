import React, { useEffect, useState, useContext } from 'react';
import SummaryApi from '../../common';
import styles from './AdminPanel.module.scss';
import { toast } from 'react-toastify'; 
import { Link, Outlet } from 'react-router-dom';
import { BlogContext } from './../../context/BlogContext';
import Modal from 'react-modal'; // Import react-modal
import UpdateBlog from './UpdateBlog/UpdateBlog'; // Import UpdateBlog
import { apiGet, apiDelete } from '../../utils/authUtils';

const AdminPanel = () => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentBlogId, setCurrentBlogId] = useState(null); // Store the selected blog ID for editing

    const fetchBlog = async () => {
        try {
            const response = await apiGet(SummaryApi.BlogFetchById.url);

            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }

            const data = await response.json();
            setPosts(data.data);
        } catch (error) {
            setError(error.message);
            console.error('Error fetching posts:', error);
        }
    };

    useEffect(() => {
        fetchBlog();
    }, []);

    const handleDelete = async (id) => {
        try {
            const response = await apiDelete(SummaryApi.BlogDelete.url, { id });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            fetchBlog();
            toast.success('Blog post deleted successfully');
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Failed to delete the blog post');
        }
    };

    const handleEdit = (id) => {
        setCurrentBlogId(id); // Set the selected blog ID
        setModalIsOpen(true); // Open the modal
    };

    return (
        <div>
            <h2>Admin Panel</h2>
            <BlogContext.Provider value={{ fetchBlog }}> 
                <div className={styles.adminPanel}>
                    <div className={styles.adminPanelList}>
                        {error && <p className={styles.error}>{error}</p>}
                        {posts.length > 0 ? (
                            posts.map((post, index) => (
                                <div className={styles.adminPanelItem} key={post.id || index}>
                                    <h3>{post.title}</h3>

                                    {/* Button div moved below the title and over the image */}
                                    <div className={styles.buttonContainer}>
                                        <button 
                                            className={styles.editButton} 
                                            onClick={() => handleEdit(post._id)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className={styles.deleteButton} 
                                            onClick={() => handleDelete(post._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    {post.image && <img src={post.image} alt={post.title} className={styles.blogImage} />}
                                    <p>{post.content}</p>
                                </div>
                            ))
                        ) : (
                            <p>No blog posts available.</p>
                        )}
                    </div>
                    
                    <Outlet /> 

                    {/* Modal for updating blog */}
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={() => setModalIsOpen(false)}
                        contentLabel="Update Blog"
                        className={styles.modal}
                        overlayClassName={styles.overlay}
                    >
                        <UpdateBlog blogId={currentBlogId} onClose={() => setModalIsOpen(false)} /> 
                    </Modal>
                </div>
            </BlogContext.Provider>
        </div>
    );
};

export default AdminPanel;
