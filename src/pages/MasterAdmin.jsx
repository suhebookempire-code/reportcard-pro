import { useState, useEffect } from "react";
import { db, auth, firebaseConfig } from "../firebase/config";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, serverTimestamp, query, where } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const MASTER_EMAILS = ["gerald.neba@suebem.com","admin@suebem.com"];
const APP_URL = typeof window !== "undefined" ? window.location.origin : "";
const secondaryApp = initializeApp(firebaseConfig, "SchoolCreation");
const schoolAuth = getAuth(secondaryApp);

export default function MasterAdmin() {
  const [isAuth, setIsAuth] = useState(false);
  const [masterEmail, setMasterEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [schools, setSchools] = useState([]);
  const [tab, setTab] = useState("schools");
  const [newSchool, setNewSchool] = useState({name:"",location:"",phone:"",adminEmail:"",adminPassword:"",code:""});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({text:"",type:"success"});
  const [copied, setCopied] = useState("");
  const [deleting, setDeleting] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (locked && lockTimer > 0) {
      const t = setTimeout(() => setLockTimer(prev => {
        if (prev <= 1) { setLocked(false); setAttempts(0); return 0; }
        return prev - 1;
      }), 1000);
      return () => clearTimeout(t);
    }
  }, [locked, lockTimer]);

  useEffect(() => { if (isAuth) fetchSchools(); }, [isAuth]);

  const fetchSchools = async () => {
    const snap = await getDocs(collection(db, "schools"));
    setSchools(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b)=>a.name.localeCompare(b.name)));
  };

  const showMsg = (text, type="success") => {
    setMsg({text, type});
    setTimeout(() => setMsg({text:"",type:"success"}), 4000);
  };

  const handleLogin = async () => {
    if (locked) return;
    try {
      const cred = await signInWithEmailAndPassword(auth, masterEmail, password);
      const tokenResult = await cred.user.getIdTokenResult();
      if (tokenResult.claims.master === true) {
        setIsAuth(true); setError(""); setAttempts(0);
      } else {
        await signOut(auth);
        throw new Error("not-master");
      }
    } catch (e) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setLocked(true); setLockTimer(60);
        setError("Too many failed attempts. Locked for 60 seconds.");
      } else {
        setError("Invalid credentials. " + (3 - newAttempts) + " attempts remaining.");
      }
      setPassword("");
    }
  };

  const generateCode = () => {
    const rand = Math.random().toString(36).substring(2,8).toUpperCase();
    setNewSchool(s => ({ ...s, code: "SUE-" + rand + "-2026" }));
  };

  const addSchool = async () => {
    if (!newSchool.name || !newSchool.code || !newSchool.adminEmail || !newSchool.adminPassword) {
      showMsg("All fields are required.", "error"); return;
    }
    if (newSchool.adminPassword.length < 6) {
      showMsg("Password must be at least 6 characters.", "error"); return;
    }
    setLoading(true);
    let adminUid = null;
    try {
      const cred = await createUserWithEmailAndPassword(schoolAuth, newSchool.adminEmail, newSchool.adminPassword);
      adminUid = cred.user.uid;
    } catch(e) {
      if (e.code !== "auth/email-already-in-use") {
        showMsg("Error creating admin: " + e.message, "error");
        setLoading(false); return;
      }
    }
    const { adminPassword, ...schoolData } = newSchool;
    const schoolRef = await addDoc(collection(db, "schools"), {
      ...schoolData, active: true,
      createdAt: serverTimestamp(),
      createdBy: "Master Admin"
    });
    if (adminUid) {
      await setDoc(doc(db, "users", adminUid), {
        role: "admin",
        schoolId: schoolRef.id,
        email: newSchool.adminEmail,
        createdAt: serverTimestamp()
      });
    }
    showMsg("School registered successfully!");
    setNewSchool({name:"",location:"",phone:"",adminEmail:"",adminPassword:"",code:""});
    setTab("schools");
    await fetchSchools();
    setLoading(false);
  };

  const toggleSchool = async (id, active, name) => {
    await updateDoc(doc(db, "schools", id), { active: !active, updatedAt: serverTimestamp() });
    await fetchSchools();
    if (selectedSchool && selectedSchool.id === id) setSelectedSchool(s => ({...s, active: !active}));
    showMsg(active ? name + " deactivated." : name + " activated.");
  };

  const deleteSchool = async (id, name) => {
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "schools", id));
      await fetchSchools();
      showMsg(name + " deleted permanently.");
      if (selectedSchool && selectedSchool.id === id) setSelectedSchool(null);
    } catch(e) { showMsg("Delete failed: " + e.message, "error"); }
    setDeleting("");
    setConfirmDelete(null);
  };

  const copyLink = (code) => {
    const link = APP_URL + "/school/" + code;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(code); setTimeout(() => setCopied(""), 2000);
    });
  };

  const shareLink = (school) => {
    const url = APP_URL + "/school/" + school.code;
    const text = "SUEBEM Access Link\n\nSchool: " + school.name + "\nLocation: " + school.location + "\n\nClick to access your dashboard:\n" + url + "\n\nPowered by SUEBEM — Suh Ebook Empire";
    if (navigator.share) {
      navigator.share({ title: school.name + " — SUEBEM", text, url });
    } else {
      navigator.clipboard.writeText(text);
      showMsg("Link copied to clipboard!");
    }
  };

  const filteredSchools = schools.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.location?.toLowerCase().includes(search.toLowerCase()) ||
    s.code?.toLowerCase().includes(search.toLowerCase())
  );

  const styleInput = {width:"100%",padding:"11px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box",marginBottom:"10px"};

  if (!isAuth) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0a0f1e,#1a0a00,#0d1b3e)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"sans-serif"}}>
      <style>{"@keyframes pulse{0%,100%{box-shadow:0 0 20px rgba(234,179,8,0.3)}50%{box-shadow:0 0 40px rgba(234,179,8,0.6)}}"}</style>
      <div style={{width:"100%",maxWidth:"380px"}}>
        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"80px",height:"80px",background:"linear-gradient(135deg,#eab308,#ca8a04)",borderRadius:"20px",marginBottom:"14px",animation:"pulse 2s infinite"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"18px",fontWeight:"900",color:"#0a0f1e",lineHeight:"1"}}>SUE</div>
              <div style={{fontSize:"18px",fontWeight:"900",color:"#0a0f1e",lineHeight:"1"}}>BEM</div>
            </div>
          </div>
          <h1 style={{color:"#eab308",fontSize:"22px",fontWeight:"bold",margin:"0 0 4px",letterSpacing:"2px"}}>SUEBEM</h1>
          <p style={{color:"#64748b",fontSize:"12px",margin:"0 0 2px"}}>Master Administrator Portal</p>
          <p style={{color:"#475569",fontSize:"11px",margin:0,fontStyle:"italic"}}>Gerald Neba — Suh Ebook Empire</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:"20px",padding:"28px 24px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"20px"}}>
            <span style={{fontSize:"16px"}}>🔐</span>
            <h2 style={{color:"#fff",fontSize:"16px",fontWeight:"bold",margin:0}}>Secure Access</h2>
          </div>
          {locked && (
            <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"10px",padding:"12px",marginBottom:"16px",textAlign:"center"}}>
              <div style={{fontSize:"24px",marginBottom:"4px"}}>🔒</div>
              <div style={{color:"#fca5a5",fontSize:"13px",fontWeight:"bold"}}>Account Locked</div>
              <div style={{color:"#94a3b8",fontSize:"12px",marginTop:"4px"}}>Try again in {lockTimer} seconds</div>
            </div>
          )}
          {error && !locked && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"10px",padding:"12px",marginBottom:"16px",color:"#fca5a5",fontSize:"13px"}}>{error}</div>}
          <input type="email" value={masterEmail}
            onChange={e=>setMasterEmail(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            placeholder="Master Email"
            disabled={locked}
            style={{...styleInput,marginBottom:"12px",opacity:locked?0.5:1}} />
          <div style={{position:"relative",marginBottom:"20px"}}>
            <input type={showPass?"text":"password"} value={password}
              onChange={e=>setPassword(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              placeholder="Master Password"
              disabled={locked}
              style={{...styleInput,marginBottom:0,paddingRight:"44px",opacity:locked?0.5:1}} />
            <button type="button" onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:"16px"}}>{showPass?"🙈":"👁️"}</button>
          </div>
          {attempts > 0 && !locked && (
            <div style={{display:"flex",gap:"4px",marginBottom:"16px",justifyContent:"center"}}>
              {[1,2,3].map(i => <div key={i} style={{width:"8px",height:"8px",borderRadius:"50%",background:i<=attempts?"#ef4444":"rgba(255,255,255,0.1)"}} />)}
            </div>
          )}
          <button onClick={handleLogin} disabled={locked} style={{width:"100%",padding:"13px",background:locked?"#334155":"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"10px",color:locked?"#64748b":"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:locked?"not-allowed":"pointer"}}>
            {locked?"🔒 Locked":"Access Master Panel →"}
          </button>
        </div>
        <p style={{textAlign:"center",fontSize:"10px",color:"#1e293b",marginTop:"16px"}}>© 2026 SUEBEM — Unauthorized access is prohibited</p>
      </div>
    </div>
  );

  if (confirmDelete) return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"sans-serif"}}>
      <div style={{background:"rgba(239,68,68,0.08)",border:"2px solid rgba(239,68,68,0.4)",borderRadius:"20px",padding:"32px 24px",maxWidth:"360px",width:"100%",textAlign:"center"}}>
        <div style={{fontSize:"48px",marginBottom:"16px"}}>🗑️</div>
        <h2 style={{color:"#fca5a5",fontSize:"18px",fontWeight:"bold",margin:"0 0 12px"}}>Delete School?</h2>
        <p style={{color:"#94a3b8",fontSize:"13px",lineHeight:"1.6",margin:"0 0 8px"}}><strong style={{color:"#fff"}}>{confirmDelete.name}</strong></p>
        <p style={{color:"#64748b",fontSize:"12px",lineHeight:"1.6",margin:"0 0 24px"}}>This action is permanent. All school data will be removed. Users visiting the school link will be told to contact the Master Admin for a new link.</p>
        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={()=>setConfirmDelete(null)} style={{flex:1,padding:"12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#94a3b8",fontSize:"13px",cursor:"pointer",fontWeight:"bold"}}>Cancel</button>
          <button onClick={()=>deleteSchool(confirmDelete.id, confirmDelete.name)} disabled={deleting===confirmDelete.id} style={{flex:1,padding:"12px",background:"linear-gradient(135deg,#ef4444,#dc2626)",border:"none",borderRadius:"10px",color:"#fff",fontSize:"13px",cursor:"pointer",fontWeight:"bold"}}>{deleting===confirmDelete.id?"Deleting...":"Delete Permanently"}</button>
        </div>
      </div>
    </div>
  );

  if (selectedSchool) return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#1a0a00,#2d1600)",borderBottom:"2px solid rgba(234,179,8,0.3)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={()=>setSelectedSchool(null)} style={{padding:"6px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#94a3b8",fontSize:"12px",cursor:"pointer"}}>← Back</button>
        <div style={{fontSize:"13px",fontWeight:"bold",color:"#eab308"}}>School Details</div>
        <button onClick={()=>setIsAuth(false)} style={{padding:"6px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"8px",color:"#fca5a5",fontSize:"12px",cursor:"pointer"}}>Logout</button>
      </div>
      <div style={{maxWidth:"500px",margin:"0 auto",padding:"20px 16px"}}>
        {msg.text && <div style={{background:msg.type==="error"?"rgba(239,68,68,0.1)":"rgba(16,185,129,0.1)",border:"1px solid "+(msg.type==="error"?"rgba(239,68,68,0.3)":"rgba(16,185,129,0.3)"),borderRadius:"10px",padding:"10px 16px",marginBottom:"16px",color:msg.type==="error"?"#fca5a5":"#34d399",fontSize:"13px"}}>{msg.text}</div>}
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"16px",padding:"20px",marginBottom:"16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px"}}>
            <div>
              <h2 style={{color:"#fff",fontSize:"17px",fontWeight:"bold",margin:"0 0 4px"}}>{selectedSchool.name}</h2>
              <p style={{color:"#64748b",fontSize:"12px",margin:"0 0 2px"}}>{selectedSchool.location}</p>
              {selectedSchool.phone && <p style={{color:"#64748b",fontSize:"12px",margin:0}}>📞 {selectedSchool.phone}</p>}
            </div>
            <span style={{fontSize:"11px",padding:"4px 12px",borderRadius:"20px",background:selectedSchool.active?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",color:selectedSchool.active?"#10b981":"#ef4444",border:"1px solid "+(selectedSchool.active?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)"),fontWeight:"bold"}}>{selectedSchool.active?"● Active":"● Inactive"}</span>
          </div>
          <div style={{background:"rgba(234,179,8,0.05)",border:"1px solid rgba(234,179,8,0.15)",borderRadius:"10px",padding:"12px",marginBottom:"16px"}}>
            <div style={{fontSize:"10px",color:"#64748b",marginBottom:"4px",textTransform:"uppercase",letterSpacing:"1px"}}>Access Code</div>
            <div style={{fontSize:"14px",color:"#eab308",fontWeight:"bold",letterSpacing:"2px"}}>{selectedSchool.code}</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:"10px",padding:"12px",marginBottom:"16px"}}>
            <div style={{fontSize:"10px",color:"#64748b",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"1px"}}>School Link</div>
            <div style={{fontSize:"11px",color:"#60a5fa",wordBreak:"break-all",lineHeight:"1.5"}}>{APP_URL}/school/{selectedSchool.code}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
            <button onClick={()=>copyLink(selectedSchool.code)} style={{padding:"10px",background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.3)",borderRadius:"10px",color:"#eab308",fontSize:"12px",cursor:"pointer",fontWeight:"bold"}}>{copied===selectedSchool.code?"✓ Copied!":"📋 Copy Link"}</button>
            <button onClick={()=>shareLink(selectedSchool)} style={{padding:"10px",background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:"10px",color:"#a5b4fc",fontSize:"12px",cursor:"pointer",fontWeight:"bold"}}>📤 Share Link</button>
            <button onClick={()=>toggleSchool(selectedSchool.id,selectedSchool.active,selectedSchool.name)} style={{padding:"10px",background:selectedSchool.active?"rgba(239,68,68,0.1)":"rgba(16,185,129,0.1)",border:"1px solid "+(selectedSchool.active?"rgba(239,68,68,0.3)":"rgba(16,185,129,0.3)"),borderRadius:"10px",color:selectedSchool.active?"#fca5a5":"#34d399",fontSize:"12px",cursor:"pointer",fontWeight:"bold"}}>{selectedSchool.active?"🔒 Deactivate":"✅ Activate"}</button>
            <button onClick={()=>setConfirmDelete(selectedSchool)} style={{padding:"10px",background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:"10px",color:"#fca5a5",fontSize:"12px",cursor:"pointer",fontWeight:"bold"}}>🗑️ Delete School</button>
          </div>
        </div>
        <div style={{background:"rgba(16,185,129,0.05)",border:"1px solid rgba(16,185,129,0.15)",borderRadius:"12px",padding:"14px"}}>
          <div style={{fontSize:"11px",color:"#34d399",fontWeight:"bold",marginBottom:"6px"}}>📧 Admin Account</div>
          <div style={{fontSize:"12px",color:"#94a3b8"}}>{selectedSchool.adminEmail || "No email registered"}</div>
          <div style={{fontSize:"11px",color:"#475569",marginTop:"4px"}}>Share the school link above with the administrator to grant access.</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#1a0a00,#2d1600)",borderBottom:"2px solid rgba(234,179,8,0.3)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"36px",height:"36px",background:"linear-gradient(135deg,#eab308,#ca8a04)",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontSize:"10px",fontWeight:"900",color:"#0a0f1e",lineHeight:"1.1",textAlign:"center"}}>SUE<br/>BEM</div>
          </div>
          <div>
            <div style={{fontSize:"13px",fontWeight:"bold",color:"#eab308"}}>SUEBEM Master Admin</div>
            <div style={{fontSize:"10px",color:"#92400e"}}>Gerald Neba — Suh Ebook Empire</div>
          </div>
        </div>
        <button onClick={()=>setIsAuth(false)} style={{padding:"6px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"8px",color:"#fca5a5",fontSize:"12px",cursor:"pointer"}}>Logout</button>
      </div>

      <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        {[{id:"schools",label:"All Schools"},{id:"add",label:"+ Register School"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"12px 4px",background:"none",border:"none",borderBottom:tab===t.id?"2px solid #eab308":"2px solid transparent",color:tab===t.id?"#eab308":"#64748b",fontSize:"13px",cursor:"pointer",fontWeight:tab===t.id?"bold":"normal"}}>{t.label}</button>
        ))}
      </div>

      <div style={{padding:"16px",maxWidth:"600px",margin:"0 auto"}}>
        {msg.text && <div style={{background:msg.type==="error"?"rgba(239,68,68,0.1)":"rgba(16,185,129,0.1)",border:"1px solid "+(msg.type==="error"?"rgba(239,68,68,0.3)":"rgba(16,185,129,0.3)"),borderRadius:"10px",padding:"10px 16px",marginBottom:"16px",color:msg.type==="error"?"#fca5a5":"#34d399",fontSize:"13px"}}>{msg.text}</div>}

        {tab==="schools" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"16px"}}>
              {[{label:"Total",value:schools.length,color:"#eab308"},{label:"Active",value:schools.filter(s=>s.active).length,color:"#10b981"},{label:"Inactive",value:schools.filter(s=>!s.active).length,color:"#ef4444"}].map(s=>(
                <div key={s.label} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"14px",textAlign:"center"}}>
                  <div style={{fontSize:"24px",fontWeight:"bold",color:s.color}}>{s.value}</div>
                  <div style={{fontSize:"10px",color:"#64748b"}}>{s.label}</div>
                </div>
              ))}
            </div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search schools..." style={{...styleInput,marginBottom:"12px"}} />
            {filteredSchools.length===0 ? (
              <div style={{textAlign:"center",padding:"40px",color:"#475569"}}>
                <div style={{fontSize:"40px",marginBottom:"12px"}}>🏫</div>
                <div>No schools found. Register your first school.</div>
              </div>
            ) : filteredSchools.map(school=>(
              <div key={school.id} onClick={()=>setSelectedSchool(school)} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"16px",marginBottom:"8px",cursor:"pointer",transition:"all 0.2s"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:"15px",color:"#fff",fontWeight:"bold",marginBottom:"2px"}}>{school.name}</div>
                    <div style={{fontSize:"11px",color:"#64748b"}}>{school.location}</div>
                    <div style={{fontSize:"11px",color:"#eab308",marginTop:"4px",letterSpacing:"1px"}}>Code: {school.code}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"6px"}}>
                    <span style={{fontSize:"11px",padding:"3px 10px",borderRadius:"20px",background:school.active?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",color:school.active?"#10b981":"#ef4444",border:"1px solid "+(school.active?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)"),fontWeight:"bold"}}>{school.active?"● Active":"● Inactive"}</span>
                    <span style={{fontSize:"11px",color:"#475569"}}>Tap to manage →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="add" && (
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"20px"}}>
            <h3 style={{color:"#eab308",fontSize:"15px",margin:"0 0 20px",display:"flex",alignItems:"center",gap:"8px"}}>🏫 Register New School</h3>
            <div style={{fontSize:"11px",color:"#64748b",marginBottom:"16px",background:"rgba(234,179,8,0.05)",border:"1px solid rgba(234,179,8,0.15)",borderRadius:"8px",padding:"10px"}}>
              Fill all fields carefully. The admin email and password will be used by the school administrator to log in.
            </div>
            {[{name:"name",placeholder:"School Name *",type:"text",icon:"🏫"},{name:"location",placeholder:"Location / City *",type:"text",icon:"📍"},{name:"phone",placeholder:"Phone Number",type:"text",icon:"📞"},{name:"adminEmail",placeholder:"Admin Email * (login email)",type:"email",icon:"📧"},{name:"adminPassword",placeholder:"Admin Password * (min 6 chars)",type:"password",icon:"🔑"}].map(f=>(
              <div key={f.name} style={{position:"relative",marginBottom:"10px"}}>
                <input value={newSchool[f.name]} onChange={e=>setNewSchool(s=>({...s,[f.name]:e.target.value}))} placeholder={f.placeholder} type={f.type} style={{...styleInput,marginBottom:0,paddingLeft:"36px"}} />
                <span style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",fontSize:"14px"}}>{f.icon}</span>
              </div>
            ))}
            <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
              <div style={{position:"relative",flex:1}}>
                <input value={newSchool.code} onChange={e=>setNewSchool(s=>({...s,code:e.target.value}))} placeholder="Activation Code *" style={{...styleInput,marginBottom:0,paddingLeft:"36px"}} />
                <span style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",fontSize:"14px"}}>🔐</span>
              </div>
              <button onClick={generateCode} style={{padding:"11px 14px",background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.3)",borderRadius:"10px",color:"#eab308",fontSize:"12px",cursor:"pointer",whiteSpace:"nowrap",fontWeight:"bold"}}>Generate</button>
            </div>
            <button onClick={addSchool} disabled={loading} style={{width:"100%",padding:"14px",background:loading?"#334155":"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"10px",color:loading?"#64748b":"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:loading?"not-allowed":"pointer"}}>
              {loading?"Registering School...":"Register School →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
