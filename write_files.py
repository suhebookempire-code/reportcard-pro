import os

files = {}

files["src/context/AuthContext.jsx"] = '''import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, signInAnonymously } from "firebase/auth";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [role, setRole] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const schoolCode = sessionStorage.getItem("schoolCode");
    if (schoolCode) {
      signInAnonymously(auth).catch(() => {});
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);

        let resolvedSchoolId = null;
        try {
          const userDocSnap = await getDoc(doc(db, "users", u.uid));
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setRole(userData.role || null);
            setMustChangePassword(!!userData.mustChangePassword);
            resolvedSchoolId = userData.schoolId || null;
          }
        } catch (e) {
          // fall through to legacy lookup below
        }

        if (resolvedSchoolId) {
          const schoolSnap = await getDoc(doc(db, "schools", resolvedSchoolId));
          if (schoolSnap.exists()) {
            const d = schoolSnap.data();
            sessionStorage.setItem("schoolName", d.name || "");
            sessionStorage.setItem("schoolId", resolvedSchoolId);
            setSchool({ id: resolvedSchoolId, ...d });
          }
        } else {
          const code = sessionStorage.getItem("schoolCode");
          if (code) {
            const q = query(collection(db, "schools"), where("code", "==", code));
            const snap = await getDocs(q);
            if (!snap.empty) { const d = snap.docs[0]; sessionStorage.setItem("schoolName", d.data().name || ""); sessionStorage.setItem("schoolId", d.id); setSchool({ id: d.id, ...d.data() }); }
          }
        }
      } else {
        setUser(null);
        setSchool(null);
        setRole(null);
        setMustChangePassword(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => { sessionStorage.removeItem("schoolCode"); sessionStorage.removeItem("schoolId"); sessionStorage.removeItem("schoolName"); return signOut(auth); };

  return (
    <AuthContext.Provider value={{ user, school, role, loading, mustChangePassword, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
'''

files["src/pages/ChangePassword.jsx"] = '''import { useState } from "react";
import { getAuth, updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export default function ChangePassword() {
  const { user, logout } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      const auth = getAuth();
      await updatePassword(auth.currentUser, newPassword);
      await updateDoc(doc(db, "users", user.uid), { mustChangePassword: false });
      window.location.assign("/");
    } catch (e) {
      setError("Error updating password: " + e.message + ". You may need to log out and back in, then try again.");
      setSaving(false);
    }
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0a0f1e,#0d1b3e,#0a1628)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"sans-serif"}}>
      <div style={{width:"100%",maxWidth:"400px"}}>
        <div style={{textAlign:"center",marginBottom:"24px"}}>
          <h1 style={{fontSize:"20px",fontWeight:"bold",color:"#fff",margin:"0 0 6px"}}>Set a New Password</h1>
          <p style={{color:"#94a3b8",fontSize:"13px",margin:0}}>Choisissej un nouveau mot de passe</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(234,179,8,0.15)",borderRadius:"20px",padding:"28px 24px"}}>
          {error && (
            <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"10px",padding:"12px",marginBottom:"16px",color:"#fca5a5",fontSize:"13px"}}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:"16px"}}>
              <label style={{display:"block",fontSize:"12px",color:"#94a3b8",marginBottom:"6px"}}>New Password</label>
              <input value={newPassword} onChange={e=>setNewPassword(e.target.value)} type="password" required style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#fff",fontSize:"14px",outline:"none",boxSizing:"border-box"}} />
            </div>
            <div style={{marginBottom:"24px"}}>
              <label style={{display:"block",fontSize:"12px",color:"#94a3b8",marginBottom:"6px"}}>Confirm New Password</label>
              <input value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} type="password" required style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#fff",fontSize:"14px",oux´line:"none",boxSizing:"border-box"}} />
            </div>
            <button type="submit" disabled={saving} style={{width:"100%",padding:"14px",background:saving?"#92400e":"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"10px",color:"#0a0f1e",fontWeight:"bold",fontSize:"15px",cursor:saving?"not-allowed":"pointer"}}>
              {saving?"Saving...":"Set Password & Continue"}
            </button>
          </form>
          <button onClick={logout} style={{width:"100%",marginTop:"14px",padding:"10px",background:"none",border:"none",color:"#64748b",fontSize:"12px",cursor:"pointer"}}>Log Out</button>
        </div>
      </div>
    </div>
  );
}
'''

# Patch App.jsx: add ChangePassword import, useLocation import, and mustChangePassword redirect logic
app_path = "src/App.jsx"
with open(app_path, "r") as f:
    app_src = f.read()

app_src = app_src.replace(
    'import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";',
    'import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";'
)
app_src = app_src.replace(
    'import Notifications from "./pages/Notifications";',
    'import Notifications from "./pages/Notifications";\nimport ChangePassword from "./pages/ChangePassword";'
)
app_src = app_src.replace(
    '''function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{color:"white",background:"#0a0f1e",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>Loading...</div>;
  const schoolCode = sessionStorage.getItem("schoolCode");
  if (!user && !schoolCode) return <Navigate to="/login" />;
  return children;
}''',
    '''function ProtectedRoute({ children }) {
  const { user, loading, mustChangePassword } = useAuth();
  const location = useLocation();
  if (loading) return <div style={{color:"white",background:"#0a0f1e",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>Loading...</div>;
  const schoolCode = sessionStorage.getItem("schoolCode");
  if (!user && !schoolCode) return <Navigate to="/login" />;
  if (mustChangePassword && location.pathname !== "/change-password") return <Navigate to="/change-password" />;
  return children;
}'''
)
app_src = app_src.replace(
    '<Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />',
    '<Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />\n          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />'
)

files[app_path] = app_src

# Patch Teachers.jsx: add mustChangePassword: true to the users/{uid} setDoc
teachers_path = "src/pages/Teachers.jsx"
with open(teachers_path, "r") as f:
    teachers_src = f.read()

teachers_src = teachers_src.replace(
    '''await setDoc(doc(db, "users", cred.user.uid), {
        role: "teacher",
        schoolId,
        teacherId: teacherRef.id,
        email: form.email,
        createdAt: serverTimestamp()
      });''',
    '''await setDoc(doc(db, "users", cred.user.uid), {
        role: "teacher",
        schoolId,
        teacherId: teacherRef.id,
        email: form.email,
        mustChangePassword: true,
        createdAt: serverTimestamp()
      });'''
)

files[teachers_path] = teachers_src

# Patch Login.jsx: neutral copy instead of "Administrator Sign In"
login_path = "src/pages/Login.jsx"
with open(login_path, "r") as f:
    login_src = f.read()

login_src = login_src.replace(
    '<h2 style={{fontSize:"16px",fontWeight:"bold",color:"#fff",margin:"0 0 20px"}}>Administrator Sign In</h2>',
    '<h2 style={{fontSize:"16px",fontWeight:"bold",color:"#fff",margin:"0 0 20px"}}>Sign In</h2>'
)

files[login_path] = login_src

for path, content in files.items():
    with open(path, "w") as f:
        f.write(content)
    print("Wrote", path)
