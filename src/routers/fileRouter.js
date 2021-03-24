const express = require("express");
const { Readable } = require("stream");
const {
    uploadFileToS3,
    getFileFromS3,
    deleteFileFromS3,
} = require("../middleware/s3-handler");
const File = require("../models/fileModel");
const userAuth = require("../middleware/userAuth");

const router = new express.Router();

router.post(
    "/upload-file",
    userAuth,
    uploadFileToS3,
    async (req, res) => {
        if (!req.file) {
            res.status(422).send({
                code: 422,
                message: "File didn't upload",
            });
        }

        const file = new File({
            originalName: req.file.originalname,
            storageName: req.file.key.split("/")[1],
            bucket: process.env.S3_BUCKET,
            region: process.env.AWS_REGION,
            key: req.file.key,
            owner: req.user._id,
        });
        try {
            await file.save();
            res.send({ message: "the file was uploaded!!" });
        } catch (err) {
            console.log(err.message);
            res.status(400).send({ error: err.messsage });
        }
    },
    (error, req, res, next) => {
        console.log(error.message);
        res.status(400).send({ error: error.message });
    }
);

router.get("/get-files", userAuth, async (req, res) => {
    try {
        await req.user.populate({ path: "files" }).execPopulate();
        res.send(req.user.files);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get("/get-file", userAuth, getFileFromS3, async (req, res) => {
    const fileName = req.query.name;
    const stream = Readable.from(req.fileBuffer);
    res.setHeader("Content-Disposition", "attachment; filename=" + fileName);
    stream.pipe(res);
});

router.delete("/delete-file", userAuth, deleteFileFromS3, async (req, res) => {
    try {
        await File.findByIdAndDelete(req.body.id);
        res.send("deleted!");
    } catch (err) {
        return res.status(400).send({ error: err.message });
    }
});

module.exports = router;
