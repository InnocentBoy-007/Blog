import express from 'express'
import blogServices from '../Service/BlogServices.js';
import { AuthMiddleware } from '../Components/AuthMiddleware.js';
import multer from 'multer';

const route = express.Router();

// Configure Multer
const storage = multer.memoryStorage(); // Store file in memory before saving to MongoDB
const upload = multer({ storage }); // Use this middleware in the route

route.get("/fetch", AuthMiddleware, blogServices.GetPost);
route.post("/upload", upload.single("file"), AuthMiddleware, blogServices.PostBlog); // Accept single file upload
route.delete("/delete/:fileId", AuthMiddleware, blogServices.DeleteBlog);

export default route;
