import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { blogAPI, uploadAPI } from '../../services/api';
import './Blog.css';

function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    tags: '',
    imageUrl: '',
    authorId: 1, // Default author ID
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    try {
      const response = await blogAPI.getPost(id);
      const post = response.data;
      setFormData({
        title: post.title,
        content: post.content,
        summary: post.summary || '',
        category: post.category,
        tags: post.tags || '',
        imageUrl: post.imageUrl || '',
        authorId: post.authorId,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      setFormData(prev => ({
        ...prev,
        imageUrl: response.data
      }));
    } catch (err) {
      alert('Failed to upload image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (formData.imageUrl) {
      try {
        await uploadAPI.deleteImage(formData.imageUrl);
      } catch (err) {
        console.error('Failed to delete image:', err);
      }
      setFormData(prev => ({
        ...prev,
        imageUrl: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await blogAPI.updatePost(id, formData);
      } else {
        await blogAPI.createPost(formData);
      }
      navigate('/admin/blog');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndPublish = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let postId = id;
      if (isEditing) {
        await blogAPI.updatePost(id, formData);
      } else {
        const response = await blogAPI.createPost(formData);
        postId = response.data.id;
      }
      await blogAPI.publishPost(postId);
      navigate('/admin/blog');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>{isEditing ? 'Edit Post' : 'New Post'}</h1>
          <p className="page-subtitle">
            {isEditing ? 'Update your blog post' : 'Create a new blog post'}
          </p>
        </div>
        <Link to="/admin/blog" className="action-btn btn-cancel">← Back</Link>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <form onSubmit={handleSubmit} className="modern-form">
        <div className="form-grid">
          <div className="form-field full-width">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter post title"
              className="input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="e.g., Legal Advice"
              className="input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="comma, separated, tags"
              className="input"
            />
          </div>

          <div className="form-field full-width">
            <label htmlFor="image">Featured Image</label>
            {formData.imageUrl ? (
              <div className="image-preview-container">
                <img src={formData.imageUrl} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="btn-remove-image"
                >
                  ✕ Remove Image
                </button>
              </div>
            ) : (
              <div className="file-upload-container">
                <label htmlFor="image" className="file-upload-label">
                  {uploadingImage ? (
                    <span>📤 Uploading...</span>
                  ) : (
                    <>
                      <span>📁 Choose Image</span>
                      <span className="file-upload-hint">PNG, JPG, GIF or WebP (Max 5MB)</span>
                    </>
                  )}
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="file-input"
                />
              </div>
            )}
          </div>

          <div className="form-field full-width">
            <label htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Brief summary (optional)"
              className="textarea"
              rows="2"
            />
          </div>

          <div className="form-field full-width">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              placeholder="Write your blog post content..."
              className="textarea"
              rows="12"
            />
          </div>
        </div>

        <div className="form-footer">
          <button type="submit" className="action-btn btn-cancel" disabled={loading}>
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={handleSaveAndPublish}
            className="btn-new"
            disabled={loading}
          >
            {loading ? 'Publishing...' : isEditing ? 'Update & Publish' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BlogForm;
