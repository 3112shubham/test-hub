/**
 * concurrent-spike-test.js
 *
 * Tests true concurrent load (thundering herd scenario)
 * Simulates 1000 users clicking submit at the exact same moment
 *
 * Usage:
 *   node concurrent-spike-test.js
 *
 * Environment variables:
 *   BASE_URL - required. e.g. http://localhost:3000
 *   CONCURRENCY - number of concurrent requests (default: 1000)
 *   BATCH_SIZE - size of concurrent batches (default: 100)
 */

import { performance } from "perf_hooks";
import http from "http";
import https from "https";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const CONCURRENCY = parseInt(process.env.CONCURRENCY || "1000", 10);
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "100", 10);
const TARGET = `${BASE_URL.replace(/\/$/, "")}/api/test-submissions`;

// Keep-alive agent for connection reuse
const agent = BASE_URL.startsWith("https")
  ? new https.Agent({ keepAlive: true, maxSockets: CONCURRENCY })
  : new http.Agent({ keepAlive: true, maxSockets: CONCURRENCY });

console.log(`╔═══════════════════════════════════════════════════════╗`);
console.log(`║       CONCURRENT SPIKE TEST (Thundering Herd)        ║`);
console.log(`╚═══════════════════════════════════════════════════════╝`);
console.log(`\nTarget:      ${TARGET}`);
console.log(`Concurrency: ${CONCURRENCY} simultaneous requests`);
console.log(`Batch size:  ${BATCH_SIZE} (to avoid local resource limits)\n`);

function randomString(len = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function makePayload(i) {
  const questions = [
    {
      type: "mcq",
      question: "Sample MCQ",
      options: ["A", "B", "C"],
      answer: 0,
    },
    {
      type: "multiple",
      question: "Sample multiple",
      options: ["X", "Y", "Z"],
      answer: [0, 2],
    },
    { type: "truefalse", question: "Sample TF", answer: 1 },
    {
      type: "text",
      question: "Explain ISR",
      answer: "ISR regenerates pages on request.",
    },
  ];

  const answers = questions.map((q, idx) => ({
    questionIndex: idx,
    answer: q.answer,
    questionType: q.type,
  }));

  const customArr = [
    { key: "name", value: `spike-user-${i}-${randomString(4)}` },
    { key: "email", value: `spike${i}@test.com` },
  ];

  return {
    testId: `spiketest`,
    response: [
      { customArr, answersArr: answers, meta: { testName: "Spike Test" } },
    ],
    meta: { testName: "Spike Test", totalQuestions: questions.length },
    status: "active",
    submittedAt: new Date().toISOString(),
  };
}

async function sendOne(index) {
  const payload = makePayload(index);
  const start = performance.now();

  try {
    const res = await fetch(TARGET, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      agent,
    });

    const text = await res.text();
    const timeMs = performance.now() - start;

    return {
      ok: res.ok,
      status: res.status,
      timeMs,
      bodySnippet: text ? text.slice(0, 200) : "",
      index,
    };
  } catch (err) {
    const timeMs = performance.now() - start;
    return {
      ok: false,
      status: 0,
      timeMs,
      error: err.message || String(err),
      index,
    };
  }
}

async function runConcurrentBatches(total, batchSize) {
  console.log(
    `⏳ Launching ${total} concurrent requests in batches of ${batchSize}...\n`
  );

  const overallStart = performance.now();
  let results = [];
  let completed = 0;

  for (let i = 0; i < total; i += batchSize) {
    const batchNum = Math.floor(i / batchSize) + 1;
    const batchCount = Math.min(batchSize, total - i);

    process.stdout.write(
      `Batch ${batchNum}: Launching ${batchCount} requests... `
    );

    const batchStart = performance.now();
    const batch = await Promise.allSettled(
      Array.from({ length: batchCount }, (_, j) => sendOne(i + j))
    );
    const batchTime = performance.now() - batchStart;

    results.push(...batch);
    completed += batchCount;

    const batchSuccess = batch.filter(
      (r) => r.status === "fulfilled" && r.value.ok
    ).length;
    console.log(
      `✓ Done in ${(batchTime / 1000).toFixed(
        2
      )}s (${batchSuccess}/${batchCount} ok, ${completed}/${total} total)`
    );
  }

  const overallTime = performance.now() - overallStart;
  console.log(
    `\n✅ All requests completed in ${(overallTime / 1000).toFixed(2)}s\n`
  );

  return { results, overallTime };
}

