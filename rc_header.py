content = open('src/pages/ReportCard.jsx').read()

# Load school info from schools collection using schoolName
old = '        const infoSnap2 = await getDoc(doc(db, "schoolInfo", s.schoolName || "default"));\n        if (infoSnap2.exists()) setHeader(prev => ({...prev, ...infoSnap2.data()}));'
new = '        const infoSnap2 = await getDoc(doc(db, "schoolInfo", s.schoolName || "default"));\n        if (infoSnap2.exists()) setHeader(prev => ({...prev, ...infoSnap2.data()}));\n        const schoolCode = sessionStorage.getItem("schoolCode");\n        if (schoolCode) {\n          const sq = await getDocs(query(collection(db, "schools"), where("code", "==", schoolCode)));\n          if (!sq.empty) {\n            const sd = sq.docs[0].data();\n            setHeader(prev => ({...prev, tel: sd.phone || prev.tel, name: sd.name || prev.name}));\n          }\n        }'

content = content.replace(old, new)

# Add missing imports
content = content.replace(
    'import { doc, getDoc, setDoc } from "firebase/firestore";',
    'import { doc, getDoc, setDoc, collection, getDocs, query, where } from "firebase/firestore";'
)

open('src/pages/ReportCard.jsx', 'w').write(content)
print("done")
