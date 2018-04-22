export default {
  MAX_ATTACHMENT_SIZE: 5000000,
  s3: {
    REGION: "us-east-1",
    BUCKET: "meters-app-uploads"
  },
  apiGateway: {
    REGION: "us-east-1",
    URL: "https://yea78x6ak0.execute-api.us-east-1.amazonaws.com/prod"
  },
  cognito: {
    REGION: "us-east-1",
    USER_POOL_ID: "us-east-1_2ecZq8OGX",
    APP_CLIENT_ID: "6cabfq8drvi48sesn29uevvpfn",
    IDENTITY_POOL_ID: "us-east-1:b5f14e14-a29a-4361-a37b-a790cad29ad4"
  }
};