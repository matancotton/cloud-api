const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = new AWS.S3({ region: process.env.AWS_REGION });

const bucket = process.env.S3_BUCKET;

const fileStorage = multerS3({
    s3,
    acl: "private",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    contentDisposition: "inline",
    bucket,
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        const validValues = /\.(jpeg|jpg|png|docx|pdf)$/;
        if (!validValues.test(file.originalname)) {
            return cb(new Error("File type not supported!"));
        }
        const fileName =
            "files/" +
            req.user.username +
            "/" +
            new Date().getTime() +
            "-" +
            file.originalname;
        cb(null, fileName);
    },
});

const uploadFileToS3 = multer({ storage: fileStorage }).single("file");

const getFileFromS3 = async (req, res, next) => {
    const Key = req.query.key;
    try {
        const { Body } = await s3.getObject({ Key, Bucket: bucket }).promise();
        req.fileBuffer = Body;
        next();
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
};

const deleteFileFromS3 = async (req, res, next) => {
    const Key = req.body.key;
    console.log(req.body);
    try {
        await s3
            .deleteObject({
                Key,
                Bucket: bucket,
            })
            .promise();
        next();
    } catch (err) {
        res.status(404).send({ error: "File not found" });
    }
};

module.exports = { uploadFileToS3, deleteFileFromS3, getFileFromS3 };
