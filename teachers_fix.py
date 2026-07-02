content = open('src/pages/Teachers.jsx').read()

# Add classes state and fetch
old = '  const [saving, setSaving] = useState(false);\n  const [copied, setCopied] = useState("");\n  const [deleting, setDeleting] = useState("");'
new = '  const [saving, setSaving] = useState(false);\n  const [copied, setCopied] = useState("");\n  const [deleting, setDeleting] = useState("");\n  const [classes, setClasses] = useState([]);'
content = content.replace(old, new)

# Fetch classes alongside teachers
old = '  const fetchTeachers = async () => {\n    const q = query(collection(db, "teachers"), where("schoolId", "==", schoolId));\n    const snap = await getDocs(q);'
new = '  const fetchTeachers = async () => {\n    const cq = query(collection(db, "classes"), where("schoolId", "==", schoolId));\n    const cSnap = await getDocs(cq);\n    setClasses(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));\n    const q = query(collection(db, "teachers"), where("schoolId", "==", schoolId));\n    const snap = await getDocs(q);'
content = content.replace(old, new)

# Add classes field to form
old = '  const [form, setForm] = useState({ name:"", subject:"", phone:"", email:"" });'
new = '  const [form, setForm] = useState({ name:"", subject:"", phone:"", email:"", assignedClasses:[] });'
content = content.replace(old, new)

# Add class multi-select after subject select
old = '            <select value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none",marginBottom:"14px"}}>\n              <option value="">-- Select Subject / Choisir Matiere --</option>\n              {allSubjects.map(s=><option key={s} value={s}>{s}</option>)}\n            </select>'
new = '            <select value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none",marginBottom:"10px"}}>\n              <option value="">-- Select Subject / Choisir Matiere --</option>\n              {allSubjects.map(s=><option key={s} value={s}>{s}</option>)}\n            </select>\n            <div style={{marginBottom:"14px"}}>\n              <div style={{fontSize:"12px",color:"#94a3b8",marginBottom:"6px"}}>Assign Classes (select all that apply):</div>\n              {classes.map(cls=>(\n                <label key={cls.id} style={{display:"flex",alignItems:"center",gap:"8px",padding:"6px",cursor:"pointer",color:"#e2e8f0",fontSize:"13px"}}>\n                  <input type="checkbox" checked={form.assignedClasses.includes(cls.id)} onChange={e=>{\n                    if(e.target.checked) setForm(f=>({...f,assignedClasses:[...f.assignedClasses,cls.id]}));\n                    else setForm(f=>({...f,assignedClasses:f.assignedClasses.filter(id=>id!==cls.id)}));\n                  }} />\n                  {cls.level} - {cls.name}\n                </label>\n              ))}\n            </div>'
content = content.replace(old, new)

open('src/pages/Teachers.jsx', 'w').write(content)
print("done")
