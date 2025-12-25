import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle API responses
api.interceptors.response.use(
  (response) => {
    // If the response has the ApiResponse wrapper, extract the data
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // Handle errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if (error.response) {
      // Server responded with error
      const errorMessage = error.response.data.message || 'An error occurred';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Request made but no response
      return Promise.reject(new Error('No response from server'));
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

// Authentication API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (userData) =>
    api.post('/auth/register', userData),
};

// Role API
export const roleAPI = {
  createRole: (roleData) =>
    api.post('/roles', roleData),

  getRole: (id) =>
    api.get(`/roles/${id}`),

  getAllRoles: () =>
    api.get('/roles'),

  updateRole: (id, roleData) =>
    api.put(`/roles/${id}`, roleData),

  deleteRole: (id) =>
    api.delete(`/roles/${id}`),

  assignPermissions: (roleId, permissionIds) =>
    api.post(`/roles/${roleId}/permissions`, { permissionIds }),
};

// Permission API
export const permissionAPI = {
  getAllPermissions: () =>
    api.get('/permissions'),

  getPermission: (id) =>
    api.get(`/permissions/${id}`),

  getPermissionsByGrouping: (grouping) =>
    api.get(`/permissions/grouping/${grouping}`),
};

// User Activity API
export const activityAPI = {
  getUserActivities: (userId, page = 0, size = 20) =>
    api.get(`/activities/user/${userId}?page=${page}&size=${size}`),

  getAllActivities: (page = 0, size = 20) =>
    api.get(`/activities?page=${page}&size=${size}`),

  getRecentActivities: (userId) =>
    api.get(`/activities/user/${userId}/recent`),
};

// Chat API
export const chatAPI = {
  sendMessage: (message, userId, conversationId = null, context = null) =>
    api.post('/chat', { message, userId, conversationId, context }),

  getChatHistory: (userId) =>
    api.get(`/chat/history/${userId}`),

  getChatMessage: (id) =>
    api.get(`/chat/messages/${id}`),

  getAllMessages: () =>
    api.get('/chat/messages'),

  getFailedMessages: () =>
    api.get('/chat/messages/failed'),
};

// Conversation API
export const conversationAPI = {
  createConversation: (userId, title) =>
    api.post('/conversations', { userId, title }),

  getUserConversations: (userId, archived = false, page = 0, size = 20) =>
    api.get(`/conversations/user/${userId}?archived=${archived}&page=${page}&size=${size}`),

  getConversation: (id, userId) =>
    api.get(`/conversations/${id}?userId=${userId}`),

  getConversationMessages: (conversationId, userId) =>
    api.get(`/conversations/${conversationId}/messages?userId=${userId}`),

  updateConversation: (id, userId, title) =>
    api.put(`/conversations/${id}?userId=${userId}`, { title }),

  archiveConversation: (id, userId) =>
    api.put(`/conversations/${id}/archive?userId=${userId}`),

  deleteConversation: (id, userId) =>
    api.delete(`/conversations/${id}?userId=${userId}`),
};

// User API
export const userAPI = {
  createUser: (userData) =>
    api.post('/users', userData),

  getUser: (id) =>
    api.get(`/users/${id}`),

  getUserByEmail: (email) =>
    api.get(`/users/email/${email}`),

  getAllUsers: () =>
    api.get('/users'),

  updateUser: (id, userData) =>
    api.put(`/users/${id}`, userData),

  deleteUser: (id) =>
    api.delete(`/users/${id}`),
};

// Lawyer API
export const lawyerAPI = {
  createLawyer: (lawyerData) =>
    api.post('/lawyers', lawyerData),

  getLawyer: (id) =>
    api.get(`/lawyers/${id}`),

  getAllLawyers: () =>
    api.get('/lawyers'),

  getLawyersByFirm: (firmId) =>
    api.get(`/lawyers/firm/${firmId}`),

  getVerifiedLawyers: () =>
    api.get('/lawyers/verified'),

  updateLawyer: (id, lawyerData) =>
    api.put(`/lawyers/${id}`, lawyerData),

  verifyLawyer: (id) =>
    api.patch(`/lawyers/${id}/verify`),

  deleteLawyer: (id) =>
    api.delete(`/lawyers/${id}`),
};

// Legal Firm API
export const legalFirmAPI = {
  createFirm: (firmData) =>
    api.post('/legal-firms', firmData),

  getFirm: (id) =>
    api.get(`/legal-firms/${id}`),

  getAllFirms: () =>
    api.get('/legal-firms'),

  getVerifiedFirms: () =>
    api.get('/legal-firms/verified'),

  updateFirm: (id, firmData) =>
    api.put(`/legal-firms/${id}`, firmData),

  verifyFirm: (id) =>
    api.patch(`/legal-firms/${id}/verify`),

  deleteFirm: (id) =>
    api.delete(`/legal-firms/${id}`),
};

// Blog API
export const blogAPI = {
  createPost: (postData) =>
    api.post('/blog-posts', postData),

  getPost: (id) =>
    api.get(`/blog-posts/${id}`),

  getAllPosts: () =>
    api.get('/blog-posts'),

  getPublishedPosts: () =>
    api.get('/blog-posts/published'),

  getPostsByCategory: (category) =>
    api.get(`/blog-posts/category/${category}`),

  // Paginated endpoints
  getPublishedPostsPaginated: (search = '', category = '', page = 0, size = 10) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);
    params.append('page', page);
    params.append('size', size);
    return api.get(`/blog-posts/published/paginated?${params.toString()}`);
  },

  getAllPostsPaginated: (search = '', page = 0, size = 10) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page);
    params.append('size', size);
    return api.get(`/blog-posts/all/paginated?${params.toString()}`);
  },

  updatePost: (id, postData) =>
    api.put(`/blog-posts/${id}`, postData),

  publishPost: (id) =>
    api.patch(`/blog-posts/${id}/publish`),

  unpublishPost: (id) =>
    api.patch(`/blog-posts/${id}/unpublish`),

  deletePost: (id) =>
    api.delete(`/blog-posts/${id}`),
};

