import { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LEVELS, SPECIALTIES } from "../utils/grading";

export default function AddStudent() {
  const { user, school } = useAuth();
  const navigate = useNavigate();
  const schoolId = school?.id || localStorage.getItem("schoolId") || user?.uid;
  const [form, setForm] = useState({ name:"", level:"Form 1", classSection:"", admissionNumber:"", gender:"Male", dateOfBirth:"", section:"Grammar", specialty:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.classSection) { setError("Name and Class Section are required."); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, "students"), { ...form, schoolId, schoolName: school?.name || "", createdAt: serverTimestamp() });
      navigate("/");
    } catch(err) { setError("Failed to add student."); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <nav style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"12px 20px",display:"flex",alignItems:"center",gap:"12px"}}>
        <Link to="/" style={{color:"#94a3b8",fontSize:"13px",textDecoration:"none"}}>← Back</Link>
        <span style={{fontWeight:"bold",color:"#fff",fontSize:"14px"}}>Add New Student / Ajouter un Eleve</span>
      </nav>
      <div style={{maxWidth:"560px",margin:"0 auto",padding:"20px 16px"}}>
        {error && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"8px",padding:"10px",marginBottom:"16px",color:"#fca5a5",fontSize:"13px"}}>{error}</div>}
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"20px"}}>
          <div style={{marginBottom:"12px"}}>
            <label style={{display:"block",fontSize:"12px",color:"#94a3b8",marginBottom:"6px"}}>Full Name *</label>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Neba Gerald Fru" style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box"}} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
            <div>
              <label style={{display:"block",fontSize:"12px",color:"#94a3b8",marginBottom:"6px"}}>Level *</label>
              <select value={form.level} onChange={e=>setForm(f=>({...f,level:e.target.value}))} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}}>
                {LEVELS.map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:"12px",color:"#94a3b8",marginBottom:"6px"}}>Gender</label>
              <select value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}}>
                <option>Male</option><option>Female</option>
              </select>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
            <div>
              <label style={{display:"block",fontSize:"12px",color:"#94a3b8",marginBottom:"6px"}}>Class Section *</label>
              <input value={form.classSection} onChange={e=>setForm(f=>({...f,classSection:e.target.value}))} placeholder="e.g. Form 1A" style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box"}} />
            </div>
            <div>
              <label style={{display:"block",fontSize:"12px",color:"#94a3b8",marginBottom:"6px"}}>Admission No.</label>
              <input value={form.admissionNumber} onChange={e=>setForm(f=>({...f,admissionNumber:e.target.value}))} placeholder="e.g. 2026/001" style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box"}} />
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
            <div>
              <label style={{display:"block",fontSize:"12px",color:"#94a3b8",marginBottom:"6px"}}>Section</label>
              <select value={form.section} onChange={e=>setForm(f=>({...f,section:e.target.value}))} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}}>
                <option>Grammar</option><option>Technical</option>
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:"12px",color:"#94a3b8",marginBottom:"6px"}}>Date of Birth</label>
              <input type="date" value={form.dateOfBirth} onChange={e=>setForm(f=>({...f,dateOfBirth:e.target.value}))} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}} />
            </div>
          </div>
          <div style={{marginBottom:"16px"}}>
            <label style={{display:"block",fontSize:"12px",color:"#94a3b8",marginBottom:"6px"}}>Specialty (Technical only)</label>
            <select value={form.specialty} onChange={e=>setForm(f=>({...f,specialty:e.target.value}))} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}}>
              <option value="">-- Select Specialty --</option>
              {Object.keys(SPECIALTIES).map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={handleSubmit} disabled={loading} style={{flex:1,padding:"12px",background:"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:"pointer"}}>{loading?"Saving...":"Save Student"}</button>
            <Link to="/" style={{padding:"12px 20px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#94a3b8",fontSize:"13px",textDecoration:"none",display:"flex",alignItems:"center"}}>Cancel</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
