export default function ProgressHeader({
  questionsLength,
  progressPercentage,
  testName
}) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Test
          </h2>
          <p className="text-gray-600">
            Complete all sections to create your assessment
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {questionsLength}
          </div>
          <div className="text-sm text-gray-500">Questions</div>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>{progressPercentage}% Complete</span>
        <div className="flex flex-col items-end justify-center text-rose-500">
          <span>
            {questionsLength > 3
              ? ""
              : "* Add atleast 3 questions to complete"}
          </span>
          <span>
            {testName
              ? ""
              : "* Test Name is missing"}
          </span>
        </div>
      </div>
    </div>
  );
}
