import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

export default function SchoolEntry() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [school, setSchool] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, "schools"), where("code", "==", code));
        const snap = await getDocs(q);
        if (snap.empty) { setStatus("deleted"); return; }
        const s = { id: snap.docs[0].id, ...snap.docs[0].data() };
        if (!s.active) { setSchool(s); setStatus("inactive"); return; }
        setSchool(s);
        sessionStorage.setItem("schoolCode", code);
        sessionStorage.setItem("schoolId", s.id);
        sessionStorage.setItem("schoolName", s.name);
        setStatus("entering");
        setTimeout(() => navigate("/"), 2000);
      } catch(e) { setStatus("error"); }
    };
    load();
  }, [code]);

  const bg = {minHeight:"100vh",background:"linear-gradient(160deg,#0a0f1e,#0d1b3e,#0a1628)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"sans-serif"};

  const Logo = () => (
    <div style={{textAlign:"center",marginBottom:"24px"}}>
      <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"80px",height:"80px",background:"linear-gradient(135deg,#eab308,#ca8a04)",borderRadius:"20px",marginBottom:"12px",boxShadow:"0 0 40px rgba(234,179,8,0.3)"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"18px",fontWeight:"900",color:"#0a0f1e",lineHeight:"1"}}>SUE</div>
          <div style={{fontSize:"18px",fontWeight:"900",color:"#0a0f1e",lineHeight:"1"}}>BEM</div>
        </div>
      </div>
      <div style={{fontSize:"20px",fontWeight:"bold",color:"#eab308",letterSpacing:"2px"}}>SUEBEM</div>
      <div style={{fontSize:"11px",color:"#64748b",marginTop:"2px"}}>School Management System</div>
    </div>
  );

  if (status === "loading") return (
    <div style={bg}>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}"}</style>
      <div style={{textAlign:"center"}}>
        <Logo />
        <div style={{width:"36px",height:"36px",border:"3px solid rgba(234,179,8,0.2)",borderTop:"3px solid #eab308",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 16px"}} />
        <p style={{color:"#64748b",fontSize:"13px",animation:"pulse 2s infinite"}}>Verifying school access...</p>
      </div>
    </div>
  );

  if (status === "deleted") return (
    <div style={bg}>
      <div style={{textAlign:"center",maxWidth:"360px"}}>
        <Logo />
        <div style={{background:"rgba(239,68,68,0.08)",border:"2px solid rgba(239,68,68,0.3)",borderRadius:"20px",padding:"32px 24px"}}>
          <div style={{fontSize:"48px",marginBottom:"16px"}}>🔗</div>
          <h2 style={{color:"#fca5a5",fontSize:"18px",fontWeight:"bold",margin:"0 0 12px"}}>Link Not Found</h2>
          <p style={{color:"#94a3b8",fontSize:"13px",lineHeight:"1.6",margin:"0 0 20px"}}>This school link does not exist or has been removed. Please contact the Master Administrator for a new access link.</p>
          <div style={{background:"rgba(255,255,255,0.05)",borderRadius:"12px",padding:"16px",textAlign:"left"}}>
            <div style={{fontSize:"11px",color:"#64748b",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"1px"}}>Contact</div>
            <div style={{fontSize:"13px",color:"#eab308",fontWeight:"bold"}}>Gerald Neba</div>
            <div style={{fontSize:"12px",color:"#94a3b8"}}>Suh Ebook Empire</div>
            <div style={{fontSize:"12px",color:"#94a3b8",marginTop:"4px"}}>Master Administrator — SUEBEM</div>
          </div>
        </div>
        <p style={{color:"#334155",fontSize:"11px",marginTop:"16px"}}>Powered by SUEBEM — Suh Ebook Empire</p>
      </div>
    </div>
  );

  if (status === "inactive") return (
    <div style={bg}>
      <div style={{textAlign:"center",maxWidth:"360px"}}>
        <Logo />
        <div style={{background:"rgba(234,179,8,0.06)",border:"2px solid rgba(234,179,8,0.3)",borderRadius:"20px",padding:"32px 24px"}}>
          <div style={{fontSize:"48px",marginBottom:"16px"}}>🔒</div>
          <h2 style={{color:"#eab308",fontSize:"18px",fontWeight:"bold",margin:"0 0 8px"}}>Account Suspended</h2>
          <p style={{color:"#94a3b8",fontSize:"13px",margin:"0 0 6px",fontWeight:"bold"}}>{school && school.name}</p>
          <p style={{color:"#64748b",fontSize:"13px",lineHeight:"1.6",margin:"0 0 20px"}}>Your school account has been temporarily deactivated. Please contact the Master Administrator to reactivate your account.</p>
          <div style={{background:"rgba(255,255,255,0.05)",borderRadius:"12px",padding:"16px",textAlign:"left",marginBottom:"16px"}}>
            <div style={{fontSize:"11px",color:"#64748b",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"1px"}}>Contact for Reactivation</div>
            <div style={{fontSize:"13px",color:"#eab308",fontWeight:"bold"}}>Gerald Neba</div>
            <div style={{fontSize:"12px",color:"#94a3b8"}}>Suh Ebook Empire</div>
            <div style={{fontSize:"12px",color:"#94a3b8",marginTop:"4px"}}>Master Administrator — SUEBEM</div>
          </div>
          <a href="https://wa.me/237651727378" style={{display:"block",padding:"12px",background:"linear-gradient(135deg,#25d366,#128c7e)",borderRadius:"10px",color:"#fff",fontWeight:"bold",fontSize:"13px",textDecoration:"none"}}>📲 Contact on WhatsApp</a>
        </div>
        <p style={{color:"#334155",fontSize:"11px",marginTop:"16px"}}>Powered by SUEBEM — Suh Ebook Empire</p>
      </div>
    </div>
  );

  if (status === "error") return (
    <div style={bg}>
      <div style={{textAlign:"center",maxWidth:"320px"}}>
        <Logo />
        <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"20px",padding:"28px 24px"}}>
          <div style={{fontSize:"48px",marginBottom:"16px"}}>⚠️</div>
          <h2 style={{color:"#fca5a5",fontSize:"18px",fontWeight:"bold",margin:"0 0 12px"}}>Connection Error</h2>
          <p style={{color:"#64748b",fontSize:"13px",marginBottom:"20px"}}>Unable to connect. Check your internet and try again.</p>
          <button onClick={()=>window.location.reload()} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"10px",color:"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:"pointer"}}>🔄 Retry</button>
        </div>
      </div>
    </div>
  );

  if (status === "entering") return (
    <div style={bg}>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <div style={{textAlign:"center",maxWidth:"320px",width:"100%"}}>
        <Logo />
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:"20px",padding:"32px 24px"}}>
          <div style={{width:"24px",height:"24px",border:"2px solid rgba(234,179,8,0.2)",borderTop:"2px solid #eab308",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 20px"}} />
          <h1 style={{color:"#fff",fontSize:"18px",fontWeight:"bold",margin:"0 0 4px"}}>{school && school.name}</h1>
          <p style={{color:"#64748b",fontSize:"12px",margin:"0 0 20px"}}>{school && school.location}</p>
          <div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:"12px",padding:"14px"}}>
            <div style={{fontSize:"16px",marginBottom:"4px"}}>✅</div>
            <p style={{color:"#34d399",fontSize:"14px",fontWeight:"bold",margin:"0 0 4px"}}>Access Granted</p>
            <p style={{color:"#6ee7b7",fontSize:"11px",margin:0}}>Loading your dashboard...</p>
          </div>
        </div>
        <p style={{color:"#334155",fontSize:"11px",marginTop:"16px"}}>Powered by SUEBEM — Suh Ebook Empire</p>
      </div>
    </div>
  );

  return null;
}
