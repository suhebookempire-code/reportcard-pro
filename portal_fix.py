content = open('src/pages/TeacherPortal.jsx').read()

# Replace student query with class-based approach
old = '''        let sSnap = await getDocs(query(collection(db, "students"), where("schoolId", "==", t.schoolId)));
        const all = sSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const eligible = all.sort((a, b) => a.name.localeCompare(b.name));
        setStudents(eligible);
        const cls = [...new Set(eligible.map(s => s.classSection))].filter(Boolean).sort();
        setClasses(cls);'''

new = '''        const assignedClassIds = t.assignedClasses || [];
        let allStudents = [];
        let clsList = [];
        if (assignedClassIds.length > 0) {
          const cSnap = await getDocs(query(collection(db, "classes"), where("schoolId", "==", t.schoolId)));
          const allClasses = cSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          clsList = allClasses.filter(c => assignedClassIds.includes(c.id));
          const sSnap = await getDocs(query(collection(db, "students"), where("schoolId", "==", t.schoolId)));
          allStudents = sSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        } else {
          const sSnap = await getDocs(query(collection(db, "students"), where("schoolId", "==", t.schoolId)));
          allStudents = sSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          clsList = [...new Set(allStudents.map(s => s.classSection))].filter(Boolean).map(name => ({ name }));
        }
        setStudents(allStudents.sort((a, b) => a.name.localeCompare(b.name)));
        setClasses(clsList);'''

if old in content:
    content = content.replace(old, new)
    print("fixed")
else:
    print("not found")
    print(content[content.find('let sSnap'):content.find('let sSnap')+300])

open('src/pages/TeacherPortal.jsx', 'w').write(content)
