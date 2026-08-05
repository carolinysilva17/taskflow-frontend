import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/shared/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import CategoriesPage from './pages/categories/CategoriesPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import LoginPage from './pages/login/LoginPage'
import NotFoundPage from './pages/not-found/NotFoundPage'
import RegisterPage from './pages/register/RegisterPage'
import TasksPage from './pages/tasks/TasksPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
