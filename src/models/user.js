import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  robloxUsername: { type: String, required: true },
  minutes: { type: Number, default: 0 }
});

export default mongoose.model("User", userSchema);
