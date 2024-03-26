import { z } from "zod";
import {
  ComprehendClient,
  DetectSentimentCommand,
  LanguageCode,
} from "@aws-sdk/client-comprehend";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
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

  getAllFeedback: publicProcedure.query(({ ctx }) => {
    return ctx.db.feedback.findMany();
  }),

  sentimentAggregation: publicProcedure.query(async ({ ctx }) => {
    const feedback = await ctx.db.feedback.groupBy({
      by: ["sentimentResult"],
      _count: {
        sentimentResult: true,
      },
    });
    return feedback
      .map((feedback_1) => {
        return {
          name: feedback_1.sentimentResult ?? "n/a",
          count: feedback_1._count.sentimentResult,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }),

  sentimentPerMonth: publicProcedure
    .output(
      z.array(
        z.object({
          month: z.string(),
          sumPositive: z.string(),
          sumNegative: z.string(),
          sumMixed: z.string(),
          sumNeutral: z.string(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const result: {
        month: string;
        sumPositive: number;
        sumNegative: number;
        sumMixed: number;
        sumNeutral: number;
      }[] = await ctx.db.$queryRaw`
        SELECT 
          TO_CHAR("createdAt", 'MM-YYYY') AS month,
          SUM("sentimentPositive") AS "sumPositive",
          SUM("sentimentNegative") AS "sumNegative",
          SUM("sentimentMixed") AS "sumMixed",
          SUM("sentimentNeutral") AS "sumNeutral"
        FROM "Feedback"
        GROUP BY TO_CHAR("createdAt", 'MM-YYYY')
        ORDER BY TO_CHAR("createdAt", 'MM-YYYY') ASC;
      `;

      return result.map((entry) => {
        return {
          month: entry.month,
          sumPositive: entry.sumPositive.toFixed(2),
          sumNegative: entry.sumNegative.toFixed(2),
          sumMixed: entry.sumMixed.toFixed(2),
          sumNeutral: entry.sumNeutral.toFixed(2),
        };
      });
    }),

  deleteFeedbackById: publicProcedure
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
