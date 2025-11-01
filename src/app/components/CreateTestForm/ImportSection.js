"use client";

import { useState } from 'react';
import { toast } from 'sonner';

export default function ImportSection({ importQuestions }) {
  const [topic, setTopic] = useState('');
  const [topics, setTopics] = useState('');
  const [level, setLevel] = useState('intermediate');
  const [questionCounts, setQuestionCounts] = useState({
    mcq: 0,
    multiple: 0,
    truefalse: 0,
    text: 0,
  });
  const [jsonText, setJsonText] = useState('');

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
  ];

  const generatePrompt = () => {
    const prompt = `Please create a ${level} level test about "${topic}" with the following structure:

${questionCounts.mcq > 0 ? `- ${questionCounts.mcq} Multiple Choice Questions (single correct answer)` : ''}
${questionCounts.multiple > 0 ? `- ${questionCounts.multiple} Multiple Select Questions (multiple correct answers)` : ''}
${questionCounts.truefalse > 0 ? `- ${questionCounts.truefalse} True/False Questions` : ''}
${questionCounts.text > 0 ? `- ${questionCounts.text} Long Text Answer Questions` : ''}

${topics ? `Topics: ${topics}

If subtopics are provided, generate questions around those specific subtopics. If no subtopics are provided, generate questions only around the main topic.` : 'If subtopics are provided, generate questions around those specific subtopics. If no subtopics are provided, generate questions only around the main topic.'}

Each question should be clear, concise, and appropriate for the ${level} level.
For MCQs and Multiple Select questions, provide 4-5 options with clear correct answer(s).
For Short and Text answers, provide sample correct answers or key points that should be included in the answer.

IMPORTANT: Please provide the output in this exact JSON format:`;

    // Build JSON examples based on selected question types
    const jsonExamples = [];
    
    if (questionCounts.mcq > 0) {
      jsonExamples.push(`  {
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctOptions": [2],
    "type": "mcq"
  }`);
    }
    
    if (questionCounts.multiple > 0) {
      jsonExamples.push(`  {
    "question": "Which of the following are programming languages? (Select all that apply)",
    "options": ["HTML", "CSS", "JavaScript", "Python", "JPEG"],
    "correctOptions": [2, 3],
    "type": "multiple"
  }`);
    }
    
    if (questionCounts.truefalse > 0) {
      jsonExamples.push(`  {
    "question": "The Earth is round.",
    "type": "truefalse",
    "trueFalseAnswer": true
  }`);
    }
    
    if (questionCounts.text > 0) {
      jsonExamples.push(`  {
    "question": "Explain the concept of recursion in programming.",
    "type": "text",
    "textAnswer": "Recursion is a programming technique where a function calls itself to solve a problem by breaking it down into smaller, similar subproblems."
  }`);
    }

    const fullPrompt = prompt + '\n\n[\n' + jsonExamples.join(',\n') + '\n]';

    return fullPrompt.trim();
  };

  const copyPrompt = () => {
    const prompt = generatePrompt();
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard! 📋');
  };

  const submitJson = (importer) => {
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      toast.error('Invalid JSON. Please check the pasted content.');
      return;
    }

    // If the JSON is an object with a 'questions' field, prefer that
    if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
      parsed = parsed.questions;
    }

    if (!Array.isArray(parsed)) {
      toast.error('JSON must be an array of questions or an object with a "questions" array.');
      return;
    }

    // If parent importer function provided, call it. Otherwise, persist to localStorage as fallback
    if (typeof importer === 'function') {
      importer(parsed);
      toast.success(`Imported ${parsed.length} questions ✅`);
      setJsonText('');
    } else {
      // Store in localStorage so user can navigate to Questions tab to see them
      localStorage.setItem('questions', JSON.stringify(parsed.map(q => ({
        question: q.question || q.prompt || '',
        options: Array.isArray(q.options) ? q.options : [],
        correctOptions: Array.isArray(q.correctOptions) ? q.correctOptions : [],
        type: q.type || (q.trueFalseAnswer !== undefined ? 'truefalse' : q.textAnswer ? 'text' : 'mcq'),
        textAnswer: q.textAnswer,
        trueFalseAnswer: q.trueFalseAnswer,
      }))));
      toast.success(`Saved ${parsed.length} questions to local storage. Go to Questions tab to review.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter topic for the test..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {levels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topics
        </label>
        <input
          type="text"
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="(Enter main topic and subtopics. Example: aptitude:profit loss,calculation,bank,finance)"
        />
        <p className="text-xs text-gray-500 mt-1">
          If subtopics are entered, questions will be generated around those specific subtopics.<br />
          If no subtopics entered, questions will be generated only around the main topic.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Question Distribution</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(questionCounts).map(([type, count]) => (
            <div key={type} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {type === 'truefalse' ? 'TRUE/FALSE' : type.toUpperCase()}
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setQuestionCounts(prev => ({
                    ...prev,
                    [type]: Math.max(0, prev[type] - 1)
                  }))}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-lg flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setQuestionCounts(prev => ({
                    ...prev,
                    [type]: Math.max(0, parseInt(e.target.value) || 0)
                  }))}
                  className="w-16 text-center border border-gray-300 rounded-lg px-2 py-1"
                  min="0"
                />
                <button
                  type="button"
                  onClick={() => setQuestionCounts(prev => ({
                    ...prev,
                    [type]: prev[type] + 1
                  }))}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-lg flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generated Prompt</h3>
        <div className="bg-gray-50 rounded-lg p-4 relative">
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {generatePrompt()}
          </pre>
          <button
            onClick={copyPrompt}
            className="absolute top-4 right-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Copy Prompt
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Upload JSON</h3>
        <p className="text-sm text-gray-600 mb-2">Paste the full JSON for the test questions below and click <strong>Submit JSON</strong>.</p>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="w-full h-48 border border-gray-300 rounded-lg p-3 text-sm bg-white"
          placeholder={`Paste JSON here, e.g.

[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOptions": [0],
    "type": "mcq"
  }
]`}
        />
        <div className="flex items-center space-x-3 mt-3">
          <button
            type="button"
            onClick={() => submitJson(importQuestions)}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            Submit JSON
          </button>
          <button
            type="button"
            onClick={() => setJsonText('')}
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}