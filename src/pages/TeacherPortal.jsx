import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, doc, getDoc, setDoc, serverTimestamp, query, where } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { GENERAL_SUBJECTS, SPECIALTIES, SEQUENCES, getGrade } from "../utils/grading";

export default function TeacherPortal() {
  const { token } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [idx, setIdx] = useState(0);
  const [sequence, setSequence] = useState("Sequence 1");
  const [year, setYear] = useState("2025/2026");
  const [mark, setMark] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, "teachers"), where("token", "==", token));
        const snap = await getDocs(q);
        if (snap.empty) { setError("Invalid teacher link. Contact your administrator."); setLoading(false); return; }
        const t = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setTeacher(t);
        const sSnap = await getDocs(query(collection(db, "students"), where("schoolId", "==", t.schoolId)));
        const all = sSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const eligible = all.filter(s => {
          const subjs = [...GENERAL_SUBJECTS, ...(SPECIALTIES[s.specialty] || [])];
          return subjs.some(sub => sub.includes(t.subject) || t.subject.includes(sub.split("/")[0].trim()));
        }).sort((a, b) => a.name.localeCompare(b.name));
        setStudents(eligible);
      } catch(e) { setError("Error loading. Try again."); }
      setLoading(false);
    };
    load();
  }, [token]);

  useEffect(() => {
    const loadMark = async () => {
      if (!teacher || students.length === 0) return;
      const student = students[idx];
      const key = year.replace(/[/]/g, "-") + "_" + sequence.replace(/ /g, "_");
      const snap = await getDoc(doc(db, "scores", student.id + "_" + key));
      const scores = snap.exists() ? snap.data().scores || {} : {};
      setMark(scores[teacher.subject] ?? "");
    };
    loadMark();
  }, [teacher, students, idx, sequence, year]);

  const saveMark = async () => {
    if (!teacher || students.length === 0 || mark === "") return false;
    setSaving(true);
    const student = students[idx];
    const key = year.replace(/[/]/g, "-") + "_" + sequence.replace(/ /g, "_");
    const ref = doc(db, "scores", student.id + "_" + key);
    const snap = await getDoc(ref);
    const existing = snap.exists() ? snap.data().scores || {} : {};
    existing[teacher.subject] = mark;
    await setDoc(ref, { studentId: student.id, sequence, year, scores: existing, updatedAt: serverTimestamp() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    return true;
  };

  const goNext = async () => {
    await saveMark();
    if (idx < students.length - 1) { setIdx(idx + 1); setMark(""); setSaved(false); }
  };

  const goPrev = () => {
    if (idx > 0) { setIdx(idx - 1); setMark(""); setSaved(false); }
  };

  if (loading) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",fontSize:"16px"}}>Loading...</div>;
  if (error) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444",padding:"20px",textAlign:"center",fontSize:"15px"}}>{error}</div>;

  const student = students[idx];
  const g = getGrade(mark);

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <div style={{background:"linear-gradient(135deg,#0d1b3e,#1a3a6e)",borderBottom:"2px solid #eab308",padding:"12px 16px"}}>
        <div style={{fontSize:"11px",color:"#eab308",fontWeight:"bold"}}>ReportCard Pro — Teacher Portal / Portail Enseignant</div>
        <div style={{fontSize:"14px",fontWeight:"bold",color:"#fff",marginTop:"2px"}}>{teacher.name}</div>
        <div style={{fontSize:"11px",color:"#94a3b8"}}>Subject / Matiere: <span style={{color:"#eab308"}}>{teacher.subject}</span></div>
      </div>

      <div style={{maxWidth:"580px",margin:"0 auto",padding:"16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
          <div>
            <label style={{display:"block",fontSize:"11px",color:"#94a3b8",marginBottom:"4px"}}>Year / Annee</label>
            <select value={year} onChange={e=>{setYear(e.target.value);setMark("");}} style={{width:"100%",padding:"8px",background:"#1e293b",border:"1px solid #334155",borderRadius:"8px",color:"#fff",fontSize:"12px",outline:"none"}}>
              {["2024/2025","2025/2026","2025/2026","2027/2028"].map(y=><option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:"block",fontSize:"11px",color:"#94a3b8",marginBottom:"4px"}}>Sequence</label>
            <select value={sequence} onChange={e=>{setSequence(e.target.value);setMark("");}} style={{width:"100%",padding:"8px",background:"#1e293b",border:"1px solid #334155",borderRadius:"8px",color:"#fff",fontSize:"12px",outline:"none"}}>
              {SEQUENCES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {students.length === 0 ? (
          <div style={{textAlign:"center",padding:"40px",color:"#475569",background:"rgba(255,255,255,0.02)",borderRadius:"12px"}}>
            No students found for your subject.<br/>Aucun eleve pour cette matiere.
          </div>
        ) : (
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
              <span style={{fontSize:"12px",color:"#eab308",fontWeight:"bold"}}>{idx + 1} / {students.length} students</span>
              <span style={{fontSize:"11px",color:"#64748b"}}>{sequence}</span>
            </div>

            <div style={{fontSize:"17px",fontWeight:"bold",color:"#fff",marginBottom:"2px"}}>{student.name}</div>
            <div style={{fontSize:"11px",color:"#64748b",marginBottom:"16px"}}>{student.level} · {student.classSection} · {student.section || "Grammar"}</div>

            <label style={{display:"block",fontSize:"12px",color:"#94a3b8",marginBottom:"8px",fontWeight:"bold"}}>
              Mark for {teacher.subject} (out of 20 / sur 20)
            </label>

            <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"16px"}}>
              <input
                type="number" min="0" max="20" step="0.5"
                value={mark}
                onChange={e => setMark(e.target.value)}
                style={{width:"100px",padding:"12px",background:"#1e293b",border:"2px solid #eab308",borderRadius:"8px",color:"#fff",fontSize:"24px",textAlign:"center",outline:"none"}}
                placeholder="0-20"
              />
              {mark !== "" && (
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:"26px",fontWeight:"bold",color:g.color}}>{g.grade}</div>
                  <div style={{fontSize:"10px",color:g.color}}>{g.remark} / {g.remarkFr}</div>
                </div>
              )}
            </div>

            <button onClick={saveMark} disabled={saving || mark === ""} style={{width:"100%",padding:"12px",background:saved?"#10b981":"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"8px",color:saved?"#fff":"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:"pointer",marginBottom:"10px",transition:"all 0.3s"}}>
              {saving ? "Saving... / Enregistrement..." : saved ? "Saved! / Enregistre!" : "Save Mark / Enregistrer la Note"}
            </button>

            <div style={{display:"flex",gap:"8px"}}>
              <button
                onClick={goPrev}
                disabled={idx === 0}
                style={{flex:1,padding:"10px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:idx===0?"#334155":"#94a3b8",fontSize:"12px",cursor:idx===0?"not-allowed":"pointer"}}>
                Previous / Precedent
              </button>
              <button
                onClick={goNext}
                disabled={idx === students.length - 1}
                style={{flex:1,padding:"10px",background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.3)",borderRadius:"8px",color:idx===students.length-1?"#334155":"#eab308",fontSize:"12px",cursor:idx===students.length-1?"not-allowed":"pointer",fontWeight:"bold"}}>
                Save + Next / Enregistrer + Suivant
              </button>
            </div>
          </div>
        )}
        <p style={{textAlign:"center",fontSize:"10px",color:"#334155",marginTop:"16px"}}>ReportCard Pro — Powered by Suh Ebook Empire</p>
      </div>
    </div>
  );
}
