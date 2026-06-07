import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const MASTER_PASSWORD = "Suebem2040";
const APP_URL = "https://reportcard-pro-suhebookempires-projects.vercel.app";
const schoolAuth = getAuth();

export default function MasterAdmin() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [schools, setSchools] = useState([]);
  const [tab, setTab] = useState("schools");
  const [newSchool, setNewSchool] = useState({ name:"", location:"", phone:"", adminEmail:"", adminPassword:"", code:"" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState("");
  const [deleting, setDeleting] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const navigate = useNavigate();

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
    if (newSchool.adminEmail && newSchool.adminPassword) {
      try { await createUserWithEmailAndPassword(schoolAuth, newSchool.adminEmail, newSchool.adminPassword); }
      catch(e) { if (e.code !== "auth/email-already-in-use") { setMsg("Error: " + e.message); setLoading(false); return; } }
    }
    await addDoc(collection(db, "schools"), { ...newSchool, active: true, createdAt: serverTimestamp() });
    setMsg("School added!"); setNewSchool({ name:"", location:"", phone:"", adminEmail:"", adminPassword:"", code:"" });
    setTab("schools"); await fetchSchools(); setLoading(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const toggleSchool = async (id, active) => { await updateDoc(doc(db, "schools", id), { active: !active }); await fetchSchools(); };

  const deleteSchool = async (id, name) => {
    if (!window.confirm("Delete " + name + "?")) return;
    setDeleting(id); await deleteDoc(doc(db, "schools", id)); await fetchSchools(); setDeleting("");
  };

  const copyLink = (code) => {
    navigator.clipboard.writeText(APP_URL + "/school/" + code);
    setCopied(code); setTimeout(() => setCopied(""), 2000);
  };

  const createAdmin = async () => {
    if (!adminEmail || !adminPassword) { setMsg("Email and password required."); return; }
    setCreatingAdmin(true);
    try {
      await createUserWithEmailAndPassword(schoolAuth, adminEmail, adminPassword);
      setMsg("Admin account created: " + adminEmail);
      setAdminEmail(""); setAdminPassword(""); setSelectedSchool(null);
    } catch(e) { setMsg(e.code === "auth/email-already-in-use" ? "Email already exists!" : "Error: " + e.message); }
    setCreatingAdmin(false); setTimeout(() => setMsg(""), 4000);
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
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"){if(password===MASTER_PASSWORD){setIsAuth(true);}else{setError("Invalid password.");}}}} placeholder="Master Password" style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"14px",outline:"none",boxSizing:"border-box",marginBottom:"16px"}} />
          <button onClick={()=>{if(password===MASTER_PASSWORD){setIsAuth(true);}else{setError("Invalid master password.");}}} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:"pointer"}}>Access Master Panel</button>
        </div>
      </div>
    </div>
  );

  if (selectedSchool) return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <div style={{background:"linear-gradient(135deg,#1a0a00,#2d1600)",borderBottom:"1px solid rgba(234,179,8,0.3)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={()=>setSelectedSchool(null)} style={{padding:"6px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"6px",color:"#94a3b8",fontSize:"12px",cursor:"pointer"}}>← Back</button>
        <div style={{fontSize:"13px",fontWeight:"bold",color:"#eab308"}}>{selectedSchool.name}</div>
        <button onClick={()=>setIsAuth(false)} style={{padding:"6px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"6px",color:"#fca5a5",fontSize:"12px",cursor:"pointer"}}>Logout</button>
      </div>
      <div style={{maxWidth:"500px",margin:"0 auto",padding:"20px 16px"}}>
        {msg && <div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:"8px",padding:"10px",marginBottom:"16px",color:"#34d399",fontSize:"13px"}}>{msg}</div>}
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"20px",marginBottom:"16px"}}>
          <h2 style={{color:"#fff",fontSize:"16px",margin:"0 0 4px"}}>{selectedSchool.name}</h2>
          <p style={{color:"#64748b",fontSize:"12px",margin:"0 0 2px"}}>{selectedSchool.location}</p>
          {selectedSchool.phone && <p style={{color:"#64748b",fontSize:"12px",margin:"0 0 8px"}}>Tel: {selectedSchool.phone}</p>}
          <p style={{color:"#eab308",fontSize:"12px",margin:"0 0 12px"}}>Code: <strong>{selectedSchool.code}</strong></p>
          <div style={{background:"rgba(255,255,255,0.02)",borderRadius:"8px",padding:"10px",marginBottom:"16px",fontSize:"11px",color:"#60a5fa",wordBreak:"break-all"}}>{APP_URL}/school/{selectedSchool.code}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
            <button onClick={()=>copyLink(selectedSchool.code)} style={{padding:"10px 16px",background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.3)",borderRadius:"8px",color:"#eab308",fontSize:"12px",cursor:"pointer",fontWeight:"bold"}}>{copied===selectedSchool.code?"✓ Copied!":"Copy Link"}</button>
            <button onClick={()=>{const url=APP_URL+"/school/"+selectedSchool.code;if(navigator.share){navigator.share({title:selectedSchool.name+" — ReportCard Pro",text:"Access "+selectedSchool.name+" dashboard on ReportCard Pro",url:url});}else{navigator.clipboard.writeText(url);}}} style={{padding:"10px 16px",background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.4)",borderRadius:"8px",color:"#a5b4fc",fontSize:"12px",cursor:"pointer",fontWeight:"bold"}}>📤 Share</button>
            <button onClick={()=>toggleSchool(selectedSchool.id,selectedSchool.active)} style={{padding:"10px 16px",background:selectedSchool.active?"rgba(239,68,68,0.1)":"rgba(16,185,129,0.1)",border:"1px solid "+(selectedSchool.active?"rgba(239,68,68,0.3)":"rgba(16,185,129,0.3)"),borderRadius:"8px",color:selectedSchool.active?"#fca5a5":"#34d399",fontSize:"12px",cursor:"pointer"}}>{selectedSchool.active?"Deactivate":"Activate"}</button>
            <button onClick={()=>{deleteSchool(selectedSchool.id,selectedSchool.name);setSelectedSchool(null);}} disabled={deleting===selectedSchool.id} style={{padding:"10px 16px",background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:"8px",color:"#fca5a5",fontSize:"12px",cursor:"pointer",fontWeight:"bold"}}>{deleting===selectedSchool.id?"Deleting...":"🗑 Delete School"}</button>
          </div>
        </div>
        <div style={{background:"rgba(16,185,129,0.05)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:"12px",padding:"16px",textAlign:"center"}}>
          <p style={{color:"#34d399",fontSize:"13px",margin:"0 0 8px"}}>✅ Admin account was created when school was registered.</p>
          <p style={{color:"#475569",fontSize:"11px",margin:0}}>Share the link above with the school administrator.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <div style={{background:"linear-gradient(135deg,#1a0a00,#2d1600)",borderBottom:"1px solid rgba(234,179,8,0.3)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"32px",height:"32px",background:"linear-gradient(135deg,#eab308,#ca8a04)",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",color:"#0a0f1e",fontSize:"12px"}}>RC</div>
          <div>
            <div style={{fontSize:"13px",fontWeight:"bold",color:"#eab308"}}>Master Admin Panel</div>
            <div style={{fontSize:"10px",color:"#92400e"}}>Gerald Neba — Suh Ebook Empire</div>
          </div>
        </div>
        <button onClick={()=>setIsAuth(false)} style={{padding:"6px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"6px",color:"#fca5a5",fontSize:"12px",cursor:"pointer"}}>Logout</button>
      </div>
      <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        {[{id:"schools",label:"All Schools"},{id:"add",label:"+ Add School"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"12px 4px",background:"none",border:"none",borderBottom:tab===t.id?"2px solid #eab308":"2px solid transparent",color:tab===t.id?"#eab308":"#64748b",fontSize:"13px",cursor:"pointer",fontWeight:tab===t.id?"bold":"normal"}}>{t.label}</button>
        ))}
      </div>
      <div style={{padding:"16px",maxWidth:"600px",margin:"0 auto"}}>
        {msg && <div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:"8px",padding:"10px 16px",marginBottom:"16px",color:"#34d399",fontSize:"13px"}}>{msg}</div>}
        {tab === "schools" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"16px"}}>
              {[{label:"Total Schools",value:schools.length,color:"#eab308"},{label:"Active",value:schools.filter(s=>s.active).length,color:"#10b981"},{label:"Inactive",value:schools.filter(s=>!s.active).length,color:"#ef4444"}].map(s=>(
                <div key={s.label} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:"24px",fontWeight:"bold",color:s.color}}>{s.value}</div>
                  <div style={{fontSize:"11px",color:"#64748b"}}>{s.label}</div>
                </div>
              ))}
            </div>
            {schools.length === 0 ? (
              <div style={{textAlign:"center",padding:"40px",color:"#475569"}}>No schools yet. Add your first school.</div>
            ) : schools.map(school=>(
              <div key={school.id} onClick={()=>setSelectedSchool(school)} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",padding:"16px",marginBottom:"8px",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:"15px",color:"#fff",fontWeight:"bold"}}>{school.name}</div>
                    <div style={{fontSize:"12px",color:"#64748b"}}>{school.location}</div>
                    <div style={{fontSize:"12px",color:"#eab308",marginTop:"4px"}}>Code: <strong>{school.code}</strong></div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"6px"}}>
                    <span style={{fontSize:"11px",padding:"3px 10px",borderRadius:"20px",background:school.active?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",color:school.active?"#10b981":"#ef4444",border:"1px solid "+(school.active?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)")}}>{school.active?"Active":"Inactive"}</span>
                    <span style={{fontSize:"11px",color:"#60a5fa"}}>Tap to manage →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "add" && (
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"20px"}}>
            <h3 style={{color:"#eab308",fontSize:"15px",margin:"0 0 16px"}}>Register New School</h3>
            {[{name:"name",placeholder:"School Name *",type:"text"},{name:"location",placeholder:"Location / Localisation",type:"text"},{name:"phone",placeholder:"Phone / Telephone",type:"text"},{name:"adminEmail",placeholder:"Admin Email * (for school login)",type:"email"},{name:"adminPassword",placeholder:"Admin Password * (min 6 chars)",type:"password"}].map(f=>(
              <input key={f.name} value={newSchool[f.name]} onChange={e=>setNewSchool(s=>({...s,[f.name]:e.target.value}))} placeholder={f.placeholder} type={f.type} style={{width:"100%",padding:"10px 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box",marginBottom:"10px"}} />
            ))}
            <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
              <input value={newSchool.code} onChange={e=>setNewSchool(s=>({...s,code:e.target.value}))} placeholder="Activation Code *" style={{flex:1,padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}} />
              <button onClick={generateCode} style={{padding:"10px 14px",background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.3)",borderRadius:"8px",color:"#eab308",fontSize:"12px",cursor:"pointer",whiteSpace:"nowrap"}}>Generate</button>
            </div>
            <button onClick={addSchool} disabled={loading} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:"pointer"}}>{loading?"Adding...":"Add School"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
