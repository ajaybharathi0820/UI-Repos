import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
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
                <ManagePage />
              </ProtectedRoute>
            } />
            <Route path="/manage/polisher" element={
              <ProtectedRoute>
                <PolisherPage />
              </ProtectedRoute>
            } />
            <Route path="/manage/user" element={
              <ProtectedRoute>
                <UserPage />
              </ProtectedRoute>
            } />
            <Route path="/manage/bag-type" element={
              <ProtectedRoute>
                <BagTypePage />
              </ProtectedRoute>
            } />
            <Route path="/manage/items" element={
              <ProtectedRoute>
                <ItemsPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 3000,
              style: {
                background: 'white',
                color: 'black',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;