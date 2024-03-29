"use client";

import React from "react";
import { api } from "~/trpc/react";

import {
  Tooltip,
  LineChart,
  CartesianGrid,
  YAxis,
  XAxis,
  Legend,
  Line,
} from "recharts";
import { Skeleton } from "~/components/ui/skeleton";

const LineChartReport = () => {
  const { data, isError } = api.feedback.sentimentPerMonth.useQuery();
  console.log({ data });

  if (isError) return <div>Error...</div>;

  if (data)
    return (
      <div className="mt-auto">
        <LineChart
          width={600}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="sumPositive"
            stroke="#008000"
            name="Positive"
          />
          <Line
            type="monotone"
            dataKey="sumNegative"
            stroke="#FF0000"
            name="Negative"
          />
          <Line
            type="monotone"
            dataKey="sumMixed"
            stroke="#800080"
            name="Mixed"
          />
          <Line
            type="monotone"
            dataKey="sumNeutral"
            stroke="#0000FF"
            name="Neutral"
          />
        </LineChart>
      </div>
    );

  return <Skeleton className="h-[300px] w-[600px]" />;
};

export default LineChartReport;
