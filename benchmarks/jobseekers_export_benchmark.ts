import { performance } from 'perf_hooks';
import { convertRecordToCSVRow, JOBSEEKER_CSV_HEADERS, escapeCSV } from '../app/(app)/jobseekers/csv-helpers.ts';

// ============================================================================
// MOCKS
// ============================================================================

const MOCK_TOTAL_RECORDS = 50000;

// A record with enough complexity to exercise all paths
const mockRecord = {
  id: 1,
  created_at: new Date().toISOString(),
  created_by: 'user',
  status: 'active',
  employment_status: 'UNEMPLOYED',
  is_ofw: false,
  is_4ps_beneficiary: false,
  personal_info: {
    surname: 'Doe',
    firstName: 'John',
    middleName: 'M',
    suffix: '',
    dateOfBirth: '1990-01-01',
    placeOfBirth: 'City',
    sex: 'MALE',
    civilStatus: 'SINGLE',
    address: { houseStreet: '123 St', barangay: 'Brgy', city: 'City', province: 'Prov' },
    contactNumber: '09123456789',
    email: 'john@example.com',
    disability: {},
    religion: 'Catholic',
    tin: '123-456-789',
    height: '170cm'
  },
  employment: {
      status: 'UNEMPLOYED',
      unemployedReason: 'NEW_ENTRANT',
      employedType: '',
      selfEmployedTypes: {},
      terminatedCountry: '',
      unemployedReasonOthers: '',
      jobSearchDuration: '1 month',
      ofwCountry: '',
      formerOfwCountry: '',
      ofwReturnDate: '',
      householdIdNumber: ''
  },
  job_preference: {
      employmentType: 'FULL_TIME',
      occupation1: 'Dev',
      occupation2: '',
      occupation3: '',
      localLocation1: '',
      localLocation2: '',
      localLocation3: '',
      overseasLocation1: '',
      overseasLocation2: '',
      overseasLocation3: ''
  },
  language: {
      english: { read: true, write: true, speak: true, understand: true },
      filipino: { read: true, write: true, speak: true, understand: true },
      mandarin: {},
      others: {},
      othersName: ''
  },
  education: {
      currentlyInSchool: false,
      elementary: { yearGraduated: '2000' },
      secondary: { yearGraduated: '2004' },
      seniorHigh: {},
      tertiary: { course: 'BS CS', yearGraduated: '2008' },
      graduate: {},
      postGraduate: {}
  },
  training: {
      entries: [
          { course: 'Training 1', hours: '40', institution: 'TESDA', skillsAcquired: 'Skill 1', certificates: { NC_II: true } },
          { course: 'Training 2', hours: '20', institution: 'Online', skillsAcquired: 'Skill 2', certificates: {} },
          { course: 'Training 3', hours: '10', institution: 'Local', skillsAcquired: 'Skill 3', certificates: {} }
      ]
  },
  eligibility: {
      civilService: [
          { name: 'CS Prof', dateTaken: '2009' },
          { name: 'CS Sub', dateTaken: '2008' }
      ],
      professionalLicense: [
          { name: 'License 1', validUntil: '2025' }
      ]
  },
  work_experience: {
      entries: [
          { companyName: 'Comp 1', address: 'Addr 1', position: 'Pos 1', numberOfMonths: '12', employmentStatus: 'PERMANENT' },
          { companyName: 'Comp 2', address: 'Addr 2', position: 'Pos 2', numberOfMonths: '24', employmentStatus: 'CONTRACTUAL' },
          { companyName: 'Comp 3', address: 'Addr 3', position: 'Pos 3', numberOfMonths: '6', employmentStatus: 'PROBATIONARY' }
      ]
  },
  skills: {
      otherSkills: { computer_literate: true, driver: true },
      certification: { acknowledged: true, signature: 'Sig', dateSigned: '2023-01-01' },
      pesoUseOnly: { referralPrograms: { spes: true }, assessedBy: 'Assessor', assessmentDate: '2023-01-02' }
  },
};

const records = Array(MOCK_TOTAL_RECORDS).fill(mockRecord).map((r, i) => ({ ...r, id: i }));

// ============================================================================
// OLD IMPLEMENTATION (Simulated to match complexity)
// ============================================================================

