const SPREADSHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ok: true, service: 'MR Main Study Logger'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const result = saveRecord_(payload);
    return ContentService
      .createTextOutput(JSON.stringify({ok: true, result: result}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ok: false, error: String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveRecord_(payload) {
  if (!payload.participant_id || !payload.record_type) {
    throw new Error('participant_id and record_type are required.');
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetName = sanitize_(payload.record_type);
  let sheet = ss.getSheetByName(sheetName);
  const flat = flatten_(payload);
  flat.server_timestamp = new Date().toISOString();

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(Object.keys(flat));
    sheet.setFrozenRows(1);
  }

  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const missing = Object.keys(flat).filter(k => !headers.includes(k));
  if (missing.length) {
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
    headers = headers.concat(missing);
  }

  const row = headers.map(h => {
    const v = flat[h];
    if (Array.isArray(v) || (v && typeof v === 'object')) return JSON.stringify(v);
    return v === undefined ? '' : v;
  });
  sheet.appendRow(row);
  return {sheet: sheetName, row: sheet.getLastRow()};
}

function flatten_(obj, prefix, out) {
  prefix = prefix || '';
  out = out || {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const next = prefix ? prefix + '.' + key : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flatten_(value, next, out);
    } else {
      out[next] = value;
    }
  });
  return out;
}

function sanitize_(name) {
  return String(name).replace(/[\\\/\?\*\[\]\:]/g, '_').slice(0, 90);
}
