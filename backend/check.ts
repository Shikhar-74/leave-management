import { processLeaveRequest } from './src/services/leave.service';

async function run() {
  try {
    const res = await processLeaveRequest(42, { status: "REJECTED", admin_remark: "Testing rejection feature" });
    console.log(res);
  } catch(e) {
    console.error(e);
  }
  process.exit();
}
run();
