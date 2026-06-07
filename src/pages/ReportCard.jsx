import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import { GENERAL_SUBJECTS, SPECIALTIES, SEQUENCES, TERMS, getGrade, getOverallRemark } from "../utils/grading";

export default function ReportCard() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [allScores, setAllScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("2026/2027");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const snap = await getDoc(doc(db, "students", id));
      if (snap.exists()) setStudent({ id: snap.id, ...snap.data() });
      const sd = {};
      for (const seq of SEQUENCES) {
        const key = year.replace(/[/]/g, "-") + "_" + seq.replace(/ /g, "_");
        const s = await getDoc(doc(db, "scores", id + "_" + key));
        if (s.exists()) sd[seq] = s.data().scores || {};
      }
      setAllScores(sd);
      setLoading(false);
    };
    load();
  }, [id, year]);

  if (loading) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Loading Report Card...</div>;
  if (!student) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}>Student not found.</div>;

  const subjects = [...GENERAL_SUBJECTS, ...(SPECIALTIES[student.specialty] || [])];
  const getScore = (subj, seq) => allScores[seq]?.[subj] ?? "";
  const getTermAvg = (subj, term) => {
    const vals = TERMS[term].map(s => getScore(subj, s)).filter(v => v !== "");
    if (!vals.length) return "";
    return (vals.reduce((a, b) => a + parseFloat(b), 0) / vals.length).toFixed(1);
  };
  const getAnnual = (subj) => {
    const vals = SEQUENCES.map(s => getScore(subj, s)).filter(v => v !== "");
    if (!vals.length) return "";
    return (vals.reduce((a, b) => a + parseFloat(b), 0) / vals.length).toFixed(1);
  };
  const overall = (() => {
    const vals = subjects.map(s => getAnnual(s)).filter(v => v !== "");
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + parseFloat(b), 0) / vals.length).toFixed(2);
  })();
  const remark = getOverallRemark(overall ? parseFloat(overall) : null);
  const th = { padding:"5px 4px", fontSize:"9px", color:"#94a3b8", fontWeight:"600", borderBottom:"1px solid rgba(255,255,255,0.08)", whiteSpace:"nowrap", background:"rgba(234,179,8,0.08)", textAlign:"center" };
  const td = { padding:"4px", fontSize:"9px", borderBottom:"1px solid rgba(255,255,255,0.04)", color:"#cbd5e1", textAlign:"center" };

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <div style={{background:"rgba(255,255,255,0.02)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
        <Link to="/" style={{color:"#94a3b8",fontSize:"13px",textDecoration:"none"}}>Back / Retour</Link>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <select value={year} onChange={e=>setYear(e.target.value)} style={{padding:"6px 10px",background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",color:"#fff",fontSize:"12px"}}>
            {["2024/2025","2025/2026","2026/2027","2027/2028"].map(y=><option key={y}>{y}</option>)}
          </select>
          <button onClick={()=>window.print()} style={{padding:"6px 14px",background:"#eab308",border:"none",borderRadius:"6px",color:"#0a0f1e",fontWeight:"bold",fontSize:"12px",cursor:"pointer"}}>Print / Imprimer</button>
        </div>
      </div>
      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"12px"}}>
        <div style={{background:"linear-gradient(135deg,#0d1b3e,#1a3a6e)",padding:"14px",textAlign:"center",borderRadius:"10px 10px 0 0",borderBottom:"3px solid #eab308"}}>
          <h1 style={{color:"#eab308",fontSize:"20px",margin:"0 0 2px",fontWeight:"bold",letterSpacing:"2px"}}>{(student.schoolName || "SCHOOL NAME").toUpperCase()}</h1>
          <p style={{color:"#94a3b8",fontSize:"11px",margin:"0 0 1px"}}>{student.schoolName || ""} — North West Region, Cameroon</p>
          <p style={{color:"#64748b",fontSize:"10px",margin:"0 0 8px",fontStyle:"italic"}}>Peace, Unity and Progress / Paix, Unite et Progres</p>
          <h2 style={{color:"#fff",fontSize:"14px",margin:"0",fontWeight:"bold"}}>STUDENT REPORT CARD / BULLETIN DE NOTES</h2>
          <p style={{color:"#eab308",fontSize:"11px",margin:"4px 0 0"}}>Academic Year / Annee Scolaire: {year}</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderTop:"none",padding:"10px 14px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginBottom:"10px"}}>
          <div>
            <p style={{fontSize:"11px",color:"#94a3b8",margin:"0 0 3px"}}>Name / Nom: <strong style={{color:"#fff"}}>{student.name}</strong></p>
            <p style={{fontSize:"11px",color:"#94a3b8",margin:"0 0 3px"}}>Class / Classe: <strong style={{color:"#fff"}}>{student.level} - {student.classSection}</strong></p>
            <p style={{fontSize:"11px",color:"#94a3b8",margin:"0 0 3px"}}>Gender / Sexe: <strong style={{color:"#fff"}}>{student.gender}</strong></p>
            <p style={{fontSize:"11px",color:"#94a3b8",margin:"0"}}>Section: <strong style={{color:"#fff"}}>{student.section || "Grammar"}</strong></p>
          </div>
          <div>
            <p style={{fontSize:"11px",color:"#94a3b8",margin:"0 0 3px"}}>Admission No. / N Matricule: <strong style={{color:"#eab308"}}>{student.admissionNumber || "-"}</strong></p>
            <p style={{fontSize:"11px",color:"#94a3b8",margin:"0 0 3px"}}>DOB / Date Naissance: <strong style={{color:"#fff"}}>{student.dateOfBirth || "-"}</strong></p>
            {student.specialty && <p style={{fontSize:"10px",color:"#94a3b8",margin:"0 0 3px"}}>Specialty / Specialite: <strong style={{color:"#fff"}}>{student.specialty}</strong></p>}
            <p style={{fontSize:"11px",color:"#94a3b8",margin:"0"}}>Overall / Moyenne: <strong style={{color:"#eab308",fontSize:"16px"}}>{overall || "-"}/20</strong> <span style={{color:overall?getGrade(overall).color:"#374151",fontWeight:"bold"}}>{overall ? getGrade(overall).grade : ""}</span></p>
          </div>
        </div>
        <div style={{overflowX:"auto",marginBottom:"10px"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                <th style={{...th,textAlign:"left",minWidth:"180px"}}>Subject / Matiere</th>
                {SEQUENCES.map(s=><th key={s} style={th}>{s.replace("Sequence ","S")}</th>)}
                <th style={{...th,background:"rgba(59,130,246,0.12)"}}>T1</th>
                <th style={{...th,background:"rgba(59,130,246,0.12)"}}>T2</th>
                <th style={{...th,background:"rgba(59,130,246,0.12)"}}>T3</th>
                <th style={{...th,background:"rgba(16,185,129,0.12)"}}>Annual/Annuel</th>
                <th style={{...th,background:"rgba(16,185,129,0.12)"}}>Grade</th>
                <th style={{...th,background:"rgba(16,185,129,0.12)",minWidth:"110px"}}>Remark/Appreciation</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subj, i) => {
                const annual = getAnnual(subj);
                const g = getGrade(annual);
                return (
                  <tr key={subj} style={{background:i%2===0?"rgba(255,255,255,0.015)":"transparent"}}>
                    <td style={{...td,textAlign:"left",color:"#e2e8f0",fontWeight:"500"}}>{subj}</td>
                    {SEQUENCES.map(s => {
                      const sc = getScore(subj, s);
                      return <td key={s} style={{...td,color:sc?getGrade(sc).color:"#374151"}}>{sc || "-"}</td>;
                    })}
                    {Object.keys(TERMS).map(t => {
                      const avg = getTermAvg(subj, t);
                      return <td key={t} style={{...td,color:avg?getGrade(avg).color:"#374151",background:"rgba(59,130,246,0.03)"}}>{avg || "-"}</td>;
                    })}
                    <td style={{...td,fontWeight:"bold",color:g.color,background:"rgba(16,185,129,0.03)"}}>{annual || "-"}</td>
                    <td style={{...td,fontWeight:"bold",color:g.color,background:"rgba(16,185,129,0.03)"}}>{annual ? g.grade : "-"}</td>
                    <td style={{...td,color:g.color,background:"rgba(16,185,129,0.03)",fontSize:"8px"}}>{annual ? g.remark + " / " + g.remarkFr : "-"}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{background:"rgba(234,179,8,0.08)",fontWeight:"bold"}}>
                <td style={{...td,textAlign:"left",color:"#eab308",fontWeight:"bold"}}>OVERALL / MOYENNE GENERALE</td>
                {SEQUENCES.map(s=><td key={s} style={td}></td>)}
                <td style={td}></td><td style={td}></td><td style={td}></td>
                <td style={{...td,color:"#eab308",fontSize:"14px",fontWeight:"bold"}}>{overall || "-"}</td>
                <td style={{...td,color:overall?getGrade(overall).color:"#374151",fontWeight:"bold"}}>{overall ? getGrade(overall).grade : "-"}</td>
                <td style={{...td,color:"#eab308",fontSize:"8px"}}>{overall ? remark.en + " / " + remark.fr : "-"}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"10px"}}>
          {[{en:"Principal",fr:"Directeur"},{en:"Class Teacher",fr:"Prof. Principal"},{en:"Parent/Guardian",fr:"Parent/Tuteur"}].map((l,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"8px",padding:"10px",textAlign:"center"}}>
              <p style={{fontSize:"10px",color:"#64748b",margin:"0 0 2px"}}>{l.en} Signature</p>
              <p style={{fontSize:"9px",color:"#475569",margin:"0 0 10px"}}>Signature {l.fr}</p>
              <div style={{height:"30px",borderBottom:"1px solid rgba(255,255,255,0.1)"}}></div>
            </div>
          ))}
        </div>
        <p style={{textAlign:"center",fontSize:"9px",color:"#334155",margin:"8px 0 0"}}>Powered by ReportCard Pro — Suh Ebook Empire</p>
      </div>
    </div>
  );
}
