import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './Service/DBconnection.js';
import account_route from './Routes/AccountRoutes.js'
import blog_route from './Routes/BlogRoutes.js'

class ServerSetup {
    constructor() {
        dotenv.config();

        this.PORT = 8000;
        this.ORIGIN = process.env.ORIGIN;
        // can also add validators for this environment vairables
        this.app = express();
    }

    // Using custom mongodb server
    async connectDatabase() {
        try {
            console.log("⏳ Establishing database connections...");

            // Attempt to connect to databases with retry logic
            const maxRetries = 3;
            let retryCount = 0;

            while (retryCount < maxRetries) {
                try {
                    global.blogAdminsDB = await connectDB.connectToDatabase("cybrella_admins");
                    global.binaryFilesDB = await connectDB.connectToDatabase("cybrella_binaryFiles");
                    console.log("✅ Database connections established successfully!");
                    return;
                } catch (error) {
                    retryCount++;
                    console.warn(`⚠️ Connection attempt ${retryCount} failed. Retrying in 5 seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }

            throw new Error(`Failed to connect to databases after ${maxRetries} attempts`);
        } catch (error) {
            console.error("❌ Database connection failed:", error.message);
            console.error("Please check:");
            console.error("1. MongoDB server is running and accessible");
            console.error("2. Connection string in .env is correct");
            console.error("3. Network connectivity to MongoDB");
            process.exit(1);
        }
    }

    async connectServer() {
        try {
            // Establish database connection first
            await this.connectDatabase();

            // Verify database connections are ready
            if (!global.binaryFilesDB) {
                throw new Error("Binary files database connection not established");
            }

            // CORS setup
            const corsOptions = {
                origin: (origin, callback) => {
                    if (origin === this.ORIGIN || !origin) {
                        callback(null, true);
                    } else {
                        callback(new Error('Not allowed by CORS'));
                    }
                },
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
                allowedHeaders: ['Content-Type', 'Authorization'],
            };

            this.app.use(cors(corsOptions)); // Enable CORS middleware
            this.app.use(express.json());

            this.app.use('/cybrella/account', account_route);
            this.app.use('/cybrella/blog', blog_route);

            this.app.use('/', (req, res) => { // default route to check if the server is working or not. Use: http://localhost:8000
                res.send("Welcome to the cybrella blog server!");
            })

            this.app.listen(this.PORT, '0.0.0.0', () => {
                console.log(`✅ Server is running at http://localhost:${this.PORT}`);
            });


            console.log("✅ Server setup successfully!");

        } catch (error) {
            console.error("❌ Server connection failed!", error);
        }
    }
}

new ServerSetup().connectServer();
