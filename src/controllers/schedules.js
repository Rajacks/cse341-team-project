import {
  getScheduleById as findScheduleById,
  getAllSchedules as findAllSchedules,
} from "../models/schedules.js";

export const getAllSchedules = async (req, res, next) => {
  try {
    const schedules = await findAllSchedules();
    return res.json({ schedules });
  } catch (error) {
    return next(error);
  }
};

export const getScheduleById = async (req, res, next) => {
  try {
    const schedule = await findScheduleById(Number(req.params.id));

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    return res.json({ schedule });
  } catch (error) {
    return next(error);
  }
};
