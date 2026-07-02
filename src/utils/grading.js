
export const getGrade = (score) => {
  if (score === null || score === undefined || score === "") return { grade: "-", remark: "N/A", remarkFr: "N/A", color: "text-gray-400" };
  const s = parseFloat(score);
  if (s >= 18) return { grade: "A+", remark: "Excellent", remarkFr: "Excellent", color: "#10b981" };
  if (s >= 16) return { grade: "A", remark: "Very Good", remarkFr: "Tres Bien", color: "#34d399" };
  if (s >= 14) return { grade: "B+", remark: "Good", remarkFr: "Bien", color: "#3b82f6" };
  if (s >= 12) return { grade: "B", remark: "Fairly Good", remarkFr: "Assez Bien", color: "#60a5fa" };
  if (s >= 10) return { grade: "C", remark: "Pass", remarkFr: "Passable", color: "#eab308" };
  if (s >= 8) return { grade: "D", remark: "Poor", remarkFr: "Insuffisant", color: "#f97316" };
  return { grade: "F", remark: "Fail", remarkFr: "Echec", color: "#ef4444" };
};

export const getOverallRemark = (avg) => {
  if (!avg) return { en: "N/A", fr: "N/A" };
  if (avg >= 18) return { en: "Excellent", fr: "Excellent" };
  if (avg >= 16) return { en: "Very Good", fr: "Tres Bien" };
  if (avg >= 14) return { en: "Good", fr: "Bien" };
  if (avg >= 12) return { en: "Fairly Good", fr: "Assez Bien" };
  if (avg >= 10) return { en: "Pass", fr: "Passable" };
  if (avg >= 8) return { en: "Poor", fr: "Insuffisant" };
  return { en: "Fail", fr: "Echec" };
};

export const LEVELS = ["Form 1","Form 2","Form 3","Form 4","Form 5","Lower Sixth","Upper Sixth"];
export const SEQUENCES = ["Sequence 1","Sequence 2","Sequence 3","Sequence 4","Sequence 5","Sequence 6"];
export const TERMS = {
  "First Term / Premier Trimestre": ["Sequence 1","Sequence 2"],
  "Second Term / Deuxieme Trimestre": ["Sequence 3","Sequence 4"],
  "Third Term / Troisieme Trimestre": ["Sequence 5","Sequence 6"],
};
export const ACADEMIC_YEARS = ["2024/2025","2025/2026","2026/2027","2027/2028"];

export const GENERAL_SUBJECTS = [
  "English Language / Langue Anglaise",
  "French / Francais",
  "Mathematics / Mathematiques",
  "Literature in English / Litterature Anglaise",
  "Citizenship Education / Education a la Citoyennete",
  "Biology / Biologie",
  "Chemistry / Chimie",
  "Physics / Physique",
  "Computer Science / Informatique",
  "Food and Nutrition / Alimentation et Nutrition",
  "Food Science / Science Alimentaire",
  "Manual Labour / Travaux Manuels",
  "Sports / Sport",
];

