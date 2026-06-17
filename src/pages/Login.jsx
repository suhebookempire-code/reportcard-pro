import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch(err) {
      setError("Invalid email or password. Contact your administrator.");
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0a0f1e,#0d1b3e,#0a1628)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"sans-serif"}}>
      <div style={{width:"100%",maxWidth:"400px"}}>
        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"80px",height:"80px",background:"linear-gradient(135deg,#eab308,#ca8a04)",borderRadius:"20px",marginBottom:"14px",boxShadow:"0 0 40px rgba(234,179,8,0.3)"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"18px",fontWeight:"900",color:"#0a0f1e",lineHeight:"1"}}>SUE</div>
              <div style={{fontSize:"18px",fontWeight:"900",color:"#0a0f1e",lineHeight:"1"}}>BEM</div>
            </div>
          </div>
          <h1 style={{fontSize:"26px",fontWeight:"bold",color:"#fff",margin:"0 0 4px",letterSpacing:"2px"}}>SUEBEM</h1>
          <p style={{color:"#94a3b8",fontSize:"13px",margin:"0 0 2px"}}>School Report Management System</p>
          <p style={{color:"#eab308",fontSize:"11px",margin:0,fontStyle:"italic"}}>Powered by Suh Ebook Empire</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(234,179,8,0.15)",borderRadius:"20px",padding:"28px 24px"}}>
          <h2 style={{fontSize:"16px",fontWeight:"bold",color:"#fff",margin:"0 0 20px"}}>Administrator Sign In</h2>
          {error && (
            <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"10px",padding:"12px",marginBottom:"16px",color:"#fca5a5",fontSize:"13px",display:"flex",gap:"8px",alignItems:"flex-start"}}>
              <span>⚠️</span><span>{error}</span>
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div style={{marginBottom:"16px"}}>
              <label style={{display:"block",fontSize:"12px",color:"#94a3b8",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"1px"}}>Email Address</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="your@email.com" required style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#fff",fontSize:"14px",outline:"none",boxSizing:"border-box"}} />
            </div>
            <div style={{marginBottom:"24px"}}>
              <label style={{display:"block",fontSize:"12px",color:"#94a3b8",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"1px"}}>Password</label>
              <div style={{position:"relative"}}>
                <input value={password} onChange={e=>setPassword(e.target.value)} type={showPass?"text":"password"} placeholder="Enter password" required style={{width:"100%",padding:"12px 44px 12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#fff",fontSize:"14px",outline:"none",boxSizing:"border-box"}} />
                <button type="button" onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:"16px",padding:"0"}}>{showPass?"🙈":"👁️"}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{width:"100%",padding:"14px",background:loading?"#92400e":"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"10px",color:"#0a0f1e",fontWeight:"bold",fontSize:"15px",cursor:loading?"not-allowed":"pointer",letterSpacing:"0.5px"}}>
              {loading?"Signing in...":"Sign In →"}
            </button>
          </form>
          <div style={{marginTop:"20px",padding:"14px",background:"rgba(255,255,255,0.02)",borderRadius:"10px",textAlign:"center"}}>
            <p style={{fontSize:"12px",color:"#475569",margin:"0 0 4px"}}>Don't have access?</p>
            <p style={{fontSize:"12px",color:"#64748b",margin:0}}>Contact your school administrator or visit <span style={{color:"#eab308"}}>suebem.vercel.app/master</span></p>
          </div>
        </div>
        <p style={{textAlign:"center",fontSize:"10px",color:"#1e293b",marginTop:"16px"}}>© 2026 SUEBEM — Suh Ebook Empire. All rights reserved.</p>
      </div>
    </div>
  );
}