// Bookmark API
export const bookmarkAPI = {
  addBookmark: (postId, userId, notes = '') =>
    api.post(`/bookmarks/${postId}?userId=${userId}&notes=${encodeURIComponent(notes)}`),

  removeBookmark: (postId, userId) =>
    api.delete(`/bookmarks/${postId}?userId=${userId}`),

  getUserBookmarks: (userId, page = 0, size = 10) =>
    api.get(`/bookmarks/user/${userId}?page=${page}&size=${size}`),

  isBookmarked: (postId, userId) =>
    api.get(`/bookmarks/check/${postId}?userId=${userId}`),
};

// Password Reset API
export const passwordResetAPI = {
  initiate: (email) =>
    api.post('/password-reset/initiate', { email }),

  confirm: (token, newPassword) =>
    api.post('/password-reset/confirm', { token, newPassword }),

  validateToken: (token) =>
    api.get(`/password-reset/validate/${token}`),
};

// Image Upload API
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteImage: (url) =>
    api.delete(`/upload/image?url=${encodeURIComponent(url)}`),
};

// Questions API
export const questionAPI = {
  createQuestion: (questionData) =>
    api.post('/questions', questionData),

  getQuestion: (id) =>
    api.get(`/questions/${id}`),

  getAllQuestions: () =>
    api.get('/questions'),

  getQuestionsByCategory: (category) =>
    api.get(`/questions/category/${category}`),

  getUnresolvedQuestions: () =>
    api.get('/questions/unresolved'),

  updateQuestion: (id, questionData) =>
    api.put(`/questions/${id}`, questionData),

  markAsResolved: (id, acceptedAnswerId) =>
    api.patch(`/questions/${id}/resolve?acceptedAnswerId=${acceptedAnswerId}`),

  deleteQuestion: (id) =>
    api.delete(`/questions/${id}`),
};

// Answers API
export const answerAPI = {
  createAnswer: (answerData) =>
    api.post('/answers', answerData),

  getAnswer: (id) =>
    api.get(`/answers/${id}`),

  getAnswersByQuestion: (questionId) =>
    api.get(`/answers/question/${questionId}`),

  updateAnswer: (id, content) =>
    api.put(`/answers/${id}`, content),

  acceptAnswer: (id) =>
    api.patch(`/answers/${id}/accept`),

  deleteAnswer: (id) =>
    api.delete(`/answers/${id}`),
};

// News API
export const newsAPI = {
  createNews: (newsData) =>
    api.post('/news-updates', newsData),

  getNews: (id) =>
    api.get(`/news-updates/${id}`),

  getAllNews: () =>
    api.get('/news-updates'),

  getPublishedNews: () =>
    api.get('/news-updates/published'),

  getNewsByCategory: (category) =>
    api.get(`/news-updates/category/${category}`),

  updateNews: (id, newsData) =>
    api.put(`/news-updates/${id}`, newsData),

  publishNews: (id) =>
    api.patch(`/news-updates/${id}/publish`),

  deleteNews: (id) =>
    api.delete(`/news-updates/${id}`),
};

// Document Template API
export const templateAPI = {
  createTemplate: (templateData) =>
    api.post('/document-templates', templateData),

  getTemplate: (id) =>
    api.get(`/document-templates/${id}`),

  getAllTemplates: () =>
    api.get('/document-templates'),

  getTemplatesByCategory: (category) =>
    api.get(`/document-templates/category/${category}`),

  getActiveTemplates: () =>
    api.get('/document-templates/active'),

  updateTemplate: (id, templateData) =>
    api.put(`/document-templates/${id}`, templateData),

  deactivateTemplate: (id) =>
    api.patch(`/document-templates/${id}/deactivate`),

  deleteTemplate: (id) =>
    api.delete(`/document-templates/${id}`),
};

// Document Generation API
export const documentAPI = {
  generateDocument: (generationData) =>
    api.post('/documents/generate', generationData),

  getDocument: (id) =>
    api.get(`/documents/${id}`),

  getDocumentsByUser: (userId) =>
    api.get(`/documents/user/${userId}`),

  getAllDocuments: () =>
    api.get('/documents'),

  deleteDocument: (id) =>
    api.delete(`/documents/${id}`),
};

export default api;
