import AWSXRay from 'aws-xray-sdk';
import AWS from 'aws-sdk';
import { createLogger } from '../utils/logger.js';

const XAWS = AWSXRay.captureAWS(AWS);
const s3BucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const logger = createLogger('attchementUtils');

export class AttachmentUtils {
    constructor(
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = s3BucketName
    ) { }

    getAttachmentUrl(todoId: string): string {
        return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
    }

    getUploadUrl(todoId: string): string {
        logger.info("called the getUploadUrl api")
        const uploadUrl = this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: parseInt(urlExpiration)
        })
        return uploadUrl
    }
}
