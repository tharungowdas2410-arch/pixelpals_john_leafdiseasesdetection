import { Request, Response } from "express";
import predictionService from "../services/prediction.service";
import { generateDescription } from "../services/gemini.service";

const predict = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" });
  }

  const user = req.user as { id: string; email: string; role: any };
  const { enriched, prediction } = await predictionService.predictAndStore(req.user as any, req.file.path);

  return res.json({
    predictionId: prediction.id,
    result: enriched
  });
};

const history = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as { id: string };
  const u = req.user as { id: string };
  const predictions = await predictionService.getUserPredictions(u.id);
  const role = (req.user as any).role as string;
  const enriched = await Promise.all(
    predictions.map(async (p) => {
      try {
        const payload = typeof p.payload === "object" && p.payload !== null ? (p.payload as Record<string, unknown>) : {};
        if (!payload["aiDescription"]) {
          const ai = await generateDescription(role, {
            species: p.species,
            disease: p.disease,
            severity: p.severity,
            qualityIndex: p.qualityIndex,
            medicinalValue: (payload as any)?.medicinalValue,
            nutritionalInfo: (payload as any)?.nutritionalValue ?? (payload as any)?.nutritionalInfo,
            toxicityRisk: (payload as any)?.toxicityRisk
          });
          return { ...p, payload: { ...payload, aiDescription: ai } };
        }
        return p;
      } catch {
        return p;
      }
    })
  );
  return res.json(enriched);
};

export default {
  predict,
  history
};

