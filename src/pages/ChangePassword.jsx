import { useState } from "react";
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
          <p style={{color:"#94a3b8",fontSize:"13px",margin:0}}>Choisissez un nouveau mot de passe</p>
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
              <input value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} type="password" required style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#fff",fontSize:"14px",outline:"none",boxSizing:"border-box"}} />
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
