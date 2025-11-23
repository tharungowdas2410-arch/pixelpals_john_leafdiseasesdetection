import axios from "axios";
import { env } from "../config/env";

type GeminiDescription = {
  speciesName: string;
  about: string;
  cause: string;
  curability: string;
  steps: string[];
  precautions?: string[];
};

const buildPrompt = (role: string, input: Record<string, unknown>) => {
  const base = {
    role,
    species: input["species"],
    disease: input["disease"],
    severity: input["severity"],
    qualityIndex: input["qualityIndex"],
    medicinalValue: input["medicinalValue"],
    nutritionalInfo: input["nutritionalValue"] ?? input["nutritionalInfo"],
    toxicityRisk: input["toxicityRisk"]
  };
  return `You are an expert agronomist and plant pathologist specializing in plant disease treatment.

Given the following plant disease information:
- Species: ${base.species}
- Disease: ${base.disease}
- Severity: ${base.severity}
- Quality Index: ${base.qualityIndex}%

Provide a detailed treatment plan in JSON format with the following structure:
{
  "speciesName": "Full scientific/common name of the plant",
  "about": "Brief 2-3 sentence description of the disease",
  "cause": "What causes this disease (pathogens, environmental factors, etc.)",
  "curability": "Is this disease curable? What is the prognosis?",
  "steps": [
    "Step 1: Detailed first treatment step",
    "Step 2: Detailed second treatment step",
    "Step 3: Detailed third treatment step",
    "Step 4: Detailed fourth treatment step",
    "Step 5: Detailed fifth treatment step",
    "Step 6: Detailed sixth treatment step",
    "Step 7: Detailed seventh treatment step",
    "Step 8: Detailed eighth treatment step",
    "Step 9: Detailed ninth treatment step",
    "Step 10: Detailed tenth treatment step"
  ],
  "precautions": [
    "Important safety precaution 1",
    "Important safety precaution 2",
    "Important safety precaution 3"
  ]
}

IMPORTANT: 
- You MUST provide exactly 10 steps in the "steps" array
- Each step should be specific, actionable, and detailed
- Steps should be in chronological order of treatment
- Include organic and chemical treatment options where applicable
- Respond ONLY with valid JSON, no additional text`;
};

const callGemini = async (prompt: string): Promise<GeminiDescription | null> => {
  if (!env.GEMINI_API_KEY) return null;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };
    const res = await axios.post(url, body, { timeout: 20000 });
    const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) return null;
    try {
      const parsed = JSON.parse(text);
      return parsed as GeminiDescription;
    } catch {
      const sentences = text
        .split(/[\r\n\.]+/)
        .map((s: string) => s.trim())
        .filter((s: string) => Boolean(s));
      const steps = sentences.slice(0, 10);
      return {
        speciesName: "",
        about: sentences.join(". "),
        cause: "",
        curability: "",
        steps,
        precautions: []
      };
    }
  } catch {
    return null;
  }
};

export const generateDescription = async (role: string, input: Record<string, unknown>) => {
  const prompt = buildPrompt(role, input);
  const desc = await callGemini(prompt);
  const d: GeminiDescription = desc ?? {
    speciesName: String(input["species"] ?? ""),
    about: "",
    cause: "",
    curability: "",
    steps: [],
    precautions: []
  };
  if (!d.speciesName && typeof input["species"] === "string") {
    d.speciesName = String(input["species"]);
  }
  const defaultsByRole: Record<string, string[]> = {
    FARMER: [
      "Inspect leaves daily",
      "Isolate infected plants",
      "Remove severely affected leaves",
      "Apply recommended fungicide",
      "Adjust irrigation to avoid wet foliage",
      "Improve airflow between rows",
      "Sanitize tools after use",
      "Rotate crops next season",
      "Mulch to reduce splash",
      "Monitor results and reapply as needed"
    ],
    AGRICULTURAL_INDUSTRY: [
      "Calibrate sensors",
      "Log readings to system",
      "Adjust NPK program",
      "Schedule field scouting",
      "Update irrigation schedule",
      "Apply integrated pest management",
      "Review soil tests",
      "Train staff on safety",
      "Document interventions",
      "Evaluate yield impact"
    ],
    PHARMACEUTICAL_INDUSTRY: [
      "Verify specimen identity",
      "Record collection site",
      "Assess quality parameters",
      "Screen for contaminants",
      "Apply validated processing",
      "Store under GMP conditions",
      "Track batch metadata",
      "Run toxicity checks",
      "Document pharmacopoeia compliance",
      "Review stability over time"
    ]
  };
  const precautionsDefaults = [
    "Use appropriate PPE",
    "Follow label directions",
    "Avoid runoff and drift",
    "Keep detailed records"
  ];
  const stepList = Array.isArray(d.steps) ? d.steps.slice() : [];
  const precList = Array.isArray(d.precautions) ? d.precautions.slice() : [];
  let count = stepList.length + precList.length;
  const roleDefaults = defaultsByRole[role] ?? defaultsByRole.FARMER;
  let i = 0;
  while (count < 10 && i < roleDefaults.length) {
    stepList.push(roleDefaults[i]);
    i++;
    count = stepList.length + precList.length;
  }
  let j = 0;
  while (count < 10 && j < precautionsDefaults.length) {
    precList.push(precautionsDefaults[j]);
    j++;
    count = stepList.length + precList.length;
  }
  d.steps = stepList;
  d.precautions = precList;
  return d;
};

export type { GeminiDescription };
