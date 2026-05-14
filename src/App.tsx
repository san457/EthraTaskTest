import { Routes, Route } from "react-router-dom";
import AuthLayout from "./layout/AuthLayout";
import Start from "./pages/Start";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layout/DashboardLayout";

import ProjectsPage from "./pages/Projects";
import TasksPage from "./pages/Tasks";
import SettingsPage from "./pages/Settings";
import { useAppContext } from "./context/context";

function App() {
  const { user } = useAppContext();

  return (
    <>
     <Toaster />
      <Routes>
        <Route path="/" element={<AuthLayout />} >
          <Route index element={<Start />} />
          <Route path="auth/signup" element={<SignUp />} />
          <Route path="auth/login" element={<Login />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            {user?.role === 'ADMIN' || user?.isProjectAdmin ? <Route path="/analytics" element={<Analytics />} /> : null}
            <Route path="/settings" element={<SettingsPage />} />

          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App;

