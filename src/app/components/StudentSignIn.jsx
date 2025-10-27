"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

export default function StudentSignIn({
  test,
  customFields,
  customResponses,
  setCustomResponses,
  testPassword,
  setTestPassword,
  onSignInComplete,
  onReset,
}) {
  const [passwordError, setPasswordError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState(new Set());

  // Validate fields when customResponses changes
  useEffect(() => {
    const errors = {};
    customFields.forEach((f) => {
      const fieldId = f.id || f.name;
      if (
        f.required &&
        (!customResponses[fieldId] || customResponses[fieldId].trim() === "")
      ) {
        errors[fieldId] = `${f.name} is required`;
      }
    });
    setValidationErrors(errors);
  }, [customResponses, customFields]);

  const validatePassword = () => {
    if (!test.password) return true;
    if (testPassword === test.password) {
      setPasswordError("");
      return true;
    }
    setPasswordError("Incorrect password. Please check with your instructor.");
    return false;
  };

  const setCustomValue = (id, value) => {
    setCustomResponses((prev) => {
      return { ...prev, [id]: value };
    });
    // Validation is now handled by the useEffect above
  };

  const validateCustomFields = () => {
    const errors = {};
    customFields.forEach((f) => {
      const fieldId = f.id || f.name;
      const value = customResponses[fieldId];
      if (f.required) {
        if (!value || value.toString().trim() === "") {
          errors[fieldId] = `${f.name} is required`;
        } else if (f.type === "dropdown" && value === "") {
          errors[fieldId] = `${f.name} is required`;
        }
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldBlur = (fieldId) => {
    setTouchedFields((prev) => new Set([...prev, fieldId]));
  };

  const isFormValid = () => {
    if (test.password && testPassword !== test.password) {
      return false;
    }
    return customFields.every((f) => {
      if (!f.required) return true;
      const fieldId = f.id || f.name;
      const value = customResponses[fieldId];
      if (f.type === "dropdown") return value && value !== "";
      return value && value.toString().trim() !== "";
    });
  };

  const handleStartTest = () => {
    if (test.password && !validatePassword()) return;
    if (!validateCustomFields()) {
      const allFieldIds = customFields.map((f) => f.id || f.name);
      setTouchedFields(new Set(allFieldIds));
      return;
    }
    onSignInComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-4 lg:py-8 px-4 w-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 lg:mb-12">
          <div className="relative inline-block mb-4 lg:mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <User className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
            </div>
          </div>

          <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
            Welcome to the Test!
          </h3>
          <p className="text-gray-500 text-base lg:text-lg font-medium">
            Please provide your details before we begin
          </p>
        </div>

        {/* Password Section */}
        {test.password && (
          <div className="mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Test Access Required
              </h4>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Enter Test Password *
                </label>
                <input
                  type="text"
                  value={testPassword}
                  onChange={(e) => {
                    setTestPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  onBlur={() => {
                    if (
                      test.password &&
                      testPassword &&
                      testPassword !== test.password
                    ) {
                      setPasswordError(
                        "Incorrect password. Please check with your instructor."
                      );
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    passwordError
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter the password provided by your instructor"
                />
                {passwordError && (
                  <p className="text-rose-600 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {passwordError}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom Fields Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-4 lg:p-8 mb-6 lg:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {customFields.map((f) => {
              const fieldId = f.id || f.name;
              const isRequired = f.required;
              const hasError =
                validationErrors[fieldId] && touchedFields.has(fieldId);
              const isEmpty =
                !customResponses[fieldId] ||
                customResponses[fieldId].trim() === "";

              return (
                <div key={fieldId} className="space-y-3 group">
                  <label className="block text-sm font-semibold text-gray-700 tracking-wide transition-colors duration-200 group-hover:text-gray-900">
                    {f.name}{" "}
                    {isRequired && <span className="text-rose-500">*</span>}
                  </label>

                  {f.type === "dropdown" ? (
                    <div className="relative">
                      <select
                        className={`w-full px-4 py-3 lg:py-3.5 border rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-blue-300/50 appearance-none cursor-pointer ${
                          hasError
                            ? "border-rose-500 bg-rose-50 text-rose-800 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                            : isEmpty
                            ? "border-gray-200/80 text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            : "border-gray-200/80 text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        }`}
                        value={customResponses[fieldId] || ""}
                        onChange={(e) =>
                          setCustomValue(fieldId, e.target.value)
                        }
                        onBlur={() => handleFieldBlur(fieldId)}
                        required={isRequired}
                      >
                        <option value="">Select an option</option>
                        {(f.options || []).map((opt, oi) => (
                          <option
                            key={oi}
                            value={opt}
                            className="text-gray-800"
                          >
                            {opt}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <ChevronDown
                          className={`w-4 h-4 ${
                            hasError ? "text-rose-500" : "text-gray-400"
                          }`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        className={`w-full px-4 py-3 lg:py-3.5 border rounded-md transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md group-hover:border-blue-300 ${
                          hasError
                            ? "border-rose-500 bg-rose-50 text-rose-800 placeholder-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                            : "border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        }`}
                        value={customResponses[fieldId] || ""}
                        onChange={(e) =>
                          setCustomValue(fieldId, e.target.value)
                        }
                        onBlur={() => handleFieldBlur(fieldId)}
                        placeholder={`Enter your ${f.name.toLowerCase()}${
                          isRequired ? " *" : ""
                        }`}
                        required={isRequired}
                      />
                    </div>
                  )}

                  {hasError && (
                    <p className="text-rose-600 text-xs font-medium flex items-center space-x-1 animate-fadeIn">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span>{validationErrors[fieldId]}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {Object.keys(validationErrors).length > 0 &&
            touchedFields.size > 0 && (
              <div className="mt-4 lg:mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl animate-fadeIn">
                <div className="flex items-center space-x-3 text-rose-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">
                      Please fill in all required fields
                    </p>
                    <p className="text-sm text-rose-600 mt-1">
                      {Object.keys(validationErrors).length} required field(s)
                      need to be completed before starting the test
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Start Test Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleStartTest}
            disabled={!isFormValid()}
            className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 lg:px-12 py-3 lg:py-4 rounded-xl font-semibold text-base lg:text-lg transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 group-disabled:translate-x-[-100%]"></div>
            <span className="relative flex items-center justify-center gap-2">
              Start Test
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200 group-disabled:transform-none" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
