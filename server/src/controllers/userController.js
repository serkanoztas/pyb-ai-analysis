import mongoose from "mongoose";
import User from "../models/User.js";

//Get all users

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            users
        })
    }
    catch (error) {
        console.log("Get Users Error: ", error);
        return res.status(500).json({
            success: false,
            message: "Kullanıcılar alınırken sunucu hatası oluştu"
        })
    }
}

const createUser = async (req, res) => {
    try {
        const { name, email, password, role = "expert" } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Ad, e-posta ve şifre zorunludur"
            })
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (normalizedName.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Kullanıcı adı en az 2 haneli olmalı"
            })
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Şifre en az 6 haneli olmalı"
            })
        }

        if (!["admin", "expert"].includes(role)) {
            return res.status(500).json({
                success: false,
                message: "Geçersiz kullanıcı rolü"
            })
        }

        const existingUser = await User.findOne({
            email: normalizedEmail,
        })

        if (existingUser) {
            return res.status(500).json({
                success: false,
                message: "Bu e-posta adresi ile kayıtlı kullanıcı zaten mevcut"
            })
        }

        const user = await User.create({
            name: normalizedName,
            email: normalizedEmail,
            password,
            role,
            isActive: true,
        })

        return res.status(201).json({
            success: true,
            message: "Kullanıcı başarıyla oluşturuldu",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
            }
        });

    } catch (error) {
        console.error("Create user error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Bu e-posta adresi zaten kullanılıyor.",
            });
        }

        if (error.name === "ValidationError") {
            const message = Object.values(error.errors)
                .map((item) => item.message)
                .join(" ");

            return res.status(400).json({
                success: false,
                message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Kullanıcı oluşturulurken sunucu hatası oluştu.",
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Geçersiz kullanıcı kimliği.",
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Kullanıcı bulunamadı.",
            });
        }

        if (email !== undefined) {
            const normalizedEmail = email.trim().toLowerCase();

            const existingUser = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: id }
            })
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.",
                });
            }

            user.email = normalizedEmail;
        }
        if (name !== undefined) {
            user.name = name.trim();
        }
        if (role !== undefined) {
            if (!["admin", "expert"].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: "Geçersiz kullanıcı rolü.",
                });
            }

            if (
                req.user._id.toString() === user._id.toString() &&
                role !== "admin"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Kendi admin yetkinizi kaldıramazsınız.",
                });
            }

            user.role = role;
        }

        if (isActive !== undefined) {
            if (
                req.user._id.toString() === user._id.toString() &&
                isActive === false
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Kendi hesabınızı pasif duruma getiremezsiniz.",
                });
            }

            user.isActive = Boolean(isActive);
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Kullanıcı başarıyla güncellendi.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });


    } catch (error) {
        console.error("Update user error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Bu e-posta adresi zaten kullanılıyor.",
            });
        }

        if (error.name === "ValidationError") {
            const message = Object.values(error.errors)
                .map((item) => item.message)
                .join(" ");

            return res.status(400).json({
                success: false,
                message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Kullanıcı güncellenirken sunucu hatası oluştu.",
        });
    }
};

const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Geçersiz kullanıcı kimliği.",
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Yeni şifre en az 6 karakter olmalıdır.",
            });
        }

        const user = await User.findById(id).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Kullanıcı bulunamadı.",
            });
        }

        user.password = password;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Kullanıcı şifresi başarıyla güncellendi.",
        });
    } catch (error) {
        console.error("Reset user password error:", error);

        return res.status(500).json({
            success: false,
            message: "Şifre güncellenirken sunucu hatası oluştu.",
        });
    }
};

const deleteUser = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status.json({
                success: false,
                message: "Geçersiz kullanıcı kimliği."
            })
        }

        if (req.user._id.toString() === id) {
            return res.status(400).json({
                success: false,
                message: "Kendi kullanıcı hesabınızı silemezsiniz.",
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Kullanıcı bulunamadı.",
            });
        }

        if (user.role === "admin") {
            const adminCount = await User.countDocuments({
                role: "admin",
                isActive: true
            });

            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: "Sistemdeki son aktif admin kullanıcısı silinemez."
                })
            }
        }

        await user.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Kullanıcı başarıyla silindi.",
        });




    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            success: false,
            message: "Kullanıcı silinirken sunucu hatası oluştu."
        })

    }
}

export { getUsers, createUser, updateUser, resetUserPassword, deleteUser };