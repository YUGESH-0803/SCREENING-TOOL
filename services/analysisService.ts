
import { AssessmentData, AIAnalysis } from "../types";

/**
 * Generates a performance-based neurological screening analysis locally.
 * This is a deterministic algorithmic model that functions 100% offline.
 */
export async function analyzeAssessment(data: AssessmentData): Promise<AIAnalysis> {
  const stats = data.roundStats;
  let score = 92; // Baseline

  // 1. Reaction Time Penalty (Motor Speed)
  // Standard healthy reaction is ~250ms-350ms on mobile/web
  if (stats.reaction?.averageReactionTime > 400) score -= 12;
  if (stats.reaction?.averageReactionTime > 600) score -= 15;
  
  // 2. Memory Span (Visual Recall)
  if (stats.memory?.memoryScore < 3) score -= 20;
  else if (stats.memory?.memoryScore < 5) score -= 5;
  
  // 3. Cognitive Control (Stroop Accuracy)
  if (stats.stroop?.accuracy < 80) score -= 15;
  else if (stats.stroop?.accuracy < 95) score -= 5;

  // 4. Sequencing (Executive Function)
  if (stats.sequencing?.sequencingTime > 8000) score -= 10;

  const finalScore = Math.max(5, score);

  const analysis: AIAnalysis = {
    healthScore: finalScore,
    summary: `Quantitative analysis complete. Your screening indicates a performance index of ${finalScore}/100. This is calculated based on your motor latency (${stats.reaction?.averageReactionTime?.toFixed(0)}ms), cognitive interference resolution, and visual-spatial memory capacity.`,
    riskIndicators: [
      stats.reaction?.averageReactionTime > 450 ? "Slightly elevated motor response latency." : "Motor processing speed is optimal.",
      stats.memory?.memoryScore < 3 ? "Pattern retention capacity is below reference baseline." : "Strong short-term visual memory recall.",
      stats.stroop?.accuracy < 85 ? "Evidence of cognitive interference during executive tasks." : "High level of inhibitory control detected."
    ],
    recommendations: [
      "Keep a digital log of these results to track cognitive trends over time.",
      "Engage in processing-speed drills (like rapid naming or reaction games).",
      "Consult a healthcare professional if you notice persistent changes in daily coordination or memory."
    ]
  };

  // 1.5s delay to simulate 'calculating' feel for better UX
  return new Promise((resolve) => setTimeout(() => resolve(analysis), 1500));
}
