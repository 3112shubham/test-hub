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
    <div className="space-y-6">
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

        <div className="space-y-3">
          {customFields.map((field, index) => (
            <div
              key={field.id}
              className="border border-blue-100 rounded-lg p-3 bg-white hover:shadow-sm transition-all duration-150"
            >
              <div className="flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    field.id === "default-email" ? "bg-[#6BBF59]" : "bg-gradient-to-r from-[#1D4ED8] to-[#00BCD4]"
                  }`} />
                  <div className="text-sm font-semibold text-gray-800">
                    {field.id === "default-email" ? "Email (Default)" : `Field ${index + 1}`}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(field.id !== "default-email" || customFields.length > 1) && (
                    <button
                      type="button"
                      onClick={() => {
                        const updatedFields = customFields.filter((_, i) => i !== index);
                        setCustomFields(updatedFields);
                      }}
                      className="text-rose-600 hover:text-rose-800 text-sm font-medium px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 items-center">
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => {
                    const updatedFields = [...customFields];
                    updatedFields[index].name = e.target.value;
                    setCustomFields(updatedFields);
                  }}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#00BCD4] transition-colors ${
                    field.id === "default-email" ? "bg-gray-50 text-gray-600 cursor-not-allowed" : "bg-white"
                  }`}
                  placeholder="Field name"
                  disabled={field.id === "default-email"}
                />

                <select
                  value={field.type}
                  onChange={(e) => {
                    const updatedFields = [...customFields];
                    updatedFields[index].type = e.target.value;
                    if (e.target.value === "value") updatedFields[index].options = [];
                    if (e.target.value === "dropdown" && !updatedFields[index].options) updatedFields[index].options = [""];
                    setCustomFields(updatedFields);
                  }}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#00BCD4] transition-colors ${
                    field.id === "default-email" ? "bg-gray-50 cursor-not-allowed" : "bg-white"
                  }`}
                  disabled={field.id === "default-email"}
                >
                  <option value="value">Text input</option>
                  <option value="dropdown">Dropdown</option>
                </select>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => {
                      const updatedFields = [...customFields];
                      updatedFields[index].required = e.target.checked;
                      setCustomFields(updatedFields);
                    }}
                    className="w-4 h-4 text-[#6BBF59]"
                  />
                  <span>Required</span>
                </label>
              </div>

              {field.type === "dropdown" && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {field.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const updatedFields = [...customFields];
                            updatedFields[index].options[optionIndex] = e.target.value;
                            setCustomFields(updatedFields);
                          }}
                          className="border rounded-md px-2 py-1 text-sm"
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedFields = [...customFields];
                            updatedFields[index].options.splice(optionIndex, 1);
                            setCustomFields(updatedFields);
                          }}
                          className="text-rose-600 px-2"
                        >
                          ✕
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
                      className="text-sm text-[#1D4ED8] px-3 py-1 border rounded-md"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Compact Add Custom Field Button */}
          <div className="pt-2">
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
              className="inline-flex items-center gap-2 px-3 py-1 border border-blue-100 rounded-md text-sm text-[#1D4ED8] hover:bg-blue-50 hover:border-[#00BCD4] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Add field</span>
            </button>
          </div>
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