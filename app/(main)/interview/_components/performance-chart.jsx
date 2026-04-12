"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function PerformanceChart({ assessments }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (assessments) {
      const formattedData = assessments.map((assessment) => ({
        date: format(new Date(assessment.createdAt), "MMM dd"),
        score: assessment.quizScore,
      }));
      setChartData(formattedData);
    }
  }, [assessments]);

  return (
    <Card className="bg-black border border-white/5 shadow-2xl rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white text-3xl md:text-4xl">
          Performance Trend
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your quiz scores over time
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] bg-black rounded-xl">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              style={{ backgroundColor: "black" }}
            >
              {/* GRID */}
              <CartesianGrid
                stroke="rgba(255,255,255,0.15)"
                strokeDasharray="4 4"
              />

              {/* X AXIS */}
              <XAxis
                dataKey="date"
                tick={{ fill: "#aaa" }}
                axisLine={{ stroke: "#444" }}
                tickLine={{ stroke: "#444" }}
              />

              {/* Y AXIS */}
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#aaa" }}
                axisLine={{ stroke: "#444" }}
                tickLine={{ stroke: "#444" }}
              />

              {/* TOOLTIP */}
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    return (
                      <div className="bg-black border border-white/10 rounded-lg p-2 shadow-xl">
                        <p className="text-sm font-medium text-white">
                          Score: {payload[0].value}%
                        </p>
                        <p className="text-xs text-gray-400">
                          {payload[0].payload.date}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* LINE */}
              <Line
                type="monotone"
                dataKey="score"
                stroke="#ffffff"
                strokeWidth={2}
                dot={{
                  fill: "#ffffff",
                  stroke: "#ffffff",
                }}
                activeDot={{
                  fill: "#ffffff",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                  r: 5,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}