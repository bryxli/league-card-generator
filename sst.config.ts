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
      environment: {
        RIOT_API_KEY: process.env.RIOT_API_KEY!,
      },
    });

    const site = new sst.aws.React("league-card-generator-app", {
      environment: {
        HANDLER_URL: lambda.url,
      },
    });
  },
});
