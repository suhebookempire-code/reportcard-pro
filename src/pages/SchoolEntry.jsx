import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

export default function SchoolEntry() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    const load = async () => {
      const q = query(collection(db, "schools"), where("code", "==", code));
      const snap = await getDocs(q);
      if (snap.empty) { setError("School not found."); setLoading(false); return; }
      const s = { id: snap.docs[0].id, ...snap.docs[0].data() };
      if (!s.active) { setError("This school account is inactive."); setLoading(false); return; }
      setSchool(s);
      setLoading(false);
    };
    load();
  }, [code]);

  const handleLogin = async () => {
    if (!email || !password) { setError("Enter email and password."); return; }
    setSigning(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("schoolCode", code);
      navigate("/");
    } catch(e) {
      setError("Invalid email or password.");
    }
    setSigning(false);
  };

  if (loading) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Loading...</div>;
  if (error && !school) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444",padding:"20px",textAlign:"center"}}>{error}</div>;

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0a0f1e,#0d1b3e)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div style={{width:"100%",maxWidth:"400px"}}>
        <div style={{textAlign:"center",marginBottom:"24px"}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"64px",height:"64px",background:"linear-gradient(135deg,#eab308,#ca8a04)",borderRadius:"16px",marginBottom:"12px"}}>
            <span style={{fontSize:"24px",fontWeight:"bold",color:"#0a0f1e"}}>RC</span>
          </div>
          <h1 style={{color:"#fff",fontSize:"20px",margin:"0 0 4px",fontWeight:"bold"}}>{school.name}</h1>
          <p style={{color:"#64748b",fontSize:"12px",margin:"0 0 2px"}}>{school.location}</p>
          <p style={{color:"#eab308",fontSize:"11px",margin:0}}>ReportCard Pro — Suh Ebook Empire</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:"16px",padding:"28px"}}>
          <h2 style={{color:"#fff",fontSize:"16px",margin:"0 0 20px"}}>Admin Login</h2>
          {error && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"8px",padding:"10px",marginBottom:"16px",color:"#fca5a5",fontSize:"13px"}}>{error}</div>}
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email Address" style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"14px",outline:"none",boxSizing:"border-box",marginBottom:"12px"}} />
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" onKeyDown={e=>{ if(e.key==="Enter") handleLogin(); }} style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"14px",outline:"none",boxSizing:"border-box",marginBottom:"16px"}} />
          <button onClick={handleLogin} disabled={signing} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:"pointer"}}>
            {signing?"Signing in...":"Sign In"}
          </button>
        </div>
        <p style={{textAlign:"center",fontSize:"10px",color:"#334155",marginTop:"16px"}}>ReportCard Pro — Powered by Suh Ebook Empire</p>
      </div>
    </div>
  );
}

  const handleLogin = async () => {
    if (!email || !password) { setError("Enter email and password."); return; }
    setSigning(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("schoolCode", code);
      navigate("/");
    } catch(e) {
      setError("Invalid email or password.");
    }
    setSigning(false);
  };

  if (loading) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Loading...</div>;
  if (error && !school) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444",padding:"20px",textAlign:"center"}}>{error}</div>;

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0a0f1e,#0d1b3e)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div style={{width:"100%",maxWidth:"400px"}}>
        <div style={{textAlign:"center",marginBottom:"24px"}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"64px",height:"64px",background:"linear-gradient(135deg,#eab308,#ca8a04)",borderRadius:"16px",marginBottom:"12px"}}>
            <span style={{fontSize:"24px",fontWeight:"bold",color:"#0a0f1e"}}>RC</span>
          </div>
          <h1 style={{color:"#fff",fontSize:"20px",margin:"0 0 4px",fontWeight:"bold"}}>{school.name}</h1>
          <p style={{color:"#64748b",fontSize:"12px",margin:"0 0 2px"}}>{school.location}</p>
          <p style={{color:"#eab308",fontSize:"11px",margin:0}}>ReportCard Pro — Suh Ebook Empire</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:"16px",padding:"28px"}}>
          <h2 style={{color:"#fff",fontSize:"16px",margin:"0 0 20px"}}>Admin Login</h2>
          {error && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"8px",padding:"10px",marginBottom:"16px",color:"#fca5a5",fontSize:"13px"}}>{error}</div>}
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email Address" style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"14px",outline:"none",boxSizing:"border-box",marginBottom:"12px"}} />
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" onKeyDown={e=>{ if(e.key==="Enter") handleLogin(); }} style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"14px",outline:"none",boxSizing:"border-box",marginBottom:"16px"}} />
          <button onClick={handleLogin} disabled={signing} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:"pointer"}}>
            {signing?"Signing in...":"Sign In"}
          </button>
        </div>
        <p style={{textAlign:"center",fontSize:"10px",color:"#334155",marginTop:"16px"}}>ReportCard Pro — Powered by Suh Ebook Empire</p>
      </div>
    </div>
  );
}
