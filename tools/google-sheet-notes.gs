/**
 * Saves notes and chat messages from the website into this Google Sheet.
 *
 * Setup (one time):
 *   1. Open the Google Sheet, then Extensions > Apps Script.
 *   2. Delete any code there, paste this whole file, and click Save.
 *   3. Deploy > New deployment > gear icon > Web app.
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      Click Deploy, allow the permissions, and copy the Web app URL
 *      (it ends in /exec).
 *   4. Put that URL in the website's index.html:
 *        <meta name="notes-endpoint" content="PASTE_URL_HERE">
 *
 * Each message becomes one row in a tab named "Website notes":
 *   Time | Source | Name | Email | Message | Page
 */

const SHEET_NAME = 'Website notes';
const HEADERS = ['Time', 'Source', 'Name', 'Email', 'Message', 'Page'];

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Bots fill the hidden "website" field; people never see it.
  if (p.website) return reply({ ok: true });

  const message = clean(p.message, 2000);
  if (!message) return reply({ ok: false, error: 'empty' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([
      new Date(),
      clean(p.source, 40) || 'Website',
      clean(p.name, 120),
      clean(p.email, 200),
      message,
      clean(p.page, 300),
    ]);
  } finally {
    lock.releaseLock();
  }
  return reply({ ok: true });
}

// Opening the URL in a browser shows this, which confirms the deployment works.
function doGet() {
  return reply({ ok: true, info: 'Website notes endpoint is running.' });
}

// Trims, limits length, and stops text from being read as a spreadsheet formula.
function clean(value, max) {
  const text = String(value || '').trim().slice(0, max);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
