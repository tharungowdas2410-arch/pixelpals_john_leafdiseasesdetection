import prisma from "../config/database";
import { getSocket } from "../utils/socket";

interface SensorPayload {
  ph: number;
  ec: number;
  moisture: number;
  temperature: number;
}

const recordSensorData = async (userId: string, payload: SensorPayload) => {
  const reading = await prisma.sensorReading.create({
    data: {
      userId,
      ...payload
    }
  });

  try {
    const io = getSocket();
    io.to(userId).emit("sensor:update", reading);
    io.emit("sensor:public", reading);
  } catch (error) {
    // Socket may not be initialized during tests
  }

  return reading;
};

const getSensorHistory = async (userId: string) => {
  return prisma.sensorReading.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50
  });
};

export default {
  recordSensorData,
  getSensorHistory
};

