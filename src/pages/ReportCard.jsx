import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import { SPECIALTIES, GENERAL_SUBJECTS, SEQUENCES, TERMS, getGrade, getOverallRemark } from "../utils/grading";

export default function ReportCard() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [allScores, setAllScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("2025/2026");
  const [term, setTerm] = useState("Third Term / Troisieme Trimestre");
  const [logo, setLogo] = useState(null);
  const [classSize, setClassSize] = useState("");
  const [position, setPosition] = useState("");
  const [classAvg, setClassAvg] = useState("");
  const [decision, setDecision] = useState("PROMOTED");
  const [classMaster, setClassMaster] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const snap = await getDoc(doc(db, "students", id));
      if (snap.exists()) {
        const s = { id: snap.id, ...snap.data() };
        setStudent(s);
        const logoSnap = await getDoc(doc(db, "schoolLogos", s.schoolName || "default"));
        if (logoSnap.exists()) setLogo(logoSnap.data().logo);
      }
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

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setLogo(base64);
      await setDoc(doc(db, "schoolLogos", student.schoolName || "default"), { logo: base64 });
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Loading Report Card...</div>;
  if (!student) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}>Student not found.</div>;

  const termSeqs = TERMS[term] || [];
  const subjects = [...GENERAL_SUBJECTS, ...(SPECIALTIES[student.specialty] || [])];
  const getScore = (subj, seq) => allScores[seq]?.[subj] ?? "";
  const getTermAvg = (subj) => {
    const vals = termSeqs.map(s => getScore(subj, s)).filter(v => v !== "");
    if (!vals.length) return "";
    return (vals.reduce((a, b) => a + parseFloat(b), 0) / vals.length).toFixed(1);
  };
  const getAnnual = (subj) => {
    const vals = SEQUENCES.map(s => getScore(subj, s)).filter(v => v !== "");
    if (!vals.length) return "";
    return (vals.reduce((a, b) => a + parseFloat(b), 0) / vals.length).toFixed(1);
  };
  const studentAvg = (() => {
    const vals = subjects.map(s => getTermAvg(s)).filter(v => v !== "");
    if (!vals.length) return "";
    return (vals.reduce((a, b) => a + parseFloat(b), 0) / vals.length).toFixed(2);
  })();

  const cell = { padding:"4px 3px", fontSize:"9px", border:"1px solid #334155", textAlign:"center", color:"#e2e8f0" };
  const hdr = { ...cell, background:"#1e3a5f", color:"#eab308", fontWeight:"bold", fontSize:"8px" };
  const subjectCell = { ...cell, textAlign:"left", paddingLeft:"6px", color:"#e2e8f0" };

  const SubjectTable = ({ title, titleFr, subjs }) => (
    <div style={{marginBottom:"8px"}}>
      <div style={{background:"#1e3a5f",padding:"4px 8px",fontSize:"10px",fontWeight:"bold",color:"#eab308",borderRadius:"4px 4px 0 0",border:"1px solid #334155"}}>
        {title} / {titleFr}
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead>
          <tr>
            <th style={{...hdr,width:"30px"}}>Code</th>
            <th style={{...hdr,textAlign:"left",paddingLeft:"6px"}}>Subject / Matiere</th>
            {termSeqs.map(s => <th key={s} style={{...hdr,width:"35px"}}>{s.replace("Sequence ","Seq ")}</th>)}
            <th style={{...hdr,width:"35px"}}>AVG/MOY</th>
            <th style={{...hdr,width:"30px"}}>COEF</th>
            <th style={{...hdr,width:"40px"}}>Total</th>
            <th style={{...hdr,width:"55px"}}>Remark/Obs</th>
            <th style={{...hdr,width:"60px"}}>Teacher/Prof</th>
          </tr>
        </thead>
        <tbody>
          {subjs.map((subj, i) => {
            const avg = getTermAvg(subj);
            const grade = getGrade(avg ? parseFloat(avg) : null);
            const coef = 2;
            const total = avg ? (parseFloat(avg) * coef).toFixed(1) : "";
            return (
              <tr key={i} style={{background: i%2===0?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)"}}>
                <td style={cell}>{i+1}</td>
                <td style={subjectCell}>{subj.split("/")[0].trim()}</td>
                {termSeqs.map(s => <td key={s} style={{...cell,color:getScore(subj,s)!==""?(parseFloat(getScore(subj,s))>=10?"#34d399":"#fca5a5"):"#94a3b8"}}>{getScore(subj,s)||"-"}</td>)}
                <td style={{...cell,fontWeight:"bold",color:avg?(parseFloat(avg)>=10?"#34d399":"#fca5a5"):"#94a3b8"}}>{avg||"-"}</td>
                <td style={cell}>{coef}</td>
                <td style={cell}>{total||"-"}</td>
                <td style={{...cell,color:grade.color,fontSize:"8px"}}>{avg?grade.remark:"-"}</td>
                <td style={cell}></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <style>{`@media print { .no-print{display:none!important} body{background:#fff} }`}</style>
      <div className="no-print" style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
        <Link to="/" style={{color:"#94a3b8",fontSize:"13px",textDecoration:"none"}}>← Back / Retour</Link>
        <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
          <select value={term} onChange={e=>setTerm(e.target.value)} style={{padding:"6px",background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",color:"#fff",fontSize:"11px"}}>
            {Object.keys(TERMS).map(t=><option key={t}>{t}</option>)}
          </select>
          <select value={year} onChange={e=>setYear(e.target.value)} style={{padding:"6px",background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",color:"#fff",fontSize:"11px"}}>
            {["2024/2025","2025/2026","2026/2027","2027/2028"].map(y=><option key={y}>{y}</option>)}
          </select>
          <button onClick={()=>window.print()} style={{padding:"6px 14px",background:"#eab308",border:"none",borderRadius:"6px",color:"#0a0f1e",fontWeight:"bold",fontSize:"12px",cursor:"pointer"}}>🖨️ Print</button>
        </div>
      </div>

      <div style={{maxWidth:"900px",margin:"0 auto",padding:"12px",background:"#fff",color:"#000",minHeight:"100vh"}}>
        {/* HEADER */}
        <div style={{border:"2px solid #1e3a5f",borderRadius:"8px",overflow:"hidden",marginBottom:"8px"}}>
          <div style={{display:"flex",alignItems:"center",padding:"10px",background:"#fff",borderBottom:"2px solid #1e3a5f"}}>
            <div style={{marginRight:"12px"}}>
              {logo ? <img src={logo} alt="Logo" style={{width:"80px",height:"80px",objectFit:"contain"}} /> :
              <label className="no-print" style={{width:"80px",height:"80px",border:"2px dashed #1e3a5f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",borderRadius:"8px",background:"#f8fafc"}}>
                <span style={{fontSize:"24px"}}>🏫</span>
                <span style={{fontSize:"7px",color:"#1e3a5f",textAlign:"center"}}>Upload Logo</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{display:"none"}} />
              </label>}
            </div>
            <div style={{flex:1,textAlign:"center"}}>
              <div contentEditable suppressContentEditableWarning style={{fontSize:"16px",fontWeight:"bold",color:"#1e3a5f",textTransform:"uppercase"}}>{(student.schoolName||"SCHOOL NAME").toUpperCase()}</div>
              <div contentEditable suppressContentEditableWarning style={{fontSize:"10px",color:"#475569",margin:"2px 0"}}>GENERAL, COMMERCIAL & TECHNICAL EDUCATION</div>
              <div contentEditable suppressContentEditableWarning style={{fontSize:"10px",color:"#475569"}}>Tel: {student.schoolPhone||""} &nbsp;|&nbsp; North West Region, Cameroon</div>
              <div contentEditable suppressContentEditableWarning style={{fontSize:"10px",color:"#1e3a5f",fontWeight:"bold",marginTop:"2px"}}>Motto: EMPOWERED TO SERVE</div>
            </div>
          </div>

          {/* STUDENT INFO */}
          <div style={{background:"#f8fafc",padding:"8px 12px",borderBottom:"1px solid #e2e8f0"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px",fontSize:"11px",color:"#1e293b"}}>
              <div>Reg. No / N° Matricule: <strong>{student.admissionNumber||"_______"}</strong></div>
              <div>Class Code / Code Classe: <strong>{student.level} - {student.classSection}</strong></div>
              <div>Name / Nom: <strong style={{color:"#1e3a5f"}}>{student.name}</strong></div>
              <div>Section: <strong>{student.section||"Grammar"}</strong></div>
              <div>D.O.B / Date Naiss.: <strong>{student.dateOfBirth||"_______"}</strong></div>
              <div>Option / Specialite: <strong>{student.specialty||student.section||"_______"}</strong></div>
            </div>
          </div>

          <div style={{background:"#1e3a5f",padding:"6px",textAlign:"center"}}>
            <div style={{color:"#eab308",fontWeight:"bold",fontSize:"13px",letterSpacing:"2px"}}>
              {term.split("/")[0].trim().toUpperCase()} REPORT CARD / BULLETIN DE NOTES
            </div>
            <div style={{color:"#fff",fontSize:"10px"}}>Academic Year / Annee Scolaire: {year}</div>
          </div>
        </div>

        {/* SUBJECT TABLES */}
        {student.section === "Technical" ? (
          <>
            <SubjectTable title="Professional Subjects" titleFr="Matieres Professionnelles" subjs={SPECIALTIES[student.specialty]||[]} />
            <SubjectTable title="General Subjects" titleFr="Matieres Generales" subjs={GENERAL_SUBJECTS.slice(0,6)} />
            <SubjectTable title="Other Subjects" titleFr="Autres Matieres" subjs={["Manual Labour / Travaux Manuels","Sports / Sport"]} />
          </>
        ) : (
          <>
            <SubjectTable title="Core Subjects" titleFr="Matieres Principales" subjs={GENERAL_SUBJECTS.slice(0,8)} />
            <SubjectTable title="Optional Subjects" titleFr="Matieres Optionnelles" subjs={SPECIALTIES[student.specialty]||GENERAL_SUBJECTS.slice(8)} />
            <SubjectTable title="Other Subjects" titleFr="Autres Matieres" subjs={["Manual Labour / Travaux Manuels","Sports / Sport"]} />
          </>
        )}

        {/* BOTTOM SUMMARY */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginTop:"8px"}}>
          <div style={{border:"1px solid #334155",borderRadius:"6px",overflow:"hidden"}}>
            <div style={{background:"#1e3a5f",padding:"4px 8px",fontSize:"10px",fontWeight:"bold",color:"#eab308"}}>Results / Resultats</div>
            <div style={{padding:"8px",fontSize:"10px",color:"#1e293b",background:"#fff"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                <span>Student Avg / Moy Eleve:</span>
                <strong style={{color:studentAvg&&parseFloat(studentAvg)>=10?"#059669":"#dc2626",fontSize:"13px"}}>{studentAvg||"-"}/20</strong>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                <span>Position / Rang:</span>
                <input value={position} onChange={e=>setPosition(e.target.value)} className="no-print" placeholder="e.g. 3" style={{width:"60px",border:"1px solid #e2e8f0",borderRadius:"4px",padding:"2px 4px",fontSize:"10px",textAlign:"center"}} />
                <span className="print-only">{position}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                <span>Out of / Sur:</span>
                <input value={classSize} onChange={e=>setClassSize(e.target.value)} className="no-print" placeholder="e.g. 45" style={{width:"60px",border:"1px solid #e2e8f0",borderRadius:"4px",padding:"2px 4px",fontSize:"10px",textAlign:"center"}} />
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span>Class Avg / Moy Classe:</span>
                <input value={classAvg} onChange={e=>setClassAvg(e.target.value)} className="no-print" placeholder="e.g. 11.5" style={{width:"60px",border:"1px solid #e2e8f0",borderRadius:"4px",padding:"2px 4px",fontSize:"10px",textAlign:"center"}} />
              </div>
            </div>
          </div>

          <div style={{border:"1px solid #334155",borderRadius:"6px",overflow:"hidden"}}>
            <div style={{background:"#1e3a5f",padding:"4px 8px",fontSize:"10px",fontWeight:"bold",color:"#eab308"}}>Class Council Decision / Decision du Conseil</div>
            <div style={{padding:"8px",background:"#fff"}}>
              <select value={decision} onChange={e=>setDecision(e.target.value)} className="no-print" style={{width:"100%",padding:"6px",border:"1px solid #e2e8f0",borderRadius:"4px",fontSize:"11px",marginBottom:"6px",fontWeight:"bold",color:decision==="PROMOTED"?"#059669":"#dc2626"}}>
                <option>PROMOTED</option>
                <option>REPEAT</option>
                <option>EXCLUDED</option>
                <option>WITHDRAWN</option>
              </select>
              <div style={{textAlign:"center",fontSize:"16px",fontWeight:"bold",color:decision==="PROMOTED"?"#059669":"#dc2626",border:"2px solid",borderColor:decision==="PROMOTED"?"#059669":"#dc2626",borderRadius:"6px",padding:"4px"}}>
                {decision}
              </div>
            </div>
          </div>
        </div>

        {/* SIGNATURES */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginTop:"8px",padding:"8px",border:"1px solid #e2e8f0",borderRadius:"6px",background:"#fff",fontSize:"10px",color:"#1e293b"}}>
          <div>
            Class Master / Maitre de Classe: 
            <input value={classMaster} onChange={e=>setClassMaster(e.target.value)} className="no-print" placeholder="Name" style={{borderBottom:"1px solid #334155",outline:"none",marginLeft:"4px",fontSize:"10px",width:"120px"}} />
            <div style={{marginTop:"20px",borderTop:"1px solid #334155",paddingTop:"2px"}}>Signature</div>
          </div>
          <div>
            Principal / Proviseur:
            <div style={{marginTop:"20px",borderTop:"1px solid #334155",paddingTop:"2px"}}>Date & Signature</div>
          </div>
        </div>

        <div style={{textAlign:"center",fontSize:"8px",color:"#94a3b8",marginTop:"8px"}}>
          Powered by ReportCard Pro — Suh Ebook Empire
        </div>
      </div>
    </div>
  );
}
