"use client";
import { useState, useEffect } from "react";
import {
  getUserTests,
  deleteTest,
  publishTest,
  unpublishTest,
} from "../../lib/testOperations";
import { exportTestToExcel } from "@/utils/ExportToExcel";

export default function ViewTests() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load tests from Firestore
  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const userTests = await getUserTests();
      setTests(userTests);
    } catch (error) {
      console.error("Error loading tests:", error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this test? This action cannot be undone."
      )
    ) {
      try {
        await deleteTest(testId);
        setTests(tests.filter((test) => test.id !== testId));
        if (selectedTest?.id === testId) {
          setSelectedTest(null);
        }
        alert("Test deleted successfully!");
      } catch (error) {
        console.error("Error deleting test:", error);
        alert("Failed to delete test. Please try again.");
      }
    }
  };

  const exportTest = () => {
    if (!selectedTest) return;

    exportTestToExcel(selectedTest);
  };

  const handlePublish = async () => {
    if (!selectedTest) return;
    try {
      await publishTest(selectedTest.id);
      // Update local state
      setTests((prev) =>
        prev.map((t) => (t.id === selectedTest.id ? { ...t, status: "published" } : t))
      );
      setSelectedTest((s) => ({ ...s, status: "published" }));
      alert("Test published. You can now copy the link to share it.");
    } catch (error) {
      console.error(error);
      alert("Failed to publish test. Please try again.");
    }
  };

  const handleUnpublish = async () => {
    if (!selectedTest) return;
    if (
      !window.confirm(
        "Are you sure you want to unpublish this test? It will no longer be publicly accessible."
      )
    )
      return;
    try {
      await unpublishTest(selectedTest.id);
      setTests((prev) =>
        prev.map((t) => (t.id === selectedTest.id ? { ...t, status: "unpublished" } : t))
      );
      setSelectedTest((s) => ({ ...s, status: "unpublished" }));
      alert("Test unpublished successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to unpublish test. Please try again.");
    }
  };

  const copyLink = async () => {
    if (!selectedTest) return;
    const url = `${window.location.origin}/test/${selectedTest.id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Public link copied to clipboard:\n+" + url);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        alert("Public link copied to clipboard:\n" + url);
      } catch (e) {
        prompt("Copy this link", url);
      }
      document.body.removeChild(textArea);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    if (timestamp.toDate) {
      // Firestore timestamp
      return timestamp.toDate().toLocaleDateString();
    } else if (typeof timestamp === "string") {
      // ISO string from localStorage
      return new Date(timestamp).toLocaleDateString();
    } else if (timestamp.seconds) {
      // Firestore timestamp in object format
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    return "Invalid date";
  };

  const refreshTests = () => {
    setLoading(true);
    loadTests();
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Created Tests
          </h2>
          <p className="text-gray-600">View and manage your assessment tests</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {tests.length}
            </div>
            <div className="text-sm text-gray-500">Total Tests</div>
          </div>
          <button
            onClick={refreshTests}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Tests Created Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first test to see it listed here
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create Your First Test
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tests List */}
          <div className="lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Your Tests
              </h3>
              <span className="text-sm text-gray-500">
                {tests.length} test{tests.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className={`p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedTest?.id === test.id
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedTest(test)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800 line-clamp-2">
                      {test.testName || "Unnamed Test"}
                    </h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        test.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {test.status || "Active"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{test.totalQuestions || 0} Qs</span>
                    <span>{test.duration || 0} mins</span>
                    <span>{test.maxMarks || 0} marks</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {formatDate(test.createdAt)}
                  </div>
                  {test.totalResponses > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      {test.totalResponses} response
                      {test.totalResponses !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Test Details */}
          <div className="lg:col-span-2">
            {selectedTest ? (
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedTest.testName}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 flex-wrap gap-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {selectedTest.domain
                          ? selectedTest.domain.charAt(0).toUpperCase() +
                            selectedTest.domain.slice(1)
                          : "No Domain"}
                      </span>
                      <span>•</span>
                      <span>{selectedTest.totalQuestions} questions</span>
                      <span>•</span>
                      <span>{selectedTest.duration} minutes</span>
                      <span>•</span>
                      <span>{selectedTest.maxMarks} total marks</span>
                      {selectedTest.totalResponses > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 font-medium">
                            {selectedTest.totalResponses} responses
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={exportTest}
                      className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <span>📥</span>
                      <span>Export</span>
                    </button>

                    {/* Publish / Unpublish / Copy Link */}
                    {selectedTest.status === "published" ? (
                      <>
                        
                        <button
                          onClick={handleUnpublish}
                          className="bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                        >
                          <span>🚫</span>
                          <span>Unpublish</span>
                        </button>
                        <button
                          onClick={copyLink}
                          className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <span>🔗</span>
                          <span>Copy Link</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handlePublish}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <span>📣</span>
                        <span>Publish</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteTest(selectedTest.id)}
                      className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <span>🗑️</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Test Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Test Configuration
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Domain:</span>
                        <span className="font-medium">
                          {selectedTest.domain || "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">
                          {selectedTest.duration} minutes
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Batch:</span>
                        <span className="font-medium">
                          {selectedTest.batch || "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Marks:</span>
                        <span className="font-medium">
                          {selectedTest.maxMarks}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Passing Marks:</span>
                        <span className="font-medium">
                          {selectedTest.passingMarks || "Not set"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Statistics
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Questions:</span>
                        <span className="font-medium">
                          {selectedTest.totalQuestions}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created On:</span>
                        <span className="font-medium">
                          {formatDate(selectedTest.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-green-600">
                          {selectedTest.status || "Active"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Responses:</span>
                        <span className="font-medium">
                          {selectedTest.totalResponses || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Fields */}
                {selectedTest.customFields &&
                  selectedTest.customFields.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Additional Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedTest.customFields.map(
                          (field, index) =>
                            field.key &&
                            field.value && (
                              <div
                                key={index}
                                className="bg-gray-50 p-3 rounded-lg"
                              >
                                <div className="text-sm text-gray-600 font-medium">
                                  {field.key}
                                </div>
                                <div className="text-gray-800">
                                  {field.value}
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  )}

                {/* Instructions */}
                {selectedTest.instructions && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Test Instructions
                    </h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedTest.instructions}
                      </p>
                    </div>
                  </div>
                )}

                {/* Questions Preview */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800">
                      Questions ({selectedTest.questions?.length || 0})
                    </h4>
                    <span className="text-sm text-gray-500">
                      Scroll to view all questions
                    </span>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedTest.questions?.map((q, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-gray-800 flex-1">
                            {index + 1}. {q.question}
                          </h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {q.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`flex items-center space-x-2 p-2 rounded ${
                                optIndex === q.correctOption
                                  ? "bg-green-50 border border-green-200"
                                  : "bg-gray-50"
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                  optIndex === q.correctOption
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-300 text-gray-600"
                                }`}
                              >
                                {optIndex + 1}
                              </div>
                              <span
                                className={
                                  optIndex === q.correctOption
                                    ? "font-medium text-green-800"
                                    : "text-gray-600"
                                }
                              >
                                {option}
                              </span>
                              {optIndex === q.correctOption && (
                                <span className="text-green-600 text-sm ml-auto">
                                  ✓
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-12 text-center bg-gray-50">
                <div className="text-4xl mb-4">👆</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Select a Test
                </h3>
                <p className="text-gray-500">
                  Choose a test from the list to view its details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
