import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AdminLayout from './components/admin/AdminLayout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import UserProfile from './components/user/UserProfile';
import Chat from './components/Chat';
import BlogList from './components/blog/BlogList';
import BlogPost from './components/blog/BlogPost';
import AdminBlog from './components/blog/AdminBlog';
import BlogForm from './components/blog/BlogForm';
import UserManagement from './components/admin/UserManagement';
import Dashboard from './components/admin/Dashboard';
import './styles/design-system.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes (No Navbar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Public Routes (With Navbar) */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Navigate to="/blog" replace />
              </>
            }
          />
          <Route
            path="/blog"
            element={
              <>
                <Navbar />
                <BlogList />
              </>
            }
          />
          <Route
            path="/blog/:id"
            element={
              <>
                <Navbar />
                <BlogPost />
              </>
            }
          />
          <Route
            path="/chat"
            element={
              <>
                <Navbar />
                <Chat />
              </>
            }
          />

          {/* Protected User Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['USER', 'SUPER_ADMIN']}>
                <Navbar />
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/blog" element={<AdminBlog />} />
                    <Route path="/blog/new" element={<BlogForm />} />
                    <Route path="/blog/edit/:id" element={<BlogForm />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/lawyers" element={<div>Lawyer Management</div>} />
                    <Route path="/firms" element={<div>Firm Management</div>} />
                    <Route path="/documents" element={<div>Documents</div>} />
                    <Route path="/questions" element={<div>Q&A Forum</div>} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Unauthorized */}
          <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
