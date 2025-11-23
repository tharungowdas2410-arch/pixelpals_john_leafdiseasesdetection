import { Request, Response } from "express";
import plantService from "../services/plant.service";

const getPlant = async (req: Request, res: Response) => {
  const { species } = req.params;
  const plant = await plantService.getPlantBySpecies(species);
  if (!plant) {
    return res.status(404).json({ message: "Plant not found" });
  }
  return res.json(plant);
};

const addPlant = async (req: Request, res: Response) => {
  const plant = await plantService.upsertPlant(req.body);
  return res.status(201).json(plant);
};

const listPlants = async (_req: Request, res: Response) => {
  const plants = await plantService.listPlants();
  return res.json(plants);
};

export default {
  getPlant,
  addPlant,
  listPlants
};

