import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, setDoc, getDoc, doc, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GRAMMAR_SPECIALTIES = ["Grammar - Science", "Grammar - Arts", "Grammar - Commercial"];
const COMMERCIAL_TRADES = ["Accounting (ACC)","Banking and Insurance (BIN)","Home Economics (HEC)","Marketing (MKTG)","Administrative and Communication Techniques (ACT)","Heating Taxation and Information Management Systems (TIMS)","Digital Professional Reporting (DPR)","Bakery and Pastry (BP)","Hotel Management (HM)","Transport and Logistics Management (TLM)"];

const ALL_EXAMS = [
  { id:"bepc", label:"BEPC", level:"Form 5", section:"Grammar", description:"Brevet d Etudes du Premier Cycle" },
  { id:"bep", label:"BEP", level:"Form 5", section:"Technical", description:"Brevet d Etudes Professionnelles" },
  { id:"cap", label:"CAP", level:"Form 3", section:"Technical", description:"Certificat d Aptitude Professionnelle" },
  { id:"ol_gs", label:"GCE O/L - Grammar Science", level:"Form 5", specialty:"Grammar - Science", description:"GCE Ordinary Level" },
  { id:"ol_ga", label:"GCE O/L - Grammar Arts", level:"Form 5", specialty:"Grammar - Arts", description:"GCE Ordinary Level" },
  { id:"ol_gc", label:"GCE O/L - Grammar Commercial", level:"Form 5", specialty:"Grammar - Commercial", description:"GCE Ordinary Level" },
  { id:"ol_acc", label:"GCE O/L - Accounting", level:"Form 5", specialty:"Accounting (ACC)", description:"GCE O/L Commercial" },
  { id:"ol_bin", label:"GCE O/L - Banking & Insurance", level:"Form 5", specialty:"Banking and Insurance (BIN)", description:"GCE O/L Commercial" },
  { id:"ol_hec", label:"GCE O/L - Home Economics", level:"Form 5", specialty:"Home Economics (HEC)", description:"GCE O/L Commercial" },
  { id:"ol_mktg", label:"GCE O/L - Marketing", level:"Form 5", specialty:"Marketing (MKTG)", description:"GCE O/L Commercial" },
  { id:"ol_act", label:"GCE O/L - Admin & Communication", level:"Form 5", specialty:"Administrative and Communication Techniques (ACT)", description:"GCE O/L Commercial" },
  { id:"ol_tims", label:"GCE O/L - Taxation & Info Mgmt", level:"Form 5", specialty:"Heating Taxation and Information Management Systems (TIMS)", description:"GCE O/L Commercial" },
  { id:"ol_dpr", label:"GCE O/L - Digital Reporting", level:"Form 5", specialty:"Digital Professional Reporting (DPR)", description:"GCE O/L Commercial" },
  { id:"ol_bp", label:"GCE O/L - Bakery & Pastry", level:"Form 5", specialty:"Bakery and Pastry (BP)", description:"GCE O/L Commercial" },
  { id:"ol_hm", label:"GCE O/L - Hotel Management", level:"Form 5", specialty:"Hotel Management (HM)", description:"GCE O/L Commercial" },
  { id:"ol_tlm", label:"GCE O/L - Transport & Logistics", level:"Form 5", specialty:"Transport and Logistics Management (TLM)", description:"GCE O/L Commercial" },
  { id:"ol_arm", label:"GCE O/L - Auto Repairs Mechanics", level:"Form 5", specialty:"Automobile Repairs Mechanics (ARM)", description:"GCE O/L Industrial" },
  { id:"ol_ae", label:"GCE O/L - Auto Electricity", level:"Form 5", specialty:"Automobile Electricity (AE)", description:"GCE O/L Industrial" },
  { id:"ol_abp", label:"GCE O/L - Auto Bodywork", level:"Form 5", specialty:"Automobile Bodywork and Painting (ABP)", description:"GCE O/L Industrial" },
  { id:"ol_mame", label:"GCE O/L - Manufacturing Mechanics", level:"Form 5", specialty:"Manufacturing Mechanics (MAME)", description:"GCE O/L Industrial" },
  { id:"ol_mwip", label:"GCE O/L - Metal Works", level:"Form 5", specialty:"Metal Works and Industrial Piping (MWIP)", description:"GCE O/L Industrial" },
  { id:"ol_meme", label:"GCE O/L - Electromechanical", level:"Form 5", specialty:"Maintenance of Electromechanical Equipment (MEME)", description:"GCE O/L Industrial" },
  { id:"ol_smf", label:"GCE O/L - Sheet Metal", level:"Form 5", specialty:"Sheet Metal Fabrication (SMF)", description:"GCE O/L Industrial" },
  { id:"ol_wf", label:"GCE O/L - Welding", level:"Form 5", specialty:"Welding and Fabrication (WF)", description:"GCE O/L Industrial" },
  { id:"ol_cebc", label:"GCE O/L - Civil Eng Building", level:"Form 5", specialty:"Civil Engineering - Building Construction (CE-BC)", description:"GCE O/L Industrial" },
  { id:"ol_eln", label:"GCE O/L - Electronics", level:"Form 5", specialty:"Electronics (ELN)", description:"GCE O/L Industrial" },
  { id:"ol_fde", label:"GCE O/L - Fashion Design", level:"Form 5", specialty:"Fashion Design (FDE)", description:"GCE O/L Industrial" },
  { id:"ol_rhvac", label:"GCE O/L - Refrigeration HVAC", level:"Form 5", specialty:"Refrigeration Heating Ventilation and Air Conditioning (RHVAC)", description:"GCE O/L Industrial" },
  { id:"al_gs", label:"GCE A/L - Grammar Science", level:"Upper Sixth", specialty:"Grammar - Science", description:"GCE Advanced Level" },
  { id:"al_ga", label:"GCE A/L - Grammar Arts", level:"Upper Sixth", specialty:"Grammar - Arts", description:"GCE Advanced Level" },
  { id:"al_gc", label:"GCE A/L - Grammar Commercial", level:"Upper Sixth", specialty:"Grammar - Commercial", description:"GCE Advanced Level" },
  { id:"al_acc", label:"GCE A/L - Accounting", level:"Upper Sixth", specialty:"Accounting (ACC)", description:"GCE A/L Commercial" },
  { id:"al_bin", label:"GCE A/L - Banking & Insurance", level:"Upper Sixth", specialty:"Banking and Insurance (BIN)", description:"GCE A/L Commercial" },
  { id:"al_hec", label:"GCE A/L - Home Economics", level:"Upper Sixth", specialty:"Home Economics (HEC)", description:"GCE A/L Commercial" },
  { id:"al_mktg", label:"GCE A/L - Marketing", level:"Upper Sixth", specialty:"Marketing (MKTG)", description:"GCE A/L Commercial" },
  { id:"al_act", label:"GCE A/L - Admin & Communication", level:"Upper Sixth", specialty:"Administrative and Communication Techniques (ACT)", description:"GCE A/L Commercial" },
  { id:"al_arm", label:"GCE A/L - Auto Repairs Mechanics", level:"Upper Sixth", specialty:"Automobile Repairs Mechanics (ARM)", description:"GCE A/L Industrial" },
  { id:"al_ae", label:"GCE A/L - Auto Electricity", level:"Upper Sixth", specialty:"Automobile Electricity (AE)", description:"GCE A/L Industrial" },
  { id:"al_mame", label:"GCE A/L - Manufacturing Mechanics", level:"Upper Sixth", specialty:"Manufacturing Mechanics (MAME)", description:"GCE A/L Industrial" },
  { id:"al_eln", label:"GCE A/L - Electronics", level:"Upper Sixth", specialty:"Electronics (ELN)", description:"GCE A/L Industrial" },
  { id:"al_cebc", label:"GCE A/L - Civil Eng Building", level:"Upper Sixth", specialty:"Civil Engineering - Building Construction (CE-BC)", description:"GCE A/L Industrial" },
];

