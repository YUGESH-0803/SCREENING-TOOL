
import { AssessmentData, AIAnalysis } from "../types";

/**
 * Generates a performance-based neurological screening analysis locally.
 * This replaces the previous AI-based synthesis with deterministic algorithmic logic.
 */
export async function analyzeAssessment(data: AssessmentData): Promise<AIAnalysis> {
  const stats = data.roundStats;
  let score = 90; // Start with healthy baseline

  // Logic: Penalize for slow reaction (Threshold > 400ms)
  if (stats.reaction?.averageReactionTime > 400) score -= 15;
  if (stats.reaction?.averageReactionTime > 650) score -= 10;
  
  // Logic: Penalize for poor memory (Threshold < 3 levels)
  if (stats.memory?.memoryScore < 3) score -= 20;
  
  // Logic: Penalize for Stroop errors
  if (stats.stroop?.accuracy < 85) score -= 15;

  // Logic: Penalize for sequencing speed (Threshold > 7000ms)
  if (stats.sequencing?.sequencingTime > 7000) score -= 10;

  // Ensure score stays within 0-100
  const finalScore = Math.max(5, score);

  const analysis: AIAnalysis = {
    healthScore: finalScore,
    summary: `Based on the quantitative performance data, your primary cognitive markers show a health index of ${finalScore}/100. This calculation is derived from your response stability, visual memory span, and executive sequencing speed.`,
    riskIndicators: [
      stats.reaction?.averageReactionTime > 450 ? "Motor response latency is slightly outside standard baseline." : "Motor reaction speed is within stable range.",
      stats.memory?.memoryScore < 3 ? "Visual pattern retention shows reduced capacity." : "Robust visual-spatial memory recall.",
      stats.stroop?.accuracy < 80 ? "Executive control over cognitive interference is below average." : "Consistent cognitive interference resolution."
    ],
    recommendations: [
      "Consult a healthcare professional for a formal clinical evaluation of these performance markers.",
      "Engage in regular cognitive exercises targeting visual-spatial memory and rapid processing.",
      "Maintain a consistent sleep and nutrition schedule to optimize neural processing speeds."
    ]
  };

  // Simulate processing time for UX
  return new Promise((resolve) => setTimeout(() => resolve(analysis), 2000));
}
