import { Request, Response } from "express";
import sensorService from "../services/sensor.service";

const record = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { ph, ec, moisture, temperature } = req.body;
  const user = req.user as { id: string };
  const u = req.user as { id: string };
  const reading = await sensorService.recordSensorData(u.id, {
    ph: Number(ph),
    ec: Number(ec),
    moisture: Number(moisture),
    temperature: Number(temperature)
  });

  return res.status(201).json(reading);
};

const history = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as { id: string };
  const u = req.user as { id: string };
  const readings = await sensorService.getSensorHistory(u.id);
  return res.json(readings);
};

export default {
  record,
  history
};

