import Schedule from "./schemas/schedules.js";

export async function getScheduleById(id) {
  return Schedule.findOne({ id }).lean();
}

export async function getAllSchedules() {
  return Schedule.find({}).lean();
}
