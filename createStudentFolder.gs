function createFoldersFromSpreadsheet() {
  var spreadsheetId = '1h5a6C-gE2x9E29156GpmBPASpzrZ7hrfHBKSkluLpAw';
  var templateSheetId = '1DPyIocv62_mobQJURpg7y2DTRx920joiOoGY_XE0GJc';  // Add your Google Sheets template ID here
  var root = DriveApp.getRootFolder();
  var newStudentFolder = root.getFoldersByName('New Student Folder').hasNext() ? root.getFoldersByName('New Student Folder').next() : root.createFolder('New Student Folder');

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheets = spreadsheet.getSheets();

  var codeSetupSheet = spreadsheet.getSheetByName('Code Setup');
  var codeSetupData = codeSetupSheet.getRange('A2:B' + codeSetupSheet.getLastRow()).getValues();
  var teacherTemplates = {};

  for (var i = 0; i < codeSetupData.length; i++) {
    var row = codeSetupData[i];
    teacherTemplates[row[0]] = row[1];
  }

  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    if(sheet.getName() === 'Code Setup') continue;

    var dataRange = sheet.getDataRange();
    var data = dataRange.getValues();

    var prefix = sheet.getName() === 'Regular' ? '0' : (sheet.getName() === 'Multiple' ? 'M' : (sheet.getName() === 'Kids' ? 'K' : undefined));

    if (prefix) {
      for (var j = 1; j < data.length; j++) { // changed from j=0 to j=1 to skip the headers
        var row = data[j];
        var name = row[0];
        var teacherName = row[1];
        var lessonStatus = row[2] ? row[2].trim().toLowerCase() : null; // make sure row[2] is not undefined

        // If either the student name or the teacher name is blank, or lessonStatus is "finished", stop processing
        if (!name || !teacherName || lessonStatus === "finished") {
          continue;
        }

        var folderName = prefix + String(j).padStart(3, '0') + ' ' + name;
        var folders = newStudentFolder.getFoldersByName(folderName);

        if (!folders.hasNext()) {
          Logger.log('Creating folder for student: ' + name + ', teacher: ' + teacherName);
          var studentFolder = newStudentFolder.createFolder(folderName);
          studentFolder.createFolder(name + "'s Lesson Notes");
          studentFolder.createFolder(name + "'s Evaluation");

          var templateId = teacherTemplates[teacherName];
          if (!templateId) {
            Logger.log('No template found for teacher: ' + teacherName);
            continue;
          }

          var templateDoc = DriveApp.getFileById(templateId);
          templateDoc.makeCopy(name + "'s Lesson Note", studentFolder);
          var templateSheet = DriveApp.getFileById(templateSheetId);
          templateSheet.makeCopy(name + "'s Lesson History", studentFolder);
          Logger.log('Copied template doc for student: ' + name + ', teacher: ' + teacherName);
        }
      }
    }
  }
}
