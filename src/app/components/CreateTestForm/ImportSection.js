"use client";

import { useState } from 'react';
import { toast } from 'sonner';

export default function ImportSection() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('intermediate');
  const [questionCounts, setQuestionCounts] = useState({
    mcq: 0,
    text: 0,
    short: 0,
    multiple: 0,
  });

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
${questionCounts.short > 0 ? `- ${questionCounts.short} Short Answer Questions` : ''}
${questionCounts.text > 0 ? `- ${questionCounts.text} Long Text Answer Questions` : ''}

Each question should be clear, concise, and appropriate for the ${level} level.
For MCQs and Multiple Select questions, provide 4-5 options with clear correct answer(s).
For Short and Text answers, provide sample correct answers or key points that should be included in the answer.`;

    return prompt.trim();
  };

  const copyPrompt = () => {
    const prompt = generatePrompt();
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard! 📋');
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

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Question Distribution</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(questionCounts).map(([type, count]) => (
            <div key={type} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {type.toUpperCase()}
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
    </div>
  );
}