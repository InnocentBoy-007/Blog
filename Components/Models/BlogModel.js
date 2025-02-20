import mongoose from "mongoose";

// schema
const fileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    filePath: { type: String, required: true },
    fileCreatedAt: { type: String } // creation date and time of the file
});

export default (dbConnection) => dbConnection.model("files", fileSchema);
