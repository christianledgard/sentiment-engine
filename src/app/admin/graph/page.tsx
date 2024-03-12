"use client";

import React from "react";
import LineChartReport from "~/app/_components/line-chart";

import PieChartReport from "~/app/_components/pie-chart";

const Report = () => {
  return (
    <div className="flex flex-col lg:flex-row ">
      <div>
        <h2 className="text-2xl">Overall Customer Sentiment</h2>
        <PieChartReport />
      </div>
      <div>
        <h2 className="mb-12 text-2xl">Sentiment vs Time</h2>
        <LineChartReport />
      </div>
    </div>
  );
};

export default Report;
