/**
 * ระบบสแกนใบหน้าและจัดการเงินเดือน (Thonwithi Face Scan & Payroll)
 * เวอร์ชัน: ตัดระบบ GPS ออกเพื่อความรวดเร็ว
 */
const SPREADSHEET_ID = '1hvlQhbDZiQxpCW8KOaocwZD2-qQx-n_omt8EqOSGdD4';

function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Thonwithi Face Scan System')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * ดึงข้อมูลใบหน้าพนักงานทั้งหมดจากชีต Users
 */
function getKnownFaces() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Users') || ss.insertSheet('Users');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  return data.slice(1).map(row => ({
    label: row[0],
    descriptor: JSON.parse(row[1])
  })).filter(u => u.label && u.descriptor);
}

/**
 * ลงทะเบียนพนักงานใหม่พร้อมบันทึก Vector ใบหน้า
 */
function registerUser(name, descriptor) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Users') || ss.insertSheet('Users');
  sheet.appendRow([name, JSON.stringify(descriptor), new Date()]);
  return "ลงทะเบียนคุณ " + name + " สำเร็จ";
}

/**
 * บันทึกเวลาเข้า-ออกงาน (เวอร์ชันตัดพิกัด GPS ออก)
 */
function logAttendance(name, type) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Attendance') || ss.insertSheet('Attendance');
  
  // ตรวจสอบและสร้างหัวตารางใหม่ถ้ายังไม่มีข้อมูล
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['ชื่อ', 'เวลา', 'วันที่', 'ประเภท']);
  }

  const now = new Date();
  const dateStr = Utilities.formatDate(now, "GMT+7", "dd/MM/yyyy");
  const timeStr = Utilities.formatDate(now, "GMT+7", "HH:mm:ss");
  
  // บันทึกข้อมูลพื้นฐานลงในแถวใหม่
  sheet.appendRow([name, timeStr, dateStr, type]);
  return "บันทึก " + type + " เรียบร้อย";
}

/**
 * ดึงข้อมูลประวัติการสแกนและค่าตั้งค่าพนักงานสำหรับระบบเงินเดือน
 */
function getPayrollData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const logsSheet = ss.getSheetByName('Attendance');
  const settingsSheet = ss.getSheetByName('Settings');
  
  const logs = logsSheet ? logsSheet.getDataRange().getValues().slice(1) : [];
  const settings = settingsSheet ? settingsSheet.getDataRange().getValues().slice(1) : [];
  
  return { logs, settings };
}
