import mongoose from "mongoose";
import bcrypt from 'bcrypt';

// schema
const adminSchema = new mongoose.Schema({
    password: { type: String, required: true }
});

// Create model first
const AdminSchema = mongoose.model('blogadmins', adminSchema);

// creating a hash password for the admins
const createPassword_admin = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new AdminSchema({ password: hashedPassword });

        // Save the admin or return the created admin
        await admin.save();
    } catch (error) {
        console.error('Error creating admin:', error);
    }
};

export { createPassword_admin, AdminSchema }; // createPassword to be called right after the mongodb connection is successfull
