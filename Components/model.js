import mongoose from "mongoose";

// schema
const adminSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true, select: false }
});

export default mongoose.model("blogadmins", adminSchema);
