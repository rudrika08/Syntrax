import React, { useState, useEffect } from 'react';
import styles from './EditProfile.module.scss';
import SummaryApi from '../../../common';
import { apiGet, apiPut } from '../../../utils/authUtils';
import { toast } from 'react-toastify';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiGet(SummaryApi.current_user.url);
        const data = await response.json();
        
        if (data.success && data.user) {
          setFormData({
            name: data.user.username || '',
            email: data.user.email || '',
            bio: data.user.bio || '',
          });
          if (data.user.profilePicture) {
            setProfilePicturePreview(data.user.profilePicture);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setFormErrors(prev => ({ ...prev, profilePicture: 'File size must be less than 5MB' }));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, profilePicture: 'Please select a valid image file' }));
        return;
      }

      setProfilePicture(file);
      setFormErrors(prev => ({ ...prev, profilePicture: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
    setFormErrors(prev => ({ ...prev, profilePicture: '' }));
    // Clear file input
    const fileInput = document.getElementById('profilePicture');
    if (fileInput) fileInput.value = '';
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setSaving(true);
      try {
        const updateData = {
          username: formData.name,
          email: formData.email,
          bio: formData.bio,
        };

        // If there's a new profile picture (base64), include it
        if (profilePicture && profilePicturePreview) {
          updateData.profilePicture = profilePicturePreview;
        }

        const response = await apiPut(SummaryApi.updateProfile.url, updateData);
        const result = await response.json();

        if (result.success) {
          toast.success('Profile updated successfully!');
        } else {
          toast.error(result.message || 'Failed to update profile');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
      } finally {
        setSaving(false);
      }
    }
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

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Edit Profile</h1>
          <p className={styles.subtitle}>Update your personal information</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          {/* Profile Picture Section */}
          <div className={styles.profilePictureSection}>
            <div className={styles.profilePictureContainer}>
              <div className={styles.profilePictureWrapper}>
                {profilePicturePreview ? (
                  <img 
                    src={profilePicturePreview} 
                    alt="Profile preview" 
                    className={styles.profilePicturePreview}
                  />
                ) : (
                  <div className={styles.profilePicturePlaceholder}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
                
                {/* Camera Overlay - Bottom Right */}
                <div className={styles.cameraOverlay}>
                  <label htmlFor="profilePicture" className={styles.uploadLabel}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </label>
                  <input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className={styles.fileInput}
                  />
                </div>

                {/* Remove Button - Top Right (only when image exists) */}
                {profilePicturePreview && (
                  <button
                    type="button"
                    onClick={removeProfilePicture}
                    className={styles.removeButton}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <div className={styles.uploadInstructions}>
              <p>Upload a profile picture</p>
              <span>JPG, PNG or GIF (max. 5MB)</span>
            </div>
            {formErrors.profilePicture && (
              <p className={styles.errorMsg}>{formErrors.profilePicture}</p>
            )}
          </div>

          {/* Form Fields */}
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <input
                id="name"
                name="name"
                type="text"
                className={`${styles.input} ${formErrors.name ? styles.errorInput : ''}`}
                value={formData.name}
                onChange={handleChange}
                required
              />
              <label htmlFor="name" className={styles.floatingLabel}>Name</label>
              {formErrors.name && <p className={styles.errorMsg}>{formErrors.name}</p>}
            </div>

            <div className={styles.formGroup}>
              <input
                id="email"
                name="email"
                type="email"
                className={`${styles.input} ${formErrors.email ? styles.errorInput : ''}`}
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label htmlFor="email" className={styles.floatingLabel}>Email</label>
              {formErrors.email && <p className={styles.errorMsg}>{formErrors.email}</p>}
            </div>

            <div className={styles.formGroup}>
              <textarea
                id="bio"
                name="bio"
                rows="4"
                className={styles.textarea}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
              />
              <label htmlFor="bio" className={styles.floatingLabelTextarea}>Bio</label>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton} disabled={saving}>
              {saving ? (
                <>
                  <span className={styles.buttonSpinner}></span>
                  Saving...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17,21 17,13 7,13 7,21"/>
                    <polyline points="7,3 7,8 15,8"/>
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;