const getTrainingArray = (
  trainingEntries: Array<Record<string, unknown>>,
  index: number
): string[] => {
  const t = trainingEntries[index] || {};
  const certs = (t.certificates || {}) as Record<string, unknown>;
  return [
    escapeCSV(t.course),
    escapeCSV(t.hours),
    escapeCSV(t.institution),
    escapeCSV(t.skillsAcquired),
    certs.NC_I ? "Yes" : "No",
    certs.NC_II ? "Yes" : "No",
    certs.NC_III ? "Yes" : "No",
    certs.NC_IV ? "Yes" : "No",
    certs.COC ? "Yes" : "No",
  ];
};

const getCivilServiceArray = (
  civilService: Array<Record<string, unknown>>,
  index: number
): string[] => {
  const cs = civilService[index] || {};
  return [escapeCSV(cs.name), escapeCSV(cs.dateTaken)];
};

const getProfLicenseArray = (
  profLicense: Array<Record<string, unknown>>,
  index: number
): string[] => {
  const pl = profLicense[index] || {};
  return [escapeCSV(pl.name), escapeCSV(pl.validUntil)];
};

const getWorkExpArray = (
  workEntries: Array<Record<string, unknown>>,
  index: number
): string[] => {
  const we = workEntries[index] || {};
  return [
    escapeCSV(we.companyName),
    escapeCSV(we.address),
    escapeCSV(we.position),
    escapeCSV(we.numberOfMonths),
    escapeCSV(we.employmentStatus),
  ];
};


