function createFoldersFromSpreadsheet() {
  // Spreadsheet containing student names
  var studentNamesSpreadsheetId = '1Y2RCgVLXR1JB36mG0NQxII9U0fRYqv9BmBHbhm7MmXo';

  // Template files
  var templateDocId = 'your-template-doc-id'; // Replace with your Google Docs template file ID
  var templateSheetId = 'your-template-sheet-id'; // Replace with your Google Sheets template file ID

  // Get all sheets in the spreadsheet
  var sheets = SpreadsheetApp.openById(studentNamesSpreadsheetId).getSheets();

  // Get or create 'Students' folder in the root
  var root = DriveApp.getRootFolder();
  var studentsFolderIterator = root.getFoldersByName('Students');
  var studentsFolder;
  if (studentsFolderIterator.hasNext()) {
    studentsFolder = studentsFolderIterator.next();
  } else {
    studentsFolder = root.createFolder('Students');
  }

  // Iterate over sheets
  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var sheetName = sheet.getName();

    // Determine the parent folder based on the sheet name
    var parentFolderName;
    var prefix;
    if (sheetName === 'Regular') {
      parentFolderName = 'Regular';
      prefix = '';
    } else if (sheetName === 'Multiple') {
      parentFolderName = 'Multiple';
      prefix = 'M';
    } else if (sheetName === 'Kids') {
      parentFolderName = 'Kids';
      prefix = 'K';
    } else {
      continue; // Skip sheets with other names
    }

    // Get or create parent folder
    var parentFolderIterator = studentsFolder.getFoldersByName(parentFolderName);
    var parentFolder;
    if (parentFolderIterator.hasNext()) {
      parentFolder = parentFolderIterator.next();
    } else {
      parentFolder = studentsFolder.createFolder(parentFolderName);
    }

    // Get student names from the current sheet
    var studentNames = sheet.getRange('A:A').getValues(); // Assumes student names are in column A

    // Iterate over student names
    for (var j = 0; j < studentNames.length; j++) {
      var studentName = studentNames[j][0];
      if (studentName) { // Skip empty rows
        // Format the folder name. Pad the student number with leading zeros.
        var studentNumber = String(j + 1).padStart(3, '0'); // add 1 to index because spreadsheet row numbers start from 1
        var folderName = prefix + studentNumber + ' ' + studentName;

        // Check if folder already exists in parent folder
        var folders = parentFolder.getFoldersByName(folderName);
        if (!folders.hasNext()) { // If the folder does not exist, create it
          var studentFolder = parentFolder.createFolder(folderName);

          // Create sub-folders
          studentFolder.createFolder(studentName + "'s Lesson Notes");
          studentFolder.createFolder(studentName + "'s Evaluation");

          // Copy the template files into the new folder
          var templateDoc = DriveApp.getFileById(templateDocId);
          var templateSheet = DriveApp.getFileById(templateSheetId);
          templateDoc.makeCopy(studentFolder);
          templateSheet.makeCopy(studentFolder);
        }
      }
    }
  }
}
