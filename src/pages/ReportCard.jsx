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
  const [lang, setLang] = useState("both");

  useEffect(() => {
    const fetchAll = async () => {
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
    fetchAll();
  }, [id, year]);

  if (loading) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Loading...</div>;
  if (student === null) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Student not found.</div>;

  const subjects = [...GENERAL_SUBJECTS, ...(SPECIALTIES[student.specialty] || [])];
  const getScore = (subj, seq) => allScores[seq]?.[subj] ?? "";
  const getTermAvg = (subj, termName) => {
    const vals = TERMS[termName].map(s => getScore(subj, s)).filter(v => v !== "");
    if (vals.length === 0) return "";
    return (vals.reduce((a,b) => a + parseFloat(b), 0) / vals.length).toFixed(1);
  };
  const getAnnual = (subj) => {
    const vals = SEQUENCES.map(s => getScore(subj, s)).filter(v => v !== "");
    if (vals.length === 0) return "";
    return (vals.reduce((a,b) => a + parseFloat(b), 0) / vals.length).toFixed(1);
  };
  const getOverallAvg = () => {
    const vals = subjects.map(s => getAnnual(s)).filter(v => v !== "");
    if (vals.length === 0) return null;
    return (vals.reduce((a,b) => a + parseFloat(b), 0) / vals.length).toFixed(2);
  };
  const overall = getOverallAvg();
  const remark = getOverallRemark(overall ? parseFloat(overall) : null);
  const th = { padding:"6px 8px", fontSize:"11px", color:"#94a3b8", fontWeight:"600", borderBottom:"1px solid rgba(255,255,255,0.08)", whiteSpace:"nowrap", background:"rgba(234,179,8,0.08)", textAlign:"center" };
  const td = { padding:"6px 8px", fontSize:"11px", borderBottom:"1px solid rgba(255,255,255,0.04)", color:"#cbd5e1", textAlign:"center" };

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <nav style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
        <Link to="/" style={{color:"#94a3b8",fontSize:"13px",textDecoration:"none"}}>Back</Link>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          <select value={year} onChange={e=>setYear(e.target.value)} style={{padding:"6px 10px",background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",color:"#fff",fontSize:"12px"}}>
            {["2024/2025","2025/2026","2026/2027","2027/2028"].map(y=><option key={y}>{y}</option>)}
          </select>
          <select value={lang} onChange={e=>setLang(e.target.value)} style={{padding:"6px 10px",background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",color:"#fff",fontSize:"12px"}}>
            <option value="both">EN + FR</option>
            <option value="en">English Only</option>
            <option value="fr">Francais Seulement</option>
          </select>
          <button onClick={()=>window.print()} style={{padding:"6px 14px",background:"#eab308",border:"none",borderRadius:"6px",color:"#0a0f1e",fontWeight:"bold",fontSize:"12px",cursor:"pointer"}}>Print</button>
        </div>
      </nav>
      <div style={{maxWidth:"1000px",margin:"0 auto",padding:"20px"}}>
        <div style={{background:"linear-gradient(135deg,#0d1b3e,#1a3a6e)",padding:"20px",textAlign:"center",borderRadius:"12px 12px 0 0",borderBottom:"3px solid #eab308"}}>
          <h1 style={{color:"#eab308",fontSize:"20px",margin:"0 0 4px",fontWeight:"bold"}}>SUNRISE COLLEGE</h1>
          <p style={{color:"#94a3b8",fontSize:"12px",margin:"0 0 2px"}}>Mile 8 Mankon, Bamenda, North West Region</p>
          <h2 style={{color:"#fff",fontSize:"15px",margin:"8px 0 0",fontWeight:"bold"}}>
            {lang==="fr" ? "BULLETIN DE NOTES" : lang==="en" ? "STUDENT REPORT CARD" : "STUDENT REPORT CARD / BULLETIN DE NOTES"}
          </h2>
          <p style={{color:"#eab308",fontSize:"12px",margin:"4px 0 0"}}>
            {lang==="fr" ? "Annee Scolaire" : "Academic Year"}: {year}
          </p>
        </div>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderTop:"none",padding:"16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"}}>
          <div>
            <p style={{fontSize:"12px",color:"#94a3b8",margin:"0 0 4px"}}>{lang==="fr"?"Nom":"Name"}: <strong style={{color:"#fff"}}>{student.name}</strong></p>
            <p style={{fontSize:"12px",color:"#94a3b8",margin:"0 0 4px"}}>{lang==="fr"?"Classe":"Class"}: <strong style={{color:"#fff"}}>{student.level} - {student.classSection}</strong></p>
            <p style={{fontSize:"12px",color:"#94a3b8",margin:"0 0 4px"}}>{lang==="fr"?"Sexe":"Gender"}: <strong style={{color:"#fff"}}>{student.gender}</strong></p>
          </div>
          <div>
            <p style={{fontSize:"12px",color:"#94a3b8",margin:"0 0 4px"}}>{lang==="fr"?"N Matricule":"Admission No."}: <strong style={{color:"#eab308"}}>{student.admissionNumber||"-"}</strong></p>
            <p style={{fontSize:"12px",color:"#94a3b8",margin:"0 0 4px"}}>Section: <strong style={{color:"#fff"}}>{student.section||"Grammar"}</strong></p>
            {student.specialty && <p style={{fontSize:"12px",color:"#94a3b8",margin:"0 0 4px"}}>{lang==="fr"?"Specialite":"Specialty"}: <strong style={{color:"#fff",fontSize:"11px"}}>{student.specialty}</strong></p>}
          </div>
        </div>
        <div style={{overflowX:"auto",marginBottom:"16px"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                <th style={{...th,textAlign:"left",minWidth:"140px"}}>{lang==="fr"?"Matiere":"Subject"}</th>
                {SEQUENCES.map(s=><th key={s} style={th}>{s.replace("Sequence ","Seq ")}</th>)}
                <th style={{...th,background:"rgba(59,130,246,0.1)"}}>T1</th>
                <th style={{...th,background:"rgba(59,130,246,0.1)"}}>T2</th>
                <th style={{...th,background:"rgba(59,130,246,0.1)"}}>T3</th>
                <th style={{...th,background:"rgba(16,185,129,0.1)"}}>{lang==="fr"?"Moy.":"Annual"}</th>
                <th style={{...th,background:"rgba(16,185,129,0.1)"}}>Grade</th>
                <th style={{...th,background:"rgba(16,185,129,0.1)"}}>{lang==="fr"?"Appreciation":"Remark"}</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subj,i)=>{
                const annual=getAnnual(subj);
                const g=getGrade(annual);
                return (
                  <tr key={subj} style={{background:i%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
                    <td style={{...td,textAlign:"left",fontWeight:"500",color:"#e2e8f0"}}>{subj}</td>
                    {SEQUENCES.map(s=>{
                      const sc=getScore(subj,s);
                      return <td key={s} style={{...td,color:sc?getGrade(sc).color:"#374151"}}>{sc||"-"}</td>;
                    })}
                    {Object.keys(TERMS).map(t=>{
                      const avg=getTermAvg(subj,t);
                      return <td key={t} style={{...td,color:avg?getGrade(avg).color:"#374151",background:"rgba(59,130,246,0.03)"}}>{avg||"-"}</td>;
                    })}
                    <td style={{...td,fontWeight:"bold",color:g.color,background:"rgba(16,185,129,0.03)"}}>{annual||"-"}</td>
                    <td style={{...td,fontWeight:"bold",color:g.color,background:"rgba(16,185,129,0.03)"}}>{annual?g.grade:"-"}</td>
                    <td style={{...td,color:g.color,background:"rgba(16,185,129,0.03)",fontSize:"10px"}}>
                      {annual?(lang==="fr"?g.remarkFr:lang==="en"?g.remark:g.remark+" / "+g.remarkFr):"-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{background:"rgba(234,179,8,0.08)",fontWeight:"bold"}}>
                <td style={{...td,textAlign:"left",color:"#eab308",fontWeight:"bold"}}>{lang==="fr"?"MOYENNE GENERALE":"OVERALL AVERAGE"}</td>
                {SEQUENCES.map(s=><td key={s} style={td}></td>)}
                <td style={td}></td><td style={td}></td><td style={td}></td>
                <td style={{...td,color:"#eab308",fontSize:"14px",fontWeight:"bold"}}>{overall||"-"}</td>
                <td style={{...td,color:overall?getGrade(overall).color:"#374151",fontWeight:"bold"}}>{overall?getGrade(overall).grade:"-"}</td>
                <td style={{...td,color:"#eab308",fontSize:"10px"}}>{overall?(lang==="fr"?remark.fr:lang==="en"?remark.en:remark.en+" / "+remark.fr):"-"}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px",marginBottom:"16px"}}>
          {[lang==="fr"?"Signature Directeur":"Principal",lang==="fr"?"Prof. Principal":"Class Teacher",lang==="fr"?"Parent/Tuteur":"Parent/Guardian"].map(label=>(
            <div key={label} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"8px",padding:"12px",textAlign:"center"}}>
              <p style={{fontSize:"11px",color:"#64748b",margin:"0 0 4px"}}>{label}</p>
              <div style={{height:"40px",borderBottom:"1px solid rgba(255,255,255,0.1)",marginBottom:"4px"}}></div>
              <p style={{fontSize:"10px",color:"#475569",margin:0}}>Signature</p>
            </div>
          ))}
        </div>
        <p style={{textAlign:"center",fontSize:"10px",color:"#334155"}}>Powered by ReportCard Pro - Suh Ebook Empire</p>
      </div>
    </div>
  );
}
