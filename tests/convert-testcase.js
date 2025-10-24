import XLSX from "xlsx";
import fs from "fs";

const inputPath = "./tests/Nhom16_TestCase_TOEIC_FINAL.xlsx";
const outputPath = "./tests/testcases.json";

// =============== Utils ===============
const norm = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const isNumberLike = (x) => /^\d+$/.test(String(x ?? "").trim());

function detectLongDescHeader(keys, sheetName) {
  const ignore = new Set([
    "test case id",
    "test case description",
    "__empty",
    "__empty_1",
    "__empty_2",
    "__empty_3",
    "__empty_4",
    "__empty_5",
    sheetName.toLowerCase()
  ]);
  const candidates = keys.filter((k) => {
    const nk = norm(k);
    return k && !ignore.has(nk) && /[a-z]/i.test(nk) && nk.length >= 8;
  });
  return candidates.sort((a, b) => norm(b).length - norm(a).length)[0] || sheetName;
}

function findIndexMark(rows, mark) {
  const m = norm(mark);
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    for (const v of Object.values(r)) {
      if (!v) continue;
      if (norm(v) === m) return i;
    }
  }
  return -1;
}

function isStepHeaderRow(r) {
  const values = Object.values(r).map(norm);
  const hasStep = values.some((v) => v.includes("step"));
  const hasDetails = values.some((v) => v.includes("details"));
  const hasExpected = values.some((v) => v.includes("expected"));
  return hasStep && hasDetails && hasExpected;
}

function findStepHeaderIndex(rows) {
  for (let i = 0; i < rows.length; i++) {
    if (isStepHeaderRow(rows[i])) return i;
  }
  return -1;
}

function extractDescription(descHeaderKey) {
  return descHeaderKey || "";
}

function extractTestData(rows, startIdx, endIdx, descHeaderKey) {
  const obj = {};
  if (startIdx < 0) return obj;
  const stop = endIdx > startIdx ? endIdx : rows.length;

  for (let i = startIdx + 1; i < stop; i++) {
    const r = rows[i];
    const cells = [
      r["__EMPTY"],
      r["Test Case Description"],
      r[descHeaderKey],
      r["__EMPTY_1"],
      r["__EMPTY_2"],
      r["__EMPTY_3"],
      r["__EMPTY_4"],
      r["__EMPTY_5"]
    ];

    const key = (cells.find((v) => {
      const s = String(v ?? "").trim();
      return s && !isNumberLike(s);
    }) || "").trim();

    let value = "";
    if (key) {
      let pick = false;
      for (const v of cells) {
        const s = String(v ?? "").trim();
        if (!pick) {
          if (s === key) pick = true;
          continue;
        }
        if (s && !isNumberLike(s)) {
          value = s;
          break;
        }
      }
      obj[key] = value;
    }
  }
  return obj;
}

function pickStepDetails(r) {
  return String(r["__EMPTY"] ?? r["Step Details"] ?? r["__EMPTY_1"] ?? "").trim();
}
function pickExpected(r) {
  return String(r["Test Case Description"] ?? r["Expected Results"] ?? r["Expected"] ?? "").trim();
}

function extractSteps(rows, headerIdx, scenarioIdx) {
  const steps = [];
  const start = headerIdx >= 0 ? headerIdx + 1 : scenarioIdx >= 0 ? scenarioIdx + 1 : 0;

  for (let i = start; i < rows.length; i++) {
    const r = rows[i];
    const step = r["Test Case ID"];
    if (!isNumberLike(step)) continue;

    const Step = Number(step);
    const StepDetails = pickStepDetails(r);
    const Expected = pickExpected(r);

    if (!StepDetails && !Expected) continue;

    // Tạo 2 step riêng biệt: action + assertion
    if (StepDetails)
      steps.push({ type: "action", description: StepDetails });
    if (Expected)
      steps.push({ type: "assertion", description: Expected });
  }
  return steps;
}

// =============== Main ===============
try {
  const wb = XLSX.readFile(inputPath, { cellDates: true });
  const finalOutput = [];

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
    if (!rows.length) continue;

    const keys = Object.keys(rows[0] || {});
    const descHeaderKey = detectLongDescHeader(keys, sheetName);

    const testDataStartIdx = findIndexMark(rows, "test data");
    const testScenarioIdx = findIndexMark(rows, "test scenario");
    const stepHeaderIdx = findStepHeaderIndex(rows);

    const description = extractDescription(descHeaderKey);
    const test_data = extractTestData(rows, testDataStartIdx, testScenarioIdx, descHeaderKey);
    const steps = extractSteps(rows, stepHeaderIdx, testScenarioIdx);

    if (description || Object.keys(test_data).length || steps.length) {
      finalOutput.push({
        id: sheetName,
        title: sheetName.replace(/_/g, " "),
        description,
        category: "functional",
        priority: "Medium",
        test_data,
        steps
      });
      console.log(`✅ ${sheetName}: ${steps.length} steps, descCol="${descHeaderKey}"`);
    } else {
      console.log(`⚠️ ${sheetName}: không trích xuất được dữ liệu hữu ích.`);
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(finalOutput, null, 2), "utf8");
  console.log(`\n🎉 DONE → ${outputPath}`);
} catch (e) {
  console.error("❌ Lỗi khi convert:", e.message);
}