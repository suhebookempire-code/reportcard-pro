import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LEVELS } from "../utils/grading";

const BASE_URL = "https://reportcard-pro-suhebookempires-projects.vercel.app";

function generateToken() {
  return Math.random().toString(36).substring(2,10).toUpperCase();
}

function generatePin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function Classes() {
  const { user, school } = useAuth();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", level:"Form 1", pin:"" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [copied, setCopied] = useState("");
  const schoolId = sessionStorage.getItem("schoolId") || sessionStorage.getItem("schoolId") || school?.id || user?.uid;

  const fetchData = async () => {
    const cq = query(collection(db, "classes"), where("schoolId", "==", schoolId));
    const cSnap = await getDocs(cq);
    setClasses(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    const sq = query(collection(db, "students"), where("schoolId", "==", schoolId));
    const sSnap = await getDocs(sq);
    setStudents(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [schoolId]);

  const addClass = async () => {
    if (!form.name) return;
    setSaving(true);
    const token = generateToken();
    const pin = form.pin || generatePin();
    await addDoc(collection(db, "classes"), {
      ...form, pin, token, schoolId,
      schoolName: school?.name || "",
      createdAt: serverTimestamp()
    });
    setForm({ name:"", level:"Form 1", pin:"" });
    setShowAdd(false);
    await fetchData();
    setSaving(false);
  };

  const deleteClass = async (id, name) => {
    if (!window.confirm("Delete class " + name + "?")) return;
    setDeleting(id);
    await deleteDoc(doc(db, "classes", id));
    await fetchData();
    setDeleting("");
  };

  const copyLink = (token) => {
    navigator.clipboard.writeText(BASE_URL + "/class/" + token);
    setCopied(token);
    setTimeout(() => setCopied(""), 2000);
  };

  const getClassStudents = (cls) => students.filter(s => s.classSection === cls.name && s.level === cls.level);

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <nav style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <Link to="/" style={{color:"#94a3b8",fontSize:"13px",textDecoration:"none"}}>Back</Link>
          <span style={{fontWeight:"bold",color:"#fff",fontSize:"14px"}}>Classes / Salles ({classes.length})</span>
        </div>
        <button onClick={()=>setShowAdd(!showAdd)} style={{padding:"8px 14px",background:"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"12px",cursor:"pointer"}}>+ Add Class</button>
      </nav>

      <div style={{maxWidth:"800px",margin:"0 auto",padding:"16px"}}>
        {showAdd && (
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:"12px",padding:"20px",marginBottom:"16px"}}>
            <h3 style={{color:"#eab308",fontSize:"14px",margin:"0 0 14px"}}>Add New Class / Ajouter une Classe</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Class Name * (e.g. Form 3A)" style={{padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}} />
              <select value={form.level} onChange={e=>setForm(f=>({...f,level:e.target.value}))} style={{padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}}>
                {LEVELS.map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
            <input value={form.pin} onChange={e=>setForm(f=>({...f,pin:e.target.value}))} placeholder="PIN (4 digits, leave blank to auto-generate)" style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box",marginBottom:"14px"}} />
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={addClass} disabled={saving} style={{padding:"10px 20px",background:"#eab308",border:"none",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"13px",cursor:"pointer"}}>
                {saving?"Saving...":"Save Class"}
              </button>
              <button onClick={()=>setShowAdd(false)} style={{padding:"10px 20px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#94a3b8",fontSize:"13px",cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{textAlign:"center",padding:"40px",color:"#475569"}}>Loading...</div>
        ) : classes.length === 0 ? (
          <div style={{textAlign:"center",padding:"40px",color:"#475569",background:"rgba(255,255,255,0.02)",borderRadius:"12px"}}>
            No classes yet. Add your first class.
          </div>
        ) : classes.map(cls => {
          const classStudents = getClassStudents(cls);
          return (
            <div key={cls.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",padding:"14px 16px",marginBottom:"8px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px",marginBottom:"8px"}}>
                <div>
                  <div style={{fontSize:"15px",fontWeight:"bold",color:"#fff"}}>{cls.level} — {cls.name}</div>
                  <div style={{fontSize:"12px",color:"#64748b"}}>{classStudents.length} students / eleves</div>
                  <div style={{fontSize:"11px",color:"#eab308",marginTop:"2px"}}>PIN: <strong>{cls.pin}</strong></div>
                </div>
                <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                  <button onClick={()=>copyLink(cls.token)} style={{padding:"6px 12px",background:copied===cls.token?"rgba(16,185,129,0.2)":"rgba(234,179,8,0.1)",border:"1px solid "+(copied===cls.token?"rgba(16,185,129,0.4)":"rgba(234,179,8,0.3)"),borderRadius:"8px",color:copied===cls.token?"#10b981":"#eab308",fontSize:"12px",cursor:"pointer",fontWeight:"bold"}}>
                    {copied===cls.token?"Copied!":"Copy Link"}
                  </button>
                  <button onClick={()=>{const url=BASE_URL+"/class/"+cls.token;if(navigator.share){navigator.share({title:cls.name+" — Class Portal",text:"Access class portal",url:url});}else{navigator.clipboard.writeText(url);}}} style={{padding:"6px 12px",background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.4)",borderRadius:"8px",color:"#a5b4fc",fontSize:"12px",cursor:"pointer",fontWeight:"bold"}}>📤 Share</button>
                  <button onClick={()=>deleteClass(cls.id,cls.name)} disabled={deleting===cls.id} style={{padding:"6px 12px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"8px",color:"#fca5a5",fontSize:"12px",cursor:"pointer"}}>
                    {deleting===cls.id?"...":"Delete"}
                  </button>
                </div>
              </div>
              <div style={{padding:"6px 10px",background:"rgba(255,255,255,0.02)",borderRadius:"6px",fontSize:"11px",color:"#475569",wordBreak:"break-all",marginBottom:"8px"}}>
                {BASE_URL}/class/{cls.token}
              </div>
              {classStudents.length > 0 && (
                <div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>
                  {classStudents.map(s=>(
                    <span key={s.id} style={{fontSize:"10px",padding:"3px 8px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"20px",color:"#94a3b8"}}>{s.name}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
