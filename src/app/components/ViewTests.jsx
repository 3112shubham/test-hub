"use client";
import { useState, useEffect } from "react";
import {
  getUserTests,
  deleteTest,
  publishTest,
  unpublishTest,
  updateTest,
} from "../../lib/testOperations";
import DuplicateTest from "./DuplicateTest";
import CreateTestForm from "./CreateTestForm";
import { exportTestToExcel } from "@/utils/ExportToExcel";
import {
  Download,
  Upload,
  Link2,
  Ban,
  Trash2,
  RefreshCcw,
  Edit,
  X,
} from "lucide-react";
import QuestionEditor from "./QuestionEditor";
import toast from "react-hot-toast";

export default function ViewTests() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingTest, setUpdatingTest] = useState(false);
  const [updatedTestData, setUpdatedTestData] = useState({
    testName: "",
    domain: "",
    description: "",
    instructions: "",
    questions: [], // Existing questions (preserved)
    newQuestions: [], // New questions to be added
    removedQuestions: [], // Questions to be removed
  });
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Load tests from Firestore
  useEffect(() => {
    loadTests();
  }, []);

  // Initialize update modal data when test is selected
  useEffect(() => {
    if (selectedTest && showUpdateModal) {
      setUpdatedTestData({
        testName: selectedTest.testName || "",
        domain: selectedTest.domain || "",
        description: selectedTest.description || "",
        instructions: selectedTest.instructions || "",
        password: selectedTest.password || "", // Add this line
        questions: selectedTest.questions || [], // Preserve existing questions
        newQuestions: [], // Start with empty new questions
        removedQuestions: [], // Start with empty removed questions
      });
    }
  }, [selectedTest, showUpdateModal]);

  const loadTests = async () => {
    try {
      const userTests = await getUserTests();
      setTests(userTests);
    } catch (error) {
      console.error("Error loading tests:", error);
      setTests([]);
      toast.error("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const refreshTestsWithSync = async () => {
    setLoading(true);
    try {
      await handleSyncQueue(); // Sync first
      await loadTests(); // Then refresh
    } catch (error) {
      console.error("Error in refresh with sync:", error);
      toast.error("Error refreshing tests");
    } finally {
      setLoading(false);
    }
  };

  //fix later export sync but exports the old data
  const exportTestWithSync = async () => {
    if (!selectedTest) return;

    setLoading(true);
    try {
      await handleSyncQueue(); // Sync first
      exportTest(); // Then export
    } catch (error) {
      console.error("Error in export with sync:", error);
      toast.error("Error exporting test");
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
        toast.success("Test deleted successfully!");
      } catch (error) {
        console.error("Error deleting test:", error);
        toast.error("Failed to delete test. Please try again.");
      }
    }
  };

  const exportTest = () => {
    if (!selectedTest) return;
    exportTestToExcel(selectedTest);
    toast.success("Test exported successfully!");
  };

  const handlePublish = async () => {
    if (!selectedTest) return;
    try {
      await publishTest(selectedTest.id);
      // Update local state
      setTests((prev) =>
        prev.map((t) =>
          t.id === selectedTest.id ? { ...t, status: "active" } : t
        )
      );
      setSelectedTest((s) => ({ ...s, status: "active" }));
      toast.success("Test published. You can now copy the link to share it.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish test. Please try again.");
    }
  };

  const handleSyncQueue = async () => {
    const loadingToast = toast.loading("Syncing queue..."); // Add this
    try {
      setLoading(true);
      const res = await fetch("/api/test-submissions/sync", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Queue synced successfully!", {
          id: loadingToast,
        });

        // Update selectedTest with fresh data
        if (selectedTest) {
          const freshTests = await getUserTests(); // Or use the updated tests state
          const updatedTest = freshTests.find((t) => t.id === selectedTest.id);
          if (updatedTest) {
            setSelectedTest(updatedTest);
          }
        }
      } else {
        toast.error(
          "Failed to sync queue: " + (data.error || "Unknown error"),
          {
            id: loadingToast,
          }
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Error syncing queue: " + err.message);
    } finally {
      setLoading(false);
      loadTests();
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
        prev.map((t) =>
          t.id === selectedTest.id ? { ...t, status: "inactive" } : t
        )
      );
      setSelectedTest((s) => ({ ...s, status: "inactive" }));
      toast.success("Test unpublished successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to unpublish test. Please try again.");
    }
  };

  const handleUpdateTest = (testId) => {
    if (!selectedTest) return;
    setShowUpdateModal(true);
  };

  // Handler used when CreateTestForm submits updated data for an existing test
  const handleUpdateWithForm = async (updatedFields) => {
    if (!selectedTest) return;
    setUpdatingTest(true);
    try {
      // Preserve fields we don't want to overwrite
      const preserved = {
        responses: selectedTest.responses || [],
        totalResponses:
          typeof selectedTest.totalResponses === "number"
            ? selectedTest.totalResponses
            : selectedTest.responses
            ? selectedTest.responses.length
            : 0,
        createdAt: selectedTest.createdAt,
        createdBy: selectedTest.createdBy,
        createdByEmail: selectedTest.createdByEmail,
        status: selectedTest.status || "inactive",
        // Preserve password if not provided in update
        password: updatedFields.password || selectedTest.password,
      };

      const updateData = {
        ...updatedFields,
        ...preserved,
        totalQuestions: (updatedFields.questions || []).length,
      };

      await updateTest(selectedTest.id, updateData);

      // Update local state
      setTests((prev) =>
        prev.map((t) =>
          t.id === selectedTest.id ? { ...t, ...updateData } : t
        )
      );
      setSelectedTest((s) => ({ ...s, ...updateData }));

      toast.success("Test updated successfully!");
      setShowUpdateModal(false);
    } catch (error) {
      console.error("Error updating test via form:", error);
      toast.error("Failed to update test. Please try again.");
    } finally {
      setUpdatingTest(false);
    }
  };

  const copyLink = async () => {
    if (!selectedTest) return;
    const url = `${window.location.origin}/test/${selectedTest.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`Public link copied to clipboard! ${url}`);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Public link copied to clipboard!");
      } catch (e) {
        toast.error("Failed to copy link. Please copy it manually.");
      }
      document.body.removeChild(textArea);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    } else if (typeof timestamp === "string") {
      return new Date(timestamp).toLocaleDateString();
    } else if (timestamp.seconds) {
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
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-8xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-8xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Created Tests
            </h2>
            <p className="text-gray-600">
              View and manage your assessment tests
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Total Tests</div>
              <div className="text-2xl font-bold text-blue-600">
                {tests.length}
              </div>
            </div>
            <button
              onClick={refreshTestsWithSync}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCcw size={16} />
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
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex flex-col py-2 gap-y-5">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {selectedTest.testName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 flex-wrap gap-2">
                          <span className="bg-sky-100 text-blue-800 px-3 py-1 rounded-full">
                            {selectedTest.domain
                              ? selectedTest.domain.charAt(0).toUpperCase() +
                                selectedTest.domain.slice(1)
                              : "No Domain"}
                          </span>
                          <span className="text-emerald-500 font-medium px-2 py-1 space-x-2 text-sm text-nowrap">
                            {selectedTest.totalQuestions || 0} questions
                          </span>

                          {selectedTest.totalResponses > 0 && (
                            <>
                              <span className="text-emerald-500 font-medium px-2 py-1 space-x-2 text-sm text-nowrap">
                                {selectedTest.totalResponses} responses
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Export button moved to the right end */}
                      <button
                        onClick={exportTestWithSync}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all"
                      >
                        <Download size={16} />
                        <span>Export</span>
                      </button>
                    </div>
                    <div className="flex flex-col items-center gap-3 text-sm">
                      {/* Reminder */}
                      <span className="text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-md border border-amber-200 shadow-sm">
                        ⚠️ Always <strong>Sync Queue</strong> before exporting
                        to avoid loss of responses.
                      </span>

                      {/* Buttons */}
                      <div className="flex justify-center flex-wrap gap-2 text-sm">
                        {/* Sync Queue */}

                        <button
                          onClick={handleSyncQueue}
                          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-purple-700 hover:shadow-md transition-all"
                        >
                          <RefreshCcw size={16} />
                          <span>Sync</span>
                        </button>
                        {/* Publish / Unpublish / Copy Link */}
                        {selectedTest.status === "active" ? (
                          <>
                            <button
                              onClick={handleUnpublish}
                              className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-amber-600 hover:shadow-md transition-all"
                            >
                              <Ban size={16} />
                              <span>Unpublish</span>
                            </button>

                            <button
                              onClick={copyLink}
                              className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-sky-700 hover:shadow-md transition-all"
                            >
                              <Link2 size={16} />
                              <span>Copy Link</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={handlePublish}
                            className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-sky-700 hover:shadow-md transition-all"
                          >
                            <Upload size={16} />
                            <span>Publish</span>
                          </button>
                        )}

                        {/* Update Test Button - Only shows when test is inactive */}
                        {selectedTest.status !== "active" && (
                          <button
                            onClick={() => handleUpdateTest(selectedTest.id)}
                            className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-600 hover:shadow-md transition-all"
                          >
                            <Edit size={16} />
                            <span>Update Test</span>
                          </button>
                        )}

                        {/* Duplicate Test Button */}
                        <button
                          onClick={() => setShowDuplicateModal(true)}
                          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Duplicate</span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteTest(selectedTest.id)}
                          className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-rose-600 hover:shadow-md transition-all"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Test Details Grid - Side by Side Layout */}
                  <div className="flex flex-col lg:flex-row gap-6 mb-6">
                    {/* Statistics Card */}
                    <div className="bg-gray-50 p-4 rounded-lg flex-1">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Statistics
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Total Questions:
                          </span>
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

                    {/* Password Card - ADD THIS */}
                    <div className="bg-gray-50 p-4 rounded-lg flex-1">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        Test Password
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-300">
                          <div className="font-mono text-lg font-bold text-gray-800 tracking-wide">
                            {selectedTest.password || "No password set"}
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Required
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Students will need this password to start the test
                        </p>
                      </div>
                    </div>

                    {/* Custom Fields - Student Data Collection */}
                    {selectedTest.customFields &&
                      selectedTest.customFields.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg flex-1">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                            Student Registration Fields
                          </h4>
                          <div className="space-y-2 max-h-40 pr-2">
                            {selectedTest.customFields.map(
                              (field, index) =>
                                field.name &&
                                field.name.trim() !== "" && (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-white rounded border border-gray-300"
                                  >
                                    <div>
                                      <div className="font-medium text-gray-800 text-sm capitalize">
                                        {field.name}
                                      </div>
                                      <div className="text-xs text-gray-500 flex items-center gap-2">
                                        <span className="capitalize">
                                          {field.type || "text"}
                                        </span>
                                        <span>•</span>
                                        <span
                                          className={
                                            field.required
                                              ? "text-rose-600 font-medium"
                                              : "text-gray-500"
                                          }
                                        >
                                          {field.required
                                            ? "Required"
                                            : "Optional"}
                                        </span>
                                      </div>
                                    </div>
                                    {field.required && (
                                      <span className="text-rose-500 text-sm">
                                        *
                                      </span>
                                    )}
                                  </div>
                                )
                            )}
                          </div>
                        </div>
                      )}
                  </div>

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
      {/* Update Test Modal - reuse CreateTestForm */}
      {showUpdateModal && selectedTest && (
        <div className="fixed inset-0 bg-gray-600/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-7xl relative flex flex-col h-[90vh]">
            <button
              onClick={() => setShowUpdateModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <X size={24} />
            </button>

            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Update Test</h3>
            </div>

            <div className="flex-1 overflow-hidden">
              <CreateTestForm
                initialData={selectedTest}
                onSubmit={handleUpdateWithForm}
                isSubmitting={updatingTest}
              />
            </div>
          </div>
        </div>
      )}
      {showDuplicateModal && selectedTest && (
        <DuplicateTest
          test={selectedTest}
          onClose={() => {
            setShowDuplicateModal(false);
            refreshTests();
          }}
        />
      )}
    </>
  );
}
