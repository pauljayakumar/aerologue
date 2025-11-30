// AWS Configuration for Aerologue Web App

export const awsConfig = {
  region: 'us-east-1',

  // Cognito
  cognito: {
    userPoolId: 'us-east-1_Y9cTSJeIm',
    userPoolClientId: '4r4muf65b9298l0hn70v1082mu',
  },

  // API
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://mazzuw3qr6.execute-api.us-east-1.amazonaws.com/prod',
  },

  // S3
  s3: {
    mediaBucket: 'aerologue-media-prod',
    region: 'us-east-1',
  },
};

export default awsConfig;
