import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Doküman adı zorunludur"],
      trim: true,
      maxlength: [200, "Doküman adı en fazla 200 karakter olabilir"],
    },

    type: {
      type: String,
      required: [true, "Doküman türü zorunludur"],
      enum: [
        "guide",
        "technical_spec_template",
        "signature_declaration_template",
      ],
    },

    originalFileName: {
      type: String,
      required: [true, "Dosya adı zorunludur"],
      trim: true,
    },

    mimeType: {
      type: String,
      required: [true, "Dosya türü zorunludur"],
    },

    fileSize: {
      type: Number,
      required: [true, "Dosya boyutu zorunludur"],
      min: 0,
    },

    extractedText: {
      type: String,
      required: [true, "Doküman metni zorunludur"],
    },

    extractionStatus: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },

    extractionError: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

templateSchema.index({
  type: 1,
  isActive: 1,
});

const Template = mongoose.model("Template", templateSchema);

export default Template;