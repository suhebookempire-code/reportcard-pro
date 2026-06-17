import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, addDoc, setDoc, getDoc, doc, query, where, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const COMMERCIAL_TRADES = ["Accounting (ACC)","Banking and Insurance (BIN)","Home Economics (HEC)","Marketing (MKTG)","Administrative and Communication Techniques (ACT)","Heating Taxation and Information Management Systems (TIMS)","Digital Professional Reporting (DPR)","Bakery and Pastry (BP)","Hotel Management (HM)","Transport and Logistics Management (TLM)"];
const INDUSTRIAL_TRADES = ["Automobile Repairs Mechanics (ARM)","Automobile Electricity (AE)","Automobile Bodywork and Painting (ABP)","Manufacturing Mechanics (MAME)","Metal Works and Industrial Piping (MWIP)","Maintenance of Electromechanical Equipment (MEME)","Sheet Metal Fabrication (SMF)","Welding and Fabrication (WF)","Civil Engineering - Building Construction (CE-BC)","Civil Engineering - Tiling (CE-TIL)","Chemical Engineering - Industrial Chemistry (CHE-IC)","Chemical Engineering - Petro-Chemistry (CHE-PCBP)","Refrigeration Heating Ventilation and Air Conditioning (RHVAC)","Electronics (ELN)","Fashion Design (FDE)","Civil Engineering - Architectural Draftsmanship (CE-AD)","Plumbing and Hydraulic Installation Systems (PHIS)","Wood Furniture and Cabinet Making (WFCM)","Carpentry and Interior Design (CID)","Surveying (SURV)","Forest Management Techniques (FMT)","Biomedical Equipment Maintenance (BEMA)","Agriculture - Monogastrics Production (AMOP)","Agriculture - Poultry Production (APLP)","Agriculture - Pig Production (APIP)"];
const GRAMMAR_LEVELS = ["Form 1","Form 2","Form 3","Form 4","Form 5","Lower Sixth","Upper Sixth"];
const TECH_LEVELS = ["Form 1","Form 2","Form 3","Form 4","Form 5","Lower Sixth","Upper Sixth"];

const buildDefaultFees = () => {
  const fees = {};
  GRAMMAR_LEVELS.forEach(l => { fees["Grammar_"+l] = 50000; });
  TECH_LEVELS.forEach(l => {
    COMMERCIAL_TRADES.forEach(t => { fees["Commercial_"+l+"_"+t] = 60000; });
    INDUSTRIAL_TRADES.forEach(t => { fees["Industrial_"+l+"_"+t] = 65000; });
  });
  return fees;
};

const DEFAULT_FEES = buildDefaultFees();

const getFeeKey = (student) => {
  if (!student.section || student.section === "Grammar") return "Grammar_" + student.level;
  if (COMMERCIAL_TRADES.includes(student.specialty)) return "Commercial_" + student.level + "_" + student.specialty;
  if (INDUSTRIAL_TRADES.includes(student.specialty)) return "Industrial_" + student.level + "_" + student.specialty;
  return "Grammar_" + student.level;
};

