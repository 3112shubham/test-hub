export default function TestSummary({
  testName,
  domain,
  domains,
  duration,
  questionsLength,
}) {
  return (
    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
      <h4 className="font-medium text-blue-900 mb-3">Test Summary</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-blue-600 font-medium">Test Name</div>
          <div>{testName || "Not set"}</div>
        </div>
        <div>
          <div className="text-blue-600 font-medium">Domain</div>
          <div>
            {domains.find((d) => d.value === domain)?.label || "Not set"}
          </div>
        </div>
        <div>
          <div className="text-blue-600 font-medium">Duration</div>
          <div>{duration ? `${duration} mins` : "Not set"}</div>
        </div>
        <div>
          <div className="text-blue-600 font-medium">Questions</div>
          <div>{questionsLength} added</div>
        </div>
      </div>
    </div>
  );
}
