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
    <div className="space-y-4">
      {/* Compact header + single-line name */}
      <div>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
          <div className="w-2 h-2 bg-gradient-to-r from-[#1D4ED8] to-[#00BCD4] rounded-full" />
          <span className="sr-only">Test Name</span>
          <span className="text-sm">Test Name *</span>
        </label>
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          className="w-full border border-blue-100 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] transition-colors bg-white placeholder-gray-400"
          placeholder="Enter a descriptive test name..."
          required
        />
      </div>

      {/* Dense grid: domain, password, short description */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
        {/* Domain Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Test Domain *
          </label>
          <div className="relative">
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full border border-blue-100 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] appearance-none bg-white cursor-pointer"
              required
            >
              <option value="" className="text-gray-400">Select a domain...</option>
              {domains.map((domainOption) => (
                <option key={domainOption.value} value={domainOption.value}>
                  {domainOption.label}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[#1D4ED8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Password (compact) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
          <div className="relative">
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-blue-100 rounded-md px-3 py-2 pl-10 text-sm focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] bg-white font-mono"
              placeholder="Access password"
            />
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-[#1D4ED8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Password is required for students to start the test</p>
        </div>

        {/* Short Description (compact textarea) */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-blue-100 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] bg-white resize-none"
            rows={2}
            placeholder="Brief domain description"
          />
        </div>
      </div>

      {/* Subtle separator */}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
        <div className="w-1.5 h-1.5 bg-[#00BCD4] rounded-full" />
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
      </div>
    </div>
  );
}