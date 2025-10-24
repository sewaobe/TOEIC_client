/**
 * ✅ Fixed TestSpire Runner
 * - Ghi trực tiếp file testsprite_tests/tmp/config.json
 * - Thêm đúng field executionArgs để TestSpire nhận testIDs và env
 */

import fs from "fs";
import path from "path";

const TMP_DIR = "./testsprite_tests/tmp";
const CONFIG_PATH = path.join(TMP_DIR, "config.json");

// Extract all test IDs from tests/testcases.json
const testCases = JSON.parse(fs.readFileSync("tests/testcases.json", "utf8"));
const testIds = testCases.map(tc => tc.id);

// Cấu hình chi tiết
const config = {
  status: "commited",
  type: "frontend",
  scope: "codebase",
  localEndpoint: "http://localhost:5173",
  loginUser: "thanha17",
  loginPassword: "Thanha17@",
  executionArgs: {
    projectName: "TOEIC_client",
    projectPath: "c:\\TOEIC\\TOEIC_client",
    testIds,
    additionalInstruction: "",
    envs: {
      API_KEY:
        "sk-user-ad_SY1bSACiOhGKPHiuRtbfPAxReicWcfMGST7j0l3pdDrJoW5A_ado3oEs5SopepDYxR8SN4d_5hx-KhzClCA5NzsV1DCgVPDYivsQ6m3JtjJ2csuHnjQhhEj8Y0GWwbXI"
    }
  }
};

// Tạo thư mục nếu chưa có
fs.mkdirSync(TMP_DIR, { recursive: true });

// Ghi file config.json
fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");

console.log(`✅ Config written to ${CONFIG_PATH}`);
console.log(`🧩 Test IDs: ${testIds.join(", ")}`);
console.log("⚙️  Ready for TestSpire execution!");
