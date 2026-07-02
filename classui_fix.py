content = open('src/pages/TeacherPortal.jsx').read()

old = '''  const classStudents = students.filter(s => s.classSection === selectedClass);
  const student = classStudents[idx];
  const g = getGrade(mark);

  return ('''

new = '''  if (!selectedClass) return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e2e8f0"}}>
      <div style={{background:"linear-gradient(135deg,#0d1b3e,#1a3a6e)",borderBottom:"2px solid #eab308",padding:"12px 16px"}}>
        <div style={{fontSize:"11px",color:"#eab308",fontWeight:"bold"}}>ReportCard Pro — Teacher Portal</div>
        <div style={{fontSize:"14px",fontWeight:"bold",color:"#fff",marginTop:"2px"}}>{teacher.name}</div>
        <div style={{fontSize:"11px",color:"#94a3b8"}}>Subject: <span style={{color:"#eab308"}}>{teacher.subject}</span></div>
      </div>
      <div style={{maxWidth:"580px",margin:"0 auto",padding:"16px"}}>
        <h2 style={{color:"#fff",fontSize:"16px",margin:"0 0 16px"}}>Select Your Class / Choisir la Classe</h2>
        {classes.length === 0 ? (
          <div style={{textAlign:"center",padding:"40px",color:"#475569"}}>No classes assigned. Contact your administrator.</div>
        ) : classes.map((cls,i) => {
          const clsName = cls.name || cls;
          const clsLevel = cls.level || "";
          const count = students.filter(s => s.classSection === clsName).length;
          return (
            <div key={i} onClick={()=>setSelectedClass(clsName)} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:"12px",padding:"16px",marginBottom:"10px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:"15px",fontWeight:"bold",color:"#fff"}}>{clsLevel} {clsLevel ? "-" : ""} {clsName}</div>
                <div style={{fontSize:"11px",color:"#64748b",marginTop:"4px"}}>{count} student{count!==1?"s":""}</div>
              </div>
              <span style={{color:"#eab308",fontSize:"20px"}}>→</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const classStudents = students.filter(s => s.classSection === selectedClass);
  const student = classStudents[idx];
  const g = getGrade(mark);

  return ('''

if old in content:
    content = content.replace(old, new)
    print("fixed")
else:
    print("not found")

open('src/pages/TeacherPortal.jsx', 'w').write(content)
