export default function BasicInfoSection({
  testName,
  setTestName,
  domain,
  setDomain,
  domains,
}) {
  const getDomainDescription = () => {
    const selected = domains.find((d) => d.value === domain);
    return selected
      ? selected.description
      : "Select a domain to see description";
  };

  return (
    <div className="space-y-6">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Domain Description
          </label>
          <div className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 min-h-[52px] flex items-center">
            <p
              className={`text-sm ${
                domain ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {getDomainDescription()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