export const SPECIALTIES = {
  "Automobile Repairs Mechanics (ARM)": ["Materials Technology and Workshop Processes","Electrical and Electronic Technology","Mechanical Technology","Engineering Science","Mechanical Construction Drawing","Industrial Computing"],
  "Automobile Electricity (AE)": ["Automobile Electrical and Electronic Technology","Automobile Circuit Diagrams and Accessories","Basic Automobile Technology","Engineering Drawing","Industrial Computing"],
  "Automobile Bodywork and Painting (ABP)": ["Basic Vehicle Technology","Mechanical Construction and Development","Material and Paint Technology","Engineering Science","Industrial Computing"],
  "Manufacturing Mechanics (MAME)": ["Manufacturing Technology and Processes","Material Science and Processes","Mechanical Construction Drawing","Industrial Automation and Numerical Control Machining","Production Technology and Processes","Industrial Computing"],
  "Metal Works and Industrial Piping (MWIP)": ["Metal Construction Design","Workshop Processes and Materials","Sheet Metal Pattern Development","Metal and Industrial Pipe Work","Engineering Science","Industrial Computing"],
  "Maintenance of Electromechanical Equipment (MEME)": ["Maintenance of Pneumatic and Hydraulic Systems","Maintenance of Mechanical Systems","Maintenance of Electrical Systems","Engineering Science","Engineering Drawing","Industrial Computing"],
  "Sheet Metal Fabrication (SMF)": ["Workshop Processes and Materials","Sheet Metal Construction Drawing","Sheet Metal Works","Engineering Science","Industrial Computing"],
  "Welding and Fabrication (WF)": ["Workshop Processes and Materials","Metal Construction Drawing","Welding Fabrication Work","Engineering Science","Industrial Computing"],
  "Civil Engineering - Building Construction (CE-BC)": ["Construction Processes and Building Practice","Building Construction Drawing","Survey Soils Mechanics and Materials","Engineering Science","Quality Hygiene Safety and Environment","Industrial Computing"],
  "Civil Engineering - Tiling (CE-TIL)": ["Tiling Drawing","Tiling Materials Estimates and Rehabilitation","Tiling Technology and Practice","Engineering Science","Quality Hygiene Safety and Environment","Industrial Computing"],
  "Chemical Engineering - Industrial Chemistry (CHE-IC)": ["Analytical Chemistry","Organic Chemistry","Physical Chemistry","Engineering Science","Chemical Engineering Process","Industrial Computing"],
  "Chemical Engineering - Petro-Chemistry (CHE-PCBP)": ["Analytical and Physical Chemistry","Processing Engineering","Industrial Organic Chemistry and Applied Biochemistry","Petro-chemicals and Bio-Products Formulations","Engineering Science"],
  "Refrigeration Heating Ventilation and Air Conditioning (RHVAC)": ["Refrigeration and Air-Conditioning Technology","Refrigeration and Air-Conditioning Electricity","Applied Sciences","Engineering Science","Engineering Drawing","Industrial Computing"],
  "Electronics (ELN)": ["Communication Systems","Electronics and Electrical Machines","Design of Electrical Systems","Embedded Systems and Computer Technology","Applied Mechanics","Industrial Computing"],
  "Fashion Design (FDE)": ["Technology of Textiles and Equipment","Fashion Illustration","Pattern Making and Garment Construction","Engineering Science","Work Organisation"],
  "Civil Engineering - Architectural Draftsmanship (CE-AD)": ["Architectural Draftsmanship Technology and Practice","Drawing and Architectural Modeling","Architectural Draftsmanship Project Management","Architectural Draftsmanship Applied Mechanics","Engineering Science","Civil Engineering Surveying and Soil Mechanics"],
  "Plumbing and Hydraulic Installation Systems (PHIS)": ["Plumbing Network Drawing","Plumbing Technology","Plumbing Maintenance","Engineering Science","Industrial Computing"],
  "Wood Furniture and Cabinet Making (WFCM)": ["Furniture Design and Drawing","Construction Processes","Finishing and Restoration Techniques","Production Management","Applied Mechanics"],
  "Carpentry and Interior Design (CID)": ["Finishing and Restoration Techniques","Production Management","Design and Drawing of Interior/External Works","Site Organisation and Installation","Applied Mechanics"],
  "Surveying (SURV)": ["Digital Processing and Survey Technology","Special Techniques in Survey","Topographical Drawing","Land Survey Law","Engineering Science"],
  "Forest Management Techniques (FMT)": ["Sustainable Management of Forest Resources","Forest Operations","Forest Sciences","Forest Geomatics","Engineering Science"],
  "Biomedical Equipment Maintenance (BEMA)": ["Biomedical Engineering","Electrical Electronics and Refrigeration","Mechanics and Automation","Human Anatomy and Physiology","Health Care Management","Engineering Science"],
  "Agriculture - Monogastrics Production (AMOP)": ["Techniques and Practice of Monogastrics","Monogastrics Diseases and Waste Management","Slaughtering and Conservation of Monogastrics Products","Process of Monogastrics Feed Production and Conservation","Anatomy and Physiology of Monogastrics"],
  "Agriculture - Poultry Production (APLP)": ["Techniques and Practice of Poultry Production","Poultry Diseases and their Management","Slaughtering and Conservation of Poultry Products","Taxonomy of Poultry and Basics of Feed Production","Quality Hygiene Safety and Environment"],
  "Agriculture - Pig Production (APIP)": ["Techniques of Pig Production","Pig Disease and their Management","Slaughtering and Conservation of Pig Products","Taxonomy of Pigs and Basics of Feed Production","Quality Hygiene Safety and Environment"],
  "Accounting (ACC)": ["OHADA Financial Accounting","OHADA Financial Reporting","International Financial Accounting","Business Mathematics","Entrepreneurship","Economics"],
  "Banking and Insurance (BIN)": ["Banking Techniques","Principles of Insurance","Banking and Insurance Accounting","Business Mathematics","Entrepreneurship","Economics"],
  "Home Economics (HEC)": ["Food Nutrition and Health","Resource Management on Home Studies","Family Life Education and Gerontology","Natural Science","Entrepreneurship"],
  "Marketing (MKTG)": ["Professional Marketing Practice","Marketing Skills","Digital Marketing","Business Mathematics","Commerce and Finance","Entrepreneurship"],
  "Administrative and Communication Techniques (ACT)": ["Office and Administrative Management","Professional and Communication Techniques","Information Processing","Business Management","Entrepreneurship","Law"],
  "Heating Taxation and Information Management Systems (TIMS)": ["Financial Accounting","Principles and Practice of Taxation","Management Information Systems","Economics","Business Management","Business Mathematics"],
  "Digital Professional Reporting (DPR)": ["Steno Method and Information Process","Transcription Techniques and Office Skill","Digital Reporting","Entrepreneurship","Professional Communication Technique","Law"],
  "Bakery and Pastry (BP)": ["Principles and Practice of Baking","Principles and Practice of Pastry","Food Processing","Marketing Skills","Entrepreneurship","Computer Aided Management"],
  "Hotel Management (HM)": ["Principles and Practice of Culinary Science","Accommodation and Housekeeping Management","Restaurant/Bar Management","Entrepreneurship","English Language","Professional French"],
  "Transport and Logistics Management (TLM)": ["Introduction to Transport","Introduction to Logistics Management","Introduction to Customs Clearance","Business Mathematics","Entrepreneurship","Sales Methods and Communication"],
  "Grammar - Science": ["Biology","Chemistry","Physics","Further Mathematics","Geography","History"],
  "Grammar - Arts": ["History","Geography","Economics","Literature in English","Religious Studies","Philosophy"],
  "Grammar - Commercial": ["Commerce","Accounting","Economics","Business Mathematics","Geography"],
};

