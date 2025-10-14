export default function CustomFields({ customFields, setCustomFields }) {
  const commonFields = [
    {
      key: "College",
      label: "🏫 College",
      description: "Add college/university name",
    },
    {
      key: "Department",
      label: "🎓 Department",
      description: "Add department/branch",
    },
    {
      key: "Academic Year",
      label: "📅 Academic Year",
      description: "Add academic year",
    },
    { key: "Course", label: "📚 Course", description: "Add course name" },
  ];

  return (
    <>
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Additional Information
          </h3>
          <button
            type="button"
            onClick={() =>
              setCustomFields([...customFields, { key: "", value: "" }])
            }
            className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Custom Field</span>
          </button>
        </div>

        <div className="space-y-3">
          {customFields.map((field, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Name
                </label>
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => {
                    const newFields = [...customFields];
                    newFields[index].key = e.target.value;
                    setCustomFields(newFields);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., College, Department, Year, etc."
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value
                </label>
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => {
                    const newFields = [...customFields];
                    newFields[index].value = e.target.value;
                    setCustomFields(newFields);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter value..."
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const newFields = customFields.filter((_, i) => i !== index);
                  setCustomFields(newFields);
                }}
                className="mt-6 text-red-600 hover:text-red-700 p-2"
              >
                🗑️
              </button>
            </div>
          ))}

          {customFields.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-600">No custom fields added yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Add fields like College, Department, etc.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Common Fields
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commonFields.map((commonField) => (
            <button
              key={commonField.key}
              type="button"
              onClick={() =>
                setCustomFields([
                  ...customFields,
                  { key: commonField.key, value: "" },
                ])
              }
              className="p-3 border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-gray-800">
                {commonField.label}
              </div>
              <div className="text-sm text-gray-600">
                {commonField.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
