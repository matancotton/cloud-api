const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    originalName: {
        type: String,
    },
    type: {
        type: String,
    },
    storageName: {
        type: String,
    },
    bucket: {
        type: String,
    },
    region: {
        type: String,
    },
    key: {
        type: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
});

const File = mongoose.model("File", fileSchema);

module.exports = File;
