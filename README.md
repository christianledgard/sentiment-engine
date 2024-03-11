# Sentiment Engine

You can find the project deployed at [sentiment-engine.vercel.app](https://sentiment-engine.vercel.app/). Also, you can access the administrative panel at the [/admin](https://sentiment-engine.vercel.app/admin/) route.

## Technologies

This project is based on [T3 Stack](https://create.t3.gg/). It uses the following technologies:

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)


## Run the project

1. Install the dependencies:
```bash
npm install
```

2. Define the environment variables. See [.env.example](.env.example) for the template.
3. Run the project
```bash
npm run dev
```


NOTE: You will need to have a PostgreSQL database and an AWS account with permissions to interact with the [ComprehendClient API](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-comprehend/).