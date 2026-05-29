export const getGrade = (score) => {
  if (score === null || score === undefined || score === "") return { grade: "-", remark: "-", percent: 0, color: "text-gray-400" };
  const s = parseFloat(score);
  const percent = (s / 20) * 100;
  if (percent >= 90) return { grade: "A", remark: "Excellent", percent, color: "text-emerald-400" };
  if (percent >= 80) return { grade: "B", remark: "Very Good", percent, color: "text-blue-400" };
  if (percent >= 70) return { grade: "C", remark: "Good", percent, color: "text-cyan-400" };
  if (percent >= 60) return { grade: "D", remark: "Average", percent, color: "text-yellow-400" };
  if (percent >= 50) return { grade: "E", remark: "Pass", percent, color: "text-orange-400" };
  return { grade: "F", remark: "Fail", percent, color: "text-red-400" };
};

export const getAverage = (scores) => {
  const valid = scores.filter(s => s !== null && s !== undefined && s !== "");
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + parseFloat(b), 0) / valid.length;
};

export const getRemark = (average) => {
  if (average === null) return "Needs Improvement";
  if (average >= 16) return "Excellent";
  if (average >= 14) return "Very Good";
  if (average >= 12) return "Good";
  if (average >= 10) return "Average";
  if (average >= 8) return "Pass";
  return "Needs Improvement";
};

export const LEVELS = ["Form 1","Form 2","Form 3","Form 4","Form 5","Lower Sixth","Upper Sixth"];

export const SUBJECTS_BY_LEVEL = {
  "Form 1": ["English Language","French","Mathematics","Science","History","Geography","Civics","Computer Science","Physical Education"],
  "Form 2": ["English Language","French","Mathematics","Science","History","Geography","Civics","Computer Science","Physical Education"],
  "Form 3": ["English Language","French","Mathematics","Physics","Chemistry","Biology","History","Geography","Computer Science"],
  "Form 4": ["English Language","French","Mathematics","Physics","Chemistry","Biology","History","Geography","Computer Science"],
  "Form 5": ["English Language","French","Mathematics","Physics","Chemistry","Biology","History","Geography","Computer Science"],
  "Lower Sixth": ["English Language","Mathematics","Physics","Chemistry","Biology","History","Geography","Economics","Computer Science"],
  "Upper Sixth": ["English Language","Mathematics","Physics","Chemistry","Biology","History","Geography","Economics","Computer Science"],
};

export const TERMS = ["First Term","Second Term","Third Term"];
export const ACADEMIC_YEARS = ["2023/2024","2024/2025","2025/2026","2026/2027"];

export const getOverallRemark = (average) => {
  if (average === null || average === undefined) return "Needs Improvement";
  if (average >= 16) return "Excellent";
  if (average >= 14) return "Very Good";
  if (average >= 12) return "Good";
  if (average >= 10) return "Average";
  if (average >= 8) return "Pass";
  return "Needs Improvement";
};
