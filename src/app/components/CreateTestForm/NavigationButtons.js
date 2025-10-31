import { Delete } from "lucide-react";

export default function NavigationButtons({
  activeSection,
  setActiveSection,
  isFormValid,
  isSubmitting,
  questionsLength,
  resetForm,
  hasData,
}) {
  return (
    <div className="flex justify-between py-6 ">
      <div className="flex space-x-3">
        {activeSection !== "basic" && (
          <button
            type="button"
            onClick={() =>
              setActiveSection(
                activeSection === "details" ? "basic" : "details"
              )
            }
            className="bg-gray-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-600 transition-colors duration-200"
          >
            ← Back to{" "}
            {activeSection === "details" ? "Basic Info" : "Test Details"}
          </button>
        )}

        {hasData && (
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to clear all form data? This cannot be undone."
                )
              ) {
                resetForm();
              }
            }}
            className="bg-white border border-gray-100 text-rose-600 py-3 px-3 rounded-xl font-medium hover:bg-rose-100 transition-colors duration-200 flex justify-center items-center gap-x-2"
          >
            <Delete />
            Clear Form
          </button>
        )}
      </div>

      <div className="flex space-x-3">
        {activeSection === "basic" && (
          <button
            type="button"
            onClick={() => setActiveSection("details")}
            className="bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Continue to Details →
          </button>
        )}

        {activeSection === "details" && (
          <button
            type="button"
            onClick={() => setActiveSection("questions")}
            className="bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Continue to Questions →
          </button>
        )}

        {activeSection === "questions" && (
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="bg-green-600 text-white py-3 px-8 rounded-xl font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Test...</span>
              </>
            ) : (
              <>
                <span>🎯</span>
                <span>Create Test ({questionsLength} questions)</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
