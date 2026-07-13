import dotenv from "dotenv";

import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = process.env.SEED_ADMIN_EMAIL;
        const adminPassword = process.env.SEED_ADMIN_PASSWORD;
        const adminName = process.env.SEED_ADMIN_NAME;

        const existingUser = await User.findOne({
            email: adminEmail,
        });

        if (existingUser) {
            console.log("Admin kullanıcı zaten mevcut:");
            console.log(existingUser.email);

            process.exit(0);
        }

        const adminUser = await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: "admin",
            isActive: true,
        });

        console.log("Admin kullanıcı başarıyla oluşturuldu:");
        console.log({
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
        });

        process.exit(0);
    } catch (error) {
        console.error("Admin seed hatası:", error);
        process.exit(1);
    }
};

seedAdmin();