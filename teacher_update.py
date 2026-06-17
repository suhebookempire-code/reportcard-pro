content = open('src/pages/TeacherPortal.jsx').read()

# Add selectedClass state after other states
content = content.replace(
    '  const [error, setError] = useState("");',
    '  const [error, setError] = useState("");\n  const [selectedClass, setSelectedClass] = useState(null);\n  const [classes, setClasses] = useState([]);'
)

# After setting students, group by class
content = content.replace(
    '        setStudents(eligible);',
    '        setStudents(eligible);\n        const cls = [...new Set(eligible.map(s => s.classSection))].filter(Boolean).sort();\n        setClasses(cls);'
)

open('src/pages/TeacherPortal.jsx', 'w').write(content)
print("done")
