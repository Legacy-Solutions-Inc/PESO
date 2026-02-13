import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  escapeCSV,
  getTraining,
  getCivilService,
  getProfLicense,
  getWorkExp,
  convertRecordToCSVRow,
  JOBSEEKER_CSV_HEADERS
} from './csv-helpers.ts';

describe('csv-helpers', () => {
  describe('escapeCSV', () => {
    it('should return empty string for null/undefined', () => {
      assert.strictEqual(escapeCSV(null), '');
      assert.strictEqual(escapeCSV(undefined), '');
    });

    it('should escape CSV injection characters', () => {
      assert.strictEqual(escapeCSV('=cmd'), "'=cmd");
      assert.strictEqual(escapeCSV('+cmd'), "'+cmd");
      assert.strictEqual(escapeCSV('-cmd'), "'-cmd");
      assert.strictEqual(escapeCSV('@cmd'), "'@cmd");
    });

    it('should quote strings with commas', () => {
      assert.strictEqual(escapeCSV('foo,bar'), '"foo,bar"');
    });

    it('should quote strings with quotes and escape inner quotes', () => {
      assert.strictEqual(escapeCSV('foo"bar'), '"foo""bar"');
    });

    it('should quote strings with newlines', () => {
      assert.strictEqual(escapeCSV('foo\nbar'), '"foo\nbar"');
    });

    it('should handle normal strings', () => {
      assert.strictEqual(escapeCSV('foobar'), 'foobar');
    });
  });

  describe('getTraining', () => {
    const trainingEntries = [
      {
        course: 'Course 1',
        hours: '40',
        institution: 'Inst 1',
        skillsAcquired: 'Skill 1',
        certificates: { NC_II: true }
      }
    ];

    it('should format training entry correctly', () => {
      const result = getTraining(trainingEntries, 0);
      assert.strictEqual(result, 'Course 1,40,Inst 1,Skill 1,No,Yes,No,No,No');
    });

    it('should handle missing entry', () => {
      const result = getTraining(trainingEntries, 1);
      assert.strictEqual(result, ',,,,No,No,No,No,No');
    });
  });

  describe('getCivilService', () => {
    const civilService = [
      { name: 'CS 1', dateTaken: '2023-01-01' }
    ];

    it('should format civil service entry correctly', () => {
      const result = getCivilService(civilService, 0);
      assert.strictEqual(result, 'CS 1,2023-01-01');
    });

    it('should handle missing entry', () => {
      const result = getCivilService(civilService, 1);
      assert.strictEqual(result, ',');
    });
  });

  describe('getProfLicense', () => {
    const profLicense = [
      { name: 'Lic 1', validUntil: '2025-01-01' }
    ];

    it('should format professional license entry correctly', () => {
      const result = getProfLicense(profLicense, 0);
      assert.strictEqual(result, 'Lic 1,2025-01-01');
    });

    it('should handle missing entry', () => {
      const result = getProfLicense(profLicense, 1);
      assert.strictEqual(result, ',');
    });
  });

  describe('getWorkExp', () => {
    const workEntries = [
      {
        companyName: 'Comp 1',
        address: 'Addr 1',
        position: 'Pos 1',
        numberOfMonths: '12',
        employmentStatus: 'Perm'
      }
    ];

    it('should format work experience entry correctly', () => {
      const result = getWorkExp(workEntries, 0);
      assert.strictEqual(result, 'Comp 1,Addr 1,Pos 1,12,Perm');
    });

    it('should handle missing entry', () => {
      const result = getWorkExp(workEntries, 1);
      assert.strictEqual(result, ',,,,');
    });
  });

  describe('convertRecordToCSVRow', () => {
    it('should convert a full record to CSV string matching headers length', () => {
      const mockRecord = {
        id: 1,
        created_at: '2023-01-01T00:00:00Z',
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
                { course: 'Training 1', hours: '40', institution: 'TESDA', skillsAcquired: 'Skill 1', certificates: { NC_II: true } }
            ]
        },
        eligibility: {
            civilService: [
                { name: 'CS Prof', dateTaken: '2009' }
            ],
            professionalLicense: []
        },
        work_experience: {
            entries: [
                { companyName: 'Comp 1', address: 'Addr 1', position: 'Pos 1', numberOfMonths: '12', employmentStatus: 'PERMANENT' }
            ]
        },
        skills: {
            otherSkills: { computer_literate: true },
            certification: { acknowledged: true, signature: 'Sig', dateSigned: '2023-01-01' },
            pesoUseOnly: { referralPrograms: { spes: true }, assessedBy: 'Assessor', assessmentDate: '2023-01-02' }
        },
      };

      const row = convertRecordToCSVRow(mockRecord);
      const columns = row.split(','); // Simple split for verification (assumes no quoted commas in mock values)

      // Verify column count matches headers
      // Note: This simple check might fail if quoted values contain commas, but our mock values don't have commas.
      // However, we should be careful. escapeCSV might add quotes.
      // Let's verify manually a few known values.

      assert.ok(row.includes('Doe'));
      assert.ok(row.includes('John'));
      assert.ok(row.includes('Training 1'));
      assert.ok(row.includes('CS Prof'));

      // To reliably check column count, we'd need a CSV parser, but for this unit test
      // we can rely on the fact that our mock data doesn't trigger quoting for commas.
      assert.strictEqual(columns.length, JOBSEEKER_CSV_HEADERS.length, 'Column count mismatch');
    });
  });
});
