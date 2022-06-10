'use strict';

const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const fs = require("fs");

module.exports.s3put = async (event, context, callback) => {
    try {
        const originalBucket = process.env.OriginalBucketName;
        const filename = 'male1.jpg';
        
        const data = fs.readFileSync(`face_images/${filename}`);
        const params = {
            Bucket: originalBucket,
            Key: filename,
            Body: data,
        };

        const result = await s3.putObject(params).promise();
        callback(null, {
            message: `Put ${filename} to S3 successs`,
            params: {}
        });
    } catch (error) {
        callback(error);
    }
};