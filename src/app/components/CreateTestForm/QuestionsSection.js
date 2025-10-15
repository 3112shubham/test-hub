import QuestionForm from "./QuestionForm";
import QuestionsList from "./QuestionsList";

export default function QuestionsSection({
  question,
  setQuestion,
  options,
  setOptions,
  correctOptions,
  setCorrectOptions,
  questions,
  handleAddQuestion,
  deleteQuestion,
  clearAllQuestions,
  // New props for question types
  questionType,
  setQuestionType,
  textAnswer,
  setTextAnswer,
  trueFalseAnswer,
  setTrueFalseAnswer,
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
        // New props for question types
        questionType={questionType}
        setQuestionType={setQuestionType}
        textAnswer={textAnswer}
        setTextAnswer={setTextAnswer}
        trueFalseAnswer={trueFalseAnswer}
        setTrueFalseAnswer={setTrueFalseAnswer}
      />

      <QuestionsList
        questions={questions}
        deleteQuestion={deleteQuestion}
        clearAllQuestions={clearAllQuestions}
      />
    </div>
  );
}