function analyzeResults(results) {
  const normalized = results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { ok: false, status: 0, timeMs: 0, error: String(r.reason), index: -1 }
  );

  const successful = normalized.filter((r) => r.ok);
  const failed = normalized.filter((r) => !r.ok);
  const times = normalized.map((r) => r.timeMs || 0).filter((t) => t > 0);

  // Group failures by error type
  const errorGroups = {};
  failed.forEach((f) => {
    const errorKey = f.error || `HTTP ${f.status}` || "Unknown";
    errorGroups[errorKey] = (errorGroups[errorKey] || 0) + 1;
  });

  // Calculate percentiles
  const sorted = times.slice().sort((a, b) => a - b);
  const stats = {
    total: normalized.length,
    successful: successful.length,
    failed: failed.length,
    successRate: (successful.length / normalized.length) * 100,
    times: {
      min: sorted[0] || 0,
      p10: percentile(sorted, 10),
      p25: percentile(sorted, 25),
      p50: percentile(sorted, 50),
      p75: percentile(sorted, 75),
      p90: percentile(sorted, 90),
      p95: percentile(sorted, 95),
      p99: percentile(sorted, 99),
      max: sorted[sorted.length - 1] || 0,
      avg: sorted.reduce((a, b) => a + b, 0) / sorted.length || 0,
    },
    errorGroups,
    throughput:
      normalized.length / (sorted.reduce((a, b) => a + b, 0) / 1000) || 0,
  };

  return { normalized, successful, failed, stats };
}

function printReport(analysis, overallTime) {
  const { stats, failed } = analysis;

  console.log(`╔═══════════════════════════════════════════════════════╗`);
  console.log(`║                    TEST RESULTS                       ║`);
  console.log(`╚═══════════════════════════════════════════════════════╝\n`);

  // Overall Summary
  console.log(`📊 OVERALL SUMMARY`);
  console.log(`${"─".repeat(55)}`);
  console.log(`Total Requests:      ${stats.total}`);
  console.log(
    `Successful:          ${stats.successful} (${stats.successRate.toFixed(
      2
    )}%)`
  );
  console.log(`Failed:              ${stats.failed}`);
  console.log(`Wall Clock Time:     ${(overallTime / 1000).toFixed(2)}s`);
  console.log(`Avg Throughput:      ${stats.throughput.toFixed(1)} req/s\n`);

  // Response Time Analysis
  console.log(`⏱️  RESPONSE TIME ANALYSIS (milliseconds)`);
  console.log(`${"─".repeat(55)}`);
  console.log(`Minimum:             ${stats.times.min.toFixed(1)}ms`);
  console.log(`10th percentile:     ${stats.times.p10.toFixed(1)}ms`);
  console.log(`25th percentile:     ${stats.times.p25.toFixed(1)}ms`);
  console.log(
    `50th percentile:     ${stats.times.p50.toFixed(1)}ms  ${getEmoji(
      stats.times.p50
    )}`
  );
  console.log(`75th percentile:     ${stats.times.p75.toFixed(1)}ms`);
  console.log(
    `90th percentile:     ${stats.times.p90.toFixed(1)}ms  ${getEmoji(
      stats.times.p90
    )}`
  );
  console.log(`95th percentile:     ${stats.times.p95.toFixed(1)}ms`);
  console.log(
    `99th percentile:     ${stats.times.p99.toFixed(1)}ms  ${getEmoji(
      stats.times.p99
    )}`
  );
  console.log(`Maximum:             ${stats.times.max.toFixed(1)}ms`);
  console.log(`Average:             ${stats.times.avg.toFixed(1)}ms\n`);

  // Performance Assessment
  console.log(`🎯 PERFORMANCE ASSESSMENT`);
  console.log(`${"─".repeat(55)}`);
  assessPerformance(stats);

  // Error Analysis
  if (Object.keys(stats.errorGroups).length > 0) {
    console.log(`\n❌ ERROR BREAKDOWN`);
    console.log(`${"─".repeat(55)}`);
    Object.entries(stats.errorGroups)
      .sort((a, b) => b[1] - a[1])
      .forEach(([error, count]) => {
        console.log(
          `${error.slice(0, 45).padEnd(45)} ${count.toString().padStart(5)}`
        );
      });
  }

  // Sample failures
  if (failed.length > 0) {
    console.log(`\n🔍 SAMPLE FAILURES (first 5)`);
    console.log(`${"─".repeat(55)}`);
    failed.slice(0, 5).forEach((f, idx) => {
      console.log(
        `#${idx + 1}: [${f.status || 0}] ${f.timeMs.toFixed(0)}ms - ${
          f.error || f.bodySnippet || "Unknown"
        }`
      );
    });
  }

  console.log(`\n${"═".repeat(55)}\n`);
}