function oldImplementation(record: any) {
    const personalInfo = (record.personal_info || {}) as Record<string, unknown>;
    const address = (personalInfo.address || {}) as Record<string, unknown>;
    const disability = (personalInfo.disability || {}) as Record<string, unknown>;
    const employment = (record.employment || {}) as Record<string, unknown>;
    const selfEmployed = (employment.selfEmployedTypes || {}) as Record<string, unknown>;
    const jobPref = (record.job_preference || {}) as Record<string, unknown>;
    const lang = (record.language || {}) as Record<string, unknown>;
    const edu = (record.education || {}) as Record<string, unknown>;
    const training = (record.training || {}) as Record<string, unknown>;
    const trainingEntries = (training.entries || []) as Array<Record<string, unknown>>;
    const eligibility = (record.eligibility || {}) as Record<string, unknown>;
    const civilService = (eligibility.civilService || []) as Array<Record<string, unknown>>;
    const profLicense = (eligibility.professionalLicense || []) as Array<Record<string, unknown>>;
    const workExp = (record.work_experience || {}) as Record<string, unknown>;
    const workEntries = (workExp.entries || []) as Array<Record<string, unknown>>;
    const skills = (record.skills || {}) as Record<string, unknown>;
    const otherSkills = (skills.otherSkills || {}) as Record<string, unknown>;
    const cert = (skills.certification || {}) as Record<string, unknown>;
    const pesoUse = (skills.pesoUseOnly || {}) as Record<string, unknown>;
    const referralPrograms = (pesoUse.referralPrograms || {}) as Record<string, unknown>;

    const row = [
      // Basic Info
      record.id,
      escapeCSV(personalInfo.surname),
      escapeCSV(personalInfo.firstName),
      escapeCSV(personalInfo.middleName),
      escapeCSV(personalInfo.suffix),
      escapeCSV(personalInfo.dateOfBirth),
      escapeCSV(personalInfo.placeOfBirth),
      escapeCSV(personalInfo.sex),
      escapeCSV(personalInfo.religion),
      escapeCSV(personalInfo.civilStatus),
      escapeCSV(address.houseStreet),
      escapeCSV(address.barangay),
      escapeCSV(address.city),
      escapeCSV(address.province),
      escapeCSV(personalInfo.tin),
      disability.visual ? "Yes" : "No",
      disability.hearing ? "Yes" : "No",
      disability.speech ? "Yes" : "No",
      disability.physical ? "Yes" : "No",
      disability.mental ? "Yes" : "No",
      escapeCSV(disability.others),
      escapeCSV(personalInfo.height),
      escapeCSV(personalInfo.contactNumber),
      escapeCSV(personalInfo.email),

      // Employment
      escapeCSV(employment.status),
      escapeCSV(employment.employedType),
      selfEmployed.fisherman ? "Yes" : "No",
      selfEmployed.vendor ? "Yes" : "No",
      selfEmployed.homeBased ? "Yes" : "No",
      selfEmployed.transport ? "Yes" : "No",
      selfEmployed.domestic ? "Yes" : "No",
      selfEmployed.freelancer ? "Yes" : "No",
      selfEmployed.artisan ? "Yes" : "No",
      escapeCSV(selfEmployed.others),
      escapeCSV(employment.unemployedReason),
      escapeCSV(employment.terminatedCountry),
      escapeCSV(employment.unemployedReasonOthers),
      escapeCSV(employment.jobSearchDuration),
      employment.isOfw ? "Yes" : "No",
      escapeCSV(employment.ofwCountry),
      employment.isFormerOfw ? "Yes" : "No",
      escapeCSV(employment.formerOfwCountry),
      escapeCSV(employment.ofwReturnDate),
      employment.is4PsBeneficiary ? "Yes" : "No",
      escapeCSV(employment.householdIdNumber),

      // Job Preference
      escapeCSV(jobPref.employmentType),
      escapeCSV(jobPref.occupation1),
      escapeCSV(jobPref.occupation2),
      escapeCSV(jobPref.occupation3),
      escapeCSV(jobPref.localLocation1),
      escapeCSV(jobPref.localLocation2),
      escapeCSV(jobPref.localLocation3),
      escapeCSV(jobPref.overseasLocation1),
      escapeCSV(jobPref.overseasLocation2),
      escapeCSV(jobPref.overseasLocation3),

      // Language
      (lang.english as Record<string, unknown>)?.read ? "Yes" : "No",
      (lang.english as Record<string, unknown>)?.write ? "Yes" : "No",
      (lang.english as Record<string, unknown>)?.speak ? "Yes" : "No",
      (lang.english as Record<string, unknown>)?.understand ? "Yes" : "No",
      (lang.filipino as Record<string, unknown>)?.read ? "Yes" : "No",
      (lang.filipino as Record<string, unknown>)?.write ? "Yes" : "No",
      (lang.filipino as Record<string, unknown>)?.speak ? "Yes" : "No",
      (lang.filipino as Record<string, unknown>)?.understand ? "Yes" : "No",
      (lang.mandarin as Record<string, unknown>)?.read ? "Yes" : "No",
      (lang.mandarin as Record<string, unknown>)?.write ? "Yes" : "No",
      (lang.mandarin as Record<string, unknown>)?.speak ? "Yes" : "No",
      (lang.mandarin as Record<string, unknown>)?.understand ? "Yes" : "No",
      escapeCSV(lang.othersName),
      (lang.others as Record<string, unknown>)?.read ? "Yes" : "No",
      (lang.others as Record<string, unknown>)?.write ? "Yes" : "No",
      (lang.others as Record<string, unknown>)?.speak ? "Yes" : "No",
      (lang.others as Record<string, unknown>)?.understand ? "Yes" : "No",

      // Education
      edu.currentlyInSchool ? "Yes" : "No",
      escapeCSV((edu.elementary as Record<string, unknown>)?.yearGraduated),
      escapeCSV((edu.elementary as Record<string, unknown>)?.levelReached),
      escapeCSV((edu.elementary as Record<string, unknown>)?.yearLastAttended),
      escapeCSV((edu.secondary as Record<string, unknown>)?.curriculumType),
      escapeCSV((edu.secondary as Record<string, unknown>)?.yearGraduated),
      escapeCSV((edu.secondary as Record<string, unknown>)?.levelReached),
      escapeCSV((edu.secondary as Record<string, unknown>)?.yearLastAttended),
      escapeCSV((edu.seniorHigh as Record<string, unknown>)?.strand),
      escapeCSV((edu.seniorHigh as Record<string, unknown>)?.yearGraduated),
      escapeCSV((edu.seniorHigh as Record<string, unknown>)?.levelReached),
      escapeCSV((edu.seniorHigh as Record<string, unknown>)?.yearLastAttended),
      escapeCSV((edu.tertiary as Record<string, unknown>)?.course),
      escapeCSV((edu.tertiary as Record<string, unknown>)?.yearGraduated),
      escapeCSV((edu.tertiary as Record<string, unknown>)?.levelReached),
      escapeCSV((edu.tertiary as Record<string, unknown>)?.yearLastAttended),
      escapeCSV((edu.graduate as Record<string, unknown>)?.course),
      escapeCSV((edu.graduate as Record<string, unknown>)?.yearGraduated),
      escapeCSV((edu.graduate as Record<string, unknown>)?.yearLastAttended),

      // Training (first 3 entries)
      ...getTrainingArray(trainingEntries, 0),
      ...getTrainingArray(trainingEntries, 1),
      ...getTrainingArray(trainingEntries, 2),

      // Eligibility
      ...getCivilServiceArray(civilService, 0),
      ...getCivilServiceArray(civilService, 1),
      ...getCivilServiceArray(civilService, 2),
      ...getProfLicenseArray(profLicense, 0),
      ...getProfLicenseArray(profLicense, 1),
      ...getProfLicenseArray(profLicense, 2),

      // Work Experience (first 5)
      ...getWorkExpArray(workEntries, 0),
      ...getWorkExpArray(workEntries, 1),
      ...getWorkExpArray(workEntries, 2),
      ...getWorkExpArray(workEntries, 3),
      ...getWorkExpArray(workEntries, 4),

      // Skills
      otherSkills.auto_mechanic ? "Yes" : "No",
      otherSkills.beautician ? "Yes" : "No",
      otherSkills.carpentry_work ? "Yes" : "No",
      otherSkills.computer_literate ? "Yes" : "No",
      otherSkills.domestic_chores ? "Yes" : "No",
      otherSkills.driver ? "Yes" : "No",
      otherSkills.electrician ? "Yes" : "No",
      otherSkills.embroidery ? "Yes" : "No",
      otherSkills.gardening ? "Yes" : "No",
      otherSkills.masonry ? "Yes" : "No",
      otherSkills.painter_artist ? "Yes" : "No",
      otherSkills.painting_jobs ? "Yes" : "No",
      otherSkills.photography ? "Yes" : "No",
      otherSkills.plumbing ? "Yes" : "No",
      otherSkills.sewing_dresses ? "Yes" : "No",
      otherSkills.stenography ? "Yes" : "No",
      otherSkills.tailoring ? "Yes" : "No",
      escapeCSV(otherSkills.others),

      // Certification
      cert.acknowledged ? "Yes" : "No",
      escapeCSV(cert.signature),
      escapeCSV(cert.dateSigned),

      // PESO Use Only
      referralPrograms.spes ? "Yes" : "No",
      referralPrograms.gip ? "Yes" : "No",
      referralPrograms.tupad ? "Yes" : "No",
      referralPrograms.jobstart ? "Yes" : "No",
      referralPrograms.dileep ? "Yes" : "No",
      referralPrograms.tesda_training ? "Yes" : "No",
      escapeCSV(referralPrograms.others),
      escapeCSV(pesoUse.assessedBy),
      escapeCSV(pesoUse.assessorSignature),
      escapeCSV(pesoUse.assessmentDate),

      // System Fields
      new Date(record.created_at).toLocaleDateString(),
      escapeCSV(record.created_by),
      escapeCSV(record.status),
    ];

    return row.join(",");
}

