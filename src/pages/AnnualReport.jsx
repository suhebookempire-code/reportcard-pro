import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import { GENERAL_SUBJECTS, SPECIALTIES, SEQUENCES, TERMS, getGrade } from "../utils/grading";

export default function AnnualReport() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [allScores, setAllScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("2026/2027");
  const [logo, setLogo] = useState(null);
  const [decision, setDecision] = useState("PROMOTED");
  const [classMaster, setClassMaster] = useState("");
  const [position1, setPosition1] = useState("");
  const [position2, setPosition2] = useState("");
  const [position3, setPosition3] = useState("");
  const [classSize, setClassSize] = useState("");

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

  if (loading) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Loading Annual Report...</div>;
  if (!student) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}>Student not found.</div>;
  const subjects = [...GENERAL_SUBJECTS, ...(SPECIALTIES[student.specialty] || [])];
  const getScore = (subj, seq) => allScores[seq]?.[subj] ?? "";
  const getTermAvg = (subj, termSeqs) => {
    const vals = termSeqs.map(s => getScore(subj, s)).filter(v => v !== "");
    if (!vals.length) return "";
    return (vals.reduce((a,b) => a + parseFloat(b), 0) / vals.length).toFixed(1);
  };
  const getAnnual = (subj) => {
    const vals = SEQUENCES.map(s => getScore(subj, s)).filter(v => v !== "");
    if (!vals.length) return "";
    return (vals.reduce((a,b) => a + parseFloat(b), 0) / vals.length).toFixed(1);
  };
  const t1seqs = TERMS["First Term / Premier Trimestre"];
  const t2seqs = TERMS["Second Term / Deuxieme Trimestre"];
  const t3seqs = TERMS["Third Term / Troisieme Trimestre"];
  const overallAvg = (() => {
    const vals = subjects.map(s => getAnnual(s)).filter(v => v !== "");
    if (!vals.length) return null;
    return (vals.reduce((a,b) => a + parseFloat(b), 0) / vals.length).toFixed(2);
  })();
  const cell = {padding:"3px 2px",fontSize:"8px",border:"1px solid #cbd5e1",textAlign:"center",color:"#1e293b",background:"#fff"};
  const hdr = {padding:"4px 3px",fontSize:"7px",border:"1px solid #1e3a5f",textAlign:"center",color:"#eab308",fontWeight:"bold",background:"#1e3a5f"};

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e"}}>
      <style>{"@media print{.no-print{display:none!important} body{background:#fff}}"}</style>
      <div className="no-print" style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
        <Link to="/" style={{color:"#94a3b8",fontSize:"13px",textDecoration:"none"}}>Back</Link>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <select value={year} onChange={e=>setYear(e.target.value)} style={{padding:"6px",background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",color:"#fff",fontSize:"11px"}}>
            {["2024/2025","2026/2027","2026/2027","2027/2028"].map(y=><option key={y}>{y}</option>)}
          </select>
          <button onClick={()=>window.print()} style={{padding:"6px 14px",background:"#eab308",border:"none",borderRadius:"6px",color:"#0a0f1e",fontWeight:"bold",fontSize:"12px",cursor:"pointer"}}>Print</button>
        </div>
      </div>
      <div style={{maxWidth:"900px",margin:"0 auto",padding:"8px",background:"#fff",color:"#000"}}>
        <div style={{border:"2px solid #1e3a5f",marginBottom:"6px"}}>
          <div style={{display:"flex",alignItems:"center",padding:"8px",borderBottom:"2px solid #1e3a5f"}}>
            <div style={{marginRight:"10px"}}>{logo && <img src={logo} alt="Logo" style={{width:"70px",height:"70px",objectFit:"contain"}} />}</div>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:"15px",fontWeight:"bold",color:"#1e3a5f"}}>{(student.schoolName||"SCHOOL").toUpperCase()}</div>
              <div style={{fontSize:"10px",color:"#475569"}}>North West Region, Cameroon</div>
            </div>
          </div>
          <div style={{background:"#1e3a5f",padding:"5px",textAlign:"center"}}>
            <div style={{color:"#eab308",fontWeight:"bold",fontSize:"13px"}}>ANNUAL REPORT CARD / BULLETIN ANNUEL</div>
            <div style={{color:"#fff",fontSize:"10px"}}>Academic Year: {year}</div>
          </div>
          <div style={{background:"#f8fafc",padding:"6px 10px",fontSize:"10px",color:"#1e293b",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px"}}>
            <div>Name: <strong>{student.name}</strong></div>
            <div>Class: <strong>{student.level} - {student.classSection}</strong></div>
            <div>Reg No: <strong>{student.admissionNumber||"-"}</strong></div>
            <div>Section: <strong>{student.section||"Grammar"}</strong></div>
          </div>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"8px"}}>
          <thead>
            <tr>
              <th style={{...hdr,width:"20px"}}>#</th>
              <th style={{...hdr,textAlign:"left",paddingLeft:"4px"}}>Subject / Matiere</th>
              <th style={{...hdr,width:"35px"}}>T1 Avg</th>
              <th style={{...hdr,width:"35px"}}>T2 Avg</th>
              <th style={{...hdr,width:"35px"}}>T3 Avg</th>
              <th style={{...hdr,width:"40px"}}>Annual</th>
              <th style={{...hdr,width:"50px"}}>Remark</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subj,i) => {
              const t1 = getTermAvg(subj, t1seqs);
              const t2 = getTermAvg(subj, t2seqs);
              const t3 = getTermAvg(subj, t3seqs);
              const ann = getAnnual(subj);
              const grade = getGrade(ann ? parseFloat(ann) : null);
              return (
                <tr key={i} style={{background:i%2===0?"#fff":"#f8fafc"}}>
                  <td style={cell}>{i+1}</td>
                  <td style={{...cell,textAlign:"left",paddingLeft:"4px"}}>{subj.split("/")[0].trim()}</td>
                  <td style={{...cell,color:t1?(parseFloat(t1)>=10?"#059669":"#dc2626"):"#94a3b8"}}>{t1||"-"}</td>
                  <td style={{...cell,color:t2?(parseFloat(t2)>=10?"#059669":"#dc2626"):"#94a3b8"}}>{t2||"-"}</td>
                  <td style={{...cell,color:t3?(parseFloat(t3)>=10?"#059669":"#dc2626"):"#94a3b8"}}>{t3||"-"}</td>
                  <td style={{...cell,fontWeight:"bold",color:ann?(parseFloat(ann)>=10?"#059669":"#dc2626"):"#94a3b8"}}>{ann||"-"}</td>
                  <td style={{...cell,fontSize:"7px",color:grade.color}}>{ann?grade.remark:"-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"8px"}}>
          <thead>
            <tr>
              <th style={{...hdr,width:"20px"}}>#</th>
              <th style={{...hdr,textAlign:"left",paddingLeft:"4px"}}>Subject / Matiere</th>
              <th style={{...hdr,width:"35px"}}>T1 Avg</th>
              <th style={{...hdr,width:"35px"}}>T2 Avg</th>
              <th style={{...hdr,width:"35px"}}>T3 Avg</th>
              <th style={{...hdr,width:"40px"}}>Annual</th>
              <th style={{...hdr,width:"50px"}}>Remark</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subj,i) => {
              const t1 = getTermAvg(subj, t1seqs);
              const t2 = getTermAvg(subj, t2seqs);
              const t3 = getTermAvg(subj, t3seqs);
              const ann = getAnnual(subj);
              const grade = getGrade(ann ? parseFloat(ann) : null);
              return (
                <tr key={i} style={{background:i%2===0?"#fff":"#f8fafc"}}>
                  <td style={cell}>{i+1}</td>
                  <td style={{...cell,textAlign:"left",paddingLeft:"4px"}}>{subj.split("/")[0].trim()}</td>
                  <td style={{...cell,color:t1?(parseFloat(t1)>=10?"#059669":"#dc2626"):"#94a3b8"}}>{t1||"-"}</td>
                  <td style={{...cell,color:t2?(parseFloat(t2)>=10?"#059669":"#dc2626"):"#94a3b8"}}>{t2||"-"}</td>
                  <td style={{...cell,color:t3?(parseFloat(t3)>=10?"#059669":"#dc2626"):"#94a3b8"}}>{t3||"-"}</td>
                  <td style={{...cell,fontWeight:"bold",color:ann?(parseFloat(ann)>=10?"#059669":"#dc2626"):"#94a3b8"}}>{ann||"-"}</td>
                  <td style={{...cell,fontSize:"7px",color:grade.color}}>{ann?grade.remark:"-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginBottom:"8px"}}>
          <div style={{border:"1px solid #cbd5e1",borderRadius:"4px",overflow:"hidden"}}>
            <div style={{background:"#1e3a5f",padding:"3px 8px",fontSize:"10px",fontWeight:"bold",color:"#eab308"}}>Annual Results</div>
            <div style={{padding:"6px",fontSize:"10px",color:"#1e293b",background:"#fff"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}><span>Annual Average:</span><strong style={{color:overallAvg&&parseFloat(overallAvg)>=10?"#059669":"#dc2626",fontSize:"14px"}}>{overallAvg||"-"}/20</strong></div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px",alignItems:"center"}}><span>1st Term Position:</span><input value={position1} onChange={e=>setPosition1(e.target.value)} style={{width:"50px",border:"1px solid #e2e8f0",borderRadius:"4px",padding:"2px 4px",fontSize:"10px",textAlign:"center"}} /></div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px",alignItems:"center"}}><span>2nd Term Position:</span><input value={position2} onChange={e=>setPosition2(e.target.value)} style={{width:"50px",border:"1px solid #e2e8f0",borderRadius:"4px",padding:"2px 4px",fontSize:"10px",textAlign:"center"}} /></div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span>3rd Term Position:</span><input value={position3} onChange={e=>setPosition3(e.target.value)} style={{width:"50px",border:"1px solid #e2e8f0",borderRadius:"4px",padding:"2px 4px",fontSize:"10px",textAlign:"center"}} /></div>
            </div>
          </div>
          <div style={{border:"1px solid #cbd5e1",borderRadius:"4px",overflow:"hidden"}}>
            <div style={{background:"#1e3a5f",padding:"3px 8px",fontSize:"10px",fontWeight:"bold",color:"#eab308"}}>Decision</div>
            <div style={{padding:"6px",background:"#fff"}}>
              <select value={decision} onChange={e=>setDecision(e.target.value)} style={{width:"100%",padding:"4px",border:"1px solid #e2e8f0",borderRadius:"4px",fontSize:"11px",marginBottom:"4px",fontWeight:"bold",color:decision==="PROMOTED"?"#059669":"#dc2626"}}>
                <option>PROMOTED</option><option>REPEAT</option><option>EXCLUDED</option>
              </select>
              <div style={{textAlign:"center",fontSize:"14px",fontWeight:"bold",color:decision==="PROMOTED"?"#059669":"#dc2626",border:"2px solid",borderColor:decision==="PROMOTED"?"#059669":"#dc2626",borderRadius:"4px",padding:"3px"}}>{decision}</div>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",padding:"8px",border:"1px solid #e2e8f0",fontSize:"10px",color:"#1e293b",background:"#fff"}}>
          <div>Class Master: <input value={classMaster} onChange={e=>setClassMaster(e.target.value)} style={{borderBottom:"1px solid #334155",outline:"none",marginLeft:"4px",fontSize:"10px",width:"120px"}} /><div style={{marginTop:"16px",borderTop:"1px solid #334155",paddingTop:"2px",fontSize:"9px"}}>Signature</div></div>
          <div>Principal:<div style={{marginTop:"16px",borderTop:"1px solid #334155",paddingTop:"2px",fontSize:"9px"}}>Signature & Date</div></div>
        </div>
        <div style={{textAlign:"center",fontSize:"8px",color:"#94a3b8",marginTop:"6px"}}>Powered by ReportCard Pro — Suh Ebook Empire</div>
      </div>
    </div>
  );
}