const DEFAULT_FEES = {};
ALL_EXAMS.forEach(e => { DEFAULT_FEES[e.id] = 15000; });

export default function ExamFees() {
  const { school } = useAuth();
  const [students, setStudents] = useState([]);
  const [examFees, setExamFees] = useState(DEFAULT_FEES);
  const [studentExams, setStudentExams] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("register");
  const [search, setSearch] = useState("");
  const [filterExam, setFilterExam] = useState("all");
  const schoolId = sessionStorage.getItem("schoolId") || school?.id;

  useEffect(() => {
    const load = async () => {
      if (!schoolId) { setLoading(false); return; }
      try {
        const sq = query(collection(db, "students"), where("schoolId", "==", schoolId));
        const snap = await getDocs(sq);
        setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        const feesDoc = await getDoc(doc(db, "examFees", schoolId));
        if (feesDoc.exists()) setExamFees(prev => ({ ...prev, ...feesDoc.data() }));
        const seDoc = await getDoc(doc(db, "studentExams", schoolId));
        if (seDoc.exists()) setStudentExams(seDoc.data());
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [schoolId]);

  const getEligibleExams = (student) => {
    return ALL_EXAMS.filter(exam => {
      if (exam.level !== student.level) return false;
      if (exam.section && student.section !== exam.section) return false;
      if (exam.specialty && student.specialty !== exam.specialty) return false;
      return true;
    });
  };

  const toggleStudentExam = async (studentId, examId) => {
    const updated = { ...studentExams };
    if (!updated[studentId]) updated[studentId] = {};
    updated[studentId][examId] = !updated[studentId][examId];
    setStudentExams(updated);
    await setDoc(doc(db, "studentExams", schoolId), updated);
  };

  const saveExamFees = async () => {
    setSaving(true);
    await setDoc(doc(db, "examFees", schoolId), examFees);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getStudentTotal = (student) => {
    const registered = studentExams[student.id] || {};
    return ALL_EXAMS.filter(e => registered[e.id]).reduce((sum, e) => sum + (examFees[e.id] || 0), 0);
  };

  const registeredStudents = students.filter(s => Object.values(studentExams[s.id] || {}).some(v => v));
  const totalExpected = registeredStudents.reduce((sum, s) => sum + getStudentTotal(s), 0);
  const examSummary = ALL_EXAMS.map(exam => {
    const count = students.filter(s => studentExams[s.id]?.[exam.id]).length;
    return { ...exam, count, total: count * (examFees[exam.id] || 0) };
  }).filter(e => e.count > 0);

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    if (filterExam === "registered") return matchSearch && Object.values(studentExams[s.id]||{}).some(v=>v);
    if (filterExam === "unregistered") return matchSearch && !Object.values(studentExams[s.id]||{}).some(v=>v);
    return matchSearch;
  });

  const GROUPS = [
    { label:"National Exams", ids:["bepc","bep","cap"] },
    { label:"GCE O/L Grammar", ids:["ol_gs","ol_ga","ol_gc"] },
    { label:"GCE O/L Commercial", ids:["ol_acc","ol_bin","ol_hec","ol_mktg","ol_act","ol_tims","ol_dpr","ol_bp","ol_hm","ol_tlm"] },
    { label:"GCE O/L Industrial", ids:["ol_arm","ol_ae","ol_abp","ol_mame","ol_mwip","ol_meme","ol_smf","ol_wf","ol_cebc","ol_eln","ol_fde","ol_rhvac"] },
    { label:"GCE A/L Grammar", ids:["al_gs","al_ga","al_gc"] },
    { label:"GCE A/L Commercial", ids:["al_acc","al_bin","al_hec","al_mktg","al_act"] },
    { label:"GCE A/L Industrial", ids:["al_arm","al_ae","al_mame","al_eln","al_cebc"] },
  ];

  if (loading) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Loading...</div>;

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <div style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <Link to="/" style={{color:"#94a3b8",fontSize:"13px",textDecoration:"none"}}>Back</Link>
        <div style={{fontSize:"14px",fontWeight:"bold",color:"#fff"}}>Exam Registration Fees</div>
        <div style={{fontSize:"11px",color:"#eab308"}}>{registeredStudents.length} registered</div>
      </div>
      <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        {[{id:"register",label:"Register"},{id:"fees",label:"Fee Setup"},{id:"summary",label:"Summary"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"11px 4px",background:"none",border:"none",borderBottom:tab===t.id?"2px solid #eab308":"2px solid transparent",color:tab===t.id?"#eab308":"#64748b",fontSize:"12px",cursor:"pointer",fontWeight:tab===t.id?"bold":"normal"}}>{t.label}</button>
        ))}
      </div>
      <div style={{maxWidth:"800px",margin:"0 auto",padding:"16px"}}>

        {tab==="register" && (
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"16px"}}>
              <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"14px",textAlign:"center"}}>
                <div style={{fontSize:"22px",fontWeight:"bold",color:"#eab308"}}>{registeredStudents.length}</div>
                <div style={{fontSize:"10px",color:"#64748b"}}>Registered</div>
              </div>
              <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"14px",textAlign:"center"}}>
                <div style={{fontSize:"16px",fontWeight:"bold",color:"#10b981"}}>{totalExpected.toLocaleString()}</div>
                <div style={{fontSize:"10px",color:"#64748b"}}>Total FCFA</div>
              </div>
            </div>
            <div style={{display:"flex",gap:"8px",marginBottom:"12px",flexWrap:"wrap"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student..." style={{flex:1,minWidth:"140px",padding:"9px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}} />
              {["all","registered","unregistered"].map(f=>(
                <button key={f} onClick={()=>setFilterExam(f)} style={{padding:"7px 10px",background:filterExam===f?"rgba(234,179,8,0.2)":"rgba(255,255,255,0.05)",border:"1px solid "+(filterExam===f?"rgba(234,179,8,0.4)":"rgba(255,255,255,0.1)"),borderRadius:"8px",color:filterExam===f?"#eab308":"#94a3b8",fontSize:"11px",cursor:"pointer"}}>{f}</button>
              ))}
            </div>
            {filtered.map(student => {
              const eligible = getEligibleExams(student);
              const registered = studentExams[student.id] || {};
              const total = getStudentTotal(student);
              const hasAny = Object.values(registered).some(v=>v);
              return (
                <div key={student.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+(hasAny?"rgba(234,179,8,0.2)":"rgba(255,255,255,0.07)"),borderRadius:"10px",padding:"14px",marginBottom:"8px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                    <div>
                      <div style={{fontSize:"14px",color:"#fff",fontWeight:"bold"}}>{student.name}</div>
                      <div style={{fontSize:"11px",color:"#64748b"}}>{student.level} - {student.section||"Grammar"}{student.specialty?" - "+student.specialty.split("(")[0].trim():""}</div>
                    </div>
                    {total>0 && <div style={{fontSize:"12px",color:"#eab308",fontWeight:"bold"}}>{total.toLocaleString()} FCFA</div>}
                  </div>
                  {eligible.length===0 ? (
                    <div style={{fontSize:"11px",color:"#475569"}}>No exams for this level/section.</div>
                  ) : eligible.map(exam => (
                    <div key={exam.id} onClick={()=>toggleStudentExam(student.id,exam.id)}
                      style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",marginBottom:"4px",background:registered[exam.id]?"rgba(234,179,8,0.08)":"rgba(255,255,255,0.02)",border:"1px solid "+(registered[exam.id]?"rgba(234,179,8,0.3)":"rgba(255,255,255,0.05)"),borderRadius:"8px",cursor:"pointer"}}>
                      <div style={{fontSize:"12px",color:registered[exam.id]?"#eab308":"#94a3b8",fontWeight:registered[exam.id]?"bold":"normal"}}>{exam.label}</div>
                      <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                        <span style={{fontSize:"11px",color:"#64748b"}}>{(examFees[exam.id]||0).toLocaleString()} FCFA</span>
                        <div style={{width:"18px",height:"18px",borderRadius:"4px",background:registered[exam.id]?"#eab308":"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",color:"#0a0f1e",fontWeight:"bold"}}>{registered[exam.id]?"✓":""}</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}

        {tab==="fees" && (
          <div>
            <div style={{background:"rgba(234,179,8,0.05)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:"10px",padding:"12px",marginBottom:"16px",fontSize:"12px",color:"#94a3b8"}}>
              Set registration fees per exam type. Save when done.
            </div>
            {GROUPS.map(({label,ids}) => (
              <div key={label} style={{marginBottom:"16px"}}>
                <div style={{background:"#1e3a5f",padding:"6px 12px",borderRadius:"8px 8px 0 0",fontSize:"11px",fontWeight:"bold",color:"#eab308"}}>{label}</div>
                {ALL_EXAMS.filter(e=>ids.includes(e.id)).map(exam => (
                  <div key={exam.id} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderTop:"none",padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
                    <div style={{fontSize:"12px",color:"#e2e8f0",flex:1}}>{exam.label.replace(/GCE [OA]\/[LR] - /,"")}</div>
                    <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                      <input type="number" value={examFees[exam.id]||0}
                        onChange={e=>setExamFees(prev=>({...prev,[exam.id]:parseFloat(e.target.value)||0}))}
                        style={{width:"100px",padding:"6px 8px",background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",color:"#eab308",fontSize:"13px",textAlign:"right",outline:"none",fontWeight:"bold"}} />
                      <span style={{fontSize:"10px",color:"#64748b"}}>FCFA</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={saveExamFees} style={{width:"100%",padding:"13px",background:saved?"#10b981":"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"10px",color:saved?"#fff":"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:"pointer"}}>
              {saving?"Saving...":saved?"Saved!":"Save Exam Fees"}
            </button>
          </div>
        )}

        {tab==="summary" && (
          <div>
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"16px",marginBottom:"16px"}}>
              <div style={{fontSize:"13px",fontWeight:"bold",color:"#eab308",marginBottom:"12px"}}>School Exam Summary</div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:"13px"}}>
                <span style={{color:"#94a3b8"}}>Total Registered</span>
                <span style={{color:"#eab308",fontWeight:"bold"}}>{registeredStudents.length} students</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",fontSize:"13px"}}>
                <span style={{color:"#94a3b8"}}>Total Fees</span>
                <span style={{color:"#10b981",fontWeight:"bold"}}>{totalExpected.toLocaleString()} FCFA</span>
              </div>
            </div>
            {examSummary.length===0 ? (
              <div style={{textAlign:"center",padding:"40px",color:"#475569"}}>No students registered yet.</div>
            ) : examSummary.map(exam => (
              <div key={exam.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",padding:"12px",marginBottom:"8px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                  <span style={{fontSize:"13px",color:"#fff",fontWeight:"bold"}}>{exam.label}</span>
                  <span style={{fontSize:"11px",color:"#eab308"}}>{exam.count} student{exam.count>1?"s":""}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px"}}>
                  <span style={{color:"#64748b"}}>{(examFees[exam.id]||0).toLocaleString()} FCFA each</span>
                  <span style={{color:"#10b981",fontWeight:"bold"}}>{exam.total.toLocaleString()} FCFA</span>
                </div>
              </div>
            ))}
            {registeredStudents.length>0 && (
              <div style={{marginTop:"16px"}}>
                <div style={{fontSize:"11px",fontWeight:"bold",color:"#64748b",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"1px"}}>Per Student</div>
                {registeredStudents.map(s => (
                  <div key={s.id} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"8px",padding:"10px",marginBottom:"6px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:"12px",color:"#e2e8f0",fontWeight:"bold"}}>{s.name}</div>
                      <div style={{fontSize:"10px",color:"#475569"}}>{ALL_EXAMS.filter(e=>studentExams[s.id]?.[e.id]).map(e=>e.label).join(", ")}</div>
                    </div>
                    <div style={{fontSize:"13px",color:"#eab308",fontWeight:"bold"}}>{getStudentTotal(s).toLocaleString()} FCFA</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
