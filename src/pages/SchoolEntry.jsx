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
        if (snap.empty) { setStatus("notfound"); return; }
        const s = { id: snap.docs[0].id, ...snap.docs[0].data() };
        if (s.active === false) { setStatus("inactive"); return; }
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

  const bg = {minHeight:"100vh",background:"linear-gradient(160deg,#0a0014,#0d0a2e,#0a1628)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"};
  const Logo = () => (
    <div style={{width:"80px",height:"80px",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",borderRadius:"20px",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",boxShadow:"0 0 30px rgba(124,58,237,0.5)"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:"22px",fontWeight:"900",color:"#fff"}}>SEE</div><div style={{fontSize:"7px",color:"rgba(255,255,255,0.7)",letterSpacing:"2px"}}>EMPIRE</div></div>
    </div>
  );

  if (status === "loading") return (
    <div style={bg}>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <div style={{textAlign:"center"}}><Logo />
        <div style={{width:"40px",height:"40px",border:"3px solid rgba(124,58,237,0.3)",borderTop:"3px solid #7c3aed",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 16px"}} />
        <p style={{color:"#94a3b8",fontSize:"14px"}}>Verifying school access...</p>
      </div>
    </div>
  );

  if (status === "notfound") return (
    <div style={bg}><div style={{textAlign:"center"}}>
      <div style={{fontSize:"56px",marginBottom:"16px"}}>🏫</div>
      <h2 style={{color:"#fca5a5",fontSize:"20px"}}>School Not Found</h2>
      <p style={{color:"#64748b",fontSize:"13px"}}>Invalid link. Contact Gerald Neba.</p>
    </div></div>
  );

  if (status === "inactive") return (
    <div style={bg}><div style={{textAlign:"center"}}>
      <div style={{fontSize:"56px",marginBottom:"16px"}}>🔒</div>
      <h2 style={{color:"#fbbf24",fontSize:"20px"}}>Account Suspended</h2>
      <p style={{color:"#64748b",fontSize:"13px"}}>Contact the master administrator.</p>
    </div></div>
  );

  if (status === "error") return (
    <div style={bg}><div style={{textAlign:"center"}}>
      <div style={{fontSize:"56px",marginBottom:"16px"}}>⚠️</div>
      <h2 style={{color:"#fca5a5",fontSize:"20px"}}>Connection Error</h2>
      <button onClick={()=>window.location.reload()} style={{padding:"10px 24px",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:"10px",color:"#fff",fontWeight:"bold",cursor:"pointer"}}>Retry</button>
    </div></div>
  );

  if (status === "entering") return (
    <div style={bg}>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <div style={{textAlign:"center"}}><Logo />
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(124,58,237,0.3)",borderRadius:"20px",padding:"28px 32px",minWidth:"280px"}}>
          <div style={{width:"20px",height:"20px",border:"2px solid rgba(124,58,237,0.3)",borderTop:"2px solid #7c3aed",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 16px"}} />
          <h1 style={{color:"#fff",fontSize:"20px",fontWeight:"bold",margin:"0 0 6px"}}>{school && school.name}</h1>
          <p style={{color:"#94a3b8",fontSize:"13px",margin:"0 0 20px"}}>{school && school.location}</p>
          <div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.4)",borderRadius:"12px",padding:"14px"}}>
            <p style={{color:"#34d399",fontSize:"14px",fontWeight:"bold",margin:"0 0 4px"}}>Access Granted</p>
            <p style={{color:"#6ee7b7",fontSize:"11px",margin:0}}>Entering dashboard...</p>
          </div>
        </div>
        <p style={{color:"#334155",fontSize:"11px",marginTop:"16px"}}>Powered by Suh Ebook Empire</p>
      </div>
    </div>
  );

  return null;
}
