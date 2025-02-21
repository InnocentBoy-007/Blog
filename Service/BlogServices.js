import fs from 'fs'
import path from 'path';
import mongoose from 'mongoose';
import getBinaryFileModel from '../Components/Models/BlogModel.js'
import getAdminModel from '../Components/Models/AdminModel.js';

class BlogServices {
    // change the file format before sending back to the frontend
    // route for fetching all the blog posts: http://localhost:8000/cybrella/blog/fetch
    async GetPost(req, res) {
        const accountId = req.accountId;
        try {
            const AdminModel = await getAdminModel(global.blogAdminsDB);
            if (!accountId) {
                const error = new Error("Invalid accountId");
                error.status = 500;
                throw error;
            }
            const isValidAdmin = await AdminModel.findById(accountId);
            if (!isValidAdmin) {
                const error = new Error("Acces denied! Unauthorized user!");
                error.status = 401;
                throw error;
            }

            const FileModel = getBinaryFileModel(global.binaryFilesDB);

            // 📌 Fetch all files from the database
            const files = await FileModel.find();

            if (!files.length) {
                return res.status(404).json({ message: "No files found in the database!" });
            }

            // 📌 Convert files into a new format (Example: Base64)
            const formattedFiles = files.map(file => {
                const fileData = fs.readFileSync(file.filePath); // Read file from the filesystem
                return {
                    _id: file._id,
                    filename: file.filename,
                    base64: fileData.toString("base64"), // Convert file data to Base64
                    fileCreatedAt: file.fileCreatedAt,
                };
            });

            // Set content type for image responses
            res.set('Content-Type', 'image/png');
            return res.status(200).json({
                files: formattedFiles,
                contentType: 'image/png'
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(error.status).json({ message: error.message });
            }
            return res.status(500).json({ message: "An unexpected error occured while trying to fetch the post!" });
        }
    }

    // route for posting a blog: http://localhost:8000/cybrella/blog/upload
    async PostBlog(req, res) {
        const accountId = req.accountId;
        const UPLOAD_DIR = "uploaded_files"; // Directory where files will be stored

        // Ensure "uploaded_files" directory exists
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        try {
            const AdminModel = await getAdminModel(global.blogAdminsDB);
            // authenticating the user by using the accountId;
            const isValidAccountId = await AdminModel.findById(accountId);
            if (!isValidAccountId) {
                const error = new Error("User not found! Invalid userId!");
                error.status = 404;
                throw error;
            }

            const FileModel = getBinaryFileModel(global.binaryFilesDB);

            /**
             * 📌 Upload a file
             * ✅ Uses streaming (req.pipe) to avoid memory issues
            */
            const { filename } = req.headers;
            if (!filename) {
                const error = new Error("Filename is required!");
                error.status = 400;
                throw error;
            }

            const filePath = path.join(UPLOAD_DIR, filename);
            const fileStream = fs.createWriteStream(filePath); // Create write stream

            req.pipe(fileStream); // Stream request data directly into file

            fileStream.on("finish", async () => {
                try {
                    // Save file path in the cybrella_binaryFiles database
                    const newFile = new FileModel({ filename, filePath });
                    await newFile.save();

                    return res.status(201).json({ message: "File uploaded successfully!", path: filePath });
                } catch (dbError) {
                    console.error("❌ Database error:", dbError.message);
                    return res.status(500).json({ error: "Failed to save file in database" });
                }
            });

            fileStream.on("error", (err) => {
                console.error("❌ Stream error:", err.message);
                return res.status(500).json({ error: "File upload failed" });
            });

        } catch (error) {
            console.error("❌ Upload error:", error.message);
            if (error instanceof Error) {
                return res.status(error.status || 500).json({ message: error.message || "An unexpected error occured while trying to upload files!" });
            }
        }
    }

    // route for deleting a specific blog using ID: http://localhost:8000/cybrella/blog/delete/:fileId
    async DeleteBlog(req, res) {
        const accountId = req.accountId;
        try {
            const AdminModel = await getAdminModel(global.blogAdminsDB);
            const isValidAccountId = await AdminModel.findById(accountId);

            if (!isValidAccountId) {
                const error = new Error("User not found! Invalid userId!");
                error.status = 404;
                throw error;
            }

            const FileModel = getBinaryFileModel(global.binaryFilesDB);

            const {fileId} = req.params;
            if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
                const error = new Error("Invalid blog ID!");
                error.status = 400;
                throw error;
            }

            // Find the file in the database
            const blog = await FileModel.findById(fileId);
            if (!blog) {
                const error = new Error("File not found!");
                error.status = 404;
                throw error;
            }

            // Remove the file from the filesystem
            if (fs.existsSync(blog.filePath)) {
                fs.unlinkSync(blog.filePath);
            }

            // Remove the file record from the database
            await FileModel.findByIdAndDelete(fileId);

            return res.status(200).json({ message: "File deleted successfully!" });

        } catch (error) {
            console.log(error);
            
            if (error instanceof Error) {
                return res.status(error.status || 500).json({ message: error.message || "An unexpected error occured while trying to delete the post!" })
            }
        }
    }
}

const blogServices = new BlogServices();
export default blogServices;
