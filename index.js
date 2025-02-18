import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createPassword_admin } from './Components/model.js';
import service from './Service/SignIn.js';

class ServerSetup {
    constructor() {
        dotenv.config();

        this.PORT = 8000;
        this.MONGODB_URL = process.env.MONGODB_URL;
        this.ORIGIN = process.env.ORIGIN;
        this.PASSWORD = process.env.PASSWORD;

        if (!this.MONGODB_URL) {
            console.error("❌ MONGODB_URL is not defined in .env file!");
            process.exit(1);
        }

        this.app = express();
    }

    // Use custom mongodb server
    async connectDatabase() {
        try {
            await mongoose.connect(this.MONGODB_URL)

            // create the password for the admins
            await createPassword_admin(this.PASSWORD);
            console.log("✅ Connected to MongoDB successfully!");
        } catch (error) {
            console.error("❌ Database connection failed!", error);
            process.exit(1);
        }
    }

    async connectServer() {
        try {
            const route = express.Router();
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

            this.app.use(route); // Mount the router
            route.post('/signin', service.SignIn); // custom route for signing in

            this.app.use('/', (req, res) => { // default route to check if the server is working or not
                res.send("Welcome to the server!");
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
