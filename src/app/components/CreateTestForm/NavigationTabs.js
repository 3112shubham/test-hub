export default function NavigationTabs({
  activeSection,
  setActiveSection,
  questionsLength,
}) {
  const sections = [
    { id: "basic", label: "📝 Basic Information" },
    { id: "details", label: "⚙️ Test Details" },
    { id: "questions", label: `❓ Questions (${questionsLength})` },
  ];

  return (
    <div className="flex space-x-4 border-b border-gray-200">
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => setActiveSection(section.id)}
          className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
            activeSection === section.id
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
}
