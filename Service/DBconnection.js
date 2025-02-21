import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class ConnectDB {
    constructor() {
        this.MONGODB_URL = process.env.MONGODB_URL;
        if (!this.MONGODB_URL) {
            console.error("❌ MONGODB_URL is not defined in .env file!");
            process.exit(1);
        }

        this.connections = {}; // Store multiple database connections
    }

    async connectToDatabase(dbName) {
        if (this.connections[dbName]) {
            console.log(`✅ Already connected to ${dbName}`);
            return this.connections[dbName];
        }
    
        try {
            const connection = mongoose.createConnection(`${this.MONGODB_URL}/${dbName}`, {
                serverSelectionTimeoutMS: 30000, // 30 seconds timeout
                socketTimeoutMS: 45000, // 45 seconds timeout
                connectTimeoutMS: 30000 // 30 seconds timeout
            });
    
            // Ensure full connection is established
            await connection.asPromise();
    
            this.connections[dbName] = connection;
            console.log(`✅ Connected to ${dbName} database successfully!`);
            return connection;
        } catch (error) {
            console.error(`❌ Failed to connect to ${dbName}:`, error.message);
            throw new Error(`Database connection failed: ${error.message}`);
        }
    }
    
}

const connectDB = new ConnectDB();
export default connectDB;
