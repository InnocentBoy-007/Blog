import express from 'express'
import blogServices from '../Service/BlogServices.js';
import { AuthMiddleware } from '../Components/AuthMiddleware.js';

const route = express.Router();

route.get("/fetch", AuthMiddleware, blogServices.GetPost);
route.post("/upload", AuthMiddleware, blogServices.PostBlog);
route.delete("/delete/:fileId", AuthMiddleware, blogServices.DeleteBlog);

export default route;