function getEmoji(ms) {
  if (ms < 500) return "🟢 Excellent";
  if (ms < 1000) return "🟡 Good";
  if (ms < 3000) return "🟠 Acceptable";
  return "🔴 Poor";
}

function assessPerformance(stats) {
  const p50 = stats.times.p50;
  const p95 = stats.times.p95;
  const successRate = stats.successRate;

  console.log(
    `Success Rate:        ${successRate.toFixed(2)}% ${
      successRate >= 99.5 ? "🟢" : successRate >= 95 ? "🟡" : "🔴"
    }`
  );
  console.log(`P50 Response:        ${getEmoji(p50)}`);
  console.log(`P95 Response:        ${getEmoji(p95)}`);

  console.log(`\nVERDICT:`);
  if (successRate >= 99.5 && p95 < 1000) {
    console.log(`✅ EXCELLENT - System handles spike well!`);
  } else if (successRate >= 99 && p95 < 3000) {
    console.log(`✓  GOOD - Acceptable under extreme load`);
  } else if (successRate >= 95 && p95 < 5000) {
    console.log(`⚠️  MARGINAL - Needs optimization`);
  } else {
    console.log(`❌ POOR - System struggles with concurrent load`);
  }

  // Recommendations
  console.log(`\nRECOMMENDATIONS:`);
  if (p95 > 3000) {
    console.log(`• Response times too high - consider:`);
    console.log(`  - Database connection pooling optimization`);
    console.log(`  - Add caching layer (Redis)`);
    console.log(`  - Database indexing`);
    console.log(`  - Horizontal scaling`);
  }
  if (successRate < 99) {
    console.log(`• Success rate too low - check:`);
    console.log(`  - Database connection limits`);
    console.log(`  - Serverless timeout settings`);
    console.log(`  - Memory allocation`);
    console.log(`  - Error handling`);
  }
  if (
    stats.failed > 0 &&
    Object.keys(stats.errorGroups).some((k) => k.includes("timeout"))
  ) {
    console.log(`• Timeout errors detected - increase:`);
    console.log(`  - Function timeout limits`);
    console.log(`  - Database query timeout`);
  }
}

function percentile(sortedArr, p) {
  if (!sortedArr.length) return 0;
  const idx = Math.ceil((p / 100) * sortedArr.length) - 1;
  return sortedArr[Math.max(0, idx)];
}

// Main execution
(async () => {
  try {
    const { results, overallTime } = await runConcurrentBatches(
      CONCURRENCY,
      BATCH_SIZE
    );
    const analysis = analyzeResults(results);
    printReport(analysis, overallTime);
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
})();
