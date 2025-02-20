import adminSchema from '../Components/model.js';
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
                error.status = 401;
                throw error;
            }

            // check if the request user has a valid email or not
            const isValidAccount = await adminSchema.findOne({ email }).select("+password");
            if (!isValidAccount) {
                const error = new Error(`Account with email, ${email} not found!`);
                error.status = 404;
                throw error;
            }

            // if email is valid, compare the password with the hasshed password
            const isValidPassword = await bcrypt.compare(password, isValidAccount?.password);
            if (!isValidPassword) {
                const error = new Error("Incorrect password!");
                error.status = 401;
                throw error;
            }

            // generate a token for the authenticated user, last 1h (automatically logs out after 1h)
            const token = await tokens.generateToken({ userId: isValidAccount._id }); // token contains the userId of the admin

            return res.status(200).json({ message: `Login successfull! Welcome to Cybrella, ${isValidAccount.email}!`, token });
        } catch (error) {
            console.error(error);

            if (error instanceof Error) return res.status(error.status || 500).json({ message: error.message || "An unexpected error occured while trying to login!" });
        }
    }

    // route for SignIn: http://localhost:8000/cybrella/account/signup
    async SignUp(req, res) {
        // add validator in the frontend (includes(@gmail.com))
        const { email } = req.body;

        try {
            if (!email || typeof email !== 'string') {
                const error = new Error("Email is either invalid or is not a string!");
                error.status = 401;
                throw error;
            }

            // check if the email was already used
            const isEmailDuplicate = await adminSchema.findOne({ email });
            if (isEmailDuplicate) {
                const error = new Error(`${email} already in used!`);
                error.status = 409;
                throw error;
            }

            // making sure the PASSWORD is inside the .env
            if (!process.env.PASSWORD) throw new Error("Environment variable PASSWORD is not defined!");

            const hashedPassword = await bcrypt.hash(process.env.PASSWORD, 10);

            // creating a new account here
            // create the account only if the email is unique
            const newAccount = await adminSchema.create({ email, password: hashedPassword });
            if (!newAccount) throw new Error("Cannot create an account!");

            const token = await tokens.generateToken({ userId: newAccount._id });

            return res.status(201).json({ message: "Account created successfully!", token });
        } catch (error) {
            console.error("Error in SignUp:", error);

            return res.status(error.status || 500).json({
                message: error.message || "An unexpected error occurred while trying to create an account!"
            });
        }
    }
}

const service = new Service();
export default service;
