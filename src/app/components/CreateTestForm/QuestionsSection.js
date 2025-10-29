"use client";

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
  questionType,
  setQuestionType,
  textAnswer,
  setTextAnswer,
  trueFalseAnswer,
  setTrueFalseAnswer,
  editIndex = null,
  onSelectQuestion,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 h-full">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #bbb;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #ccc #f1f1f1;
        }
      `}</style>
      <div className="lg:col-span-1 min-h-0 h-full">
        <div className="h-full">
          <QuestionForm
            question={question}
            setQuestion={setQuestion}
            options={options}
            setOptions={setOptions}
            correctOptions={correctOptions}
            setCorrectOptions={setCorrectOptions}
            handleAddQuestion={handleAddQuestion}
            questionType={questionType}
            setQuestionType={setQuestionType}
            textAnswer={textAnswer}
            setTextAnswer={setTextAnswer}
            trueFalseAnswer={trueFalseAnswer}
            setTrueFalseAnswer={setTrueFalseAnswer}
            isEditing={editIndex !== null}
          />
        </div>
      </div>

      <div className="lg:col-span-1 h-full">
        <QuestionsList
          questions={questions}
          deleteQuestion={deleteQuestion}
          clearAllQuestions={clearAllQuestions}
          onSelectQuestion={onSelectQuestion}
        />
      </div>
    </div>
  );
}