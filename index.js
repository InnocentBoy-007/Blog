import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import account_route from './Routes/AccountRoutes.js'

class ServerSetup {
    constructor() {
        dotenv.config();

        this.PORT = 7000;
        this.MONGODB_URL = process.env.MONGODB_URL;
        this.ORIGIN = process.env.ORIGIN;

        if (!this.MONGODB_URL) {
            console.error("❌ MONGODB_URL is not defined in .env file!");
            process.exit(1);
        }

        this.app = express();
    }

    // Use custom mongodb server
    async connectDatabase() {
        try {
            await mongoose.connect(this.MONGODB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            
            console.log("✅ Connected to MongoDB successfully!");
        } catch (error) {
            console.error("❌ Database connection failed!", error);
            process.exit(1);
        }
    }

    async connectServer() {
        try {
            await this.connectDatabase();

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
            // this.app.use('/cybrella/blog'); // use this api endpoint for blogging(add later)

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
