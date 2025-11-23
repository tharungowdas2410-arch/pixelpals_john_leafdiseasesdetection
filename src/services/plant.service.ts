import prisma from "../config/database";

const getPlantBySpecies = async (species: string) => {
  return prisma.plantInfo.findFirst({
    where: { species: { equals: species, mode: "insensitive" } },
    include: {
      diseaseInfo: true,
      marketPrices: true
    }
  });
};

const upsertPlant = async (input: {
  species: string;
  medicinalValue: string;
  nutritionalInfo: string;
  avgMarketPrice: number;
  cures: string;
  recommendedSoil?: string | null;
}) => {
  return prisma.plantInfo.upsert({
    where: { species: input.species },
    update: {
      medicinalValue: input.medicinalValue,
      nutritionalInfo: input.nutritionalInfo,
      avgMarketPrice: input.avgMarketPrice,
      cures: input.cures,
      recommendedSoil: input.recommendedSoil ?? null
    },
    create: {
      species: input.species,
      medicinalValue: input.medicinalValue,
      nutritionalInfo: input.nutritionalInfo,
      avgMarketPrice: input.avgMarketPrice,
      cures: input.cures,
      recommendedSoil: input.recommendedSoil ?? null
    }
  });
};

const listPlants = async () => {
  return prisma.plantInfo.findMany({
    include: {
      diseaseInfo: true,
      marketPrices: true
    }
  });
};

export default {
  getPlantBySpecies,
  upsertPlant,
  listPlants
};