const COMMERCIAL_KEYS = ["Accounting (ACC)","Banking and Insurance (BIN)","Home Economics (HEC)","Marketing (MKTG)","Administrative and Communication Techniques (ACT)","Heating Taxation and Information Management Systems (TIMS)","Digital Professional Reporting (DPR)","Bakery and Pastry (BP)","Hotel Management (HM)","Transport and Logistics Management (TLM)"];

export function getSpecialtiesBySection(section) {
  const keys = Object.keys(SPECIALTIES);
  if (section === "Technical") {
    return keys.filter(k => !k.startsWith("Grammar") && !COMMERCIAL_KEYS.includes(k));
  }
  if (section === "Commercial") {
    return COMMERCIAL_KEYS;
  }
  if (section === "Grammar") {
    return keys.filter(k => k.startsWith("Grammar"));
  }
  return keys;
}

export const SUBJECTS_BY_LEVEL = {
  "Form 1": [...GENERAL_SUBJECTS],
  "Form 2": [...GENERAL_SUBJECTS],
  "Form 3": [...GENERAL_SUBJECTS],
  "Form 4": [...GENERAL_SUBJECTS],
  "Form 5": [...GENERAL_SUBJECTS],
  "Lower Sixth": [...GENERAL_SUBJECTS],
  "Upper Sixth": [...GENERAL_SUBJECTS],
};
