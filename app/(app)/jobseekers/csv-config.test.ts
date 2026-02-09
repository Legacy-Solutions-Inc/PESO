import { test } from 'node:test';
import assert from 'node:assert';
import { csvColumns } from './csv-config.ts';
import type { DBJobseekerRecord } from './csv-config.ts';

test('csvColumns accessors should return correct values for a mock record', () => {
  const mockRecord = {
    id: 123,
    created_at: '2023-01-01T00:00:00Z',
    created_by: 'user1',
    status: 'active',
    employment_status: 'unemployed',
    is_ofw: false,
    is_4ps_beneficiary: true,
    personal_info: {
      surname: 'Doe',
      firstName: 'John',
      middleName: 'M',
      suffix: 'Jr',
      dateOfBirth: '1990-01-01',
      placeOfBirth: 'Manila',
      sex: 'Male',
      religion: 'Catholic',
      civilStatus: 'Single',
      address: {
        houseStreet: '123 Street',
        barangay: 'Barangay 1',
        city: 'City A',
        province: 'Province B',
      },
      tin: '123-456-789',
      disability: {
        visual: true,
        others: 'None',
      },
      height: '170',
      contactNumber: '09123456789',
      email: 'john.doe@example.com',
    },
    employment: {
      status: 'UNEMPLOYED',
      employedType: 'None',
      unemployedReason: 'Fresh grad',
      isOfw: false,
      is4PsBeneficiary: true,
      householdIdNumber: '4PS-123',
      selfEmployedTypes: {},
    },
    job_preference: {
      occupation1: 'Developer',
    },
    language: {
      english: { read: true, write: true },
      filipino: {},
      mandarin: {},
      others: {},
    },
    education: {
        currentlyInSchool: false,
        tertiary: {
            course: 'BS CS',
            yearGraduated: '2012',
        },
        elementary: {},
        secondary: {},
        seniorHigh: {},
        graduate: {},
    },
    training: {
        entries: [
            {
                course: 'Training 1',
                hours: '40',
                institution: 'Tesda',
                skillsAcquired: 'Coding',
                certificates: { NC_II: true }
            }
        ]
    },
    eligibility: {
        civilService: [
            { name: 'CS Pro', dateTaken: '2013' }
        ],
        professionalLicense: [],
    },
    work_experience: {
        entries: [
            { companyName: 'Company A', position: 'Dev' }
        ]
    },
    skills: {
        otherSkills: {
            driver: true
        },
        certification: {},
        pesoUseOnly: { referralPrograms: {} }
    }
  } as unknown as DBJobseekerRecord;

  // Helper to find column by header
  const getVal = (header: string) => {
    const col = csvColumns.find(c => c.header === header);
    if (!col) throw new Error(`Column ${header} not found`);
    return col.accessor(mockRecord);
  };

  assert.strictEqual(getVal('ID'), 123);
  assert.strictEqual(getVal('Surname'), 'Doe');
  assert.strictEqual(getVal('First Name'), 'John');
  assert.strictEqual(getVal('Barangay'), 'Barangay 1');
  assert.strictEqual(getVal('Disability - Visual'), 'Yes');
  assert.strictEqual(getVal('Disability - Hearing'), 'No'); // undefined -> No
  assert.strictEqual(getVal('Is OFW'), 'No');
  assert.strictEqual(getVal('4Ps Beneficiary'), 'Yes');
  assert.strictEqual(getVal('Preferred Occupation 1'), 'Developer');
  assert.strictEqual(getVal('English - Read'), 'Yes');
  assert.strictEqual(getVal('Tertiary - Course'), 'BS CS');
  assert.strictEqual(getVal('Training 1 - Course'), 'Training 1');
  assert.strictEqual(getVal('Training 1 - NC II'), 'Yes');
  assert.strictEqual(getVal('Training 2 - Course'), undefined); // Missing entry
  assert.strictEqual(getVal('Civil Service 1 - Name'), 'CS Pro');
  assert.strictEqual(getVal('Work 1 - Company'), 'Company A');
  assert.strictEqual(getVal('Skill - Driver'), 'Yes');

  const expectedDate = new Date('2023-01-01T00:00:00Z').toLocaleDateString();
  assert.strictEqual(getVal('Date Registered'), expectedDate);
});
