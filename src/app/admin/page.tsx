"use client";

import React from "react";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import { DeleteFeedback } from "../_components/delete-feedback";

const SentimentAnalysis = () => {
  const { data, isLoading, isError, refetch } =
    api.feedback.getAllFeedback.useQuery();
  if (isError) return <div>Error...</div>;

  return (
    <>
      <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
        <h1 className="text-2xl font-bold">Sentiment Analysis</h1>
      </header>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Feedback</TableHead>
            <TableHead>Sentiment</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow className="animate-pulse">
              <TableCell>
                <Skeleton className="h-4 w-[150px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[150px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[200px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[50px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[200px]" />
              </TableCell>
            </TableRow>
          ) : (
            <>
              {data?.map((feedback) => (
                <TableRow
                  // className="bg-red-100 dark:bg-red-800 dark:text-red-200"
                  key={feedback.id}
                >
                  <TableCell className="font-medium">{feedback.name}</TableCell>
                  <TableCell>{feedback.email}</TableCell>
                  <TableCell>{feedback.message}</TableCell>
                  <TableCell>
                    <b>{feedback.sentimentResult}</b>
                    <ul className="list-disc">
                      <li>
                        😃{" "}
                        {feedback.sentimentPositive == null
                          ? "n/a"
                          : (Number(feedback.sentimentPositive) * 100)
                              .toFixed(2)
                              .toString() + "%"}
                      </li>
                      <li>
                        😐{" "}
                        {feedback.sentimentNeutral == null
                          ? "n/a"
                          : (Number(feedback.sentimentNeutral) * 100)
                              .toFixed(2)
                              .toString() + "%"}
                      </li>
                      <li>
                        😡{" "}
                        {feedback.sentimentNegative == null
                          ? "n/a"
                          : (Number(feedback.sentimentNegative) * 100)
                              .toFixed(2)
                              .toString() + "%"}
                      </li>
                    </ul>
                  </TableCell>
                  <TableCell>
                    <DeleteFeedback
                      feedbackId={feedback.id}
                      refetch={refetch}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default SentimentAnalysis;
