import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, doc, getDoc, setDoc, serverTimestamp, query, where } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { GENERAL_SUBJECTS, SPECIALTIES, SEQUENCES, getGrade } from "../utils/grading";

export default function TeacherPortal() {
  const { token } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sequence, setSequence] = useState("Sequence 1");
  const [year, setYear] = useState("2026/2027");
  const [score, setScore] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const q = query(collection(db, "teachers"), where("token", "==", token));
        const snap = await getDocs(q);
        if (snap.empty) { setError("Invalid teacher link."); setLoading(false); return; }
        const t = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setTeacher(t);
        const sSnap = await getDocs(collection(db, "students"));
        const allStudents = sSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const eligible = allStudents.filter(s => {
          const subjs = [...GENERAL_SUBJECTS, ...(SPECIALTIES[s.specialty] || [])];
          return subjs.includes(t.subject);
        });
        setStudents(eligible);
      } catch(e) { setError("Error loading data."); }
      setLoading(false);
    };
    fetchTeacher();
  }, [token]);

  useEffect(() => {
    const fetchScore = async () => {
      const key = year.replace(/[/]/g, "-") + "_" + sequence.replace(/ /g, "_");
      const snap = await getDoc(doc(db, "scores", selectedStudent.id + "_" + key));
      const scores = snap.exists() ? snap.data().scores || {} : {};
      setScore(scores[teacher.subject] ?? "");
    };
    fetchScore();
  }, [selectedStudent, sequence, year, teacher]);

  const handleSave = async () => {
    setSaving(true);
    const key = year.replace(/[/]/g, "-") + "_" + sequence.replace(/ /g, "_");
    const ref = doc(db, "scores", selectedStudent.id + "_" + key);
    const snap = await getDoc(ref);
    const existing = snap.exists() ? snap.data().scores || {} : {};
    existing[teacher.subject] = score;
    await setDoc(ref, { studentId: selectedStudent.id, sequence, year, scores: existing, updatedAt: serverTimestamp() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Loading...</div>;
  if (error) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444",fontSize:"16px"}}>{error}</div>;

  const g = getGrade(score);

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <div style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"12px 20px"}}>
        <div style={{fontSize:"14px",fontWeight:"bold",color:"#fff"}}>{teacher.name}</div>
        <div style={{fontSize:"11px",color:"#eab308"}}>Subject: {teacher.subject}</div>
        <div style={{fontSize:"11px",color:"#64748b"}}>ReportCard Pro — Powered by Suh Ebook Empire</div>
      </div>
      <div style={{maxWidth:"600px",margin:"0 auto",padding:"20px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"}}>
          <div>
            <label style={{display:"block",fontSize:"12px",color:"#94a3b8",marginBottom:"6px"}}>Academic Year</label>
            <select value={year} onChange={e=>setYear(e.target.value)} style={{width:"100%",padding:"10px",background:"#1e293b",border:"1px solid #334155",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}}>
              {["2024/2025","2025/2026","2026/2027","2027/2028"].map(y=><option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:"block",fontSize:"12px",color:"#94a3b8",marginBottom:"6px"}}>Sequence</label>
            <select value={sequence} onChange={e=>setSequence(e.target.value)} style={{width:"100%",padding:"10px",background:"#1e293b",border:"1px solid #334155",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}}>
              {SEQUENCES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{marginBottom:"16px"}}>
          <label style={{display:"block",fontSize:"12px",color:"#94a3b8",marginBottom:"6px"}}>Select Student</label>
          <select value={selectedStudent?.id || ""} onChange={e=>setSelectedStudent(students.find(s=>s.id===e.target.value)||null)} style={{width:"100%",padding:"10px",background:"#1e293b",border:"1px solid #334155",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}}>
            <option value="">-- Select Student --</option>
            {students.map(s=><option key={s.id} value={s.id}>{s.name} — {s.level} {s.classSection}</option>)}
          </select>
        </div>
        {selectedStudent && (
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"20px"}}>
            <div style={{marginBottom:"16px"}}>
              <div style={{fontSize:"15px",fontWeight:"bold",color:"#fff"}}>{selectedStudent.name}</div>
              <div style={{fontSize:"12px",color:"#64748b"}}>{selectedStudent.level} · {selectedStudent.classSection}</div>
            </div>
            <div style={{marginBottom:"12px"}}>
              <label style={{display:"block",fontSize:"13px",color:"#94a3b8",marginBottom:"8px"}}>Mark for {teacher.subject} — {sequence} (out of 20)</label>
              <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
                <input type="number" min="0" max="20" step="0.5" value={score} onChange={e=>setScore(e.target.value)}
                  style={{width:"100px",padding:"10px",background:"#1e293b",border:"1px solid #334155",borderRadius:"8px",color:"#fff",fontSize:"20px",textAlign:"center",outline:"none"}}
                  placeholder="0-20" />
                {score !== "" && (
                  <div>
                    <div style={{fontSize:"24px",fontWeight:"bold",color:g.color}}>{g.grade}</div>
                    <div style={{fontSize:"12px",color:g.color}}>{g.remark} / {g.remarkFr}</div>
                  </div>
                )}
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} style={{width:"100%",padding:"12px",background:saved?"#10b981":"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"8px",color:saved?"#fff":"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:"pointer"}}>
            </button>
          </div>
        )}
        {students.length === 0 && (
          <div style={{textAlign:"center",padding:"40px",color:"#475569",background:"rgba(255,255,255,0.02)",borderRadius:"12px"}}>
            No students found for your subject.
          </div>
        )}
      </div>
    </div>
  );
}
