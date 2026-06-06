import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, serverTimestamp } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { SPECIALTIES } from "../utils/grading";

export default function ClassList() {
  const { token } = useParams();
  const [cls, setCls] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pin, setPin] = useState("");
  const [verified, setVerified] = useState(false);
  const [pinError, setPinError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [form, setForm] = useState({ name:"", gender:"Male", admissionNumber:"", dateOfBirth:"", section:"Grammar", specialty:"" });

  useEffect(() => {
    const load = async () => {
      const q = query(collection(db, "classes"), where("token", "==", token));
      const snap = await getDocs(q);
      if (snap.empty) { setError("Class not found."); setLoading(false); return; }
      const c = { id: snap.docs[0].id, ...snap.docs[0].data() };
      setCls(c);
      setLoading(false);
    };
    load();
  }, [token]);

  const fetchStudents = async (c) => {
    const cl = c || cls;
    if (!cl) return;
    const sq = query(collection(db, "students"), where("schoolId", "==", cl.schoolId), where("classSection", "==", cl.name), where("level", "==", cl.level));
    const sSnap = await getDocs(sq);
    setStudents(sSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b)=>a.name.localeCompare(b.name)));
  };

  const verifyPin = async () => {
    if (pin === cls.pin) {
      setVerified(true);
      await fetchStudents(cls);
    } else {
      setPinError("Incorrect PIN. Try again.");
    }
  };

  const addStudent = async () => {
    if (!form.name) return;
    setSaving(true);
    await addDoc(collection(db, "students"), { ...form, level: cls.level, classSection: cls.name, schoolId: cls.schoolId, schoolName: cls.schoolName, createdAt: serverTimestamp() });
    setForm({ name:"", gender:"Male", admissionNumber:"", dateOfBirth:"", section:"Grammar", specialty:"" });
    setShowAdd(false);
    await fetchStudents();
    setSaving(false);
  };

  const removeStudent = async (id, name) => {
    if (!window.confirm("Remove " + name + "?")) return;
    setDeleting(id);
    await deleteDoc(doc(db, "students", id));
    await fetchStudents();
    setDeleting("");
  };

  if (loading) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Loading...</div>;
  if (error) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444",padding:"20px",textAlign:"center"}}>{error}</div>;

  if (!verified) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0a0f1e,#0d1b3e)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div style={{width:"100%",maxWidth:"360px"}}>
        <div style={{textAlign:"center",marginBottom:"24px"}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"60px",height:"60px",background:"linear-gradient(135deg,#eab308,#ca8a04)",borderRadius:"14px",marginBottom:"12px"}}>
            <span style={{fontSize:"22px",fontWeight:"bold",color:"#0a0f1e"}}>RC</span>
          </div>
          <h1 style={{color:"#fff",fontSize:"18px",margin:"0 0 4px"}}>Class List / Liste de Classe</h1>
          <p style={{color:"#eab308",fontSize:"14px",margin:"0 0 2px",fontWeight:"bold"}}>{cls.level} - {cls.name}</p>
          <p style={{color:"#64748b",fontSize:"12px",margin:0}}>{cls.schoolName}</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:"16px",padding:"24px"}}>
          {pinError && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"8px",padding:"10px",marginBottom:"12px",color:"#fca5a5",fontSize:"12px",textAlign:"center"}}>{pinError}</div>}
          <input type="password" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") verifyPin(); }} placeholder="Enter PIN" maxLength={4} style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"24px",textAlign:"center",outline:"none",boxSizing:"border-box",marginBottom:"12px",letterSpacing:"8px"}} />
          <button onClick={verifyPin} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:"pointer"}}>Access / Acceder</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <div style={{background:"linear-gradient(135deg,#0d1b3e,#1a3a6e)",borderBottom:"2px solid #eab308",padding:"14px 20px",textAlign:"center"}}>
        <h1 style={{color:"#eab308",fontSize:"16px",margin:"0 0 2px",fontWeight:"bold"}}>{cls.schoolName}</h1>
        <h2 style={{color:"#fff",fontSize:"14px",margin:"0 0 2px"}}>CLASS LIST / LISTE DE CLASSE</h2>
        <p style={{color:"#94a3b8",fontSize:"12px",margin:0}}>{cls.level} - {cls.name}</p>
      </div>
      <div style={{maxWidth:"600px",margin:"0 auto",padding:"16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
          <span style={{fontSize:"14px",fontWeight:"bold",color:"#fff"}}>{students.length} Students / Eleves</span>
          <button onClick={()=>setShowAdd(!showAdd)} style={{padding:"8px 14px",background:"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"12px",cursor:"pointer"}}>+ Add Student</button>
        </div>
        {showAdd && (
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:"12px",padding:"16px",marginBottom:"16px"}}>
            <h3 style={{color:"#eab308",fontSize:"13px",margin:"0 0 12px"}}>Add to {cls.level} - {cls.name}</h3>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Full Name *" style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box",marginBottom:"8px"}} />
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"8px"}}>
              <select value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))} style={{padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}}><option>Male</option><option>Female</option></select>
              <input value={form.admissionNumber} onChange={e=>setForm(f=>({...f,admissionNumber:e.target.value}))} placeholder="Admission No." style={{padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}} />
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"8px"}}>
              <input type="date" value={form.dateOfBirth} onChange={e=>setForm(f=>({...f,dateOfBirth:e.target.value}))} style={{padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}} />
              <select value={form.section} onChange={e=>setForm(f=>({...f,section:e.target.value}))} style={{padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}}><option>Grammar</option><option>Technical</option></select>
            </div>
            <select value={form.specialty} onChange={e=>setForm(f=>({...f,specialty:e.target.value}))} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box",marginBottom:"12px"}}>
              <option value="">-- Specialty (Technical only) --</option>
              {Object.keys(SPECIALTIES).map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={addStudent} disabled={saving} style={{padding:"10px 20px",background:"#eab308",border:"none",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"13px",cursor:"pointer"}}>{saving?"Saving...":"Add to Class"}</button>
              <button onClick={()=>setShowAdd(false)} style={{padding:"10px 20px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#94a3b8",fontSize:"13px",cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        )}
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"12px",overflow:"hidden"}}>
          {students.length === 0 ? (
            <div style={{padding:"40px",textAlign:"center",color:"#475569"}}>No students yet. Add the first student.</div>
          ) : students.map((student, i) => (
            <div key={student.id} style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",alignItems:"center",gap:"12px"}}>
              <div style={{width:"28px",height:"28px",borderRadius:"50%",background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"bold",color:"#eab308",flexShrink:0}}>{i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:"13px",fontWeight:"bold",color:"#fff"}}>{student.name}</div>
                <div style={{fontSize:"10px",color:"#64748b"}}>{student.gender} · {student.admissionNumber||"No ID"} · {student.section||"Grammar"}</div>
              </div>
              <button onClick={()=>removeStudent(student.id,student.name)} disabled={deleting===student.id} style={{padding:"5px 10px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"6px",color:"#fca5a5",fontSize:"11px",cursor:"pointer"}}>{deleting===student.id?"...":"Remove"}</button>
            </div>
          ))}
        </div>
        <p style={{textAlign:"center",fontSize:"10px",color:"#334155",marginTop:"16px"}}>ReportCard Pro — Suh Ebook Empire</p>
      </div>
    </div>
  );
}
