/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "league-card-generator",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const lambda = new sst.aws.Function("league-card-generator-handler", {
      handler: "app/functions/lambda.handler",
      url: true,
      timeout: "2 minutes",
      environment: {
        RIOT_API_KEY: process.env.RIOT_API_KEY!,
        BEDROCK_MODEL_ID: "amazon.titan-image-generator-v2:0",
      },
      permissions: [
        {
          actions: [
            "bedrock:InvokeModel",
            "bedrock:InvokeModelWithResponseStream",
          ],
          resources: ["*"], // TODO: Narrow down to specific model ARN
        },
      ],
    });

    const site = new sst.aws.React("league-card-generator-app", {
      environment: {
        HANDLER_URL: lambda.url,
      },
    });
  },
});
