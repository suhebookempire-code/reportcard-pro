import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LEVELS } from "../utils/grading";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState("All");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, "students"), orderBy("name"));
        const snap = await getDocs(q);
        setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchStudents();
  }, []);

  const handleLogout = async () => { await logout(); navigate("/"); };
  const filtered = filterLevel === "All" ? students : students.filter((s) => s.level === filterLevel);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
            <span className="text-sm font-black text-slate-950">RC</span>
          </div>
          <span className="font-bold text-white">ReportCard Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm hidden sm:block">{user?.email}</span>
          <Link to="/add-student" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-colors">+ Add Student</Link>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white text-sm transition-colors">Logout</button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Total Students</p>
            <p className="text-3xl font-black text-amber-500">{students.length}</p>
          </div>
          {["Form 1","Form 3","Form 5"].map((l) => (
            <div key={l} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">{l}</p>
              <p className="text-3xl font-black text-white">{students.filter((s) => s.level === l).length}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-slate-400 text-sm">Filter:</span>
          {["All",...LEVELS].map((l) => (
            <button key={l} onClick={() => setFilterLevel(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterLevel === l ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="font-bold text-white">Students ({filtered.length})</h2>
          </div>
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading students...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 mb-4">No students found</p>
              <Link to="/add-student" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-sm transition-colors">Add First Student</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filtered.map((student) => (
                <div key={student.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-amber-500">
                      {student.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{student.name}</p>
                      <p className="text-slate-400 text-sm">{student.level} · {student.classSection}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link to={`/report/${student.id}`} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">View Report</Link>
                    <Link to={`/enter-scores/${student.id}`} className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Enter Scores</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
