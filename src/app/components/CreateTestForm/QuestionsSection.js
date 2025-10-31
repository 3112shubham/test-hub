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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      <div className="lg:col-span-2 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden">
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

      <div className="lg:col-span-1 flex flex-col">
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