"use client";

import React from "react";
import LineChartReport from "~/app/_components/line-chart";

import PieChartReport from "~/app/_components/pie-chart";

const Report = () => {
  return (
    <div className="flex flex-row">
      <PieChartReport />
      <LineChartReport />
    </div>
  );
};

export default Report;