export default function FeeTracking() {
  const { school } = useAuth();
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState({});
  const [feeStructure, setFeeStructure] = useState(DEFAULT_FEES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("students");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [amounts, setAmounts] = useState({});
  const [structureTab, setStructureTab] = useState("grammar");
  const schoolId = sessionStorage.getItem("schoolId") || school?.id;

  useEffect(() => {
    const load = async () => {
      if (!schoolId) { setLoading(false); return; }
      try {
        const sq = query(collection(db, "students"), where("schoolId", "==", schoolId));
        const snap = await getDocs(sq);
        setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        const fq = query(collection(db, "fees"), where("schoolId", "==", schoolId));
        const fsnap = await getDocs(fq);
        const fdata = {};
        fsnap.docs.forEach(d => { fdata[d.data().studentId] = d.data(); });
        setFees(fdata);
        const fsDoc = await getDoc(doc(db, "feeStructure", schoolId));
        if (fsDoc.exists()) setFeeStructure(prev => ({ ...prev, ...fsDoc.data() }));
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [schoolId]);

  const getFeeForStudent = (student) => {
    const key = getFeeKey(student);
    return feeStructure[key] || 50000;
  };

  const saveFeeStructure = async () => {
    setSaving(true);
    await setDoc(doc(db, "feeStructure", schoolId), feeStructure);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const payFee = async (student, amount) => {
    const totalFee = getFeeForStudent(student);
    const existing = fees[student.id];
    const alreadyPaid = existing ? (existing.totalPaid || existing.amount || 0) : 0;
    const newTotal = alreadyPaid + parseFloat(amount);
    const balance = totalFee - newTotal;
    await addDoc(collection(db, "fees"), {
      studentId: student.id, studentName: student.name, schoolId,
      amount: parseFloat(amount), totalPaid: newTotal,
      totalFee, balance, paidAt: serverTimestamp()
    });
    const fq = query(collection(db, "fees"), where("schoolId", "==", schoolId));
    const fsnap = await getDocs(fq);
    const fdata = {};
    fsnap.docs.forEach(d => { fdata[d.data().studentId] = d.data(); });
    setFees(fdata);
    setAmounts(prev => ({ ...prev, [student.id]: "" }));
  };

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const fee = fees[s.id];
    const totalFee = getFeeForStudent(s);
    const paid = fee && (fee.totalPaid || fee.amount || 0) >= totalFee;
    if (filter === "paid") return matchSearch && paid;
    if (filter === "unpaid") return matchSearch && !paid;
    return matchSearch;
  });

  const totalPaid = students.filter(s => { const f = fees[s.id]; return f && (f.totalPaid||f.amount||0) >= getFeeForStudent(s); }).length;
  const totalUnpaid = students.length - totalPaid;
  const totalExpected = students.reduce((sum, s) => sum + getFeeForStudent(s), 0);
  const totalCollected = students.reduce((sum, s) => { const f = fees[s.id]; return sum + (f ? (f.totalPaid||f.amount||0) : 0); }, 0);

  if (loading) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Loading...</div>;

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <div style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <Link to="/" style={{color:"#94a3b8",fontSize:"13px",textDecoration:"none"}}>Back</Link>
        <div style={{fontSize:"14px",fontWeight:"bold",color:"#fff"}}>Fee Tracking</div>
        <div style={{fontSize:"11px",color:"#10b981"}}>{totalPaid}/{students.length} Paid</div>
      </div>

      <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        {[{id:"students",label:"Students"},{id:"structure",label:"Fee Structure"},{id:"summary",label:"Summary"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"11px 4px",background:"none",border:"none",borderBottom:tab===t.id?"2px solid #eab308":"2px solid transparent",color:tab===t.id?"#eab308":"#64748b",fontSize:"12px",cursor:"pointer",fontWeight:tab===t.id?"bold":"normal"}}>{t.label}</button>
        ))}
      </div>

      <div style={{maxWidth:"800px",margin:"0 auto",padding:"16px"}}>

        {tab==="students" && (
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"10px",marginBottom:"16px"}}>
              {[{label:"Expected (FCFA)",value:totalExpected.toLocaleString(),color:"#eab308"},{label:"Collected (FCFA)",value:totalCollected.toLocaleString(),color:"#10b981"},{label:"Paid Students",value:totalPaid,color:"#10b981"},{label:"Unpaid Students",value:totalUnpaid,color:"#ef4444"}].map(s=>(
                <div key={s.label} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"14px",textAlign:"center"}}>
                  <div style={{fontSize:"18px",fontWeight:"bold",color:s.color}}>{s.value}</div>
                  <div style={{fontSize:"10px",color:"#64748b"}}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:"8px",marginBottom:"12px",flexWrap:"wrap"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student..." style={{flex:1,minWidth:"150px",padding:"9px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}} />
              {["all","paid","unpaid"].map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{padding:"8px 12px",background:filter===f?"rgba(234,179,8,0.2)":"rgba(255,255,255,0.05)",border:"1px solid "+(filter===f?"rgba(234,179,8,0.4)":"rgba(255,255,255,0.1)"),borderRadius:"8px",color:filter===f?"#eab308":"#94a3b8",fontSize:"12px",cursor:"pointer",textTransform:"capitalize"}}>{f}</button>
              ))}
            </div>
            {filtered.map(student => {
              const fee = fees[student.id];
              const totalFee = getFeeForStudent(student);
              const paidAmt = fee ? (fee.totalPaid||fee.amount||0) : 0;
              const balance = totalFee - paidAmt;
              const isPaid = paidAmt >= totalFee;
              return (
                <div key={student.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+(isPaid?"rgba(16,185,129,0.2)":"rgba(255,255,255,0.07)"),borderRadius:"10px",padding:"14px",marginBottom:"8px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"8px"}}>
                    <div>
                      <div style={{fontSize:"14px",color:"#fff",fontWeight:"bold"}}>{student.name}</div>
                      <div style={{fontSize:"11px",color:"#64748b"}}>{student.level} — {student.section||"Grammar"}{student.specialty?" — "+student.specialty.split("(")[0].trim():""}</div>
                      <div style={{fontSize:"11px",color:"#eab308",marginTop:"2px"}}>Fee: {totalFee.toLocaleString()} FCFA</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                      {isPaid ? (
                        <span style={{padding:"4px 12px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:"20px",color:"#10b981",fontSize:"12px",fontWeight:"bold"}}>PAID</span>
                      ) : (
                        <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                          <input value={amounts[student.id]||""} onChange={e=>setAmounts(p=>({...p,[student.id]:e.target.value}))} placeholder="Amount" type="number" style={{width:"90px",padding:"6px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"6px",color:"#fff",fontSize:"12px",outline:"none",textAlign:"center"}} />
                          <button onClick={()=>{if(amounts[student.id])payFee(student,amounts[student.id]);}} style={{padding:"6px 12px",background:"linear-gradient(135deg,#10b981,#059669)",border:"none",borderRadius:"6px",color:"#fff",fontSize:"12px",cursor:"pointer",fontWeight:"bold"}}>Pay</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{marginTop:"8px",display:"flex",gap:"16px",fontSize:"11px"}}>
                    <span style={{color:"#94a3b8"}}>Paid: <span style={{color:"#10b981",fontWeight:"bold"}}>{paidAmt.toLocaleString()} FCFA</span></span>
                    <span style={{color:"#94a3b8"}}>Balance: <span style={{color:balance>0?"#ef4444":"#10b981",fontWeight:"bold"}}>{balance.toLocaleString()} FCFA</span></span>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {tab==="structure" && (
          <div>
            <div style={{background:"rgba(234,179,8,0.05)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:"10px",padding:"12px",marginBottom:"16px",fontSize:"12px",color:"#94a3b8"}}>
              Set fees per section, level and trade. Each school saves its own fee structure.
            </div>
            <div style={{display:"flex",gap:"6px",marginBottom:"16px",flexWrap:"wrap"}}>
              {[{id:"grammar",label:"Grammar"},{id:"commercial",label:"Technical Commercial"},{id:"industrial",label:"Technical Industrial"}].map(t=>(
                <button key={t.id} onClick={()=>setStructureTab(t.id)} style={{padding:"8px 14px",background:structureTab===t.id?"rgba(234,179,8,0.2)":"rgba(255,255,255,0.05)",border:"1px solid "+(structureTab===t.id?"rgba(234,179,8,0.4)":"rgba(255,255,255,0.1)"),borderRadius:"8px",color:structureTab===t.id?"#eab308":"#94a3b8",fontSize:"12px",cursor:"pointer",fontWeight:structureTab===t.id?"bold":"normal"}}>{t.label}</button>
              ))}
            </div>

            {structureTab==="grammar" && (
              <div>
                <div style={{background:"#1e3a5f",padding:"6px 12px",borderRadius:"8px 8px 0 0",fontSize:"11px",fontWeight:"bold",color:"#eab308"}}>Grammar Section — All Levels</div>
                {GRAMMAR_LEVELS.map(level => {
                  const key = "Grammar_"+level;
                  return (
                    <div key={key} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderTop:"none",padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
                      <div style={{fontSize:"13px",color:"#e2e8f0",flex:1}}>{level}</div>
                      <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                        <input type="number" value={feeStructure[key]||0} onChange={e=>setFeeStructure(prev=>({...prev,[key]:parseFloat(e.target.value)||0}))} style={{width:"110px",padding:"8px",background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",color:"#eab308",fontSize:"13px",textAlign:"right",outline:"none",fontWeight:"bold"}} />
                        <span style={{fontSize:"11px",color:"#64748b"}}>FCFA</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {structureTab==="commercial" && (
              <div>
                {COMMERCIAL_TRADES.map(trade => (
                  <div key={trade} style={{marginBottom:"12px"}}>
                    <div style={{background:"#1e3a5f",padding:"6px 12px",borderRadius:"8px 8px 0 0",fontSize:"11px",fontWeight:"bold",color:"#eab308"}}>{trade.split("(")[0].trim()}</div>
                    {TECH_LEVELS.map(level => {
                      const key = "Commercial_"+level+"_"+trade;
                      return (
                        <div key={key} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderTop:"none",padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
                          <div style={{fontSize:"12px",color:"#e2e8f0",flex:1}}>{level}</div>
                          <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                            <input type="number" value={feeStructure[key]||0} onChange={e=>setFeeStructure(prev=>({...prev,[key]:parseFloat(e.target.value)||0}))} style={{width:"110px",padding:"8px",background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",color:"#eab308",fontSize:"13px",textAlign:"right",outline:"none",fontWeight:"bold"}} />
                            <span style={{fontSize:"11px",color:"#64748b"}}>FCFA</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {structureTab==="industrial" && (
              <div>
                {INDUSTRIAL_TRADES.map(trade => (
                  <div key={trade} style={{marginBottom:"12px"}}>
                    <div style={{background:"#1e3a5f",padding:"6px 12px",borderRadius:"8px 8px 0 0",fontSize:"11px",fontWeight:"bold",color:"#eab308"}}>{trade.split("(")[0].trim()}</div>
                    {TECH_LEVELS.map(level => {
                      const key = "Industrial_"+level+"_"+trade;
                      return (
                        <div key={key} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderTop:"none",padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
                          <div style={{fontSize:"12px",color:"#e2e8f0",flex:1}}>{level}</div>
                          <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                            <input type="number" value={feeStructure[key]||0} onChange={e=>setFeeStructure(prev=>({...prev,[key]:parseFloat(e.target.value)||0}))} style={{width:"110px",padding:"8px",background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",color:"#eab308",fontSize:"13px",textAlign:"right",outline:"none",fontWeight:"bold"}} />
                            <span style={{fontSize:"11px",color:"#64748b"}}>FCFA</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            <button onClick={saveFeeStructure} style={{width:"100%",padding:"13px",background:saved?"#10b981":"linear-gradient(135deg,#eab308,#ca8a04)",border:"none",borderRadius:"10px",color:saved?"#fff":"#0a0f1e",fontWeight:"bold",fontSize:"14px",cursor:"pointer",marginTop:"16px"}}>
              {saving?"Saving...":saved?"Saved!":"Save Fee Structure"}
            </button>
          </div>
        )}

        {tab==="summary" && (
          <div>
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"16px",marginBottom:"12px"}}>
              <div style={{fontSize:"13px",fontWeight:"bold",color:"#eab308",marginBottom:"12px"}}>School Fee Summary</div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:"13px"}}>
                <span style={{color:"#94a3b8"}}>Total Expected</span>
                <span style={{color:"#eab308",fontWeight:"bold"}}>{totalExpected.toLocaleString()} FCFA</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:"13px"}}>
                <span style={{color:"#94a3b8"}}>Total Collected</span>
                <span style={{color:"#10b981",fontWeight:"bold"}}>{totalCollected.toLocaleString()} FCFA</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",fontSize:"13px"}}>
                <span style={{color:"#94a3b8"}}>Outstanding</span>
                <span style={{color:"#ef4444",fontWeight:"bold"}}>{(totalExpected-totalCollected).toLocaleString()} FCFA</span>
              </div>
            </div>
            {["Grammar",...COMMERCIAL_TRADES.map(t=>"Commercial_"+t),...INDUSTRIAL_TRADES.map(t=>"Industrial_"+t)].map(group => {
              const isGrammar = group === "Grammar";
              const isCommercial = group.startsWith("Commercial_");
              const trade = isCommercial ? group.replace("Commercial_","") : group.replace("Industrial_","");
              const groupStudents = isGrammar
                ? students.filter(s => !s.section || s.section==="Grammar")
                : students.filter(s => s.specialty === trade);
              if (groupStudents.length===0) return null;
              const expected = groupStudents.reduce((sum,s)=>sum+getFeeForStudent(s),0);
              const collected = groupStudents.reduce((sum,s)=>{ const f=fees[s.id]; return sum+(f?(f.totalPaid||f.amount||0):0); },0);
              const paidCount = groupStudents.filter(s=>{ const f=fees[s.id]; return f&&(f.totalPaid||f.amount||0)>=getFeeForStudent(s); }).length;
              const label = isGrammar ? "Grammar Section" : trade.split("(")[0].trim();
              return (
                <div key={group} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",padding:"12px",marginBottom:"8px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                    <span style={{fontSize:"13px",color:"#fff",fontWeight:"bold"}}>{label}</span>
                    <span style={{fontSize:"11px",color:"#eab308"}}>{paidCount}/{groupStudents.length} paid</span>
                  </div>
                  <div style={{display:"flex",gap:"12px",fontSize:"11px",flexWrap:"wrap"}}>
                    <span style={{color:"#94a3b8"}}>Expected: <span style={{color:"#eab308"}}>{expected.toLocaleString()}</span></span>
                    <span style={{color:"#94a3b8"}}>Collected: <span style={{color:"#10b981"}}>{collected.toLocaleString()}</span></span>
                    <span style={{color:"#94a3b8"}}>Balance: <span style={{color:"#ef4444"}}>{(expected-collected).toLocaleString()}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
