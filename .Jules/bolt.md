## 2025-02-14 - String Concatenation vs Array.join for Large CSVs
**Learning:** In V8 (Node.js), constructing large CSV strings (50k+ rows) via direct string concatenation (`+=`) is significantly faster (~20-400% depending on row size) and more memory-efficient than building a massive array of strings and calling `.join()`. This is due to V8's "Rope" string optimization which avoids immediate copying.
**Action:** For large text export features, prefer streaming or direct string concatenation over `Array.push()` + `.join()`. Always benchmark with realistic data volume.
