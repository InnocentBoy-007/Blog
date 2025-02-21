import mongoose from "mongoose";

// schema
const fileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    image: {
        data: Buffer,
        contentType: String
    },
    uploadedBy: {type: String} // admin's email
});

export default (dbConnection) => dbConnection.model("files", fileSchema);
