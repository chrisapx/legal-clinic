import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { blogAPI } from '../../services/api';
import './Blog.css';

function AdminBlog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    loadPosts();
  }, [currentPage, searchTerm]);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogAPI.getAllPostsPaginated(searchTerm, currentPage, pageSize);
      setPosts(response.data?.content || []);
      setTotalPages(response.data?.totalPages || 0);
      setTotalElements(response.data?.totalElements || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handlePublish = async (id) => {
    try {
      await blogAPI.publishPost(id);
      await loadPosts();
    } catch (err) {
      alert('Error publishing post: ' + err.message);
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await blogAPI.unpublishPost(id);
      await loadPosts();
    } catch (err) {
      alert('Error unpublishing post: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      await blogAPI.deletePost(id);
      await loadPosts();
      setDeleteConfirm(null);
    } catch (err) {
      alert('Error deleting post: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading posts...</div>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Blog Posts</h1>
          <p className="page-subtitle">Manage your blog content</p>
        </div>
        <Link to="/admin/blog/new" className="btn-new">+ New Post</Link>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="search-container">
        <input
          type="text"
          placeholder="Search blog posts..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-value">{totalElements}</div>
          <div className="stat-label">Total {searchTerm ? 'Found' : 'Posts'}</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{posts.filter(p => p.published).length}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{posts.filter(p => !p.published).length}</div>
          <div className="stat-label">Drafts</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{posts.reduce((sum, p) => sum + (p.viewCount || 0), 0)}</div>
          <div className="stat-label">Views (Page)</div>
        </div>
      </div>

      {posts.length === 0 && !loading ? (
        <div className="empty-state-box">
          <p>No blog posts yet. Create your first post!</p>
          <Link to="/admin/blog/new" className="btn-new">Create Post</Link>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Views</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>
                    <Link to={`/blog/${post.id}`} className="table-link">
                      {post.title}
                    </Link>
                  </td>
                  <td>
                    <span className="badge badge-category">{post.category}</span>
                  </td>
                  <td>
                    <span className={`badge ${post.published ? 'badge-success' : 'badge-warning'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="text-muted">{post.viewCount || 0}</td>
                  <td className="text-muted">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/admin/blog/edit/${post.id}`} className="action-btn btn-edit">
                        Edit
                      </Link>
                      {!post.published ? (
                        <button onClick={() => handlePublish(post.id)} className="action-btn btn-publish">
                          Publish
                        </button>
                      ) : (
                        <button onClick={() => handleUnpublish(post.id)} className="action-btn btn-warning">
                          Unpublish
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(post.id)}
                        className={`action-btn btn-delete ${deleteConfirm === post.id ? 'confirm' : ''}`}
                      >
                        {deleteConfirm === post.id ? 'Confirm?' : 'Delete'}
                      </button>
                      {deleteConfirm === post.id && (
                        <button onClick={() => setDeleteConfirm(null)} className="action-btn btn-cancel">
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="btn-secondary"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                ← Previous
              </button>

              <span className="page-info">
                Page {currentPage + 1} of {totalPages} ({totalElements} total)
              </span>

              <button
                className="btn-secondary"
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminBlog;
