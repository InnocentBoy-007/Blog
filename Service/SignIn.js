import { AdminSchema } from '../Components/model.js';
import bcrypt from 'bcrypt'
import tokens from "../Components/Tokens.js";

class Service {
    async SignIn(req, res) {
        const { password } = req.body;
        try {
            if (!password || typeof password !== 'string') {
                const error = new Error("Invalid login password! Type of password should be a string!");
                error.status = 401;
                throw error;
            }

            // Fetch admin from database and compare password
            const admin = await AdminSchema.findOne({});
            if (!admin) {
                const error = new Error("Admin not found!");
                error.status = 404;
                throw error;
            }
            
            const isValidPassword = await bcrypt.compare(password, admin.password);
            if (!isValidPassword) {
                const error = new Error("Incorrect password!");
                error.status = 409;
                throw error;
            }

            // add a function to generate a JWT before returning the success response
            const token = await tokens.generateToken({userId: admin._id});

            return res.status(200).json({ message: "Login successfull!", token });
        } catch (error) {
            console.error(error);
            
            if (error instanceof Error) return res.status(error.status || 500).json({ message: error.message || "An unexpected error occured while trying to login!" });
        }
    }
}

const service = new Service();
export default service;
