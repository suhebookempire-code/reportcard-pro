/**
 * streamSpecialties.js
 * ---------------------------------------------------------------------------
 * Reference data for GCE Technical & Vocational Education (TVE) streams.
 * Source: GCE Board Regulations and Syllabuses (Technical & Vocational
 * Education Examination, Intermediate Level).
 *
 * Covers the two specialty tracks used alongside the existing General
 * academic stream in ReportCard Pro:
 *   - TECHNICAL  (Industrial Specialties)
 *   - COMMERCIAL (Commercial Specialties)
 *
 * Each specialty carries its own specific subjects. All specialties within
 * a stream also carry that stream's compulsory subjects, and may choose
 * from that stream's elective subjects.
 * ---------------------------------------------------------------------------
 */

export const STREAMS = Object.freeze({
  GENERAL: "General",
  COMMERCIAL: "Commercial",
  TECHNICAL: "Technical",
});

/* ============================================================
 * TECHNICAL STREAM (Industrial Specialties)
 * ============================================================ */

export const TECHNICAL_SPECIALTIES = Object.freeze([
  { code: "ARM",   name: "Automobile Repair Mechanics" },
  { code: "ABWP",  name: "Automobile Body Work and Painting" },
  { code: "AE",    name: "Automobile Electricity" },
  { code: "FD",    name: "Fashion Design" },
  { code: "CEBC",  name: "Civil Engineering – Building Construction" },
  { code: "CJ",    name: "Carpentry and Joinery" },
  { code: "CET",   name: "Civil Engineering – Tiling" },
  { code: "CEIC",  name: "Chemical Engineering – Industrial Chemistry" },
  { code: "EPS",   name: "Electrical Power Systems" },
  { code: "ELEC",  name: "Electronics" },
  { code: "RHVAC", name: "Refrigeration, Heating, Ventilation & Air Conditioning" },
  { code: "IMES",  name: "Installation and Maintenance of Electronic Systems" },
  { code: "MEE",   name: "Maintenance of Electromechanical Equipment" },
  { code: "MM",    name: "Manufacturing Mechanics" },
  { code: "PHIS",  name: "Plumbing and Hydraulic Installation Systems" },
  { code: "SMF",   name: "Sheet Metal Fabrication" },
  { code: "WF",    name: "Welding and Fabrication" },
  { code: "APOP",  name: "Agriculture – Poultry Production" },
  { code: "APIP",  name: "Agriculture – Pig Production" },
]);

export const TECHNICAL_COMPULSORY_SUBJECTS = Object.freeze([
  "Mechanical Construction Drawing",
  "Engineering Science",
  "Engineering Drawing",
  "Mathematics",
  "Industrial Computing",
  "Quality, Hygiene, Safety & Environment",
  "Citizenship",
  "Religious Study",
  "Professional English",
  "French",
]);

export const TECHNICAL_ELECTIVE_SUBJECTS = Object.freeze([
  "Economic Geography",
  "Entrepreneurship",
  "Law and Government",
]);

/* ============================================================
 * COMMERCIAL STREAM (Commercial Specialties)
 * ============================================================ */

export const COMMERCIAL_SPECIALTIES = Object.freeze([
  { code: "ACC",  name: "Accounting" },
  { code: "BI",   name: "Banking and Insurance" },
  { code: "HE",   name: "Home Economics" },
  { code: "MKT",  name: "Marketing" },
  { code: "OACT", name: "Office Administration and Communication Techniques" },
  { code: "TL",   name: "Transport and Logistics" },
]);

export const COMMERCIAL_COMPULSORY_SUBJECTS = Object.freeze([
  "Business Mathematics",
  "Entrepreneurship",
  "Economics",
  "Professional English",
  "French",
]);

export const COMMERCIAL_ELECTIVE_SUBJECTS = Object.freeze([
  "Economic Geography",
  "Law and Government",
]);

/* ============================================================
 * UNIFIED LOOKUP TABLE
 * ============================================================ */

const STREAM_CONFIG = Object.freeze({
  [STREAMS.TECHNICAL]: {
    specialties: TECHNICAL_SPECIALTIES,
    compulsory: TECHNICAL_COMPULSORY_SUBJECTS,
    electives: TECHNICAL_ELECTIVE_SUBJECTS,
  },
  [STREAMS.COMMERCIAL]: {
    specialties: COMMERCIAL_SPECIALTIES,
    compulsory: COMMERCIAL_COMPULSORY_SUBJECTS,
    electives: COMMERCIAL_ELECTIVE_SUBJECTS,
  },
});

/**
 * Get all specialties available for a given stream.
 * @param {string} stream - one of STREAMS
 * @returns {{code: string, name: string}[]}
 */
export function getSpecialtiesForStream(stream) {
  return STREAM_CONFIG[stream]?.specialties ?? [];
}

/**
 * Get the full subject list (specialty subject + compulsory subjects)
 * for a given stream + specialty code.
 * @param {string} stream - one of STREAMS
 * @param {string} specialtyCode - e.g. "ARM", "ACC"
 * @returns {string[]}
 */
export function getSubjectsForSpecialty(stream, specialtyCode) {
  const config = STREAM_CONFIG[stream];
  if (!config) return [];
  const specialty = config.specialties.find((s) => s.code === specialtyCode);
  if (!specialty) return [];
  return [specialty.name, ...config.compulsory];
}

/**
 * Get elective subjects available for a stream.
 * @param {string} stream - one of STREAMS
 * @returns {string[]}
 */
export function getElectivesForStream(stream) {
  return STREAM_CONFIG[stream]?.electives ?? [];
}

export default {
  STREAMS,
  TECHNICAL_SPECIALTIES,
  TECHNICAL_COMPULSORY_SUBJECTS,
  TECHNICAL_ELECTIVE_SUBJECTS,
  COMMERCIAL_SPECIALTIES,
  COMMERCIAL_COMPULSORY_SUBJECTS,
  COMMERCIAL_ELECTIVE_SUBJECTS,
  getSpecialtiesForStream,
  getSubjectsForSpecialty,
  getElectivesForStream,
};
