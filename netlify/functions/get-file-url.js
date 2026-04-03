const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

exports.handler = async function (event) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
    const body = JSON.parse(event.body || '{}');
    const { key } = body;
    if (!key) return { statusCode: 400, body: JSON.stringify({ error: 'Missing key' }) };

    const bucket = process.env.S3_BUCKET;
    if (!bucket)
      return { statusCode: 400, body: JSON.stringify({ error: 'S3_BUCKET not configured' }) };

    const s3 = new S3Client({});
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const url = await getSignedUrl(s3, command, { expiresIn: 300 });
    return { statusCode: 200, body: JSON.stringify({ url }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
