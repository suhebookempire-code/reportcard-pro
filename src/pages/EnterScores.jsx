import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, useParams, Link } from "react-router-dom";
import { GENERAL_SUBJECTS, SPECIALTIES, SEQUENCES, getGrade } from "../utils/grading";

export default function EnterScores() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [sequence, setSequence] = useState("Sequence 1");
  const [year, setYear] = useState("2025/2026");
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, "students", id));
      if (snap.exists()) setStudent({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    fetch();
  }, [id]);

  useEffect(() => {
    const fetchScores = async () => {
      if (!student) return;
      const key = year.replace(/[/]/g, "-") + "_" + sequence.replace(/ /g, "_");
      const snap = await getDoc(doc(db, "scores", id + "_" + key));
      setScores(snap.exists() ? snap.data().scores || {} : {});
    };
    fetchScores();
  }, [student, sequence, year, id]);

  const handleScoreChange = (subject, value) => {
    if (value === "" || (parseFloat(value) >= 0 && parseFloat(value) <= 20)) {
      setScores(prev => ({ ...prev, [subject]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const key = year.replace(/[/]/g, "-") + "_" + sequence.replace(/ /g, "_");
    await setDoc(doc(db, "scores", id + "_" + key), {
      studentId: id, sequence, year, scores, updatedAt: serverTimestamp()
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Loading...</div>;
  if (!student) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Student not found.</div>;

  const subjects = [...GENERAL_SUBJECTS, ...(SPECIALTIES[student.specialty] || [])];

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <nav style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <Link to="/" style={{color:"#94a3b8",fontSize:"13px",textDecoration:"none"}}>Back</Link>
          <div>
            <div style={{fontSize:"14px",fontWeight:"bold",color:"#fff"}}>{student.name}</div>
            <div style={{fontSize:"11px",color:"#64748b"}}>{student.level} - {student.classSection}</div>
          </div>
        </div>
        <Link to={"/report/" + id} style={{color:"#eab308",fontSize:"13px",textDecoration:"none",fontWeight:"bold"}}>View Report</Link>
      </nav>
      <div style={{maxWidth:"700px",margin:"0 auto",padding:"20px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"20px"}}>
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
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"12px",overflow:"hidden",marginBottom:"16px"}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(234,179,8,0.05)"}}>
            <span style={{fontSize:"13px",fontWeight:"bold",color:"#fff"}}>Enter Scores (out of 20) - {sequence}</span>
          </div>
          {subjects.map(subject => {
            const score = scores[subject] ?? "";
            const g = getGrade(score);
            return (
              <div key={subject} style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",alignItems:"center",gap:"12px"}}>
                <div style={{flex:1,fontSize:"13px",color:"#e2e8f0"}}>{subject}</div>
                <input type="number" min="0" max="20" step="0.5" value={score}
                  onChange={e=>handleScoreChange(subject, e.target.value)}
                  style={{width:"70px",padding:"6px 8px",background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",color:"#fff",fontSize:"14px",textAlign:"center",outline:"none"}}
                  placeholder="0-20" />
                <div style={{width:"80px",textAlign:"right"}}>
                  {score !== "" && <span style={{fontSize:"12px",fontWeight:"bold",color:g.color}}>{g.grade}</span>}
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={handleSave} disabled={saving} style={{width:"100%",padding:"14px",background:saved?"#10b981":"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"10px",color:saved?"#fff":"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:"pointer"}}>
          {saving ? "Saving..." : saved ? "Saved!" : "Save Scores"}
        </button>
      </div>
    </div>
  );
}
