import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';
import { HomePage } from './pages/home/HomePage';
import AssignmentDetailsPage from './pages/assignments/AssignmentDetailsPage';
import NewAssignmentPage from './pages/assignments/NewAssignmentPage';
import { ManagePage } from './pages/manage/ManagePage';
import { PolisherPage } from './pages/manage/PolisherPage';
import { UserPage } from './pages/manage/UserPage';
import { BagTypePage } from './pages/manage/BagTypePage';
import { ItemsPage } from './pages/manage/ItemsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/assignments/new" element={
              <ProtectedRoute>
                <NewAssignmentPage />
              </ProtectedRoute>
            } />
            <Route path="/assignments/:id" element={
              <ProtectedRoute>
                <AssignmentDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            } />
            <Route path="/manage" element={
              <ProtectedRoute>
                <AdminRoute>
                  <ManagePage />
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/manage/polisher" element={
              <ProtectedRoute>
                <AdminRoute>
                  <PolisherPage />
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/manage/user" element={
              <ProtectedRoute>
                <AdminRoute>
                  <UserPage />
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/manage/bag-type" element={
              <ProtectedRoute>
                <AdminRoute>
                  <BagTypePage />
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/manage/items" element={
              <ProtectedRoute>
                <AdminRoute>
                  <ItemsPage />
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster 
            position="top-right" 
            richColors
            expand
            closeButton
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
              },
              classNames: {
                success: 'bg-green-50 text-green-800 border-green-200',
                error: 'bg-red-50 text-red-800 border-red-200',
                warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                info: 'bg-blue-50 text-blue-800 border-blue-200',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;