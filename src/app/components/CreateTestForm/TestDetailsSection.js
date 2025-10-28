import { useEffect } from "react";

export default function TestDetailsSection({
  instructions,
  setInstructions,
  customFields,
  setCustomFields,
}) {
  // Ensure "Email" field always exists
  useEffect(() => {
    const hasEmailField = customFields.some(
      (field) => field.name.toLowerCase() === "email"
    );

    if (!hasEmailField) {
      const emailField = {
        id: "default-email",
        name: "Email",
        type: "value",
        required: true,
        options: [],
      };
      setCustomFields([emailField, ...customFields]);
    }
  }, [customFields, setCustomFields]);

  return (
    <div className="space-y-8">
      {/* Response Structure Definition Section */}
      <div className="pt-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#1D4ED8] to-[#00BCD4] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Student Registration Fields
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Define custom fields that students will fill out before starting the test
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {customFields.map((field, index) => (
            <div
              key={field.id}
              className="border-2 border-blue-100 rounded-xl p-6 bg-gradient-to-br from-white to-blue-25 hover:border-blue-200 transition-all duration-300"
            >
              {/* Field Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    field.id === "default-email" 
                      ? "bg-[#6BBF59]" 
                      : "bg-gradient-to-r from-[#1D4ED8] to-[#00BCD4]"
                  }`}></div>
                  <span className="text-sm font-semibold text-gray-700">
                    Field {index + 1}
                    {field.id === "default-email" && (
                      <span className="text-[#6BBF59] ml-2 text-xs bg-[#6BBF59]/10 px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </span>
                </div>
                
                {/* Show Remove for email only if there's more than one field */}
                {(field.id !== "default-email" || customFields.length > 1) && (
                  <button
                    type="button"
                    onClick={() => {
                      const updatedFields = customFields.filter(
                        (_, i) => i !== index
                      );
                      setCustomFields(updatedFields);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-rose-600 hover:text-rose-800 font-medium bg-rose-50 hover:bg-rose-100 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                {/* Field Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#1D4ED8] rounded-full"></div>
                    Field Name *
                  </label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => {
                      const updatedFields = [...customFields];
                      updatedFields[index].name = e.target.value;
                      setCustomFields(updatedFields);
                    }}
                    className={`w-full border-2 border-blue-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4] transition-all duration-300 ${
                      field.id === "default-email" 
                        ? "bg-blue-50 text-gray-600 cursor-not-allowed" 
                        : "bg-white hover:border-blue-200"
                    }`}
                    placeholder="e.g., Roll Number, Department"
                    required
                    disabled={field.id === "default-email"}
                  />
                </div>

                {/* Field Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#00BCD4] rounded-full"></div>
                    Field Type *
                  </label>
                  <div className="relative">
                    <select
                      value={field.type}
                      onChange={(e) => {
                        const updatedFields = [...customFields];
                        updatedFields[index].type = e.target.value;
                        if (e.target.value === "value") {
                          updatedFields[index].options = [];
                        } else if (
                          e.target.value === "dropdown" &&
                          !updatedFields[index].options
                        ) {
                          updatedFields[index].options = [""];
                        }
                        setCustomFields(updatedFields);
                      }}
                      className={`w-full border-2 border-blue-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4] transition-all duration-300 appearance-none ${
                        field.id === "default-email" 
                          ? "bg-blue-50 cursor-not-allowed" 
                          : "bg-white hover:border-blue-200 cursor-pointer"
                      }`}
                      disabled={field.id === "default-email"}
                    >
                      <option value="value">Text Input</option>
                      <option value="dropdown">Dropdown</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-[#1D4ED8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dropdown Options */}
              {field.type === "dropdown" && (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#6BBF59] rounded-full"></div>
                    Dropdown Options *
                  </label>
                  <div className="space-y-3">
                    {field.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-3 items-center">
                        <div className="w-6 h-6 bg-gradient-to-r from-[#1D4ED8] to-[#00BCD4] rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {optionIndex + 1}
                        </div>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const updatedFields = [...customFields];
                            updatedFields[index].options[optionIndex] = e.target.value;
                            setCustomFields(updatedFields);
                          }}
                          className="flex-1 border-2 border-blue-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4] transition-all duration-300 bg-white hover:border-blue-200"
                          placeholder={`Enter option ${optionIndex + 1}...`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedFields = [...customFields];
                            updatedFields[index].options.splice(optionIndex, 1);
                            setCustomFields(updatedFields);
                          }}
                          className="px-4 py-3 text-rose-600 hover:text-rose-800 font-medium bg-rose-50 hover:bg-rose-100 rounded-xl transition-all duration-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const updatedFields = [...customFields];
                        updatedFields[index].options.push("");
                        setCustomFields(updatedFields);
                      }}
                      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#6BBF59] to-[#00BCD4] text-white rounded-xl hover:from-[#6BBF59]/90 hover:to-[#00BCD4]/90 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Option
                    </button>
                  </div>
                </div>
              )}

              {/* Required Checkbox */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id={`required-${field.id}`}
                      checked={field.required}
                      onChange={(e) => {
                        const updatedFields = [...customFields];
                        updatedFields[index].required = e.target.checked;
                        setCustomFields(updatedFields);
                      }}
                      className="h-5 w-5 text-[#6BBF59] focus:ring-[#6BBF59] border-blue-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <label
                    htmlFor={`required-${field.id}`}
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Required field
                  </label>
                  {field.required && (
                    <span className="text-xs bg-[#6BBF59]/10 text-[#6BBF59] px-2 py-1 rounded-full font-medium">
                      Mandatory
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add Custom Field Button */}
          <button
            type="button"
            onClick={() => {
              const newField = {
                id: Date.now().toString(),
                name: "",
                type: "value",
                required: false,
                options: [],
              };
              setCustomFields([...customFields, newField]);
            }}
            className="w-full border-2 border-dashed border-blue-200 rounded-xl py-6 hover:border-[#00BCD4] hover:bg-blue-25 transition-all duration-300 group"
          >
            <div className="flex items-center justify-center gap-3 text-[#1D4ED8] group-hover:text-[#00BCD4]">
              <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-all duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-center">
                <div className="font-semibold">Add Custom Field</div>
                <div className="text-sm text-gray-500 mt-1">
                  Collect additional information from students
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Test Instructions */}
      <div className="border-t border-blue-100 pt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Test Instructions</h3>
            <p className="text-sm text-gray-600 mt-1">
              Provide clear instructions for students before they start the test
            </p>
          </div>
        </div>
        
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full border-2 border-blue-100 rounded-xl px-4 py-4 focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4] transition-all duration-300 bg-white hover:border-blue-200 focus:bg-blue-25 placeholder-gray-400 resize-vertical"
          rows="6"
          placeholder="Enter detailed test instructions for students...
• Time limits
• Question types
• Navigation rules
• Submission guidelines
• Any special instructions..."
        />
        <div className="flex items-center gap-2 mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm text-amber-700">
            These instructions will be shown to students before they begin the test
          </p>
        </div>
      </div>
    </div>
  );
}