// ============================================================================
// BENCHMARK
// ============================================================================

async function run() {
  console.log(`Running benchmark with ${MOCK_TOTAL_RECORDS} records...`);

  // 1. Baseline (Array + Spread + Join)
  global.gc?.();
  const startBase = performance.now();
  const startMemBase = process.memoryUsage().heapUsed;

  for (const record of records) {
      oldImplementation(record);
  }

  const endBase = performance.now();
  const endMemBase = process.memoryUsage().heapUsed;

  console.log(`Baseline (Array + Join): ${(endBase - startBase).toFixed(2)} ms`);
  console.log(`Baseline Memory Delta: ${((endMemBase - startMemBase) / 1024 / 1024).toFixed(2)} MB`);


  // 2. Optimized (String Concatenation)
  global.gc?.();
  const startOpt = performance.now();
  const startMemOpt = process.memoryUsage().heapUsed;

  for (const record of records) {
      convertRecordToCSVRow(record);
  }

  const endOpt = performance.now();
  const endMemOpt = process.memoryUsage().heapUsed;

  console.log(`Optimized (String Concat): ${(endOpt - startOpt).toFixed(2)} ms`);
  console.log(`Optimized Memory Delta: ${((endMemOpt - startMemOpt) / 1024 / 1024).toFixed(2)} MB`);

  const speedup = (endBase - startBase) / (endOpt - startOpt);
  console.log(`Speedup: ${speedup.toFixed(2)}x`);
}

run();
