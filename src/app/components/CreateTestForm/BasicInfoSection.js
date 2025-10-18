export default function BasicInfoSection({
  testName,
  setTestName,
  domain,
  setDomain,
  description,
  setDescription,
  domains,
}) {
  return (
    <div className="space-y-6">
      {/* Test Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Name *
        </label>
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Enter a descriptive test name..."
          required
        />
      </div>

      {/* Test Domain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Domain *
          </label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          >
            <option value="">Select a domain...</option>
            {domains.map((domainOption) => (
              <option key={domainOption.value} value={domainOption.value}>
                {domainOption.label}
              </option>
            ))}
          </select>
        </div>

        {/* Domain Description (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Domain Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            rows={1}
            placeholder="Enter a description for the domain (optional)..."
          />
        </div>
      </div>
    </div>
  );
}
