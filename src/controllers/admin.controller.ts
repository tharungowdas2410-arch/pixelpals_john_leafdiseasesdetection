import { Request, Response } from "express";
import adminService from "../services/admin.service";
import plantService from "../services/plant.service";

const predictions = async (_req: Request, res: Response) => {
  const data = await adminService.listPredictions();
  return res.json(data);
};

const addPlant = async (req: Request, res: Response) => {
  const plant = await plantService.upsertPlant(req.body);
  return res.status(201).json(plant);
};

const createDisease = async (req: Request, res: Response) => {
  const disease = await adminService.createDisease(req.body);
  return res.status(201).json(disease);
};

const updateDisease = async (req: Request, res: Response) => {
  const { id } = req.params;
  const disease = await adminService.updateDisease(id, req.body);
  return res.json(disease);
};

const deleteDisease = async (req: Request, res: Response) => {
  const { id } = req.params;
  await adminService.deleteDisease(id);
  return res.status(204).send();
};

const upsertMarketPrice = async (req: Request, res: Response) => {
  const price = await adminService.upsertMarketPrice(req.body);
  return res.status(201).json(price);
};

const uploadDataset = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "datasetZip file is required" });
  }
  const { name, description, source } = req.body as { name: string; description?: string; source?: string };
  const dataset = await adminService.uploadDataset({ name, description, source }, req.file.path);
  return res.status(201).json(dataset);
};

const listDatasets = async (_req: Request, res: Response) => {
  const datasets = await adminService.listDatasets();
  return res.json(datasets);
};

const getDataset = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await adminService.getDataset(id);
  if (!data) {
    return res.status(404).json({ message: "Dataset not found" });
  }
  return res.json(data);
};

const importDatasetUrl = async (req: Request, res: Response) => {
  const { name, description, source, url } = req.body as { name: string; description?: string; source?: string; url: string };
  if (!url || !name) {
    return res.status(400).json({ message: "url and name are required" });
  }
  const dataset = await adminService.importDatasetFromUrl({ name, description, source }, url);
  return res.status(201).json(dataset);
};

export default {
  predictions,
  addPlant,
  createDisease,
  updateDisease,
  deleteDisease,
  upsertMarketPrice,
  uploadDataset,
  listDatasets,
  getDataset,
  importDatasetUrl
};

