import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Kullanıcı adı zorunludur"],
        trim: true,
        minlength: [2, "Kullanıcı adı en az 2 karakter olmalıdır"],
        maxlength: [100, "Kullanıcı adı en fazla 100 karakter olabilir"]
    },
    email: {
        type: String,
        required: [true, "Email zorunludur"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Geçerli bir e-posta adresi giriniz",
        ],
    },
    password: {
        type: String,
        required: [true, "Şifre zorunludur"],
        minlength: [6, "Şifre en az 6 karakter olmalıdır"],
        select: false,
    },
    role: {
        type: String,
        enum: ["admin", "expert"],
        default: "admin",
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLoginAt: {
        type: Date,
        default: null
    }

},
    {
        timestamps: true,
    }

);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;