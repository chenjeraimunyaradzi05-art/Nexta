const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const SENDGRID = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_FROM || 'noreply@gimbi.example';

const DATA_FILE = path.resolve(__dirname, '..', '..', 'data', 'applications.json');
// optional DynamoDB table name (set in env) for production use
const DDB_TABLE = process.env.DYNAMODB_TABLE || '';

function getDDBDocClient() {
  const client = new DynamoDBClient({});
  return DynamoDBDocumentClient.from(client);
}

function ensureDataFolder() {
  const d = path.dirname(DATA_FILE);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

async function saveAppToFile(app) {
  if (DDB_TABLE) {
    return await saveAppToDDB(app);
  }
  ensureDataFolder();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const arr = JSON.parse(raw || '[]');
  arr.push(app);
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
  return app;
}

// DynamoDB helpers (if DDB_TABLE configured)
async function saveAppToDDB(app) {
  const ddb = getDDBDocClient();
  await ddb.send(new PutCommand({ TableName: DDB_TABLE, Item: app }));
  return app;
}

async function getAllAppsFromDDB() {
  const ddb = getDDBDocClient();
  const data = await ddb.send(new ScanCommand({ TableName: DDB_TABLE }));
  return data.Items || [];
}

async function deleteAppFromDDB(id) {
  const ddb = getDDBDocClient();
  await ddb.send(new DeleteCommand({ TableName: DDB_TABLE, Key: { id } }));
  return true;
}

async function getAllAppsFromFile() {
  if (DDB_TABLE) {
    return await getAllAppsFromDDB();
  }
  ensureDataFolder();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw || '[]');
}

async function deleteAppFromFile(id) {
  if (DDB_TABLE) {
    return await deleteAppFromDDB(id);
  }
  ensureDataFolder();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const arr = JSON.parse(raw || '[]').filter((a) => a.id !== id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
  return true;
}

async function uploadToS3({ bucket, key, buffer, contentType }) {
  // this helper uses AWS S3 — requires AWS_* env vars when deployed
  if (!bucket) throw new Error('Missing S3 bucket');
  const s3 = new S3Client({});
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private',
    })
  );
  return `s3://${bucket}/${key}`;
}

module.exports = {
  saveAppToFile,
  getAllAppsFromFile,
  deleteAppFromFile,
  uploadToS3,
  SENDGRID,
  SENDGRID_FROM,
};
