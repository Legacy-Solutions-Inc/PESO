export const escapeCSV = (val: unknown): string => {
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

export const getTraining = (
  trainingEntries: Array<Record<string, unknown>>,
  index: number
): string => {
  const t = trainingEntries[index] || {};
  const certs = (t.certificates || {}) as Record<string, unknown>;

  // Directly join with commas
  return (
    escapeCSV(t.course) + "," +
    escapeCSV(t.hours) + "," +
    escapeCSV(t.institution) + "," +
    escapeCSV(t.skillsAcquired) + "," +
    (certs.NC_I ? "Yes" : "No") + "," +
    (certs.NC_II ? "Yes" : "No") + "," +
    (certs.NC_III ? "Yes" : "No") + "," +
    (certs.NC_IV ? "Yes" : "No") + "," +
    (certs.COC ? "Yes" : "No")
  );
};

export const getCivilService = (
  civilService: Array<Record<string, unknown>>,
  index: number
): string => {
  const cs = civilService[index] || {};
  return escapeCSV(cs.name) + "," + escapeCSV(cs.dateTaken);
};

export const getProfLicense = (
  profLicense: Array<Record<string, unknown>>,
  index: number
): string => {
  const pl = profLicense[index] || {};
  return escapeCSV(pl.name) + "," + escapeCSV(pl.validUntil);
};

export const getWorkExp = (
  workEntries: Array<Record<string, unknown>>,
  index: number
): string => {
  const we = workEntries[index] || {};
  return (
    escapeCSV(we.companyName) + "," +
    escapeCSV(we.address) + "," +
    escapeCSV(we.position) + "," +
    escapeCSV(we.numberOfMonths) + "," +
    escapeCSV(we.employmentStatus)
  );
};

export const JOBSEEKER_CSV_HEADERS = [
  // Basic Info
  "ID",
  "Surname",
  "First Name",
  "Middle Name",
  "Suffix",
  "Date of Birth",
  "Place of Birth",
  "Sex",
  "Religion",
  "Civil Status",
  "House/Street",
  "Barangay",
  "City",
  "Province",
  "TIN",
  "Disability - Visual",
  "Disability - Hearing",
  "Disability - Speech",
  "Disability - Physical",
  "Disability - Mental",
  "Disability - Others",
  "Height",
  "Contact Number",
  "Email",

  // Employment Status
  "Employment Status",
  "Employed Type",
  "Self-Employed - Fisherman",
  "Self-Employed - Vendor",
  "Self-Employed - Home Based",
  "Self-Employed - Transport",
  "Self-Employed - Domestic",
  "Self-Employed - Freelancer",
  "Self-Employed - Artisan",
  "Self-Employed - Others",
  "Unemployed Reason",
  "Terminated Country",
  "Unemployed Reason Others",
  "Job Search Duration",
  "Is OFW",
  "OFW Country",
  "Is Former OFW",
  "Former OFW Country",
  "OFW Return Date",
  "4Ps Beneficiary",
  "Household ID Number",

  // Job Preference
  "Preferred Employment Type",
  "Preferred Occupation 1",
  "Preferred Occupation 2",
  "Preferred Occupation 3",
  "Local Location 1",
  "Local Location 2",
  "Local Location 3",
  "Overseas Location 1",
  "Overseas Location 2",
  "Overseas Location 3",

  // Language
  "English - Read",
  "English - Write",
  "English - Speak",
  "English - Understand",
  "Filipino - Read",
  "Filipino - Write",
  "Filipino - Speak",
  "Filipino - Understand",
  "Mandarin - Read",
  "Mandarin - Write",
  "Mandarin - Speak",
  "Mandarin - Understand",
  "Other Language Name",
  "Other Language - Read",
  "Other Language - Write",
  "Other Language - Speak",
  "Other Language - Understand",

  // Education
  "Currently in School",
  "Elementary - Year Graduated",
  "Elementary - Level Reached",
  "Elementary - Year Last Attended",
  "Secondary - Curriculum Type",
  "Secondary - Year Graduated",
  "Secondary - Level Reached",
  "Secondary - Year Last Attended",
  "Senior High - Strand",
  "Senior High - Year Graduated",
  "Senior High - Level Reached",
  "Senior High - Year Last Attended",
  "Tertiary - Course",
  "Tertiary - Year Graduated",
  "Tertiary - Level Reached",
  "Tertiary - Year Last Attended",
  "Graduate - Course",
  "Graduate - Year Graduated",
  "Graduate - Year Last Attended",

  // Training (multiple entries - showing first 3)
  "Training 1 - Course",
  "Training 1 - Hours",
  "Training 1 - Institution",
  "Training 1 - Skills Acquired",
  "Training 1 - NC I",
  "Training 1 - NC II",
  "Training 1 - NC III",
  "Training 1 - NC IV",
  "Training 1 - COC",
  "Training 2 - Course",
  "Training 2 - Hours",
  "Training 2 - Institution",
  "Training 2 - Skills Acquired",
  "Training 2 - NC I",
  "Training 2 - NC II",
  "Training 2 - NC III",
  "Training 2 - NC IV",
  "Training 2 - COC",
  "Training 3 - Course",
  "Training 3 - Hours",
  "Training 3 - Institution",
  "Training 3 - Skills Acquired",
  "Training 3 - NC I",
  "Training 3 - NC II",
  "Training 3 - NC III",
  "Training 3 - NC IV",
  "Training 3 - COC",

  // Eligibility (multiple entries - showing first 3 of each)
  "Civil Service 1 - Name",
  "Civil Service 1 - Date Taken",
  "Civil Service 2 - Name",
  "Civil Service 2 - Date Taken",
  "Civil Service 3 - Name",
  "Civil Service 3 - Date Taken",
  "Professional License 1 - Name",
  "Professional License 1 - Valid Until",
  "Professional License 2 - Name",
  "Professional License 2 - Valid Until",
  "Professional License 3 - Name",
  "Professional License 3 - Valid Until",

  // Work Experience (multiple entries - showing first 5)
  "Work 1 - Company",
  "Work 1 - Address",
  "Work 1 - Position",
  "Work 1 - Months",
  "Work 1 - Employment Status",
  "Work 2 - Company",
  "Work 2 - Address",
  "Work 2 - Position",
  "Work 2 - Months",
  "Work 2 - Employment Status",
  "Work 3 - Company",
  "Work 3 - Address",
  "Work 3 - Position",
  "Work 3 - Months",
  "Work 3 - Employment Status",
  "Work 4 - Company",
  "Work 4 - Address",
  "Work 4 - Position",
  "Work 4 - Months",
  "Work 4 - Employment Status",
  "Work 5 - Company",
  "Work 5 - Address",
  "Work 5 - Position",
  "Work 5 - Months",
  "Work 5 - Employment Status",

  // Skills
  "Skill - Auto Mechanic",
  "Skill - Beautician",
  "Skill - Carpentry Work",
  "Skill - Computer Literate",
  "Skill - Domestic Chores",
  "Skill - Driver",
  "Skill - Electrician",
  "Skill - Embroidery",
  "Skill - Gardening",
  "Skill - Masonry",
  "Skill - Painter/Artist",
  "Skill - Painting Jobs",
  "Skill - Photography",
  "Skill - Plumbing",
  "Skill - Sewing Dresses",
  "Skill - Stenography",
  "Skill - Tailoring",
  "Skill - Others",

  // Certification
  "Certification Acknowledged",
  "Signature",
  "Date Signed",

  // PESO Use Only
  "Referral - SPES",
  "Referral - GIP",
  "Referral - TUPAD",
  "Referral - JobStart",
  "Referral - DILEEP",
  "Referral - TESDA Training",
  "Referral - Others",
  "Assessed By",
  "Assessor Signature",
  "Assessment Date",

  // System Fields
  "Date Registered",
  "Created By",
  "Status",
];

export const convertRecordToCSVRow = (record: any): string => {
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

    // Use a large string concatenation block for efficiency
    // This avoids creating a 200-element array and joining it
    return (
      // Basic Info
      record.id + "," +
      escapeCSV(personalInfo.surname) + "," +
      escapeCSV(personalInfo.firstName) + "," +
      escapeCSV(personalInfo.middleName) + "," +
      escapeCSV(personalInfo.suffix) + "," +
      escapeCSV(personalInfo.dateOfBirth) + "," +
      escapeCSV(personalInfo.placeOfBirth) + "," +
      escapeCSV(personalInfo.sex) + "," +
      escapeCSV(personalInfo.religion) + "," +
      escapeCSV(personalInfo.civilStatus) + "," +
      escapeCSV(address.houseStreet) + "," +
      escapeCSV(address.barangay) + "," +
      escapeCSV(address.city) + "," +
      escapeCSV(address.province) + "," +
      escapeCSV(personalInfo.tin) + "," +
      (disability.visual ? "Yes" : "No") + "," +
      (disability.hearing ? "Yes" : "No") + "," +
      (disability.speech ? "Yes" : "No") + "," +
      (disability.physical ? "Yes" : "No") + "," +
      (disability.mental ? "Yes" : "No") + "," +
      escapeCSV(disability.others) + "," +
      escapeCSV(personalInfo.height) + "," +
      escapeCSV(personalInfo.contactNumber) + "," +
      escapeCSV(personalInfo.email) + "," +

      // Employment
      escapeCSV(employment.status) + "," +
      escapeCSV(employment.employedType) + "," +
      (selfEmployed.fisherman ? "Yes" : "No") + "," +
      (selfEmployed.vendor ? "Yes" : "No") + "," +
      (selfEmployed.homeBased ? "Yes" : "No") + "," +
      (selfEmployed.transport ? "Yes" : "No") + "," +
      (selfEmployed.domestic ? "Yes" : "No") + "," +
      (selfEmployed.freelancer ? "Yes" : "No") + "," +
      (selfEmployed.artisan ? "Yes" : "No") + "," +
      escapeCSV(selfEmployed.others) + "," +
      escapeCSV(employment.unemployedReason) + "," +
      escapeCSV(employment.terminatedCountry) + "," +
      escapeCSV(employment.unemployedReasonOthers) + "," +
      escapeCSV(employment.jobSearchDuration) + "," +
      (employment.isOfw ? "Yes" : "No") + "," +
      escapeCSV(employment.ofwCountry) + "," +
      (employment.isFormerOfw ? "Yes" : "No") + "," +
      escapeCSV(employment.formerOfwCountry) + "," +
      escapeCSV(employment.ofwReturnDate) + "," +
      (employment.is4PsBeneficiary ? "Yes" : "No") + "," +
      escapeCSV(employment.householdIdNumber) + "," +

      // Job Preference
      escapeCSV(jobPref.employmentType) + "," +
      escapeCSV(jobPref.occupation1) + "," +
      escapeCSV(jobPref.occupation2) + "," +
      escapeCSV(jobPref.occupation3) + "," +
      escapeCSV(jobPref.localLocation1) + "," +
      escapeCSV(jobPref.localLocation2) + "," +
      escapeCSV(jobPref.localLocation3) + "," +
      escapeCSV(jobPref.overseasLocation1) + "," +
      escapeCSV(jobPref.overseasLocation2) + "," +
      escapeCSV(jobPref.overseasLocation3) + "," +

      // Language
      ((lang.english as Record<string, unknown>)?.read ? "Yes" : "No") + "," +
      ((lang.english as Record<string, unknown>)?.write ? "Yes" : "No") + "," +
      ((lang.english as Record<string, unknown>)?.speak ? "Yes" : "No") + "," +
      ((lang.english as Record<string, unknown>)?.understand ? "Yes" : "No") + "," +
      ((lang.filipino as Record<string, unknown>)?.read ? "Yes" : "No") + "," +
      ((lang.filipino as Record<string, unknown>)?.write ? "Yes" : "No") + "," +
      ((lang.filipino as Record<string, unknown>)?.speak ? "Yes" : "No") + "," +
      ((lang.filipino as Record<string, unknown>)?.understand ? "Yes" : "No") + "," +
      ((lang.mandarin as Record<string, unknown>)?.read ? "Yes" : "No") + "," +
      ((lang.mandarin as Record<string, unknown>)?.write ? "Yes" : "No") + "," +
      ((lang.mandarin as Record<string, unknown>)?.speak ? "Yes" : "No") + "," +
      ((lang.mandarin as Record<string, unknown>)?.understand ? "Yes" : "No") + "," +
      escapeCSV(lang.othersName) + "," +
      ((lang.others as Record<string, unknown>)?.read ? "Yes" : "No") + "," +
      ((lang.others as Record<string, unknown>)?.write ? "Yes" : "No") + "," +
      ((lang.others as Record<string, unknown>)?.speak ? "Yes" : "No") + "," +
      ((lang.others as Record<string, unknown>)?.understand ? "Yes" : "No") + "," +

      // Education
      (edu.currentlyInSchool ? "Yes" : "No") + "," +
      escapeCSV((edu.elementary as Record<string, unknown>)?.yearGraduated) + "," +
      escapeCSV((edu.elementary as Record<string, unknown>)?.levelReached) + "," +
      escapeCSV((edu.elementary as Record<string, unknown>)?.yearLastAttended) + "," +
      escapeCSV((edu.secondary as Record<string, unknown>)?.curriculumType) + "," +
      escapeCSV((edu.secondary as Record<string, unknown>)?.yearGraduated) + "," +
      escapeCSV((edu.secondary as Record<string, unknown>)?.levelReached) + "," +
      escapeCSV((edu.secondary as Record<string, unknown>)?.yearLastAttended) + "," +
      escapeCSV((edu.seniorHigh as Record<string, unknown>)?.strand) + "," +
      escapeCSV((edu.seniorHigh as Record<string, unknown>)?.yearGraduated) + "," +
      escapeCSV((edu.seniorHigh as Record<string, unknown>)?.levelReached) + "," +
      escapeCSV((edu.seniorHigh as Record<string, unknown>)?.yearLastAttended) + "," +
      escapeCSV((edu.tertiary as Record<string, unknown>)?.course) + "," +
      escapeCSV((edu.tertiary as Record<string, unknown>)?.yearGraduated) + "," +
      escapeCSV((edu.tertiary as Record<string, unknown>)?.levelReached) + "," +
      escapeCSV((edu.tertiary as Record<string, unknown>)?.yearLastAttended) + "," +
      escapeCSV((edu.graduate as Record<string, unknown>)?.course) + "," +
      escapeCSV((edu.graduate as Record<string, unknown>)?.yearGraduated) + "," +
      escapeCSV((edu.graduate as Record<string, unknown>)?.yearLastAttended) + "," +

      // Training (first 3 entries)
      getTraining(trainingEntries, 0) + "," +
      getTraining(trainingEntries, 1) + "," +
      getTraining(trainingEntries, 2) + "," +

      // Eligibility
      getCivilService(civilService, 0) + "," +
      getCivilService(civilService, 1) + "," +
      getCivilService(civilService, 2) + "," +
      getProfLicense(profLicense, 0) + "," +
      getProfLicense(profLicense, 1) + "," +
      getProfLicense(profLicense, 2) + "," +

      // Work Experience (first 5)
      getWorkExp(workEntries, 0) + "," +
      getWorkExp(workEntries, 1) + "," +
      getWorkExp(workEntries, 2) + "," +
      getWorkExp(workEntries, 3) + "," +
      getWorkExp(workEntries, 4) + "," +

      // Skills
      (otherSkills.auto_mechanic ? "Yes" : "No") + "," +
      (otherSkills.beautician ? "Yes" : "No") + "," +
      (otherSkills.carpentry_work ? "Yes" : "No") + "," +
      (otherSkills.computer_literate ? "Yes" : "No") + "," +
      (otherSkills.domestic_chores ? "Yes" : "No") + "," +
      (otherSkills.driver ? "Yes" : "No") + "," +
      (otherSkills.electrician ? "Yes" : "No") + "," +
      (otherSkills.embroidery ? "Yes" : "No") + "," +
      (otherSkills.gardening ? "Yes" : "No") + "," +
      (otherSkills.masonry ? "Yes" : "No") + "," +
      (otherSkills.painter_artist ? "Yes" : "No") + "," +
      (otherSkills.painting_jobs ? "Yes" : "No") + "," +
      (otherSkills.photography ? "Yes" : "No") + "," +
      (otherSkills.plumbing ? "Yes" : "No") + "," +
      (otherSkills.sewing_dresses ? "Yes" : "No") + "," +
      (otherSkills.stenography ? "Yes" : "No") + "," +
      (otherSkills.tailoring ? "Yes" : "No") + "," +
      escapeCSV(otherSkills.others) + "," +

      // Certification
      (cert.acknowledged ? "Yes" : "No") + "," +
      escapeCSV(cert.signature) + "," +
      escapeCSV(cert.dateSigned) + "," +

      // PESO Use Only
      (referralPrograms.spes ? "Yes" : "No") + "," +
      (referralPrograms.gip ? "Yes" : "No") + "," +
      (referralPrograms.tupad ? "Yes" : "No") + "," +
      (referralPrograms.jobstart ? "Yes" : "No") + "," +
      (referralPrograms.dileep ? "Yes" : "No") + "," +
      (referralPrograms.tesda_training ? "Yes" : "No") + "," +
      escapeCSV(referralPrograms.others) + "," +
      escapeCSV(pesoUse.assessedBy) + "," +
      escapeCSV(pesoUse.assessorSignature) + "," +
      escapeCSV(pesoUse.assessmentDate) + "," +

      // System Fields
      new Date(record.created_at).toLocaleDateString() + "," +
      escapeCSV(record.created_by) + "," +
      escapeCSV(record.status)
    );
};
