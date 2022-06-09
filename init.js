'use strict';

const AWS = require("aws-sdk");

const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB();

const MAX_BATCH_SIZE = 25;

const truncateBucket = async (bucketName) => {
    const data = await s3.listObjects({Bucket: bucketName}).promise();
    for(let content of data.Contents) {
        if(content.Key.match(/.*jpg$/)) {
            await s3.deleteObject({ Bucket: bucketName, Key: content.Key }).promise();
        }
    }
};

const batchDelete = async (tableName, items) => {
    const params = {
        RequestItems: {
            [tableName]: items.map((item) => {
                return {
                    DeleteRequest: {
                        Key: {
                            id: item.id,
                            createdAt: item.createdAt
                        }
                    }
                }
            })
        }
    };
    await dynamoDB.batchWriteItem(params).promise();
};

const getAllData = async (tableName) => {
    const res = await dynamoDB.scan({ TableName: tableName }).promise();
    return {
        ...res,
        Items: res.Items.map((item) => {
            return {
                id: item.id,
                createdAt: item.createdAt
            }
        })
    };
};

const chunk = (arr, size = 1) => {
    let newarr = []
    for (let i = 0; i < arr.length / size; i++)
        newarr[i] = []
        for (let j = 0; j < arr.length; j++)
        newarr[Math.floor(j / size)][j % size] = arr[j]
    return newarr
};

module.exports.init = async (event, context, callback) => {
    try {
        const originalBucket = process.env.OriginalBucketName;
        const processedBucket = process.env.ProcessedBucketName;
        const tableName = process.env.DynamoTableName;

        await truncateBucket(originalBucket);
        await truncateBucket(processedBucket);

        const { Items, Count } = await getAllData(tableName);
        if (Count !== 0) {
            const batches = chunk(Items, MAX_BATCH_SIZE);
            for (const batch of batches) {
                await batchDelete(tableName, batch);
            }
        }
        callback(null, "init success");
    } catch (error) {
        callback(error);
    }
};