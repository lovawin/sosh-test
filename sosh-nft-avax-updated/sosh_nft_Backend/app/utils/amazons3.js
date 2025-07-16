const aws = require('aws-sdk');
const uuid = require('uuid').v4;
const appconfig = require('../../config/appconfig');
const logging = require('../logging');

const s3 = new aws.S3({
  accessKeyId: appconfig.AWS_ACCESS_KEY,
  secretAccessKey: appconfig.AWS_SECRET_KEY,
  region: appconfig.AWS_REGION,
});

const uploadToS3 = async function (buffer, folder, ext) {
  // Create a request ID for tracking this operation
  const requestId = `s3-upload-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  const fileKey = `${uuid()}${ext}`;
  
  // Log the start of the S3 upload process
  logging.apiLogger.logRequest({
    method: 'S3_UPLOAD',
    url: `s3://${appconfig.AWS_BUCKET_NAME}/${folder}/${fileKey}`,
    context: {
      requestId,
      operation: 's3_upload_start',
      bucket: appconfig.AWS_BUCKET_NAME,
      folder,
      fileType: ext,
      bufferSize: buffer ? buffer.length : 0
    }
  });
  
  // Check if buffer is valid
  if (!buffer || buffer.length === 0) {
    const error = new Error('Invalid or empty buffer provided for S3 upload');
    
    // Log buffer validation error
    logging.errorLogger.logError(error, {
      context: 's3_upload_buffer_validation',
      requestId,
      operation: 's3_upload',
      bucket: appconfig.AWS_BUCKET_NAME,
      folder,
      fileType: ext,
      bufferSize: buffer ? buffer.length : 0
    });
    
    throw error;
  }
  
  const uploadparams = {
    Bucket: `${appconfig.AWS_BUCKET_NAME}/${folder}`,
    Body: buffer,
    Key: fileKey,
    ACL: 'public-read',
  };
  
  try {
    // Log S3 upload attempt with parameters
    logging.apiLogger.logRequest({
      method: 'S3_UPLOAD',
      url: `s3://${appconfig.AWS_BUCKET_NAME}/${folder}/${fileKey}`,
      context: {
        requestId,
        operation: 's3_upload_attempt',
        bucket: uploadparams.Bucket,
        key: uploadparams.Key,
        acl: uploadparams.ACL,
        contentLength: buffer.length
      }
    });
    
    const result = await s3.upload(uploadparams).promise();
    
    // Log successful S3 upload
    logging.apiLogger.logRequest({
      method: 'S3_UPLOAD',
      url: `s3://${appconfig.AWS_BUCKET_NAME}/${folder}/${fileKey}`,
      context: {
        requestId,
        operation: 's3_upload_success',
        bucket: uploadparams.Bucket,
        key: uploadparams.Key,
        location: result.Location,
        etag: result.ETag
      }
    });
    
    return result;
  } catch (error) {
    // Log S3 upload error with detailed information
    logging.errorLogger.logError(error, {
      context: 's3_upload_error',
      requestId,
      operation: 's3_upload',
      bucket: uploadparams.Bucket,
      key: uploadparams.Key,
      errorCode: error.code,
      errorMessage: error.message,
      awsRequestId: error.requestId,
      statusCode: error.statusCode,
      retryable: error.retryable,
      region: appconfig.AWS_REGION
    });
    
    throw error;
  }
};

const deleteFromS3 = async function (key, bucket = appconfig.AWS_BUCKET_NAME) {
  // Create a request ID for tracking this operation
  const requestId = `s3-delete-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  
  // Log the start of the S3 delete process
  logging.apiLogger.logRequest({
    method: 'S3_DELETE',
    url: `s3://${bucket}/${key}`,
    context: {
      requestId,
      operation: 's3_delete_start',
      bucket,
      key
    }
  });
  
  console.log(key, bucket);
  
  try {
    const result = await s3.deleteObject({ Bucket: bucket, Key: key }).promise();
    
    // Log successful S3 delete
    logging.apiLogger.logRequest({
      method: 'S3_DELETE',
      url: `s3://${bucket}/${key}`,
      context: {
        requestId,
        operation: 's3_delete_success',
        bucket,
        key,
        deleteMarker: result.DeleteMarker,
        versionId: result.VersionId
      }
    });
    
    return result;
  } catch (error) {
    // Log S3 delete error with detailed information
    logging.errorLogger.logError(error, {
      context: 's3_delete_error',
      requestId,
      operation: 's3_delete',
      bucket,
      key,
      errorCode: error.code,
      errorMessage: error.message,
      awsRequestId: error.requestId,
      statusCode: error.statusCode,
      retryable: error.retryable,
      region: appconfig.AWS_REGION
    });
    
    throw error;
  }
};

module.exports = { uploadToS3, deleteFromS3 };
