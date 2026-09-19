import { importConversation } from "../lib/conversation/index";
import { detectProvider } from "../lib/conversation/detect";

const realTestCases = [
  {
    name: "ChatGPT (Phage-explorer design plan)",
    url: "https://chatgpt.com/share/69343092-91ac-800b-996c-7552461b9b70",
    expectedSource: "chatgpt",
  },
  {
    name: "ChatGPT (Flight Search)",
    url: "https://chatgpt.com/share/feacac46-4201-48c5-9fb6-e3109475c8c8",
    expectedSource: "chatgpt",
  },
  {
    name: "Claude (Open-source contribution review)",
    url: "https://claude.ai/share/549c846d-f6c8-411c-9039-a9a14db376cf",
    expectedSource: "claude",
  },
  {
    name: "Claude (Friendly Assistance Offered)",
    url: "https://claude.ai/share/d205d79c-ee72-4c32-9e89-b0328e6747c1",
    expectedSource: "claude",
  },
];

async function run() {
  console.log("=== RUNNING CONVERSATION IMPORTER VERIFICATION ===");

  let passed = 0;
  let failed = 0;

  for (const tc of realTestCases) {
    try {
      console.log(`\nTesting: ${tc.name}`);
      console.log(`URL: ${tc.url}`);

      const conv = await importConversation(tc.url);

      console.log(`✓ Title: "${conv.title}"`);
      console.log(`✓ Source: ${conv.source}`);
      console.log(`✓ Message count: ${conv.messages.length}`);
      console.log(`✓ First message: [${conv.messages[0].role}] ${conv.messages[0].content.slice(0, 80).replace(/\s+/g, ' ')}...`);
      console.log(`✓ Last message: [${conv.messages[conv.messages.length - 1].role}] ${conv.messages[conv.messages.length - 1].content.slice(0, 80).replace(/\s+/g, ' ')}...`);

      if (conv.source !== tc.expectedSource) {
        throw new Error(`Expected source ${tc.expectedSource}, got ${conv.source}`);
      }
      if (conv.messages.length === 0) {
        throw new Error("No messages extracted");
      }

      passed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`✗ FAILED: ${msg}`);
      failed++;
    }
  }

  // Test detection
  console.log("\n--- Testing URL Detection ---");
  const testUrls = [
    "https://chatgpt.com/share/abc-123",
    "https://chat.openai.com/share/def-456",
    "https://claude.ai/share/ghi-789",
    "https://gemini.google.com/share/jkl-012",
    "https://g.co/gemini/share/mno-345",
    "https://share.gemini.google/pqr-678",
  ];

  for (const u of testUrls) {
    const d = detectProvider(u);
    console.log(`✓ ${u} -> provider: ${d.provider}, shareId: ${d.shareId}`);
  }

  console.log(`\nSummary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

run();

