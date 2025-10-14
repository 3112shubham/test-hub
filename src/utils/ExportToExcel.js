// utils/exportToExcel.js
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * Exports a test object to an Excel file with Questions & Responses sheets
 * @param {Object} test - The selected test object
 */
export const exportTestToExcel = async (test) => {
  if (!test) return;

  const workbook = new ExcelJS.Workbook();

  // ===================
  // Questions Sheet
  // ===================
  const questionsSheet = workbook.addWorksheet("Questions");
  questionsSheet.columns = [
    { header: "No", key: "no", width: 5 },
    { header: "Question", key: "question", width: 50 },
    { header: "Options", key: "options", width: 50 },
    { header: "Correct Option", key: "correct", width: 30 },
  ];

  (test.questions || []).forEach((q, i) => {
    questionsSheet.addRow({
      no: i + 1,
      question: q.question,
      options: q.options.join(" | "),
      correct: q.options[q.correctOption] || "",
    });
  });

  // ===================
  // Responses Sheet
  // ===================
  const responsesSheet = workbook.addWorksheet("Responses");
  responsesSheet.columns = [
    { header: "No", key: "no", width: 5 },
    { header: "Student ID", key: "studentId", width: 30 },
    { header: "Answers", key: "answers", width: 50 },
    { header: "Score", key: "score", width: 10 },
    { header: "Submitted At", key: "submittedAt", width: 25 },
  ];

  (test.responses || []).forEach((r, i) => {
    responsesSheet.addRow({
      no: i + 1,
      studentId: r.userId || `Unknown-${i + 1}`,
      answers: r.answers?.join(" | ") || "",
      score: r.score ?? "",
      submittedAt: r.submittedAt
        ? new Date(r.submittedAt.seconds * 1000).toLocaleString()
        : "N/A",
    });
  });

  // ===================
  // Export
  // ===================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  saveAs(blob, `test-${test.testName || "export"}.xlsx`);
};
