import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, setDoc, doc, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Attendance() {
  const { school } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filterClass, setFilterClass] = useState("All");
  const [classes, setClasses] = useState([]);
  const schoolId = sessionStorage.getItem("schoolId") || school?.id;

  useEffect(() => {
    const load = async () => {
      if (!schoolId) return;
      const sq = query(collection(db, "students"), where("schoolId", "==", schoolId));
      const snap = await getDocs(sq);
      const studs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(studs);
      const cls = [...new Set(studs.map(s => s.classSection))].filter(Boolean);
      setClasses(cls);
      setLoading(false);
    };
    load();
  }, [schoolId]);

  useEffect(() => {
    const loadAttendance = async () => {
      if (!schoolId) return;
      const key = schoolId + "_" + date;
      const snap = await getDocs(query(collection(db, "attendance"), where("key", "==", key)));
      const data = {};
      snap.docs.forEach(d => { data[d.data().studentId] = d.data().status; });
      setAttendance(data);
    };
    loadAttendance();
  }, [date, schoolId]);

  const markAttendance = (studentId, status) => {
    setAttendance(prev => ({...prev, [studentId]: status}));
  };

  const saveAttendance = async () => {
    setSaving(true);
    const key = schoolId + "_" + date;
    for (const student of students) {
      const status = attendance[student.id] || "absent";
      await setDoc(doc(db, "attendance", key + "_" + student.id), {
        key, studentId: student.id, studentName: student.name,
        schoolId, date, status
      });
    }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const filtered = students.filter(s => filterClass === "All" || s.classSection === filterClass);
  const presentCount = filtered.filter(s => attendance[s.id] === "present").length;
  const absentCount = filtered.filter(s => !attendance[s.id] || attendance[s.id] === "absent").length;
  if (loading) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Loading...</div>;
  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <div style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <Link to="/" style={{color:"#94a3b8",fontSize:"13px",textDecoration:"none"}}>Back</Link>
        <div style={{fontSize:"14px",fontWeight:"bold",color:"#fff"}}>📅 Attendance</div>
        <button onClick={saveAttendance} style={{padding:"6px 14px",background:saved?"#10b981":"#3b82f6",border:"none",borderRadius:"6px",color:"#fff",fontWeight:"bold",fontSize:"12px",cursor:"pointer"}}>{saving?"Saving...":saved?"Saved!":"Save"}</button>
      </div>
      <div style={{maxWidth:"800px",margin:"0 auto",padding:"16px"}}>
        <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{padding:"8px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}} />
          <select value={filterClass} onChange={e=>setFilterClass(e.target.value)} style={{padding:"8px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}}>
            <option>All</option>{classes.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"16px"}}>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"16px",textAlign:"center"}}><div style={{fontSize:"32px",fontWeight:"bold",color:"#10b981"}}>{presentCount}</div><div style={{fontSize:"12px",color:"#64748b"}}>Present</div></div>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"16px",textAlign:"center"}}><div style={{fontSize:"32px",fontWeight:"bold",color:"#ef4444"}}>{absentCount}</div><div style={{fontSize:"12px",color:"#64748b"}}>Absent</div></div>
        </div>
        {filtered.map(student => {
          const status = attendance[student.id];
          return (
            <div key={student.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",padding:"12px",marginBottom:"8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:"14px",color:"#fff",fontWeight:"bold"}}>{student.name}</div><div style={{fontSize:"11px",color:"#64748b"}}>{student.classSection}</div></div>
              <div style={{display:"flex",gap:"6px"}}>
                <button onClick={()=>markAttendance(student.id,"present")} style={{padding:"6px 10px",background:status==="present"?"rgba(16,185,129,0.3)":"rgba(255,255,255,0.05)",border:"1px solid "+(status==="present"?"#10b981":"rgba(255,255,255,0.1)"),borderRadius:"6px",color:status==="present"?"#10b981":"#94a3b8",fontSize:"11px",cursor:"pointer"}}>Present</button>
                <button onClick={()=>markAttendance(student.id,"late")} style={{padding:"6px 10px",background:status==="late"?"rgba(234,179,8,0.3)":"rgba(255,255,255,0.05)",border:"1px solid "+(status==="late"?"#eab308":"rgba(255,255,255,0.1)"),borderRadius:"6px",color:status==="late"?"#eab308":"#94a3b8",fontSize:"11px",cursor:"pointer"}}>Late</button>
                <button onClick={()=>markAttendance(student.id,"absent")} style={{padding:"6px 10px",background:status==="absent"?"rgba(239,68,68,0.3)":"rgba(255,255,255,0.05)",border:"1px solid "+(status==="absent"?"#ef4444":"rgba(255,255,255,0.1)"),borderRadius:"6px",color:status==="absent"?"#ef4444":"#94a3b8",fontSize:"11px",cursor:"pointer"}}>Absent</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
