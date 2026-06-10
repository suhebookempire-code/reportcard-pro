import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Notifications() {
  const { school } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [msgType, setMsgType] = useState("result");
  const schoolId = sessionStorage.getItem("schoolId") || school?.id;
  const schoolName = sessionStorage.getItem("schoolName") || school?.name || "School";

  useEffect(() => {
    const load = async () => {
      if (!schoolId) return;
      const sq = query(collection(db, "students"), where("schoolId", "==", schoolId));
      const snap = await getDocs(sq);
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    load();
  }, [schoolId]);

  const getMessage = (student) => {
    if (msgType === "result") return `Dear Parent, your child ${student.name} (${student.level} - ${student.classSection}) result is ready. Please visit ${schoolName} to collect the report card. Thank you.`;
    if (msgType === "fees") return `Dear Parent, your child ${student.name} school fees are due. Please contact ${schoolName} for payment. Thank you.`;
    if (msgType === "meeting") return `Dear Parent, you are invited to a Parent-Teacher meeting at ${schoolName}. Please confirm your attendance. Thank you.`;
    return `Dear Parent, this is a message from ${schoolName} regarding your child ${student.name}. Please contact us for more information.`;
  };

  const sendWhatsApp = (phone, message) => {
    const cleaned = phone.replace(/[^0-9]/g, "");
    const intl = cleaned.startsWith("0") ? "237" + cleaned.slice(1) : cleaned.startsWith("237") ? cleaned : "237" + cleaned;
    const url = `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };
  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  if (loading) return <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>Loading...</div>;
  return (<div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}><div style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><Link to="/" style={{color:"#94a3b8",fontSize:"13px",textDecoration:"none"}}>Back</Link><div style={{fontSize:"14px",fontWeight:"bold",color:"#fff"}}>WhatsApp Notifications</div><div style={{fontSize:"11px",color:"#25d366"}}>Free via WhatsApp</div></div>
  <div style={{maxWidth:"800px",margin:"0 auto",padding:"16px"}}>
  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student..." style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box",marginBottom:"16px"}} />
  {filtered.map(student => (<div key={student.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",padding:"14px",marginBottom:"8px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"8px"}}><div><div style={{fontSize:"14px",color:"#fff",fontWeight:"bold"}}>{student.name}</div><div style={{fontSize:"11px",color:"#64748b"}}>{student.level}</div></div><button onClick={()=>sendWhatsApp(student.phone||"",getMessage(student))} style={{padding:"8px 16px",background:"linear-gradient(135deg,#25d366,#128c7e)",border:"none",borderRadius:"8px",color:"#fff",fontSize:"12px",cursor:"pointer",fontWeight:"bold"}}>Send WhatsApp</button></div><div style={{marginTop:"8px",fontSize:"11px",color:"#475569"}}>{getMessage(student)}</div></div>))}
  </div></div>);
}
