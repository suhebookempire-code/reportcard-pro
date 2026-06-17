content = '''import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useParams } from "react-router-dom";

export default function Debug() {
  const { id } = useParams();
  const [out, setOut] = useState("Loading...");

  useEffect(() => {
    const run = async () => {
      let text = "";
      const snap = await getDoc(doc(db, "students", id));
      if (!snap.exists()) { setOut("Student not found"); return; }
      const s = snap.data();
      text += "STUDENT DATA:\\n" + JSON.stringify(s, null, 2) + "\\n\\n";

      if (s.schoolName) {
        const sq = query(collection(db, "schools"), where("name", "==", s.schoolName));
        const sqSnap = await getDocs(sq);
        text += "SCHOOL QUERY (by name='" + s.schoolName + "') RESULTS: " + sqSnap.size + "\\n";
        sqSnap.forEach(d => { text += JSON.stringify(d.data(), null, 2) + "\\n"; });
      }

      const allSchools = await getDocs(collection(db, "schools"));
      text += "\\nALL SCHOOLS (" + allSchools.size + "):\\n";
      allSchools.forEach(d => { text += JSON.stringify(d.data(), null, 2) + "\\n"; });

      const seqKey = "2026-2027_Sequence_1";
      const scoreDoc = await getDoc(doc(db, "scores", id + "_" + seqKey));
      text += "\\nSCORE DOC (" + id + "_" + seqKey + "): exists=" + scoreDoc.exists() + "\\n";
      if (scoreDoc.exists()) text += JSON.stringify(scoreDoc.data(), null, 2);

      setOut(text);
    };
    run();
  }, [id]);

  return <pre style={{whiteSpace:"pre-wrap",padding:"16px",background:"#0a0f1e",color:"#0f0",fontSize:"11px",minHeight:"100vh"}}>{out}</pre>;
}'''
open('src/pages/Debug.jsx','w').write(content)
print("done")
