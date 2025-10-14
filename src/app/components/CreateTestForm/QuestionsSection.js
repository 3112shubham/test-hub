import QuestionForm from "./QuestionForm";
import QuestionsList from "./QuestionsList";

export default function QuestionsSection({
  question,
  setQuestion,
  options,
  setOptions,
  correctOptions, // Changed from correctOption
  setCorrectOptions, // Changed from setCorrectOption
  questions,
  handleAddQuestion,
  deleteQuestion,
  clearAllQuestions,
}) {
  return (
    <div className="space-y-6">
      <QuestionForm
        question={question}
        setQuestion={setQuestion}
        options={options}
        setOptions={setOptions}
        correctOptions={correctOptions}
        setCorrectOptions={setCorrectOptions}
        handleAddQuestion={handleAddQuestion}
      />

      <QuestionsList
        questions={questions}
        deleteQuestion={deleteQuestion}
        clearAllQuestions={clearAllQuestions}
      />
    </div>
  );
}
