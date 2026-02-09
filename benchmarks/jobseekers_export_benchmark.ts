import { performance } from 'perf_hooks';

// ============================================================================
// MOCKS
// ============================================================================

const MOCK_TOTAL_RECORDS = 50000; // Large enough to stress memory
const PAGE_SIZE = 1000;

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

// Generate data on demand to avoid initial memory spike
const getDataSlice = (start: number, end: number) => {
    const slice = [];
    for (let i = start; i <= end && i < MOCK_TOTAL_RECORDS; i++) {
        slice.push({ ...mockRecord, id: i });
    }
    return slice;
};

// Mock Supabase
const createMockSupabase = () => {
  return {
    from: (table: string) => {
      const queryBuilder: any = {
        select: (columns: string) => queryBuilder,
        or: (filter: string) => queryBuilder,
        eq: (col: string, val: any) => queryBuilder,
        ilike: (col: string, val: any) => queryBuilder,
        range: (start: number, end: number) => {
          return Promise.resolve({ data: getDataSlice(start, end), error: null });
        },
        then: (resolve: any) => {
             // Simulate "fetch all"
             // Be careful: this will create the massive array in memory immediately
             resolve({ data: getDataSlice(0, MOCK_TOTAL_RECORDS - 1), error: null });
        }
      };
      return queryBuilder;
    }
  };
};

// CSV Header
const headers = [
      "ID", "Surname", "First Name", "Middle Name", "Suffix", "Date of Birth", "Place of Birth", "Sex", "Religion", "Civil Status",
      "House/Street", "Barangay", "City", "Province", "TIN", "Disability - Visual", "Disability - Hearing", "Disability - Speech",
      "Disability - Physical", "Disability - Mental", "Disability - Others", "Height", "Contact Number", "Email", "Employment Status",
      "Employed Type", "Self-Employed - Fisherman", "Self-Employed - Vendor", "Self-Employed - Home Based", "Self-Employed - Transport",
      "Self-Employed - Domestic", "Self-Employed - Freelancer", "Self-Employed - Artisan", "Self-Employed - Others", "Unemployed Reason",
      "Terminated Country", "Unemployed Reason Others", "Job Search Duration", "Is OFW", "OFW Country", "Is Former OFW", "Former OFW Country",
      "OFW Return Date", "4Ps Beneficiary", "Household ID Number", "Preferred Employment Type", "Preferred Occupation 1", "Preferred Occupation 2",
      "Preferred Occupation 3", "Local Location 1", "Local Location 2", "Local Location 3", "Overseas Location 1", "Overseas Location 2",
      "Overseas Location 3", "English - Read", "English - Write", "English - Speak", "English - Understand", "Filipino - Read",
      "Filipino - Write", "Filipino - Speak", "Filipino - Understand", "Mandarin - Read", "Mandarin - Write", "Mandarin - Speak",
      "Mandarin - Understand", "Other Language Name", "Other Language - Read", "Other Language - Write", "Other Language - Speak",
      "Other Language - Understand", "Currently in School", "Elementary - Year Graduated", "Elementary - Level Reached",
      "Elementary - Year Last Attended", "Secondary - Curriculum Type", "Secondary - Year Graduated", "Secondary - Level Reached",
      "Secondary - Year Last Attended", "Senior High - Strand", "Senior High - Year Graduated", "Senior High - Level Reached",
      "Senior High - Year Last Attended", "Tertiary - Course", "Tertiary - Year Graduated", "Tertiary - Level Reached",
      "Tertiary - Year Last Attended", "Graduate - Course", "Graduate - Year Graduated", "Graduate - Year Last Attended",
      "Training 1 - Course", "Training 1 - Hours", "Training 1 - Institution", "Training 1 - Skills Acquired", "Training 1 - NC I",
      "Training 1 - NC II", "Training 1 - NC III", "Training 1 - NC IV", "Training 1 - COC", "Training 2 - Course", "Training 2 - Hours",
      "Training 2 - Institution", "Training 2 - Skills Acquired", "Training 2 - NC I", "Training 2 - NC II", "Training 2 - NC III",
      "Training 2 - NC IV", "Training 2 - COC", "Training 3 - Course", "Training 3 - Hours", "Training 3 - Institution",
      "Training 3 - Skills Acquired", "Training 3 - NC I", "Training 3 - NC II", "Training 3 - NC III", "Training 3 - NC IV",
      "Training 3 - COC", "Civil Service 1 - Name", "Civil Service 1 - Date Taken", "Civil Service 2 - Name", "Civil Service 2 - Date Taken",
      "Civil Service 3 - Name", "Civil Service 3 - Date Taken", "Professional License 1 - Name", "Professional License 1 - Valid Until",
      "Professional License 2 - Name", "Professional License 2 - Valid Until", "Professional License 3 - Name", "Professional License 3 - Valid Until",
      "Work 1 - Company", "Work 1 - Address", "Work 1 - Position", "Work 1 - Months", "Work 1 - Employment Status", "Work 2 - Company",
      "Work 2 - Address", "Work 2 - Position", "Work 2 - Months", "Work 2 - Employment Status", "Work 3 - Company", "Work 3 - Address",
      "Work 3 - Position", "Work 3 - Months", "Work 3 - Employment Status", "Work 4 - Company", "Work 4 - Address", "Work 4 - Position",
      "Work 4 - Months", "Work 4 - Employment Status", "Work 5 - Company", "Work 5 - Address", "Work 5 - Position", "Work 5 - Months",
      "Work 5 - Employment Status", "Skill - Auto Mechanic", "Skill - Beautician", "Skill - Carpentry Work", "Skill - Computer Literate",
      "Skill - Domestic Chores", "Skill - Driver", "Skill - Electrician", "Skill - Embroidery", "Skill - Gardening", "Skill - Masonry",
      "Skill - Painter/Artist", "Skill - Painting Jobs", "Skill - Photography", "Skill - Plumbing", "Skill - Sewing Dresses",
      "Skill - Stenography", "Skill - Tailoring", "Skill - Others", "Certification Acknowledged", "Signature", "Date Signed",
      "Referral - SPES", "Referral - GIP", "Referral - TUPAD", "Referral - JobStart", "Referral - DILEEP", "Referral - TESDA Training",
      "Referral - Others", "Assessed By", "Assessor Signature", "Assessment Date", "Date Registered", "Created By", "Status"
];

