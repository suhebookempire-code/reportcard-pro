import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

const MASTER_PASSWORD = "Suebem2040";
const APP_URL = "https://reportcard-pro-suhebookempires-projects.vercel.app";

export default function MasterAdmin() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [schools, setSchools] = useState([]);
  const [tab, setTab] = useState("schools");
  const [newSchool, setNewSchool] = useState({ name:"", location:"", adminEmail:"", phone:"", code:"" });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => { if (isAuth) fetchSchools(); }, [isAuth]);

  const fetchSchools = async () => {
    const snap = await getDocs(collection(db, "schools"));
    setSchools(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const generateCode = () => {
    const rand = Math.random().toString(36).substring(2,8).toUpperCase();
    setNewSchool(s => ({ ...s, code: "RC-" + rand + "-2026" }));
  };

  const addSchool = async () => {
    if (!newSchool.name || !newSchool.code) { setMsg("Name and code required."); return; }
    setLoading(true);
    await addDoc(collection(db, "schools"), { ...newSchool, active: true, createdAt: serverTimestamp() });
    setMsg("School added successfully!");
    setNewSchool({ name:"", location:"", email:"", phone:"", code:"" });
    setTab("schools");
    await fetchSchools();
    setLoading(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const toggleSchool = async (id, active) => {
    await updateDoc(doc(db, "schools", id), { active: !active });
    await fetchSchools();
  };

  const deleteSchool = async (id, name) => {
    if (!window.confirm("Delete " + name + "? This cannot be undone.")) return;
    setDeleting(id);
    await deleteDoc(doc(db, "schools", id));
    await fetchSchools();
    setDeleting("");
  };

  const copyLink = (code) => {
    const link = APP_URL + "/school/" + code;
    navigator.clipboard.writeText(link);
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
  };

  if (!isAuth) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0a0f1e,#1a0a00)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div style={{width:"100%",maxWidth:"380px"}}>
        <div style={{textAlign:"center",marginBottom:"24px"}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"64px",height:"64px",background:"linear-gradient(135deg,#eab308,#ca8a04)",borderRadius:"16px",marginBottom:"12px"}}>
            <span style={{fontSize:"24px",fontWeight:"bold",color:"#0a0f1e"}}>RC</span>
          </div>
          <h1 style={{color:"#eab308",fontSize:"20px",margin:"0 0 4px"}}>ReportCard Pro</h1>
          <p style={{color:"#64748b",fontSize:"12px",margin:0}}>Master Administrator — Gerald Neba</p>
          <p style={{color:"#475569",fontSize:"11px",margin:"4px 0 0",fontStyle:"italic"}}>Powered by Suh Ebook Empire</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:"16px",padding:"28px"}}>
          <h2 style={{color:"#fff",fontSize:"16px",margin:"0 0 20px"}}>Master Login</h2>
          {error && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"8px",padding:"10px",marginBottom:"16px",color:"#fca5a5",fontSize:"13px"}}>{error}</div>}
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter" && password===MASTER_PASSWORD) setIsAuth(true); }} placeholder="Master Password" style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"14px",outline:"none",boxSizing:"border-box",marginBottom:"16px"}} />
          <button onClick={()=>{ if(password===MASTER_PASSWORD){setIsAuth(true);}else{setError("Invalid master password.");}}} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:"pointer"}}>
            Access Master Panel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <div style={{background:"linear-gradient(135deg,#1a0a00,#2d1600)",borderBottom:"1px solid rgba(234,179,8,0.3)",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"56px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"32px",height:"32px",background:"linear-gradient(135deg,#eab308,#ca8a04)",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",color:"#0a0f1e",fontSize:"12px"}}>RC</div>
          <div>
            <div style={{fontSize:"13px",fontWeight:"bold",color:"#eab308"}}>Master Admin Panel</div>
            <div style={{fontSize:"10px",color:"#92400e"}}>Gerald Neba — Suh Ebook Empire</div>
          </div>
        </div>
        <button onClick={()=>setIsAuth(false)} style={{padding:"6px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"6px",color:"#fca5a5",fontSize:"12px",cursor:"pointer"}}>Logout</button>
      </div>

      <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"0 24px"}}>
        {[{id:"schools",label:"All Schools"},{id:"add",label:"+ Add School"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"12px 16px",background:"none",border:"none",borderBottom:tab===t.id?"2px solid #eab308":"2px solid transparent",color:tab===t.id?"#eab308":"#64748b",fontSize:"13px",cursor:"pointer",fontWeight:tab===t.id?"bold":"normal"}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{padding:"20px",maxWidth:"900px",margin:"0 auto"}}>
        {msg && <div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:"8px",padding:"10px 16px",marginBottom:"16px",color:"#34d399",fontSize:"13px"}}>{msg}</div>}

        {tab === "schools" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"20px"}}>
              {[{label:"Total Schools",value:schools.length,color:"#eab308"},{label:"Active",value:schools.filter(s=>s.active).length,color:"#10b981"},{label:"Inactive",value:schools.filter(s=>!s.active).length,color:"#ef4444"}].map(s=>(
                <div key={s.label} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",padding:"16px",textAlign:"center"}}>
                  <div style={{fontSize:"28px",fontWeight:"bold",color:s.color}}>{s.value}</div>
                  <div style={{fontSize:"12px",color:"#64748b"}}>{s.label}</div>
                </div>
              ))}
            </div>
            {schools.length === 0 ? (
              <div style={{textAlign:"center",padding:"40px",color:"#475569",background:"rgba(255,255,255,0.02)",borderRadius:"12px"}}>No schools registered yet.</div>
            ) : schools.map(school=>(
              <div key={school.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",padding:"14px 16px",marginBottom:"8px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px",marginBottom:"8px"}}>
                  <div>
                    <div style={{fontSize:"15px",color:"#fff",fontWeight:"bold"}}>{school.name}</div>
                    <div style={{fontSize:"12px",color:"#64748b"}}>{school.location}</div>
                    {school.phone && <div style={{fontSize:"11px",color:"#64748b"}}>Tel: {school.phone}</div>}
                    <div style={{fontSize:"12px",color:"#eab308",marginTop:"2px"}}>Code: <strong>{school.code}</strong></div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap"}}>
                    <span style={{fontSize:"11px",padding:"3px 10px",borderRadius:"20px",background:school.active?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",color:school.active?"#10b981":"#ef4444",border:"1px solid "+(school.active?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)")}}>
                      {school.active?"Active":"Inactive"}
                    </span>
                    <button onClick={()=>toggleSchool(school.id,school.active)} style={{padding:"5px 10px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"6px",color:"#94a3b8",fontSize:"11px",cursor:"pointer"}}>
                      {school.active?"Deactivate":"Activate"}
                    </button>
                    <button onClick={()=>copyLink(school.code)} style={{padding:"5px 10px",background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.3)",borderRadius:"6px",color:"#eab308",fontSize:"11px",cursor:"pointer"}}>
                      {copied===school.code?"Copied!":"Copy Link"}
                    </button>
                    <button onClick={()=>deleteSchool(school.id,school.name)} disabled={deleting===school.id} style={{padding:"5px 10px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"6px",color:"#fca5a5",fontSize:"11px",cursor:"pointer"}}>
                      {deleting===school.id?"...":"Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "add" && (
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"24px",maxWidth:"500px"}}>
            <h3 style={{color:"#eab308",fontSize:"15px",margin:"0 0 20px"}}>Register New School</h3>
            {[{name:"name",placeholder:"School Name *"},{name:"location",placeholder:"Location / Localisation"},{name:"adminEmail",placeholder:"Admin Login Email *"},{name:"phone",placeholder:"Phone / Telephone"}].map(f=>(
              <input key={f.name} value={newSchool[f.name]} onChange={e=>setNewSchool(s=>({...s,[f.name]:e.target.value}))} placeholder={f.placeholder} style={{width:"100%",padding:"10px 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box",marginBottom:"10px"}} />
            ))}
            <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
              <input value={newSchool.code} onChange={e=>setNewSchool(s=>({...s,code:e.target.value}))} placeholder="Activation Code *" style={{flex:1,padding:"10px 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box"}} />
              <button onClick={generateCode} style={{padding:"10px 14px",background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.3)",borderRadius:"8px",color:"#eab308",fontSize:"12px",cursor:"pointer",whiteSpace:"nowrap"}}>Generate</button>
            </div>
            <button onClick={addSchool} disabled={loading} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:"pointer"}}>
              {loading?"Adding...":"Add School"}
            </button>
            <div style={{marginTop:"16px",padding:"12px",background:"rgba(234,179,8,0.05)",border:"1px solid rgba(234,179,8,0.1)",borderRadius:"8px"}}>
              <p style={{fontSize:"11px",color:"#64748b",margin:"0 0 4px"}}>App URL to share with school:</p>
              <p style={{fontSize:"11px",color:"#eab308",margin:0,wordBreak:"break-all"}}>{APP_URL}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
