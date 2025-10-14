export default function TestDetailsSection({
  instructions,
  setInstructions,
  customFields,
  setCustomFields,
}) {
  return (
    <div className="space-y-6">
      

      {/* Response Structure Definition Section */}
      <div className=" pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Response Structure Definition
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Define custom fields that candidates will need to fill out before
          starting the test.
        </p>

        <div className="space-y-4">
          {customFields.map((field, index) => (
            <div
              key={field.id}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Roll Number, Department"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Type *
                  </label>
                  <select
                    value={field.type}
                    onChange={(e) => {
                      const updatedFields = [...customFields];
                      updatedFields[index].type = e.target.value;
                      // Clear options when switching from dropdown to value type
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="value">Text Input</option>
                    <option value="dropdown">Dropdown</option>
                  </select>
                </div>
              </div>

              {field.type === "dropdown" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dropdown Options *
                  </label>
                  <div className="space-y-2">
                    {field.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const updatedFields = [...customFields];
                            updatedFields[index].options[optionIndex] =
                              e.target.value;
                            setCustomFields(updatedFields);
                          }}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Option ${optionIndex + 1}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedFields = [...customFields];
                            updatedFields[index].options.splice(optionIndex, 1);
                            setCustomFields(updatedFields);
                          }}
                          className="px-3 py-2 text-red-600 hover:text-red-800 font-medium"
                        >
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Add Option
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`required-${field.id}`}
                    checked={field.required}
                    onChange={(e) => {
                      const updatedFields = [...customFields];
                      updatedFields[index].required = e.target.checked;
                      setCustomFields(updatedFields);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`required-${field.id}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    Required field
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const updatedFields = customFields.filter(
                      (_, i) => i !== index
                    );
                    setCustomFields(updatedFields);
                  }}
                  className="px-3 py-1 text-red-600 hover:text-red-800 font-medium"
                >
                  Remove Field
                </button>
              </div>
            </div>
          ))}

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
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 hover:border-gray-400 transition-colors duration-200"
          >
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Custom Field
            </div>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Instructions
        </label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          rows="4"
          placeholder="Enter test instructions for candidates..."
        />
      </div>
    </div>
  );
}
