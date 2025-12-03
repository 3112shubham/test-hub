// utils/exportToExcel.js
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { db } from "../lib/firebaseConfig";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";

/**
 * Fetches responses from both sources:
 * 1. Direct responses array in test document (legacy)
 * 2. Batch responses from responseBatches subcollection (new)
 * @param {string} testId - The test document ID
 * @param {Array} legacyResponses - Responses from test.responses array (if exists)
 * @returns {Promise<Array>} Combined responses from both sources
 */
const fetchAllResponses = async (testId, legacyResponses = []) => {
  let allResponses = [];

  // 1. First, add legacy responses if they exist
  if (Array.isArray(legacyResponses) && legacyResponses.length > 0) {
    console.log(`Fetched ${legacyResponses.length} responses from legacy array`);
    allResponses = [...legacyResponses];
  }

  // 2. Then, fetch from new batch subcollection
  try {
    const responseBatchesRef = collection(db, "tests", testId, "responseBatches");
    const batchesSnapshot = await getDocs(responseBatchesRef);

    if (!batchesSnapshot.empty) {
      console.log(`Found ${batchesSnapshot.size} batch documents`);

      // Sort batches by batch number to maintain order
      const sortedBatches = batchesSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }))
        .sort((a, b) => {
          const numA = parseInt(a.id.replace("batch_", "")) || 0;
          const numB = parseInt(b.id.replace("batch_", "")) || 0;
          return numA - numB;
        });

      // Extract responses from each batch
      sortedBatches.forEach((batch) => {
        if (batch.data.responses && Array.isArray(batch.data.responses)) {
          console.log(`  Batch ${batch.id}: ${batch.data.responses.length} responses`);
          allResponses.push(...batch.data.responses);
        }
      });

      console.log(`Total responses from batches: ${batchesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().responses?.length || 0), 0)}`);
    }
  } catch (error) {
    console.warn("Error fetching from responseBatches subcollection:", error);
    // Continue with legacy responses only if batch fetch fails
  }

  return allResponses;
};

/**
 * Exports test responses to Excel - maps custom field keys to actual names
 * Fetches responses from both legacy array and new batch subcollection
 * @param {Object} test - The test object with responses
 */
export const exportTestToExcel = async (test) => {
  if (!test) return;

  // Fetch responses from both sources (legacy array + new batches)
  const responses = await fetchAllResponses(test.id || test._id, test.responses);

  if (!responses || responses.length === 0) {
    console.warn("No responses found in either source (legacy array or batch subcollection)");
    alert("No responses found to export.");
    return;
  }

  console.log(`Total responses to export: ${responses.length}`);

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
    { header: "Status", key: "status", width: 15 },
    { header: "Score", key: "score", width: 15 },
    { header: "Total Questions", key: "total", width: 15 },
    { header: "Percentage", key: "percentage", width: 15 }
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
  (responses || []).forEach((response, responseIndex) => {
    const rowData = {
      responseId: response.responseId || `RES-${responseIndex + 1}`,
      submittedAt: formatFirestoreTimestamp(response.submittedAt),
      status: response.status || "submitted",
    };

    // Calculate and add score
    const scoreDetails = calculateScore(response, test.questions);
    rowData.score = scoreDetails.score;
    rowData.total = scoreDetails.total;
    rowData.percentage = `${scoreDetails.percentage}%`;

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
            if (Array.isArray(userAnswer) && userAnswer.length > 0) {
              answerText = userAnswer
                .map(
                  (optIdx) =>
                    question.options?.[optIdx] || `Option ${optIdx + 1}`
                )
                .join(", ");
            } else {
              answerText = "Not Attempted";
            }
            break;

          case "truefalse":
            if (typeof userAnswer === "boolean") {
              answerText = userAnswer ? "True" : "False";
            } else if (userAnswer === 0 || userAnswer === "0") {
              answerText = "True";
            } else if (userAnswer === 1 || userAnswer === "1") {
              answerText = "False";
            } else {
              answerText = `Invalid: ${userAnswer}`;
            }
            break;

          case "text":
            if (typeof userAnswer === "string") {
              answerText = userAnswer || "Not Attempted";
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

// Calculate score for a single response
const calculateScore = (response, questions) => {
  if (!response?.answers || !questions) return 0;
  
  let score = 0;
  const totalQuestions = questions.length;
  
  response.answers.forEach(answer => {
    const question = questions[answer.questionIndex];
    if (!question) return;

    switch (question.type) {
      case "mcq":
        if (Array.isArray(answer.answer)) {
          // If answer is array, check first element
          if (answer.answer[0] === question.correctOptions?.[0]) score++;
        } else if (answer.answer === question.correctOptions?.[0]) score++;
        break;
        
      case "multiple":
        if (Array.isArray(answer.answer) && Array.isArray(question.correctOptions)) {
          // For multiple, check if arrays contain same elements
          const answersSorted = [...answer.answer].sort();
          const correctSorted = [...question.correctOptions].sort();
          if (arraysEqual(answersSorted, correctSorted)) score++;
        }
        break;
        
      case "truefalse":
        const answerBoolean = answer.answer === 0 || answer.answer === true;
        if (answerBoolean === question.trueFalseAnswer) score++;
        break;
        
      case "text":
        score++;
        break;
    }
  });

  return {
    score,
    total: totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100)
  };
};
