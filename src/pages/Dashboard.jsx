import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LEVELS } from "../utils/grading";

export default function Dashboard() {
  const { user, school, logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState("All");
  const [deleting, setDeleting] = useState("");
  const schoolId = sessionStorage.getItem("schoolId") || school?.id || user?.uid;
  const schoolName = school?.name || sessionStorage.getItem("schoolName") || "ReportCard Pro";

  const fetchData = async () => {
    try {
      const sq = query(collection(db, "students"), where("schoolId", "==", schoolId));
      const sSnap = await getDocs(sq);
      setStudents(sSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b)=>a.name.localeCompare(b.name)));
      const cq = query(collection(db, "classes"), where("schoolId", "==", schoolId));
      const cSnap = await getDocs(cq);
      setClasses(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [schoolId]);

  useEffect(() => {
    const code = sessionStorage.getItem("schoolCode");
    if (!code && !user) { navigate("/login"); }
  }, [user]);

  const schoolCode = school?.code || sessionStorage.getItem("schoolCode") || "";
  const handleLogout = async () => { await logout(); navigate("/school/" + schoolCode); };

  const deleteStudent = async (id, name) => {
    if (!window.confirm("Delete " + name + "?")) return;
    setDeleting(id);
    await deleteDoc(doc(db, "students", id));
    await fetchData();
    setDeleting("");
  };

  const filtered = filterLevel === "All" ? students : students.filter(s => s.level === filterLevel);

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <nav style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"10px 16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"36px",height:"36px",background:"linear-gradient(135deg,#eab308,#ca8a04)",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",color:"#0a0f1e",fontSize:"14px"}}>RC</div>
            <div style={{fontSize:"13px",fontWeight:"bold",color:"#fff"}}>{schoolName}</div>
          </div>
          <button onClick={handleLogout} style={{padding:"6px 14px",background:"rgba(239,68,68,0.2)",border:"1px solid rgba(239,68,68,0.5)",borderRadius:"8px",color:"#ff6b6b",fontSize:"12px",cursor:"pointer",fontWeight:"bold"}}>Logout</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"6px"}}>
          <Link to="/classes" style={{padding:"8px 4px",background:"rgba(139,92,246,0.15)",border:"1px solid rgba(139,92,246,0.3)",borderRadius:"8px",color:"#a78bfa",fontSize:"11px",textDecoration:"none",textAlign:"center",fontWeight:"bold"}}>Classes</Link>
          <Link to="/teachers" style={{padding:"8px 4px",background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:"8px",color:"#60a5fa",fontSize:"11px",textDecoration:"none",textAlign:"center",fontWeight:"bold"}}>Teachers</Link>
          <Link to="/fees" style={{padding:"8px 4px",background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:"8px",color:"#34d399",fontSize:"11px",textDecoration:"none",textAlign:"center",fontWeight:"bold"}}>Fees</Link>
          <Link to="/attendance" style={{padding:"8px 4px",background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:"8px",color:"#60a5fa",fontSize:"11px",textDecoration:"none",textAlign:"center",fontWeight:"bold"}}>Attendance</Link>
          <Link to="/notifications" style={{padding:"8px 4px",background:"rgba(37,211,102,0.15)",border:"1px solid rgba(37,211,102,0.3)",borderRadius:"8px",color:"#25d366",fontSize:"11px",textDecoration:"none",textAlign:"center",fontWeight:"bold"}}>WhatsApp</Link>
          <Link to="/add-student" style={{padding:"8px 4px",background:"linear-gradient(135deg,#eab308,#ca8a04)",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"11px",textDecoration:"none",textAlign:"center"}}>+ Student</Link>
        </div>
      </nav>
      <div style={{maxWidth:"1000px",margin:"0 auto",padding:"16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"16px"}}>
          {[{label:"Students",value:students.length,color:"#eab308"},{label:"Grammar",value:students.filter(s=>s.section==="Grammar").length,color:"#3b82f6"},{label:"Technical",value:students.filter(s=>s.section==="Technical").length,color:"#10b981"},{label:"Classes",value:classes.length,color:"#8b5cf6"}].map(stat=>(
            <div key={stat.label} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"12px",textAlign:"center"}}>
              <div style={{fontSize:"24px",fontWeight:"bold",color:stat.color}}>{stat.value}</div>
              <div style={{fontSize:"11px",color:"#64748b",marginTop:"4px"}}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"12px"}}>
          {["All",...LEVELS].map(l=>(
            <button key={l} onClick={()=>setFilterLevel(l)} style={{padding:"5px 10px",background:filterLevel===l?"rgba(234,179,8,0.2)":"rgba(255,255,255,0.05)",border:"1px solid "+(filterLevel===l?"rgba(234,179,8,0.4)":"rgba(255,255,255,0.1)"),borderRadius:"20px",color:filterLevel===l?"#eab308":"#64748b",fontSize:"11px",cursor:"pointer"}}>Filter: {l}</button>
          ))}
        </div>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:"bold",color:"#fff",fontSize:"14px"}}>Students / Eleves ({filtered.length})</span>
          </div>
          {filtered.length === 0 ? (
            <div style={{textAlign:"center",padding:"40px"}}>
              <p style={{color:"#475569",marginBottom:"12px"}}>No students yet / Aucun eleve</p>
              <Link to="/classes" style={{padding:"10px 20px",background:"#eab308",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"13px",textDecoration:"none"}}>Go to Classes to Add Students</Link>
            </div>
          ) : filtered.map(student=>(
            <div key={student.id} style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{width:"32px",height:"32px",background:"linear-gradient(135deg,#eab308,#ca8a04)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",color:"#0a0f1e",fontSize:"12px"}}>
                  {student.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{fontSize:"13px",fontWeight:"bold",color:"#fff"}}>{student.name}</div>
                  <div style={{fontSize:"10px",color:"#64748b"}}>{student.level} · {student.classSection} · {student.section||"Grammar"}</div>
                  {student.specialty && <div style={{fontSize:"9px",color:"#475569"}}>{student.specialty}</div>}
                </div>
              </div>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                <Link to={"/enter-scores/"+student.id} style={{padding:"5px 10px",background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:"6px",color:"#eab308",fontSize:"11px",textDecoration:"none",fontWeight:"bold"}}>Scores</Link>
                <Link to={"/report/"+student.id} style={{padding:"5px 10px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"6px",color:"#94a3b8",fontSize:"11px",textDecoration:"none"}}>Report</Link>
                <Link to={"/charts/"+student.id} style={{padding:"5px 10px",background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:"6px",color:"#a5b4fc",fontSize:"11px",textDecoration:"none"}}>Charts</Link>
                <Link to={"/annual/"+student.id} style={{padding:"5px 10px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:"6px",color:"#34d399",fontSize:"11px",textDecoration:"none"}}>Annual</Link>
                <button onClick={()=>deleteStudent(student.id,student.name)} disabled={deleting===student.id} style={{padding:"5px 10px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"6px",color:"#fca5a5",fontSize:"11px",cursor:"pointer"}}>{deleting===student.id?"...":"Delete"}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
