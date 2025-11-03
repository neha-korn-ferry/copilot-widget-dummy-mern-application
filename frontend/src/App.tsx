import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { DirectLineTokenProvider } from './context/DirectLineTokenContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SignInPage } from './pages/SignInPage';
import { DashboardPage } from './pages/DashboardPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <DirectLineTokenProvider>
        <div className="app-shell">
          <main className="content">
            <Routes>
              <Route path="/" element={<SignInPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </DirectLineTokenProvider>
    </BrowserRouter>
  );
};

export default App;
