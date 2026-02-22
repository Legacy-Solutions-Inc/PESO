
import { performance } from 'perf_hooks';
import { escapeCSV } from '../app/(app)/jobseekers/csv-helpers.ts';

// Original Implementation (Baseline)
const escapeCSV_Original = (val: unknown): string => {
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

// Test data
const strings = [
  "Simple string",
  "String with , comma",
  "String with \" quote",
  "String with \n newline",
  "=Formula",
  "+Formula",
  "-Formula",
  "@Formula",
  "Very long string without special chars " + "a".repeat(100),
  "Very long string with , comma " + "a".repeat(100),
  12345, // Number
  null,
  undefined
];

const ITERATIONS = 1_000_000;

function runBenchmark(name: string, fn: (val: unknown) => string) {
  global.gc?.();
  const start = performance.now();

  for (let i = 0; i < ITERATIONS; i++) {
    for (const s of strings) {
      fn(s);
    }
  }

  const end = performance.now();
  console.log(`${name}: ${(end - start).toFixed(2)}ms`);
}

console.log("Warming up...");
runBenchmark("Warmup Original", escapeCSV_Original);
runBenchmark("Warmup App Implementation", escapeCSV);

console.log("\nRunning Benchmark...");
runBenchmark("Original (Baseline)", escapeCSV_Original);
runBenchmark("App Implementation (Optimized)", escapeCSV);
