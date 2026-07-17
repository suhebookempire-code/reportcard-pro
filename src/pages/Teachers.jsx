import { useState, useEffect } from "react";
import { db, firebaseConfig } from "../firebase/config";
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc, serverTimestamp, query, where } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GENERAL_SUBJECTS, SPECIALTIES } from "../utils/grading";

const BASE_URL = "https://reportcard-pro-suhebookempires-projects.vercel.app";
const secondaryApp = initializeApp(firebaseConfig, "TeacherCreation");
const teacherAuth = getAuth(secondaryApp);

function generateToken() {
  return Math.random().toString(36).substring(2,10).toUpperCase() + Math.random().toString(36).substring(2,10).toUpperCase();
}

function generateTempPassword() {
  return Math.random().toString(36).slice(-8) + "Aa1!";
}

export default function Teachers() {
  const { user, school } = useAuth();
  const schoolId = sessionStorage.getItem("schoolId") || school?.id || user?.uid;
  const schoolName = school?.name || sessionStorage.getItem("schoolName") || "";
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", subject:"", phone:"", email:"", assignedClasses:[] });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState("");
  const [deleting, setDeleting] = useState("");
  const [classes, setClasses] = useState([]);
  const [tempPasswords, setTempPasswords] = useState({});
  const [resetSending, setResetSending] = useState("");

  const allSubjects = [...GENERAL_SUBJECTS, ...Object.values(SPECIALTIES).flat().filter((v,i,a)=>a.indexOf(v)===i)].sort();

  const fetchTeachers = async () => {
    const cq = query(collection(db, "classes"), where("schoolId", "==", schoolId));
    const cSnap = await getDocs(cq);
    setClasses(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    const q = query(collection(db, "teachers"), where("schoolId", "==", schoolId));
    const snap = await getDocs(q);
    setTeachers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchTeachers(); }, []);

  const addTeacher = async () => {
    if (!form.name || !form.subject || !form.email) {
      alert("Name, subject, and email are all required to create a teacher login.");
      return;
    }
    setSaving(true);
    try {
      const token = generateToken();
      const tempPassword = generateTempPassword();
      const cred = await createUserWithEmailAndPassword(teacherAuth, form.email, tempPassword);
      const teacherRef = await addDoc(collection(db, "teachers"), { ...form, token, schoolId, schoolName, uid: cred.user.uid, createdAt: serverTimestamp() });
      await setDoc(doc(db, "users", cred.user.uid), {
        role: "teacher",
        schoolId,
        teacherId: teacherRef.id,
        email: form.email,
        mustChangePassword: true,
        createdAt: serverTimestamp()
      });
      setTempPasswords(prev => ({ ...prev, [teacherRef.id]: tempPassword }));
      setForm({ name:"", subject:"", phone:"", email:"", assignedClasses:[] });
      setShowAdd(false);
      await fetchTeachers();
    } catch (e) {
      alert("Error creating teacher account: " + e.message);
    }
    setSaving(false);
  };

  const sendReset = async (email) => {
    setResetSending(email);
    try {
      await sendPasswordResetEmail(teacherAuth, email);
      alert("Password reset email sent to " + email);
    } catch (e) {
      alert("Error sending reset email: " + e.message);
    }
    setResetSending("");
  };

  const deleteTeacher = async (id, name) => {
    if (!window.confirm("Delete teacher " + name + "? Their link will stop working.")) return;
    setDeleting(id);
    await deleteDoc(doc(db, "teachers", id));
    await fetchTeachers();
    setDeleting("");
  };

  const copyLoginLink = (teacherId, email) => {
    const link = BASE_URL + "/login?email=" + encodeURIComponent(email);
    navigator.clipboard.writeText(link);
    setCopied(teacherId);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <nav style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <Link to="/" style={{color:"#94a3b8",fontSize:"13px",textDecoration:"none"}}>Back</Link>
          <span style={{fontWeight:"bold",color:"#fff",fontSize:"14px"}}>Teachers / Enseignants ({teachers.length})</span>
        </div>
        <button onClick={()=>setShowAdd(!showAdd)} style={{padding:"8px 14px",background:"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"12px",cursor:"pointer"}}>+ Add Teacher</button>
      </nav>

      <div style={{maxWidth:"800px",margin:"0 auto",padding:"16px"}}>
        {showAdd && (
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:"12px",padding:"20px",marginBottom:"16px"}}>
            <h3 style={{color:"#eab308",fontSize:"14px",margin:"0 0 14px"}}>Add New Teacher / Ajouter un Enseignant</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Full Name *" style={{padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}} />
              <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="Phone / Telephone" style={{padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}} />
            </div>
            <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="Email (optional)" style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box",marginBottom:"10px"}} />
            <select value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none",marginBottom:"10px"}}>
              <option value="">-- Select Subject / Choisir Matiere --</option>
              {allSubjects.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <div style={{marginBottom:"14px"}}>
              <div style={{fontSize:"12px",color:"#94a3b8",marginBottom:"6px"}}>Assign Classes (select all that apply):</div>
              {classes.map(cls=>(
                <label key={cls.id} style={{display:"flex",alignItems:"center",gap:"8px",padding:"6px",cursor:"pointer",color:"#e2e8f0",fontSize:"13px"}}>
                  <input type="checkbox" checked={form.assignedClasses.includes(cls.id)} onChange={e=>{
                    if(e.target.checked) setForm(f=>({...f,assignedClasses:[...f.assignedClasses,cls.id]}));
                    else setForm(f=>({...f,assignedClasses:f.assignedClasses.filter(id=>id!==cls.id)}));
                  }} />
                  {cls.level} - {cls.name}
                </label>
              ))}
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={addTeacher} disabled={saving} style={{padding:"10px 20px",background:"#eab308",border:"none",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"13px",cursor:"pointer"}}>
                {saving?"Saving...":"Save Teacher"}
              </button>
              <button onClick={()=>setShowAdd(false)} style={{padding:"10px 20px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#94a3b8",fontSize:"13px",cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{textAlign:"center",padding:"40px",color:"#475569"}}>Loading...</div>
        ) : teachers.length === 0 ? (
          <div style={{textAlign:"center",padding:"40px",color:"#475569",background:"rgba(255,255,255,0.02)",borderRadius:"12px"}}>
            No teachers yet. Add your first teacher.
          </div>
        ) : teachers.map(teacher => (
          <div key={teacher.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",padding:"14px 16px",marginBottom:"8px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px",marginBottom:"8px"}}>
              <div>
                <div style={{fontSize:"15px",fontWeight:"bold",color:"#fff"}}>{teacher.name}</div>
                <div style={{fontSize:"12px",color:"#eab308"}}>Subject: {teacher.subject}</div>
                {teacher.phone && <div style={{fontSize:"11px",color:"#64748b"}}>Phone: {teacher.phone}</div>}
              </div>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                <button onClick={()=>copyLoginLink(teacher.id, teacher.email)} style={{padding:"7px 12px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:"8px",color:"#6ee7b7",fontSize:"12px",cursor:"pointer",fontWeight:"bold"}}>
                  {copied===teacher.id?"Copied!":"Copy Login Link"}
                </button>
                <button onClick={()=>sendReset(teacher.email)} disabled={resetSending===teacher.email} style={{padding:"7px 12px",background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.3)",borderRadius:"8px",color:"#eab308",fontSize:"12px",cursor:"pointer",fontWeight:"bold"}}>
                  {resetSending===teacher.email?"Sending...":"Send Password Reset"}
                </button>
                <button onClick={()=>deleteTeacher(teacher.id,teacher.name)} disabled={deleting===teacher.id} style={{padding:"7px 12px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"8px",color:"#fca5a5",fontSize:"12px",cursor:"pointer"}}>
                  {deleting===teacher.id?"...":"Delete"}
                </button>
              </div>
            </div>
            <div style={{padding:"6px 10px",background:"rgba(255,255,255,0.02)",borderRadius:"6px",fontSize:"11px",color:"#475569",wordBreak:"break-all"}}>
              Login email: {teacher.email}
            </div>
            {tempPasswords[teacher.id] && (
              <div style={{marginTop:"8px",padding:"10px",background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:"8px",fontSize:"12px",color:"#6ee7b7"}}>
                Temporary password: <strong>{tempPasswords[teacher.id]}</strong><br/>
                Share this with {teacher.name} — they should change it after first login.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
