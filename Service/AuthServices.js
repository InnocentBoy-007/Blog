import getAdminModel from '../Components/Models/AdminModel.js'
import bcrypt from 'bcrypt'
import tokens from "../Components/Tokens.js";

class Service {
    // route for SignIn: http://localhost:8000/cybrella/account/signin
    async SignIn(req, res) {
        // add validator for email and password in the frontend
        const { email, password } = req.body?.signinCredentials ?? {};
        
        try {
            if (!email || typeof email !== 'string') {
                const error = new Error(`Email, ${email} is either invalid or is not a string!`);
                error.status = 401;
                throw error;
            }

            if (!password || typeof password !== 'string') {
                const error = new Error(`Password, ${password} is either invalid or is not a string!`);
                error.status = 401``;
                throw error;
            }

            const AdminModel = getAdminModel(global.blogAdminsDB);

            // check if the request user has a valid email or not
            const isValidAccount = await AdminModel.findOne({ email }).select("+password");
            if (!isValidAccount) {
                const error = new Error(`Account with email, ${email} not found!`);
                error.status = 404;
                throw error;
            }

            // if email is valid, compare the password with the hasshed password
            const isValidPassword = await bcrypt.compare(password, isValidAccount?.password);
            if (!isValidPassword) {
                console.log("Password comparison failed");
                const error = new Error("Incorrect password!");
                error.status = 401;
                throw error;
            }

            // generate a token for the authenticated user, last 1h (automatically logs out after 1h)
            const token = await tokens.generateToken({ accountId: isValidAccount._id }); // token contains the accountId of the admin

            return res.status(200).json({ message: `Login successfull! Welcome to Cybrella, ${isValidAccount.email}!`, token });
        } catch (error) {
            console.error(error);

            if (error instanceof Error) return res.status(error.status || 500).json({ message: error.message || "An unexpected error occured while trying to login!" });
        }
    }

    // route for SignUp: http://localhost:8000/cybrella/account/signup
    async SignUp(req, res) {
        const { email } = req.body;

        try {
            if (!email || typeof email !== "string") {
                return res.status(400).json({ message: "Email is invalid or not a string!" });
            }

            const emailLowerCase = email.toLowerCase();

            // Check for duplicate email with proper timeout handling
            console.log("Checking email:", emailLowerCase);

            const AdminModel = getAdminModel(global.blogAdminsDB);

            const isEmailDuplicate = await AdminModel.findOne({ email: emailLowerCase });
            if (isEmailDuplicate) {
                return res.status(409).json({ message: `${emailLowerCase} is already in use!` });
            }

            // Ensure password is set in .env
            if (!process.env.PASSWORD) {
                console.error("Error: Environment variable PASSWORD is not defined!");
                return res.status(500).json({ message: "Server configuration error!" });
            }

            const hashedPassword = await bcrypt.hash(process.env.PASSWORD, 10);

            // Create new admin account
            const newAccount = await AdminModel.create({ email: emailLowerCase, password: hashedPassword });
            if (!newAccount) {
                return res.status(500).json({ message: "Cannot create an account!" });
            }

            const token = await tokens.generateToken({ userId: newAccount._id });

            return res.status(201).json({ message: "Account created successfully!", token });

        } catch (error) {
            console.error("Error in SignUp:", error);

            // Return proper status codes
            return res.status(error.status || 500).json({
                message: error.message || "An unexpected error occurred!"
            });
        }
    }
}

const service = new Service();
export default service;
