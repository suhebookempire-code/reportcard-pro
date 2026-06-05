import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useParams } from "react-router-dom";

export default function ClassList() {
  const { token } = useParams();
  const [cls, setCls] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pin, setPin] = useState("");
  const [verified, setVerified] = useState(false);
  const [pinError, setPinError] = useState("");

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

  const verifyPin = async () => {
    if (!cls) return;
    if (pin === cls.pin) {
      setVerified(true);
      const sq = query(collection(db, "students"), where("schoolId", "==", cls.schoolId), where("classSection", "==", cls.name), where("level", "==", cls.level));
      const sSnap = await getDocs(sq);
      setStudents(sSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b)=>a.name.localeCompare(b.name)));
    } else {
      setPinError("Incorrect PIN. Please try again.");
    }
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
          <p style={{color:"#eab308",fontSize:"14px",margin:"0 0 2px",fontWeight:"bold"}}>{cls.level} — {cls.name}</p>
          <p style={{color:"#64748b",fontSize:"12px",margin:0}}>{cls.schoolName}</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:"16px",padding:"24px"}}>
          <p style={{color:"#94a3b8",fontSize:"13px",margin:"0 0 16px",textAlign:"center"}}>Enter PIN to view class list / Entrez le PIN</p>
          {pinError && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"8px",padding:"10px",marginBottom:"12px",color:"#fca5a5",fontSize:"12px",textAlign:"center"}}>{pinError}</div>}
          <input
            type="password" value={pin} onChange={e=>setPin(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter") verifyPin(); }}
            placeholder="Enter PIN / Entrez le PIN"
            maxLength={4}
            style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"20px",textAlign:"center",outline:"none",boxSizing:"border-box",marginBottom:"12px",letterSpacing:"8px"}}
          />
          <button onClick={verifyPin} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"8px",color:"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:"pointer"}}>
            Access / Acceder
          </button>
        </div>
        <p style={{textAlign:"center",fontSize:"10px",color:"#334155",marginTop:"16px"}}>ReportCard Pro — Suh Ebook Empire</p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <div style={{background:"linear-gradient(135deg,#0d1b3e,#1a3a6e)",borderBottom:"2px solid #eab308",padding:"14px 20px",textAlign:"center"}}>
        <h1 style={{color:"#eab308",fontSize:"16px",margin:"0 0 2px",fontWeight:"bold"}}>{cls.schoolName}</h1>
        <h2 style={{color:"#fff",fontSize:"14px",margin:"0 0 2px"}}>CLASS LIST / LISTE DE CLASSE</h2>
        <p style={{color:"#94a3b8",fontSize:"12px",margin:0}}>{cls.level} — {cls.name}</p>
      </div>

      <div style={{maxWidth:"600px",margin:"0 auto",padding:"16px"}}>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:"bold",color:"#fff",fontSize:"14px"}}>Students / Eleves</span>
            <span style={{fontSize:"12px",color:"#eab308",fontWeight:"bold"}}>{students.length} students</span>
          </div>
          {students.length === 0 ? (
            <div style={{padding:"40px",textAlign:"center",color:"#475569"}}>No students in this class yet.</div>
          ) : students.map((student, i) => (
            <div key={student.id} style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",alignItems:"center",gap:"12px"}}>
              <div style={{width:"28px",height:"28px",borderRadius:"50%",background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"bold",color:"#eab308",flexShrink:0}}>
                {i + 1}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:"14px",fontWeight:"bold",color:"#fff"}}>{student.name}</div>
                <div style={{fontSize:"10px",color:"#64748b"}}>{student.gender} · {student.admissionNumber || "No ID"}</div>
              </div>
              <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#10b981"}}></div>
            </div>
          ))}
        </div>
        <p style={{textAlign:"center",fontSize:"10px",color:"#334155",marginTop:"16px"}}>ReportCard Pro — Suh Ebook Empire</p>
      </div>
    </div>
  );
}
