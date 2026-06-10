import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, addDoc, query, where, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function FeeTracking() {
  const { school } = useAuth();
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalFee, setTotalFee] = useState("50000");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const schoolId = sessionStorage.getItem("schoolId") || school?.id;

  useEffect(() => {
    const load = async () => {
      if (!schoolId) return;
      const sq = query(collection(db, "students"), where("schoolId", "==", schoolId));
      const snap = await getDocs(sq);
      const studs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(studs);
      const fq = query(collection(db, "fees"), where("schoolId", "==", schoolId));
      const fsnap = await getDocs(fq);
      const fdata = {};
      fsnap.docs.forEach(d => { fdata[d.data().studentId] = d.data(); });
      setFees(fdata);
      setLoading(false);
    };
    load();
  }, [schoolId]);

  const payFee = async (student, amount) => {
    await addDoc(collection(db, "fees"), {
      studentId: student.id,
      studentName: student.name,
      schoolId,
      amount: parseFloat(amount),
      totalFee: parseFloat(totalFee),
      balance: parseFloat(totalFee) - parseFloat(amount),
      paidAt: serverTimestamp()
    });
    const fq = query(collection(db, "fees"), where("schoolId", "==", schoolId));
    const fsnap = await getDocs(fq);
    const fdata = {};
    fsnap.docs.forEach(d => { fdata[d.data().studentId] = d.data(); });
    setFees(fdata);
  };

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const fee = fees[s.id];
    if (filter === "paid") return matchSearch && fee && fee.balance <= 0;
    if (filter === "unpaid") return matchSearch && (!fee || fee.balance > 0);
    return matchSearch;
  });

  const totalPaid = students.filter(s => fees[s.id] && fees[s.id].balance <= 0).length;
  const totalUnpaid = students.length - totalPaid;

  if (loading) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Loading...</div>;

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <div style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <Link to="/" style={{color:"#94a3b8",fontSize:"13px",textDecoration:"none"}}>Back</Link>
        <div style={{fontSize:"14px",fontWeight:"bold",color:"#fff"}}>Fee Tracking</div>
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
          <span style={{fontSize:"11px",color:"#94a3b8"}}>Total Fee:</span>
          <input value={totalFee} onChange={e=>setTotalFee(e.target.value)} style={{width:"80px",padding:"4px",background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",color:"#fff",fontSize:"11px",textAlign:"center"}} />
        </div>
      </div>
      <div style={{maxWidth:"800px",margin:"0 auto",padding:"16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"16px"}}>
          {[{label:"Total Students",value:students.length,color:"#eab308"},{label:"Paid",value:totalPaid,color:"#10b981"},{label:"Unpaid",value:totalUnpaid,color:"#ef4444"}].map(s=>(
            <div key={s.label} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"16px",textAlign:"center"}}>
              <div style={{fontSize:"28px",fontWeight:"bold",color:s.color}}>{s.value}</div>
              <div style={{fontSize:"11px",color:"#64748b"}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student..." style={{flex:1,padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none"}} />
          {["all","paid","unpaid"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:"8px 12px",background:filter===f?"rgba(234,179,8,0.2)":"rgba(255,255,255,0.05)",border:"1px solid "+(filter===f?"rgba(234,179,8,0.4)":"rgba(255,255,255,0.1)"),borderRadius:"8px",color:filter===f?"#eab308":"#94a3b8",fontSize:"12px",cursor:"pointer",textTransform:"capitalize"}}>{f}</button>
          ))}
        </div>
        {filtered.map(student => {
          const fee = fees[student.id];
          const paid = fee && fee.balance <= 0;
          const [amount, setAmount] = useState("");
          return (
            <div key={student.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",padding:"14px",marginBottom:"8px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
                <div>
                  <div style={{fontSize:"14px",color:"#fff",fontWeight:"bold"}}>{student.name}</div>
                  <div style={{fontSize:"11px",color:"#64748b"}}>{student.level} — {student.classSection}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  {paid ? (
                    <span style={{padding:"4px 12px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:"20px",color:"#10b981",fontSize:"12px",fontWeight:"bold"}}>✅ PAID</span>
                  ) : (
                    <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                      <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount" style={{width:"90px",padding:"6px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"6px",color:"#fff",fontSize:"12px",outline:"none",textAlign:"center"}} />
                      <button onClick={()=>{if(amount)payFee(student,amount);}} style={{padding:"6px 12px",background:"linear-gradient(135deg,#10b981,#059669)",border:"none",borderRadius:"6px",color:"#fff",fontSize:"12px",cursor:"pointer",fontWeight:"bold"}}>Pay</button>
                    </div>
                  )}
                </div>
              </div>
              {fee && <div style={{marginTop:"8px",fontSize:"11px",color:"#64748b"}}>Paid: <span style={{color:"#10b981"}}>{fee.amount?.toLocaleString()} FCFA</span> | Balance: <span style={{color:fee.balance>0?"#ef4444":"#10b981"}}>{fee.balance?.toLocaleString()} FCFA</span></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