// Reusable row converter (simplified logic for benchmark)
const convertRecordToCsvRow = (record: any) => {
    // This is a simplified version of the logic inside exportJobseekersCSV
    // Just enough to simulate the CPU load of string processing
    const values = headers.map(() => "Test Value");
    return values.join(",");
};


// ============================================================================
// BASELINE
// ============================================================================

async function baselineExport() {
  global.gc?.(); // Try to clear GC before start
  const startMem = process.memoryUsage().heapUsed;
  const startTime = performance.now();

  const supabase = createMockSupabase();

  // 1. Fetch ALL
  const { data } = await supabase.from("jobseekers").select("*");

  // 2. Process ALL
  const csvRows = [headers.join(",")];
  data.forEach((record: any) => {
    csvRows.push(convertRecordToCsvRow(record));
  });

  const csv = csvRows.join("\n");

  const endTime = performance.now();
  const endMem = process.memoryUsage().heapUsed;

  return {
      name: "Baseline (Load All)",
      timeMs: endTime - startTime,
      memoryDiffMB: (endMem - startMem) / 1024 / 1024,
      resultLength: csv.length
  };
}

// ============================================================================
// OPTIMIZED
// ============================================================================

async function optimizedExport() {
  global.gc?.();
  const startMem = process.memoryUsage().heapUsed;
  const startTime = performance.now();

  const supabase = createMockSupabase();

  // 1. Init CSV with headers
  // Using an array of strings is better than one huge string concatenation loop
  const csvParts = [headers.join(",")];

  // 2. Paginate
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const start = page * pageSize;
    const end = start + pageSize - 1;

    // Fetch chunk
    const { data } = await supabase.from("jobseekers").select("*").range(start, end);

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    // Process chunk
    data.forEach((record: any) => {
      csvParts.push(convertRecordToCsvRow(record));
    });

    // Check if we reached the end
    if (data.length < pageSize) {
      hasMore = false;
    }
    page++;
  }

  const csv = csvParts.join("\n");

  const endTime = performance.now();
  const endMem = process.memoryUsage().heapUsed;

  return {
      name: "Optimized (Paginated)",
      timeMs: endTime - startTime,
      memoryDiffMB: (endMem - startMem) / 1024 / 1024,
      resultLength: csv.length
  };
}

// ============================================================================
// RUNNER
// ============================================================================

async function run() {
  console.log(`Running benchmark with ${MOCK_TOTAL_RECORDS} records...`);

  try {
    const baseline = await baselineExport();
    console.log(baseline);

    const optimized = await optimizedExport();
    console.log(optimized);

  } catch (e) {
    console.error(e);
  }
}

run();
