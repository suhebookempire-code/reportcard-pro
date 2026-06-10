import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, signInAnonymously } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const schoolCode = sessionStorage.getItem("schoolCode");
    if (schoolCode) {
      signInAnonymously(auth).catch(() => {});
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const code = sessionStorage.getItem("schoolCode");
        if (code) {
          const q = query(collection(db, "schools"), where("code", "==", code));
          const snap = await getDocs(q);
          if (!snap.empty) { const d = snap.docs[0]; sessionStorage.setItem("schoolName", d.data().name || ""); setSchool({ id: d.id, ...d.data() }); }
        }
      } else {
        setUser(null);
        setSchool(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => { sessionStorage.removeItem("schoolCode"); sessionStorage.removeItem("schoolId"); sessionStorage.removeItem("schoolName"); return signOut(auth); };

  return (
    <AuthContext.Provider value={{ user, school, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
