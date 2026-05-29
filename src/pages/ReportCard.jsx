import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import { SUBJECTS_BY_LEVEL, TERMS, ACADEMIC_YEARS, getGrade, getAverage, getOverallRemark } from "../utils/grading";

export default function ReportCard() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [term, setTerm] = useState("First Term");
  const [year, setYear] = useState("2025/2026");
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, "students", id));
      if (snap.exists()) setStudent({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    fetch();
  }, [id]);

  useEffect(() => {
    const fetchScores = async () => {
      if (!student) return;
      const key = `${year}_${term}`.replace(/\//g, "-").replace(/ /g, "_");
      const snap = await getDoc(doc(db, "scores", `${id}_${key}`));
      setScores(snap.exists() ? snap.data().scores || {} : {});
    };
    fetchScores();
  }, [student, term, year, id]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>;
  if (!student) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Student not found.</div>;

  const subjects = SUBJECTS_BY_LEVEL[student.level] || [];
  const filledScores = subjects.map((s) => scores[s] ?? "");
  const avg = getAverage(filledScores.filter((s) => s !== "").map(Number));
  const { grade: avgGrade, remark: avgRemark, color: avgColor } = getGrade(avg);
  const overall = getOverallRemark(avg);
  const totalScore = filledScores.filter((s) => s !== "").reduce((a, b) => a + parseFloat(b), 0);
  const maxPossible = filledScores.filter((s) => s !== "").length * 20;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">← Back</Link>
          <span className="font-bold text-white">Report Card</span>
        </div>
        <div className="flex items-center gap-3">
          <select value={year} onChange={(e) => setYear(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500">
            {ACADEMIC_YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
          <select value={term} onChange={(e) => setTerm(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500">
            {TERMS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <button onClick={() => window.print()}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-colors">
            Print / PDF
          </button>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-slate-900 text-white px-8 py-6 text-center">
            <h1 className="text-xl font-black">Government Bilingual High School</h1>
            <p className="text-slate-300 text-xs">Bamenda, North West Region · Cameroon</p>
            <div className="mt-3 pt-3 border-t border-slate-700">
              <h2 className="text-lg font-bold text-amber-400">STUDENT REPORT CARD</h2>
              <p className="text-slate-300 text-sm">{year} · {term}</p>
            </div>
          </div>
          <div className="px-8 py-5 bg-gray-50 border-b border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[["Student Name",student.name],["Class",student.classSection],["Level",student.level],["Admission No.",student.admissionNumber||"—"],["Gender",student.gender],["Date of Birth",student.dateOfBirth||"—"]].map(([label,value])=>(
              <div key={label}>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          <div className="px-8 py-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="text-left px-4 py-3 font-semibold">Subject</th>
                  <th className="text-center px-4 py-3 font-semibold">Score (/20)</th>
                  <th className="text-center px-4 py-3 font-semibold">%</th>
                  <th className="text-center px-4 py-3 font-semibold">Grade</th>
                  <th className="text-left px-4 py-3 font-semibold">Remark</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, i) => {
                  const score = scores[subject] ?? "";
                  const { grade, remark, percent } = getGrade(score);
                  return (
                    <tr key={subject} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-medium text-gray-900">{subject}</td>
                      <td className="px-4 py-3 text-center font-bold text-gray-900">{score !== "" ? score : "—"}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{score !== "" ? `${percent.toFixed(1)}%` : "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-black text-base ${grade==="A"?"text-emerald-600":grade==="B"?"text-blue-600":grade==="C"?"text-cyan-600":grade==="D"?"text-yellow-600":grade==="E"?"text-orange-600":grade==="F"?"text-red-600":"text-gray-400"}`}>{grade}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{remark}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-8 pb-8">
            <div className="bg-slate-900 text-white rounded-xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div><p className="text-slate-400 text-xs uppercase mb-1">Total Score</p><p className="text-2xl font-black text-amber-400">{totalScore.toFixed(1)}</p><p className="text-slate-400 text-xs">out of {maxPossible}</p></div>
              <div><p className="text-slate-400 text-xs uppercase mb-1">Average</p><p className="text-2xl font-black text-white">{avg.toFixed(2)}</p><p className="text-slate-400 text-xs">out of 20</p></div>
              <div><p className="text-slate-400 text-xs uppercase mb-1">Grade</p><p className={`text-2xl font-black ${avgColor}`}>{avgGrade}</p><p className="text-slate-400 text-xs">{avgRemark}</p></div>
              <div><p className="text-slate-400 text-xs uppercase mb-1">Overall</p><p className="text-sm font-bold text-white leading-tight">{overall}</p></div>
            </div>
          </div>
          <div className="px-8 pb-8 grid grid-cols-3 gap-8">
            {["Class Teacher","Principal","Parent / Guardian"].map((role)=>(
              <div key={role} className="text-center"><div className="border-t-2 border-gray-300 pt-2 mt-8"><p className="text-xs text-gray-500">{role}</p></div></div>
            ))}
          </div>
          <div className="bg-gray-100 px-8 py-3 text-center">
            <p className="text-xs text-gray-400">Generated by ReportCard Pro · Powered by Suh Ebook Empire</p>
          </div>
        </div>
      </div>
    </div>
  );
}
