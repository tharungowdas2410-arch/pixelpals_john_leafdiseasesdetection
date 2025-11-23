const { PrismaClient, UserRole } = require("@prisma/client");
const prisma = new PrismaClient();

const permissions = [
  { key: "prediction:read", description: "Read predictions" },
  { key: "plant:manage", description: "Manage plant catalog" },
  { key: "sensor:write", description: "Submit sensor data" },
  { key: "admin:full", description: "Full administrative access" }
];

const plants = [
  {
    species: "Tomato",
    medicinalValue: "Rich in antioxidants and lycopene.",
    nutritionalInfo: "High in vitamin C, potassium, folate.",
    avgMarketPrice: 2.5,
    cures: "Boost immunity, improve heart health.",
    recommendedSoil: "Loamy soil with pH 6.0-6.8"
  },
  {
    species: "Potato",
    medicinalValue: "Source of potassium and vitamin B6.",
    nutritionalInfo: "High in carbohydrates and fiber.",
    avgMarketPrice: 1.2,
    cures: "Helps in digestion and satiety.",
    recommendedSoil: "Well-drained sandy loam"
  },
  {
    species: "Tea",
    medicinalValue: "Polyphenols aid in metabolism.",
    nutritionalInfo: "Contains caffeine, catechins.",
    avgMarketPrice: 4.5,
    cures: "Reduces oxidative stress.",
    recommendedSoil: "Slightly acidic soil pH 4.5-5.5"
  }
];

const diseases = [
  {
    name: "Late Blight",
    cureSteps: "Apply copper-based fungicides and remove infected leaves.",
    vulnerabilityScore: 85,
    toxicityRisk: "MEDIUM",
    curable: true,
    disadvantages: "Can wipe out yield within days.",
    plantSpecies: "Potato"
  },
  {
    name: "Septoria Leaf Spot",
    cureSteps: "Introduce crop rotation and use resistant cultivars.",
    vulnerabilityScore: 60,
    toxicityRisk: "LOW",
    curable: true,
    disadvantages: "Reduces photosynthesis drastically.",
    plantSpecies: "Tomato"
  },
  {
    name: "Tea Red Rust",
    cureSteps: "Optimize shade and apply sulfur fungicides.",
    vulnerabilityScore: 70,
    toxicityRisk: "LOW",
    curable: true,
    disadvantages: "Degrades leaf quality impacting exports.",
    plantSpecies: "Tea"
  }
];

async function seedRoles() {
  for (const roleName of Object.values(UserRole)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `${roleName} role` }
    });

    for (const perm of permissions) {
      const permission = await prisma.permission.upsert({
        where: { key: perm.key },
        update: { description: perm.description },
        create: perm
      });

      if (roleName === UserRole.ADMIN || (roleName === UserRole.AGRICULTURAL_INDUSTRY && perm.key === "sensor:write")) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id
          }
        });
      }
    }
  }
}

async function seedPlants() {
  for (const plant of plants) {
    await prisma.plantInfo.upsert({
      where: { species: plant.species },
      update: plant,
      create: plant
    });
  }
}

async function seedDiseases() {
  for (const disease of diseases) {
    const plant = await prisma.plantInfo.findUnique({ where: { species: disease.plantSpecies } });
    await prisma.diseaseInfo.upsert({
      where: { name: disease.name },
      update: {
        cureSteps: disease.cureSteps,
        vulnerabilityScore: disease.vulnerabilityScore,
        toxicityRisk: disease.toxicityRisk,
        curable: disease.curable,
        disadvantages: disease.disadvantages,
        plantId: plant ? plant.id : null
      },
      create: {
        name: disease.name,
        cureSteps: disease.cureSteps,
        vulnerabilityScore: disease.vulnerabilityScore,
        toxicityRisk: disease.toxicityRisk,
        curable: disease.curable,
        disadvantages: disease.disadvantages,
        plantId: plant ? plant.id : null
      }
    });
  }
}

async function main() {
  await seedRoles();
  await seedPlants();
  await seedDiseases();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
