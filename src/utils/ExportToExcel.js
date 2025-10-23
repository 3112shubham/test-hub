// utils/exportToExcel.js
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * Exports test responses to Excel - maps custom field keys to actual names
 * @param {Object} test - The test object with responses
 */
export const exportTestToExcel = async (test) => {
  if (!test) return;

  const workbook = new ExcelJS.Workbook();

  const responsesSheet = workbook.addWorksheet("Responses");

  // Create dynamic columns
  const responseColumns = [];

  // Create mapping from custom field IDs to actual names and add them first
  const customFieldMap = {};
  if (test.customFields && test.customFields.length > 0) {
    test.customFields.forEach((field) => {
      if (field.name && field.name.trim() !== "") {
        const fieldId = field.id || field.name;
        customFieldMap[fieldId] = field.name;

        // Add column with actual field name
        responseColumns.push({
          header: field.name,
          key: `custom_${field.name}`,
          width: field.name === "email" ? 25 : 20, 
        });
      }
    });
  }

  // Add standard columns after custom fields
  responseColumns.push(
    { header: "Response ID", key: "responseId", width: 20 },
    { header: "Submitted At", key: "submittedAt", width: 25 },
    { header: "Status", key: "status", width: 15 }
  );

  // Add question answer columns
  (test.questions || []).forEach((q, index) => {
    responseColumns.push({
      header: `Q${index + 1}`,
      key: `q${index}`,
      width: 40,
    });
  });

  responsesSheet.columns = responseColumns;

  // Process responses
  (test.responses || []).forEach((response, responseIndex) => {
    const rowData = {
      responseId: response.responseId || `RES-${responseIndex + 1}`,
      submittedAt: formatFirestoreTimestamp(response.submittedAt),
      status: response.status || "submitted",
    };

    // Initialize custom fields as "N/A"
    if (test.customFields) {
      test.customFields.forEach((field) => {
        if (field.name && field.name.trim() !== "") {
          rowData[`custom_${field.name}`] = "N/A";
        }
      });
    }

    // Map custom field values
    if (response.customResponses && Array.isArray(response.customResponses)) {
      response.customResponses.forEach((customField) => {
        if (customField.key && customField.value !== undefined) {
          const actualFieldName = customFieldMap[customField.key];

          if (actualFieldName) {
            rowData[`custom_${actualFieldName}`] = customField.value;
          } else {
            rowData[`custom_${customField.key}`] = customField.value;
          }
        }
      });
    }

    // Add question answers
    const userAnswers = response.answers || [];
    (test.questions || []).forEach((question, questionIndex) => {
      const answerObj = userAnswers.find(
        (ans) => ans.questionIndex === questionIndex
      );
      const userAnswer = answerObj ? answerObj.answer : undefined;

      let answerText = "Not Attempted";

      if (userAnswer !== undefined && userAnswer !== null) {
        switch (question.type) {
          case "mcq":
            if (typeof userAnswer === "number") {
              answerText =
                question.options?.[userAnswer] || `Option ${userAnswer + 1}`;
            } else {
              answerText = `Invalid: ${typeof userAnswer}`;
            }
            break;

          case "multiple":
            if (Array.isArray(userAnswer)) {
              answerText = userAnswer
                .map(
                  (optIdx) =>
                    question.options?.[optIdx] || `Option ${optIdx + 1}`
                )
                .join(", ");
            } else {
              answerText = `Invalid: ${typeof userAnswer}`;
            }
            break;

          case "truefalse":
            if (typeof userAnswer === "boolean") {
              answerText = userAnswer ? "True" : "False";
            } else if (userAnswer === 1 || userAnswer === "1") {
              answerText = "True";
            } else if (userAnswer === 0 || userAnswer === "0") {
              answerText = "False";
            } else {
              answerText = `Invalid: ${userAnswer}`;
            }
            break;

          case "text":
            if (typeof userAnswer === "string") {
              answerText = userAnswer || "No answer provided";
            } else {
              answerText = `Invalid: ${typeof userAnswer}`;
            }
            break;

          default:
            answerText = `Unknown type: ${typeof userAnswer}`;
        }
      }

      rowData[`q${questionIndex}`] = answerText;
    });

    responsesSheet.addRow(rowData);
  });

  // Style header
  responsesSheet.getRow(1).font = { bold: true };
  responsesSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE6F3FF" },
  };
  responsesSheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

  // Export
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fileName = `responses_${(test.testName || "test").replace(
    /[^a-zA-Z0-9]/g,
    "_"
  )}_${new Date().toISOString().split("T")[0]}.xlsx`;
  saveAs(blob, fileName);
};

// Helper functions
const formatFirestoreTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";

  try {
    if (timestamp.toDate) return timestamp.toDate().toLocaleString();
    else if (timestamp.seconds)
      return new Date(timestamp.seconds * 1000).toLocaleString();
    else if (typeof timestamp === "string")
      return new Date(timestamp).toLocaleString();
    else if (timestamp instanceof Date) return timestamp.toLocaleString();
    return "Invalid date";
  } catch {
    return "N/A";
  }
};

const arraysEqual = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
};
