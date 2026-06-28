import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GENERAL_SUBJECTS, SPECIALTIES, SEQUENCES, getGrade } from "../utils/grading";

export default function StudentCharts() {
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
  const subjects = [...GENERAL_SUBJECTS, ...(SPECIALTIES[student?.specialty] || [])];
  const getScore = (subj, seq) => allScores[seq]?.[subj] ?? null;

  const lineData = SEQUENCES.map(seq => {
    const vals = subjects.map(s => getScore(s, seq)).filter(v => v !== null);
    const avg = vals.length ? (vals.reduce((a,b) => a + parseFloat(b), 0) / vals.length).toFixed(1) : null;
    return { name: seq.replace("Sequence ", "Seq "), avg: avg ? parseFloat(avg) : null };
  });

  const barData = subjects.slice(0,10).map(subj => {
    const vals = SEQUENCES.map(s => getScore(subj, s)).filter(v => v !== null);
    const avg = vals.length ? (vals.reduce((a,b) => a + parseFloat(b), 0) / vals.length).toFixed(1) : null;
    return { name: subj.split("/")[0].trim().substring(0,12), avg: avg ? parseFloat(avg) : 0 };
  });

  const passCount = barData.filter(s => s.avg >= 10).length;
  const failCount = barData.filter(s => s.avg > 0 && s.avg < 10).length;
  const overallAvg = (() => {
    const vals = barData.filter(s => s.avg > 0).map(s => s.avg);
    if (!vals.length) return null;
    return (vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(2);
  })();

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <div style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <Link to="/" style={{color:"#94a3b8",fontSize:"13px",textDecoration:"none"}}>Back</Link>
        <div style={{fontSize:"14px",fontWeight:"bold",color:"#fff"}}>{student.name} Charts</div>
      </div>
      <div style={{maxWidth:"900px",margin:"0 auto",padding:"16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"20px"}}>
          {[{label:"Overall Avg",value:overallAvg?overallAvg+"/20":"-",color:"#eab308"},{label:"Passed",value:passCount,color:"#10b981"},{label:"Failed",value:failCount,color:"#ef4444"}].map(s=>(
            <div key={s.label} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"16px",textAlign:"center"}}>
              <div style={{fontSize:"28px",fontWeight:"bold",color:s.color}}>{s.value}</div>
              <div style={{fontSize:"11px",color:"#64748b",marginTop:"4px"}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"16px",marginBottom:"20px"}}>
          <h3 style={{color:"#eab308",fontSize:"14px",margin:"0 0 16px"}}>Average Progress</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis domain={[0,20]} stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",color:"#fff"}} />
              <Line type="monotone" dataKey="avg" stroke="#eab308" strokeWidth={3} dot={{fill:"#eab308",r:5}} name="Average/20" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"16px"}}>
          <h3 style={{color:"#eab308",fontSize:"14px",margin:"0 0 16px"}}>Subject Averages</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{bottom:40}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-35} textAnchor="end" interval={0} />
              <YAxis domain={[0,20]} stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",color:"#fff"}} />
              <Bar dataKey="avg" fill="#3b82f6" name="Average/20" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
