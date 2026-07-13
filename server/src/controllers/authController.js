import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email ve şifre zorunludur" });
        }

        // düzenlenmiş email ile kullanıcı bulma
        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail }).select("+password");;

        if (!user) {
            return res.status(401).json({ success: false, message: "E posta veya şifre hatalı" });
        }

        // aktiflik kontolü
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Bu kullanıcı hesabı pasif durumdadır" });
        }

        // şifre doğrulama
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "E posta veya şifre hatalı" });
        }

        user.lastLoginAt = new Date();
        await user.save();

        const token = generateToken(user._id);

        return res.status(200).json({
            success: true,
            message: "Giriş başarılı.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Giriş işlemi sırasında sunucu hatası oluştu.",
        });
    }
}

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Kullanıcı bulunamadı.",
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                lastLoginAt: user.lastLoginAt,
            },
        });
    } catch (error) {
        console.error("Get current user error:", error);

        return res.status(500).json({
            success: false,
            message: "Kullanıcı bilgileri alınırken sunucu hatası oluştu.",
        });
    }
};

export {
    login,
    getCurrentUser,
};