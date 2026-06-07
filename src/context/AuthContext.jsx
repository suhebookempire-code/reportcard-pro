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
    const schoolCode = localStorage.getItem("schoolCode");
    if (schoolCode) {
      signInAnonymously(auth).catch(() => {});
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const code = localStorage.getItem("schoolCode");
        if (code) {
          const q = query(collection(db, "schools"), where("code", "==", code));
          const snap = await getDocs(q);
          if (!snap.empty) setSchool({ id: snap.docs[0].id, ...snap.docs[0].data() });
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
  const logout = () => { localStorage.removeItem("schoolCode"); localStorage.removeItem("schoolId"); localStorage.removeItem("schoolName"); return signOut(auth); };

  return (
    <AuthContext.Provider value={{ user, school, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
