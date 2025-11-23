import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import prisma from "../config/database";
import { env } from "../config/env";
import { UserRole } from "@prisma/client";
import logger from "../utils/logger";
import { generateDescription } from "./gemini.service";

interface InferenceResponse {
  species: string;
  disease: string;
  confidence: number;
  severity: string;
  quality_index: number;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

const callInference = async (filePath: string): Promise<InferenceResponse> => {
  const form = new FormData();
  form.append("image", fs.createReadStream(filePath));

  const response = await axios.post(env.INFERENCE_URL, form, {
    headers: form.getHeaders(),
    timeout: 60000
  });

  return response.data;
};

const enrichForRole = async (
  role: UserRole,
  inference: InferenceResponse,
  userId: string
) => {
  const plantInfo = await prisma.plantInfo.findFirst({
    where: { species: inference.species },
    include: {
      diseaseInfo: true,
      marketPrices: true
    }
  });

  const diseaseInfo = await prisma.diseaseInfo.findFirst({
    where: { name: inference.disease }
  });

  const latestSensor = await prisma.sensorReading.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  switch (role) {
    case UserRole.FARMER:
      return {
        disease: inference.disease,
        cureSteps: diseaseInfo?.cureSteps ?? "Consult local agronomist.",
        vulnerabilityScore: diseaseInfo?.vulnerabilityScore ?? 50,
        curable: diseaseInfo?.curable ?? true,
        medicinalValue: plantInfo?.medicinalValue ?? "Data unavailable",
        averageMarketPrice: plantInfo?.avgMarketPrice ?? null,
        qualityIndex: inference.quality_index,
        severity: inference.severity,
        advisory:
          inference.severity === "high"
            ? "Immediate intervention recommended."
            : "Monitor crop health regularly.",
        aiDescription: await generateDescription("FARMER", {
          species: inference.species,
          disease: inference.disease,
          severity: inference.severity,
          qualityIndex: inference.quality_index,
          medicinalValue: plantInfo?.medicinalValue
        })
      };
    case UserRole.AGRICULTURAL_INDUSTRY:
      return {
        species: inference.species,
        healthCondition: inference.severity,
        soilFertilitySuggestions:
          plantInfo?.recommendedSoil ?? "Maintain balanced NPK with organic matter.",
        nutrientDeficiencyAnalysis:
          plantInfo?.nutritionalInfo ?? "No nutritional insights available.",
        realTimeSensor: latestSensor ?? null,
        plantInformation: plantInfo ?? null,
        qualityIndex: inference.quality_index,
        aiDescription: await generateDescription("AGRICULTURAL_INDUSTRY", {
          species: inference.species,
          disease: inference.disease,
          severity: inference.severity,
          qualityIndex: inference.quality_index,
          nutritionalInfo: plantInfo?.nutritionalInfo
        })
      };
    case UserRole.PHARMACEUTICAL_INDUSTRY:
      return {
        medicinalUses: plantInfo?.medicinalValue ?? "Unknown",
        nutritionalValue: plantInfo?.nutritionalInfo ?? "Unknown",
        healthPercentage: inference.quality_index,
        toxicityRisk: diseaseInfo?.toxicityRisk ?? "LOW",
        curable: diseaseInfo?.curable ?? true,
        disadvantages: diseaseInfo?.disadvantages ?? "Further research required.",
        severity: inference.severity,
        aiDescription: await generateDescription("PHARMACEUTICAL_INDUSTRY", {
          species: inference.species,
          disease: inference.disease,
          severity: inference.severity,
          qualityIndex: inference.quality_index,
          medicinalValue: plantInfo?.medicinalValue,
          toxicityRisk: diseaseInfo?.toxicityRisk
        })
      };
    case UserRole.ADMIN:
    default:
      return {
        ...inference,
        plantInfo,
        diseaseInfo,
        latestSensor
      };
  }
};

const predictAndStore = async (user: any, filePath: string) => {
  const inference = await callInference(filePath);

  const enriched = await enrichForRole(user.role as UserRole, inference, user.id as string);

  const prediction = await prisma.prediction.create({
    data: {
      userId: user.id as string,
      species: inference.species,
      disease: inference.disease,
      confidence: inference.confidence,
      severity: inference.severity,
      qualityIndex: inference.quality_index,
      payload: enriched
    }
  });

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    logger.warn("Failed to cleanup uploaded file", { error });
  }

  return { prediction, enriched };
};

const getUserPredictions = async (userId: string, take = 10) => {
  return prisma.prediction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take
  });
};

export default {
  predictAndStore,
  getUserPredictions
};

