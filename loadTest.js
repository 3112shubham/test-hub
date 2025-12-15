import axios from "axios";

const TEST_ID = "IM6ziLwRbXo4EsQ8qPtd";

const QUESTIONS = [
  { type: "mcq", options: 4 },
  { type: "mcq", options: 4 },
  { type: "mcq", options: 4 },
  { type: "mcq", options: 4 },
  { type: "mcq", options: 4 },
  { type: "mcq", options: 4 },
  { type: "mcq", options: 4 },
  { type: "mcq", options: 4 },
  { type: "mcq", options: 4 },
  { type: "mcq", options: 4 },
  { type: "mcq", options: 4 },
  { type: "mcq", options: 4 },
  { type: "mcq", options: 4 },
  { type: "mcq", options: 4 },
  { type: "mcq", options: 4 },

  { type: "multiple", options: 4 },
  { type: "multiple", options: 4 },
  { type: "multiple", options: 4 },
  { type: "multiple", options: 4 }
];

function randomEmail() {
  const id = Math.random().toString(36).substring(2, 10);
  return `ajay@gmail.com`;
}

function randomMCQ(options) {
  // 0 to options-1, OR null (skipped)
  const values = [...Array(options).keys(), null];
  return values[Math.floor(Math.random() * values.length)];
}

function randomMultiple(options) {
  return [...Array(options).keys()].filter(() => Math.random() > 0.5);
}

function generateAnswersArr() {
  return QUESTIONS.map((q, i) => {
    return {
      questionIndex: i,
      questionType: q.type,
      answer:
        q.type === "mcq"
          ? randomMCQ(q.options)
          : randomMultiple(q.options)
    };
  });
}

async function sendSubmission(i) {
  const email = randomEmail();

  const body = {
    testId: TEST_ID,
    meta: {
      testName: "test",
      totalQuestions: QUESTIONS.length
    },
    response: [
      {
        customArr: [{ key: "default-email", value: email }],
        answersArr: generateAnswersArr(),
        meta: { testName: "test" },
        status: "active",
        submittedAt: new Date().toISOString()
      }
    ]
  };

  try {
    const res = await axios.post(
      "https://test-hub-5tlx.vercel.app/api/test-submissions",
      body
    );

    console.log(`✔ Sent ${i + 1} / 1000`);
  } catch (err) {
    console.log(
      `❌ Error on submission ${i + 1}`,
      err?.response?.status,
      err?.response?.data
    );
  }
}

async function run() {
  for (let i = 0; i < 2; i++) {
    await sendSubmission(i);
  }
}

run();