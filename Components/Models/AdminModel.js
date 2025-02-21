import mongoose from "mongoose";

// schema
const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }
});

export default (dbConnection) => dbConnection.model("blog_admins", adminSchema);
