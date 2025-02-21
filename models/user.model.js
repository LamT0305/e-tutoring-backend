import mongoose from "mongoose"; 

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateOfBirth: { type: String, required: true},
  address: { type: String, required: true},
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Role",
  },
  created_at: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema); // Create the model
export default User; // Export as default
