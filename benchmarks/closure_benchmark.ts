
import { performance } from 'perf_hooks';

const ITERATIONS = 100000;

// Mock data
const mockRecord = {
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

const records = Array(ITERATIONS).fill(mockRecord);

function baseline() {
  const csvRows: string[] = [];

  records.forEach((record) => {
      const personalInfo = (record.personal_info || {}) as Record<string, unknown>;
      const employment = (record.employment || {}) as Record<string, unknown>;
      const training = (record.training || {}) as Record<string, unknown>;
      const trainingEntries = (training.entries || []) as Array<Record<string, unknown>>;
      const eligibility = (record.eligibility || {}) as Record<string, unknown>;
      const civilService = (eligibility.civilService || []) as Array<Record<string, unknown>>;
      const profLicense = (eligibility.professionalLicense || []) as Array<Record<string, unknown>>;
      const workExp = (record.work_experience || {}) as Record<string, unknown>;
      const workEntries = (workExp.entries || []) as Array<Record<string, unknown>>;

      // Helper to escape CSV values
      const escapeCSV = (val: unknown): string => {
        if (val === null || val === undefined) return "";
        let str = String(val);

        // Prevent CSV injection
        if (/^[=+\-@]/.test(str)) {
          str = `'${str}`;
        }

        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Helper to get nested array values
      const getTraining = (index: number): string[] => {
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

      const getCivilService = (index: number): string[] => {
        const cs = civilService[index] || {};
        return [escapeCSV(cs.name), escapeCSV(cs.dateTaken)];
      };

      const getProfLicense = (index: number): string[] => {
        const pl = profLicense[index] || {};
        return [escapeCSV(pl.name), escapeCSV(pl.validUntil)];
      };

      const getWorkExp = (index: number): string[] => {
        const we = workEntries[index] || {};
        return [
          escapeCSV(we.companyName),
          escapeCSV(we.address),
          escapeCSV(we.position),
          escapeCSV(we.numberOfMonths),
          escapeCSV(we.employmentStatus),
        ];
      };

      // Only calling a few to simulate usage
      getTraining(0);
      getTraining(1);
      getCivilService(0);
      getProfLicense(0);
      getWorkExp(0);
      escapeCSV(personalInfo.surname);

      // We don't need to build the full row for this test, just enough to exercise the closures
      csvRows.push("row");
  });
  return csvRows.length;
}

// ----------------------------------------------------------------------

// Hoisted helpers
const escapeCSV = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    let str = String(val);

    // Prevent CSV injection
    if (/^[=+\-@]/.test(str)) {
      str = `'${str}`;
    }

    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

const getTraining = (trainingEntries: Array<Record<string, unknown>>, index: number): string[] => {
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

const getCivilService = (civilService: Array<Record<string, unknown>>, index: number): string[] => {
    const cs = civilService[index] || {};
    return [escapeCSV(cs.name), escapeCSV(cs.dateTaken)];
};

const getProfLicense = (profLicense: Array<Record<string, unknown>>, index: number): string[] => {
    const pl = profLicense[index] || {};
    return [escapeCSV(pl.name), escapeCSV(pl.validUntil)];
};

const getWorkExp = (workEntries: Array<Record<string, unknown>>, index: number): string[] => {
    const we = workEntries[index] || {};
    return [
      escapeCSV(we.companyName),
      escapeCSV(we.address),
      escapeCSV(we.position),
      escapeCSV(we.numberOfMonths),
      escapeCSV(we.employmentStatus),
    ];
};

function optimized() {
  const csvRows: string[] = [];

  records.forEach((record) => {
      const personalInfo = (record.personal_info || {}) as Record<string, unknown>;
      const training = (record.training || {}) as Record<string, unknown>;
      const trainingEntries = (training.entries || []) as Array<Record<string, unknown>>;
      const eligibility = (record.eligibility || {}) as Record<string, unknown>;
      const civilService = (eligibility.civilService || []) as Array<Record<string, unknown>>;
      const profLicense = (eligibility.professionalLicense || []) as Array<Record<string, unknown>>;
      const workExp = (record.work_experience || {}) as Record<string, unknown>;
      const workEntries = (workExp.entries || []) as Array<Record<string, unknown>>;

      getTraining(trainingEntries, 0);
      getTraining(trainingEntries, 1);
      getCivilService(civilService, 0);
      getProfLicense(profLicense, 0);
      getWorkExp(workEntries, 0);
      escapeCSV(personalInfo.surname);

      csvRows.push("row");
  });
  return csvRows.length;
}

async function run() {
    console.log(`Running benchmark with ${ITERATIONS} iterations...`);

    global.gc?.();
    const startBase = performance.now();
    baseline();
    const endBase = performance.now();
    console.log(`Baseline: ${(endBase - startBase).toFixed(2)} ms`);

    global.gc?.();
    const startOpt = performance.now();
    optimized();
    const endOpt = performance.now();
    console.log(`Optimized: ${(endOpt - startOpt).toFixed(2)} ms`);

    console.log(`Improvement: ${((endBase - startBase - (endOpt - startOpt)) / (endBase - startBase) * 100).toFixed(2)}%`);
}

run();
