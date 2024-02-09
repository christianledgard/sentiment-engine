import { z } from "zod";
import {
  ComprehendClient,
  DetectSentimentCommand,
  LanguageCode,
} from "@aws-sdk/client-comprehend";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { env } from "~/env";
import { TRPCError } from "@trpc/server";

export const feedbackRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.union([z.string().email(), z.literal("")]),
        message: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let availableQuota = 0;
      try {
        const quota = await ctx.db.aWSQuota.findFirstOrThrow({
          where: { serviceName: "AWSAccess" },
        });
        availableQuota = quota.maxCapacity - quota.current;
      } catch (err) {
        await ctx.db.aWSQuota.create({
          data: { serviceName: "AWSAccess", current: 0, maxCapacity: 10 },
        });
        availableQuota = 100;
      }
      const maxCapacityReached = availableQuota <= 0;

      if (!maxCapacityReached) {
        const comprehendClient = new ComprehendClient({
          region: "us-east-1",
          credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          },
        });
        const comprehendInput = {
          Text: input.message,
          LanguageCode: LanguageCode.EN,
        };
        const comprehendCommand = new DetectSentimentCommand(comprehendInput);
        const comprehendResponse =
          await comprehendClient.send(comprehendCommand);

        const result = await ctx.db.$transaction([
          ctx.db.aWSQuota.update({
            where: { serviceName: "AWSAccess" },
            data: { current: { increment: 1 } },
          }),
          ctx.db.feedback.create({
            data: {
              ...input,
              sentimentResult: comprehendResponse.Sentiment,
              sentimentPositive: comprehendResponse.SentimentScore?.Positive,
              sentimentNegative: comprehendResponse.SentimentScore?.Negative,
              sentimentNeutral: comprehendResponse.SentimentScore?.Neutral,
              sentimentMixed: comprehendResponse.SentimentScore?.Mixed,
            },
          }),
        ]);
        return result[1];
      } else {
        throw new TRPCError({
          message:
            "Throttle blocked for security reasons. Go to the database an allow more requests.",
          code: "BAD_REQUEST",
        });
      }
    }),

  getAllFeedback: protectedProcedure.query(({ ctx }) => {
    return ctx.db.feedback.findMany();
  }),

  deleteFeedbackById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.feedback.delete({
        where: { id: input.id },
      });
    }),
});
