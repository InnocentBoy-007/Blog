import multer from 'multer';
import mongoose from 'mongoose';
import getBinaryFileModel from '../Components/Models/BlogModel.js'
import getAdminModel from '../Components/Models/AdminModel.js';

// Configure Multer
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

class BlogServices {
    // route for fetching all the blog posts: http://localhost:8000/cybrella/blog/fetch
    async GetPost(req, res) {
        const accountId = req.accountId;
        try {
            if (!accountId) {
                const error = new Error("Invalid accountId");
                error.status = 500;
                throw error;
            }
    
            const AdminModel = await getAdminModel(global.blogAdminsDB);
            const isValidAdmin = await AdminModel.findById(accountId);
            if (!isValidAdmin) {
                const error = new Error("Access denied! Unauthorized user!");
                error.status = 401;
                throw error;
            }
    
            const FileModel = getBinaryFileModel(global.binaryFilesDB);
    
            // 📌 Fetch all files from the database
            const files = await FileModel.find();
    
            if (!files.length) {
                return res.status(404).json({ message: "No files found in the database!" });
            }
    
            // 📌 Fix: Send an array of files with contentType
            const responseFiles = files.map(file => ({
                id: file._id,
                filename: file.filename,
                contentType: file.image.contentType,
                data: file.image.data.toString("base64") // Convert buffer to base64
            }));
    
            return res.status(200).json({ files: responseFiles });
        } catch (error) {
            console.log(error);
    
            return res.status(error.status || 500).json({
                message: error.message || "An unexpected error occurred while trying to fetch the post!"
            });
        }
    }
    

    // route for posting a blog: http://localhost:8000/cybrella/blog/upload
    async PostBlog(req, res) {
        const accountId = req.accountId;

        try {
            if (!accountId) {
                const error = new Error("Invalid accountId");
                error.status = 500;
                throw error;
            }

            const AdminModel = await getAdminModel(global.blogAdminsDB);

            // Authenticate the user using accountId
            const isValidAdmin = await AdminModel.findById(accountId);
            if (!isValidAdmin) {
                const error = new Error("User not found! Invalid userId!");
                error.status = 404;
                throw error;
            }

            const FileModel = await getBinaryFileModel(global.binaryFilesDB);

            // Check if a file was uploaded
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded!" });
            }

            // Create and save the file document in MongoDB
            const newFile = new FileModel({
                filename: req.file.originalname,
                image: {
                    data: req.file.buffer, // Store file as binary
                    contentType: req.file.mimetype // Store file type
                },
                uploadedBy: isValidAdmin.email
            });

            await newFile.save();

            return res.status(201).json({ message: "File uploaded successfully!", fileId: newFile._id });

        } catch (error) {
            console.error("❌ Upload error:", error.message);
            if (error instanceof Error) {
                return res.status(error.status || 500).json({ message: error.message || "An unexpected error occurred while trying to upload files!" });
            }
        }
    }

    // route for deleting a specific blog using ID: http://localhost:8000/cybrella/blog/delete/:fileId
    async DeleteBlog(req, res) {
        const accountId = req.accountId;
        try {
            if (!accountId) {
                const error = new Error("Invalid accountId");
                error.status = 500;
                throw error;
            }

            const AdminModel = await getAdminModel(global.blogAdminsDB);
            const isValidAdmin = await AdminModel.findById(accountId);
            if (!isValidAdmin) {
                const error = new Error("User not found! Invalid userId!");
                error.status = 404;
                throw error;
            }

            const FileModel = getBinaryFileModel(global.binaryFilesDB);

            const { fileId } = req.params;
            if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
                const error = new Error("Invalid blog ID!");
                error.status = 400;
                throw error;
            }


            // Remove the file record from the database
            const file = await FileModel.findByIdAndDelete(fileId);
            if (!file) {
                const error = new Error("File cannot be deleted!");
                error.status = 404;
                throw error
            }
            return res.status(200).json({ message: "File deleted successfully!" });

        } catch (error) {
            console.log(error);

            if (error instanceof Error) {
                return res.status(error.status || 500).json({ message: error.message || "An unexpected error occurred while trying to delete the post!" })
            }
        }
    }
}

const blogServices = new BlogServices();
export default blogServices;
