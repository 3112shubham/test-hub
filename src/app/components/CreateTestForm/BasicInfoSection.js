export default function BasicInfoSection({
  testName,
  setTestName,
  domain,
  setDomain,
  description,
  setDescription,
  domains,
  password,
  setPassword,
}) {
  return (
    <div className="space-y-6">
      {/* Test Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-[#1D4ED8] to-[#00BCD4] rounded-full"></div>
          Test Name *
        </label>
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          className="w-full border-2 border-blue-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4] transition-all duration-300 bg-white hover:border-blue-200 focus:bg-blue-25 placeholder-gray-400"
          placeholder="Enter a descriptive test name..."
          required
        />
      </div>

      {/* Test Domain and Description */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-[#1D4ED8] to-[#00BCD4] rounded-full"></div>
            Test Domain *
          </label>
          <div className="relative">
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full border-2 border-blue-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4] transition-all duration-300 bg-white hover:border-blue-200 appearance-none cursor-pointer"
              required
            >
              <option value="" className="text-gray-400">Select a domain...</option>
              {domains.map((domainOption) => (
                <option key={domainOption.value} value={domainOption.value}>
                  {domainOption.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-[#1D4ED8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Domain Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-[#00BCD4] to-[#6BBF59] rounded-full"></div>
            Domain Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border-2 border-blue-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4] transition-all duration-300 bg-white hover:border-blue-200 focus:bg-blue-25 resize-none placeholder-gray-400"
            rows={3}
            placeholder="Describe the domain focus area..."
          />
        </div>
      </div>

      {/* Test Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-r from-[#1D4ED8] to-[#00BCD4] rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          Test Password *
        </label>
        <div className="relative">
          <input
            type="text"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-blue-100 rounded-xl px-4 py-3 pl-12 focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4] transition-all duration-300 bg-white hover:border-blue-200 focus:bg-blue-25 placeholder-gray-400 font-mono"
            placeholder="Enter access password..."
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-6 h-6 text-[#1D4ED8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
          <div className="w-6 h-6 bg-[#6BBF59] rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <p className="text-sm text-gray-700">
            This password will be required for students to start the test
          </p>
        </div>
      </div>

      {/* Visual Separator */}
      <div className="flex items-center gap-4 pt-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
        <div className="w-2 h-2 bg-[#00BCD4] rounded-full"></div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
      </div>
    </div>
  );
}