import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UiProvider } from './context/UiContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import FortDetailsPage from './pages/FortDetailsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UserDashboardPage from './pages/dashboard/UserDashboardPage';
import AdminDashboardPage from './pages/dashboard/AdminDashboardPage';
import ProtectedRoute from './components/routing/ProtectedRoute';
import SimpleInfoPage from './pages/SimpleInfoPage';

function App() {
  return (
    <AuthProvider>
      <UiProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<SimpleInfoPage type="explore" />} />
              <Route path="/plan-trip" element={<SimpleInfoPage type="plan" />} />
              <Route path="/group-tours" element={<SimpleInfoPage type="group" />} />
              <Route path="/contact" element={<SimpleInfoPage type="contact" />} />
              <Route path="/fort/:slug" element={<FortDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </BrowserRouter>
      </UiProvider>
    </AuthProvider>
  );
}

export default App;
