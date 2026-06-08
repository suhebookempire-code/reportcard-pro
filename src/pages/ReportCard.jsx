import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import { SPECIALTIES, GENERAL_SUBJECTS, SEQUENCES, TERMS, getGrade } from "../utils/grading";

export default function ReportCard() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [allScores, setAllScores] = useState({});
  const [teachers, setTeachers] = useState({});
  const [coefs, setCoefs] = useState({});
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("2025/2026");
  const [term, setTerm] = useState("Third Term / Troisieme Trimestre");
  const [logo, setLogo] = useState(null);
  const [header, setHeader] = useState({
    subtitle: "GENERAL, COMMERCIAL & TECHNICAL EDUCATION",
    tel: "", motto: "EMPOWERED TO SERVE"
  });

  const saveHeader = async (field, value) => {
    const newHeader = {...header, [field]: value};
    setHeader(newHeader);
    await setDoc(doc(db, "schoolInfo", student?.schoolName || "default"), newHeader, {merge: true});
  };
  const [classSize, setClassSize] = useState("");
  const [position, setPosition] = useState("");
  const [classAvg, setClassAvg] = useState("");
  const [decision, setDecision] = useState("PROMOTED");
  const [classMaster, setClassMaster] = useState("");
  const [principal, setPrincipal] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const snap = await getDoc(doc(db, "students", id));
      if (snap.exists()) {
        const s = { id: snap.id, ...snap.data() };
        setStudent(s);
        const logoSnap = await getDoc(doc(db, "schoolLogos", s.schoolName || "default"));
        if (logoSnap.exists()) setLogo(logoSnap.data().logo);
        const infoSnap2 = await getDoc(doc(db, "schoolInfo", s.schoolName || "default"));
        if (infoSnap2.exists()) setHeader(prev => ({...prev, ...infoSnap2.data()}));
        const infoSnap = await getDoc(doc(db, "reportMeta", id));
        if (infoSnap.exists()) {
          const d = infoSnap.data();
          setTeachers(d.teachers || {});
          setCoefs(d.coefs || {});
          setClassSize(d.classSize || "");
          setPosition(d.position || "");
          setClassAvg(d.classAvg || "");
          setDecision(d.decision || "PROMOTED");
          setClassMaster(d.classMaster || "");
          setPrincipal(d.principal || "");
        }
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

  const saveScore = async (seq, subj, val) => {
    if (val !== "" && (parseFloat(val) < 0 || parseFloat(val) > 20)) return;
    const newScores = { ...allScores, [seq]: { ...(allScores[seq] || {}), [subj]: val } };
    setAllScores(newScores);
    const key = year.replace(/[/]/g, "-") + "_" + seq.replace(/ /g, "_");
    await setDoc(doc(db, "scores", id + "_" + key), { studentId: id, sequence: seq, year, scores: newScores[seq] || {} });
  };

  const saveMeta = async () => {
    setSaving(true);
    await setDoc(doc(db, "reportMeta", id), { teachers, coefs, classSize, position, classAvg, decision, classMaster, principal });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Loading...</div>;
  if (!student) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}>Student not found.</div>;

  const termSeqs = TERMS[term] || [];
  const subjects = [...GENERAL_SUBJECTS, ...(SPECIALTIES[student.specialty] || [])];
  const getScore = (subj, seq) => allScores[seq]?.[subj] ?? "";
  const getTermAvg = (subj) => {
    const vals = termSeqs.map(s => getScore(subj, s)).filter(v => v !== "");
    if (!vals.length) return "";
    return (vals.reduce((a, b) => a + parseFloat(b), 0) / vals.length).toFixed(1);
  };
  const studentAvg = (() => {
    const vals = subjects.map(s => getTermAvg(s)).filter(v => v !== "");
    if (!vals.length) return "";
    return (vals.reduce((a, b) => a + parseFloat(b), 0) / vals.length).toFixed(2);
  })();

  const inp = { border:"1px solid #cbd5e1", borderRadius:"3px", padding:"2px 3px", fontSize:"9px", width:"100%", textAlign:"center", outline:"none", background:"#f8fafc", color:"#1e293b" };
  const cell = { padding:"3px 2px", fontSize:"9px", border:"1px solid #cbd5e1", textAlign:"center", color:"#1e293b", background:"#fff" };
  const hdr = { padding:"4px 3px", fontSize:"8px", border:"1px solid #1e3a5f", textAlign:"center", color:"#eab308", fontWeight:"bold", background:"#1e3a5f" };

  const SubjectTable = ({ title, titleFr, subjs }) => (
    <div style={{marginBottom:"6px"}}>
      <div style={{background:"#1e3a5f",padding:"3px 8px",fontSize:"10px",fontWeight:"bold",color:"#eab308",border:"1px solid #1e3a5f"}}>
        {title} / {titleFr}
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead>
          <tr>
            <th style={{...hdr,width:"22px"}}>#</th>
            <th style={{...hdr,textAlign:"left",paddingLeft:"4px"}}>Subject / Matiere</th>
            {termSeqs.map(s=><th key={s} style={{...hdr,width:"32px"}}>{s.replace("Sequence ","Seq ")}</th>)}
            <th style={{...hdr,width:"32px"}}>AVG</th>
            <th style={{...hdr,width:"28px"}}>COEF</th>
            <th style={{...hdr,width:"35px"}}>Total</th>
            <th style={{...hdr,width:"50px"}}>Remark</th>
            <th style={{...hdr,width:"65px"}}>Teacher/Prof</th>
          </tr>
        </thead>
        <tbody>
          {subjs.map((subj, i) => {
            const avg = getTermAvg(subj);
            const grade = getGrade(avg ? parseFloat(avg) : null);
            const coef = coefs[subj] || 2;
            const total = avg ? (parseFloat(avg) * coef).toFixed(1) : "";
            return (
              <tr key={i} style={{background:i%2===0?"#fff":"#f8fafc"}}>
                <td style={cell}>{i+1}</td>
                <td style={{...cell,textAlign:"left",paddingLeft:"4px",fontSize:"9px"}}>{subj.split("/")[0].trim()}</td>
                {termSeqs.map(s=>(
                  <td key={s} style={cell}>
                    <input value={getScore(subj,s)} onChange={e=>saveScore(s,subj,e.target.value)} style={{...inp,color:getScore(subj,s)!==""?(parseFloat(getScore(subj,s))>=10?"#059669":"#dc2626"):"#1e293b",width:"28px"}} placeholder="-" />
                  </td>
                ))}
                <td style={{...cell,fontWeight:"bold",color:avg?(parseFloat(avg)>=10?"#059669":"#dc2626"):"#94a3b8"}}>{avg||"-"}</td>
                <td style={cell}>
                  <input value={coef} onChange={e=>setCoefs(c=>({...c,[subj]:e.target.value}))} style={{...inp,width:"24px"}} />
                </td>
                <td style={cell}>{total||"-"}</td>
                <td style={{...cell,fontSize:"8px",color:grade.color}}>{avg?grade.remark:"-"}</td>
                <td style={cell}>
                  <input value={teachers[subj]||""} onChange={e=>setTeachers(t=>({...t,[subj]:e.target.value}))} style={{...inp,width:"60px",fontSize:"8px"}} placeholder="Name" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e"}}>
      <style>{`@media print{.no-print{display:none!important} body{background:#fff}}`}</style>
      <div className="no-print" style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
        <Link to="/" style={{color:"#94a3b8",fontSize:"13px",textDecoration:"none"}}>← Back</Link>
        <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
          <select value={term} onChange={e=>setTerm(e.target.value)} style={{padding:"6px",background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",color:"#fff",fontSize:"11px"}}>
            {Object.keys(TERMS).map(t=><option key={t}>{t}</option>)}
          </select>
          <select value={year} onChange={e=>setYear(e.target.value)} style={{padding:"6px",background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",color:"#fff",fontSize:"11px"}}>
            {["2024/2025","2025/2026","2026/2027","2027/2028"].map(y=><option key={y}>{y}</option>)}
          </select>
          <button onClick={saveMeta} style={{padding:"6px 14px",background:saved?"#10b981":"#3b82f6",border:"none",borderRadius:"6px",color:"#fff",fontWeight:"bold",fontSize:"12px",cursor:"pointer"}}>{saving?"Saving...":saved?"✅ Saved!":"💾 Save"}</button>
          <button onClick={()=>window.print()} style={{padding:"6px 14px",background:"#eab308",border:"none",borderRadius:"6px",color:"#0a0f1e",fontWeight:"bold",fontSize:"12px",cursor:"pointer"}}>🖨️ Print</button>
        </div>
      </div>

      <div style={{maxWidth:"900px",margin:"0 auto",padding:"8px",background:"#fff",color:"#000"}}>
        <div style={{border:"2px solid #1e3a5f",marginBottom:"6px"}}>
          <div style={{display:"flex",alignItems:"center",padding:"8px",borderBottom:"2px solid #1e3a5f"}}>
            <div style={{marginRight:"10px"}}>
              {logo ? <img src={logo} alt="Logo" style={{width:"75px",height:"75px",objectFit:"contain"}} /> :
              <label className="no-print" style={{width:"75px",height:"75px",border:"2px dashed #1e3a5f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",borderRadius:"6px"}}>
                <span style={{fontSize:"20px"}}>🏫</span>
                <span style={{fontSize:"7px",color:"#1e3a5f",textAlign:"center"}}>Upload Logo</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{display:"none"}} />
              </label>}
              {logo && <label className="no-print" style={{display:"block",textAlign:"center",cursor:"pointer",fontSize:"8px",color:"#3b82f6",marginTop:"2px"}}>✏️ Change<input type="file" accept="image/*" onChange={handleLogoUpload} style={{display:"none"}} /></label>}
            </div>
            <div style={{flex:1,textAlign:"center"}}>
              <div contentEditable suppressContentEditableWarning onBlur={e=>saveHeader("name",e.target.innerText)} style={{fontSize:"15px",fontWeight:"bold",color:"#1e3a5f",textTransform:"uppercase",outline:"none",borderBottom:"1px dashed #cbd5e1"}}>{(student.schoolName||"SCHOOL NAME").toUpperCase()}</div>
              <div contentEditable suppressContentEditableWarning onBlur={e=>saveHeader("subtitle",e.target.innerText)} style={{fontSize:"10px",color:"#475569",margin:"2px 0",outline:"none",borderBottom:"1px dashed #cbd5e1"}}>{header.subtitle}</div>
              <div contentEditable suppressContentEditableWarning onBlur={e=>saveHeader("tel",e.target.innerText)} style={{fontSize:"10px",color:"#475569",outline:"none",borderBottom:"1px dashed #cbd5e1"}}>{header.tel||"Tel: _________ | Email: _________ | North West Region, Cameroon"}</div>
              <div contentEditable suppressContentEditableWarning onBlur={e=>saveHeader("motto",e.target.innerText)} style={{fontSize:"10px",color:"#1e3a5f",fontWeight:"bold",marginTop:"2px",outline:"none",borderBottom:"1px dashed #cbd5e1"}}>{header.motto}</div>
            </div>
          </div>

          <div style={{background:"#f8fafc",padding:"6px 10px",borderBottom:"1px solid #e2e8f0"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px",fontSize:"10px",color:"#1e293b"}}>
              <div>Reg. No: <input defaultValue={student.admissionNumber||""} style={{...inp,width:"80px",display:"inline"}} /></div>
              <div>Class / Classe: <strong>{student.level} - {student.classSection}</strong></div>
              <div>Name / Nom: <input defaultValue={student.name||""} style={{...inp,width:"120px",display:"inline",fontWeight:"bold",color:"#1e3a5f"}} /></div>
              <div>Section: <strong>{student.section||"Grammar"}</strong></div>
              <div>D.O.B: <input defaultValue={student.dateOfBirth||""} style={{...inp,width:"80px",display:"inline"}} /></div>
              <div>Option: <strong>{student.specialty||student.section||"_______"}</strong></div>
            </div>
          </div>

          <div style={{background:"#1e3a5f",padding:"5px",textAlign:"center"}}>
            <div style={{color:"#eab308",fontWeight:"bold",fontSize:"12px",letterSpacing:"1px"}}>{term.split("/")[0].trim().toUpperCase()} REPORT CARD / BULLETIN DE NOTES</div>
            <div style={{color:"#fff",fontSize:"10px"}}>Academic Year / Annee Scolaire: {year}</div>
          </div>
        </div>

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

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginTop:"6px"}}>
          <div style={{border:"1px solid #cbd5e1",borderRadius:"4px",overflow:"hidden"}}>
            <div style={{background:"#1e3a5f",padding:"3px 8px",fontSize:"10px",fontWeight:"bold",color:"#eab308"}}>Results / Resultats</div>
            <div style={{padding:"6px",fontSize:"10px",color:"#1e293b",background:"#fff"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
                <span>Student Avg / Moy Eleve:</span>
                <strong style={{color:studentAvg&&parseFloat(studentAvg)>=10?"#059669":"#dc2626",fontSize:"12px"}}>{studentAvg||"-"}/20</strong>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px",alignItems:"center"}}>
                <span>Position / Rang:</span>
                <input value={position} onChange={e=>setPosition(e.target.value)} style={{...inp,width:"50px"}} placeholder="3" />
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px",alignItems:"center"}}>
                <span>Out of / Sur:</span>
                <input value={classSize} onChange={e=>setClassSize(e.target.value)} style={{...inp,width:"50px"}} placeholder="45" />
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>Class Avg / Moy Classe:</span>
                <input value={classAvg} onChange={e=>setClassAvg(e.target.value)} style={{...inp,width:"50px"}} placeholder="11.5" />
              </div>
            </div>
          </div>

          <div style={{border:"1px solid #cbd5e1",borderRadius:"4px",overflow:"hidden"}}>
            <div style={{background:"#1e3a5f",padding:"3px 8px",fontSize:"10px",fontWeight:"bold",color:"#eab308"}}>Class Council / Conseil de Classe</div>
            <div style={{padding:"6px",background:"#fff"}}>
              <select value={decision} onChange={e=>setDecision(e.target.value)} style={{width:"100%",padding:"4px",border:"1px solid #e2e8f0",borderRadius:"4px",fontSize:"11px",marginBottom:"4px",fontWeight:"bold",color:decision==="PROMOTED"?"#059669":"#dc2626"}}>
                <option>PROMOTED</option>
                <option>REPEAT</option>
                <option>EXCLUDED</option>
                <option>WITHDRAWN</option>
              </select>
              <div style={{textAlign:"center",fontSize:"14px",fontWeight:"bold",color:decision==="PROMOTED"?"#059669":"#dc2626",border:"2px solid",borderColor:decision==="PROMOTED"?"#059669":"#dc2626",borderRadius:"4px",padding:"3px"}}>
                {decision}
              </div>
            </div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginTop:"6px",padding:"8px",border:"1px solid #e2e8f0",fontSize:"10px",color:"#1e293b",background:"#fff"}}>
          <div>
            <div>Class Master / Maitre de Classe:</div>
            <input value={classMaster} onChange={e=>setClassMaster(e.target.value)} style={{...inp,marginTop:"2px"}} placeholder="Full Name" />
            <div style={{marginTop:"16px",borderTop:"1px solid #334155",paddingTop:"2px",fontSize:"9px"}}>Signature & Date</div>
          </div>
          <div>
            <div>Principal / Proviseur:</div>
            <input value={principal} onChange={e=>setPrincipal(e.target.value)} style={{...inp,marginTop:"2px"}} placeholder="Full Name" />
            <div style={{marginTop:"16px",borderTop:"1px solid #334155",paddingTop:"2px",fontSize:"9px"}}>Signature & Date</div>
          </div>
        </div>

        <div style={{textAlign:"center",fontSize:"8px",color:"#94a3b8",marginTop:"6px",paddingBottom:"8px"}}>
          Powered by ReportCard Pro — Suh Ebook Empire
        </div>
      </div>
    </div>
  );
}
