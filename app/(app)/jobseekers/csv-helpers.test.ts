import { describe, it } from 'node:test';
import assert from 'node:assert';
import { escapeCSV, getTraining, getCivilService, getProfLicense, getWorkExp } from './csv-helpers.ts';

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

    it('should quote strings with injection characters and special CSV chars', () => {
      assert.strictEqual(escapeCSV('=foo,bar'), '"\'=foo,bar"');
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
      assert.deepStrictEqual(result, [
        'Course 1',
        '40',
        'Inst 1',
        'Skill 1',
        'No',
        'Yes',
        'No',
        'No',
        'No'
      ]);
    });

    it('should handle missing entry', () => {
      const result = getTraining(trainingEntries, 1);
      assert.deepStrictEqual(result, ['', '', '', '', 'No', 'No', 'No', 'No', 'No']);
    });
  });

  describe('getCivilService', () => {
    const civilService = [
      { name: 'CS 1', dateTaken: '2023-01-01' }
    ];

    it('should format civil service entry correctly', () => {
      const result = getCivilService(civilService, 0);
      assert.deepStrictEqual(result, ['CS 1', '2023-01-01']);
    });

    it('should handle missing entry', () => {
      const result = getCivilService(civilService, 1);
      assert.deepStrictEqual(result, ['', '']);
    });
  });

  describe('getProfLicense', () => {
    const profLicense = [
      { name: 'Lic 1', validUntil: '2025-01-01' }
    ];

    it('should format professional license entry correctly', () => {
      const result = getProfLicense(profLicense, 0);
      assert.deepStrictEqual(result, ['Lic 1', '2025-01-01']);
    });

    it('should handle missing entry', () => {
      const result = getProfLicense(profLicense, 1);
      assert.deepStrictEqual(result, ['', '']);
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
      assert.deepStrictEqual(result, ['Comp 1', 'Addr 1', 'Pos 1', '12', 'Perm']);
    });

    it('should handle missing entry', () => {
      const result = getWorkExp(workEntries, 1);
      assert.deepStrictEqual(result, ['', '', '', '', '']);
    });
  });
});
