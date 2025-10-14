import QuestionForm from "./QuestionForm";
import QuestionsList from "./QuestionsList";

export default function QuestionsSection({
  question,
  setQuestion,
  options,
  setOptions,
  correctOption,
  setCorrectOption,
  optionCount,
  setOptionCount,
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
        correctOption={correctOption}
        setCorrectOption={setCorrectOption}
        optionCount={optionCount}
        setOptionCount={setOptionCount}
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
