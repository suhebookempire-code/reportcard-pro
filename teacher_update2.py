content = open('src/pages/TeacherPortal.jsx').read()

# Add class selection view before student list
old = '            No students found for your subject.<br/>Aucun eleve pour cette matiere.'
new = 'No students found for your subject.<br/>Aucun eleve pour cette matiere.'

# Find the return statement and add class selection
content = content.replace(
    '  if (students.length === 0) return (',
    '  if (!selectedClass && classes.length > 0) return (\n    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>\n      <div style={{background:"linear-gradient(135deg,#1a0a00,#0a0f1e)",borderBottom:"1px solid rgba(234,179,8,0.3)",padding:"12px 16px"}}>\n        <div style={{fontSize:"13px",fontWeight:"bold",color:"#eab308"}}>{teacher?.name}</div>\n        <div style={{fontSize:"11px",color:"#94a3b8"}}>Subject: {teacher?.subject}</div>\n      </div>\n      <div style={{maxWidth:"600px",margin:"0 auto",padding:"16px"}}>\n        <h2 style={{color:"#fff",fontSize:"16px",margin:"0 0 16px"}}>Select Class / Choisir la Classe</h2>\n        {classes.map(cls=>(\n          <div key={cls} onClick={()=>setSelectedClass(cls)} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:"12px",padding:"16px",marginBottom:"10px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>\n            <div>\n              <div style={{fontSize:"15px",fontWeight:"bold",color:"#fff"}}>{cls}</div>\n              <div style={{fontSize:"11px",color:"#64748b"}}>{students.filter(s=>s.classSection===cls).length} students</div>\n            </div>\n            <span style={{color:"#eab308",fontSize:"20px"}}>→</span>\n          </div>\n        ))}\n      </div>\n    </div>\n  );\n\n  if (!selectedClass) return (\n    <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>No classes found</div>\n  );\n\n  if (students.length === 0) return ('
)

# Filter students by selected class
content = content.replace(
    'const student = students[idx];',
    'const classStudents = students.filter(s => s.classSection === selectedClass);\n  const student = classStudents[idx];'
)
content = content.replace(
    'students.length === 0',
    'classStudents.length === 0'
)
content = content.replace(
    'students[idx + 1]',
    'classStudents[idx + 1]'
)
content = content.replace(
    '{idx + 1} / {students.length}',
    '{idx + 1} / {classStudents.length}'
)

open('src/pages/TeacherPortal.jsx', 'w').write(content)
print("done")
