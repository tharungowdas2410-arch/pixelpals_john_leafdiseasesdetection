import prisma from "../config/database";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";
import axios from "axios";

const listPredictions = async () => {
  return prisma.prediction.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          name: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

const createDisease = async (input: {
  name: string;
  cureSteps: string;
  vulnerabilityScore?: number;
  toxicityRisk?: string;
  curable?: boolean;
  disadvantages?: string;
  plantId?: string;
}) => {
  return prisma.diseaseInfo.create({
    data: {
      name: input.name,
      cureSteps: input.cureSteps,
      vulnerabilityScore: input.vulnerabilityScore ?? 50,
      toxicityRisk: input.toxicityRisk ?? "LOW",
      curable: input.curable ?? true,
      disadvantages: input.disadvantages,
      plantId: input.plantId
    }
  });
};

const updateDisease = async (id: string, data: Partial<Parameters<typeof createDisease>[0]>) => {
  return prisma.diseaseInfo.update({
    where: { id },
    data
  });
};

const deleteDisease = async (id: string) => {
  return prisma.diseaseInfo.delete({
    where: { id }
  });
};

const upsertMarketPrice = async (input: {
  plantId: string;
  region: string;
  price: number;
}) => {
  return prisma.marketPrice.upsert({
    where: {
      plantId_region: {
        plantId: input.plantId,
        region: input.region
      }
    },
    update: { price: input.price },
    create: input
  });
};

const uploadDataset = async (
  meta: { name: string; description?: string; source?: string },
  zipFilePath: string
) => {
  const baseDir = path.join(process.cwd(), "uploads", "datasets");
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const created = await prisma.dataset.create({
    data: {
      name: meta.name,
      description: meta.description ?? null,
      source: meta.source ?? null,
      classes: [],
      imageCount: 0
    }
  });

  const extractDir = path.join(baseDir, created.id);
  fs.mkdirSync(extractDir, { recursive: true });

  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(extractDir, true);

  const labels = new Set<string>();
  const items: { datasetId: string; imagePath: string; label?: string }[] = [];

  const walk = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if ([".jpg", ".jpeg", ".png"].includes(ext)) {
          const rel = path.relative(extractDir, abs);
          const parts = rel.split(path.sep);
          const label = parts.length > 1 ? parts[0] : undefined;
          if (label) labels.add(label);
          items.push({ datasetId: created.id, imagePath: path.join("datasets", created.id, rel), label });
        }
      }
    }
  };

  walk(extractDir);

  if (items.length > 0) {
    await prisma.datasetItem.createMany({ data: items });
  }

  const classes = Array.from(labels.values());
  await prisma.dataset.update({
    where: { id: created.id },
    data: {
      imageCount: items.length,
      classes
    }
  });

  return created;
};

const listDatasets = async () => {
  return prisma.dataset.findMany({ orderBy: { createdAt: "desc" } });
};

const getDataset = async (id: string) => {
  const dataset = await prisma.dataset.findUnique({ where: { id } });
  if (!dataset) return null;
  const items = await prisma.datasetItem.findMany({ where: { datasetId: id }, take: 100, orderBy: { createdAt: "desc" } });
  return { dataset, items };
};

const importDatasetFromUrl = async (
  meta: { name: string; description?: string; source?: string },
  url: string
) => {
  const tmpDir = path.join(process.cwd(), "uploads", "datasets", "tmp");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  const tmpPath = path.join(tmpDir, `${Date.now()}-${Math.round(Math.random() * 1e9)}.zip`);

  const response = await axios.get(url, { responseType: "stream", timeout: 120000 });
  await new Promise<void>((resolve, reject) => {
    const writer = fs.createWriteStream(tmpPath);
    response.data.pipe(writer);
    writer.on("finish", () => resolve());
    writer.on("error", reject);
  });

  const result = await uploadDataset(meta, tmpPath);
  try {
    fs.unlinkSync(tmpPath);
  } catch {}
  return result;
};

export default {
  listPredictions,
  createDisease,
  updateDisease,
  deleteDisease,
  upsertMarketPrice,
  uploadDataset,
  listDatasets,
  getDataset,
  importDatasetFromUrl
};

