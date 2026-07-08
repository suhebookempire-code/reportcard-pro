import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, signInAnonymously } from "firebase/auth";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const schoolCode = sessionStorage.getItem("schoolCode");
    if (schoolCode) {
      signInAnonymously(auth).catch(() => {});
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);

        let resolvedSchoolId = null;
        try {
          const userDocSnap = await getDoc(doc(db, "users", u.uid));
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setRole(userData.role || null);
            resolvedSchoolId = userData.schoolId || null;
          }
        } catch (e) {
          // fall through to legacy lookup below
        }

        if (resolvedSchoolId) {
          const schoolSnap = await getDoc(doc(db, "schools", resolvedSchoolId));
          if (schoolSnap.exists()) {
            const d = schoolSnap.data();
            sessionStorage.setItem("schoolName", d.name || "");
            sessionStorage.setItem("schoolId", resolvedSchoolId);
            setSchool({ id: resolvedSchoolId, ...d });
          }
        } else {
          const code = sessionStorage.getItem("schoolCode");
          if (code) {
            const q = query(collection(db, "schools"), where("code", "==", code));
            const snap = await getDocs(q);
            if (!snap.empty) { const d = snap.docs[0]; sessionStorage.setItem("schoolName", d.data().name || ""); sessionStorage.setItem("schoolId", d.id); setSchool({ id: d.id, ...d.data() }); }
          }
        }
      } else {
        setUser(null);
        setSchool(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => { sessionStorage.removeItem("schoolCode"); sessionStorage.removeItem("schoolId"); sessionStorage.removeItem("schoolName"); return signOut(auth); };

  return (
    <AuthContext.Provider value={{ user, school, role, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
