/**
 * Pulls Pelikan data into this Google Sheet.
 * Setup: Extensions > Apps Script > paste this file.
 * Project Settings > Script properties: add BASE_URL (e.g. https://pelikanszauna.com)
 * and EXPORT_TOKEN (the EXPORT_TOKEN_FINANCE value from your site settings).
 * Run pullPelikan once, approve access, then add a Trigger (clock icon) to run it daily.
 */
function pullPelikan() {
  var props = PropertiesService.getScriptProperties();
  var base = props.getProperty('BASE_URL');
  var token = props.getProperty('EXPORT_TOKEN');
  ['finance', 'slots'].forEach(function (kind) {
    var res = UrlFetchApp.fetch(base + '/api/export?kind=' + kind, {
      headers: { 'x-export-token': token },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() !== 200) throw new Error(kind + ': ' + res.getContentText());
    var rows = Utilities.parseCsv(res.getContentText());
    var ss = SpreadsheetApp.getActive();
    var sheet = ss.getSheetByName(kind) || ss.insertSheet(kind);
    sheet.clearContents();
    if (rows.length) sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  });
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Pelikan').addItem('Refresh data', 'pullPelikan').addToUi();
}
