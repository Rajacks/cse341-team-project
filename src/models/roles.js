import mongoose from "mongoose";
import roleSchema from "./schemas/role.js";

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);

export default Role;

export async function getRoleByName(name) {
  return Role.findOne({ name: name.toLowerCase() });
}

export async function createRole(name) {
  return Role.create({ name: name.toLowerCase() });
}

export async function getAllRoles() {
  return Role.find({});
}
