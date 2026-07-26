const SPREADSHEET_ID = "1SYWrwRMeAPX1JRNDY7QdpwoJVLm8bpf9rBT9AvVn654";
const SHEET_NAME = "Leads";

function doPost(e) {
  try {
    const rawBody = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    const payload = JSON.parse(rawBody);

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet_(spreadsheet, SHEET_NAME);

    ensureHeader_(sheet);

    const submittedAt = payload.submittedAt ? new Date(payload.submittedAt) : new Date();

    sheet.appendRow([
      new Date(),
      payload.fullName || "",
      payload.phoneNumber || "",
      payload.studentClass || "",
      payload.learningGoal || "",
      submittedAt,
      "Landing Page Hoc La Phat Am Duoc"
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        message: "Saved successfully"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        message: error.message || "Unknown error"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      message: "Apps Script is running"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet_(spreadsheet, sheetName) {
  const existingSheet = spreadsheet.getSheetByName(sheetName);

  if (existingSheet) {
    return existingSheet;
  }

  return spreadsheet.insertSheet(sheetName);
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
    "createdAt",
    "fullName",
    "phoneNumber",
    "studentClass",
    "learningGoal",
    "submittedAt",
    "source"
  ]);
}
