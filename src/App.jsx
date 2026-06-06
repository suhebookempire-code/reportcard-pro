import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddStudent from "./pages/AddStudent";
import EnterScores from "./pages/EnterScores";
import ReportCard from "./pages/ReportCard";
import MasterAdmin from "./pages/MasterAdmin";
import TeacherPortal from "./pages/TeacherPortal";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import ClassList from "./pages/ClassList";
import SchoolEntry from "./pages/SchoolEntry";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{color:"white",background:"#0a0f1e",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/master" element={<MasterAdmin />} />
          <Route path="/school/:code" element={<SchoolEntry />} />
          <Route path="/teacher/:token" element={<TeacherPortal />} />
          <Route path="/class/:token" element={<ClassList />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/add-student" element={<ProtectedRoute><AddStudent /></ProtectedRoute>} />
          <Route path="/enter-scores/:id" element={<ProtectedRoute><EnterScores /></ProtectedRoute>} />
          <Route path="/report/:id" element={<ProtectedRoute><ReportCard /></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
