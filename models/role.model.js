import mongoose from "mongoose"; // Use ES module import

const roleSchema = new mongoose.Schema({
  role_name: {
    type: String,
    enum: ["Student", "Tutor", "Staff"],
    required: true,
  },
});

const Role = mongoose.model("Role", roleSchema); // Create the model
export default Role; // Export as default
