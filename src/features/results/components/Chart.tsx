import { ResponsiveLine } from "@nivo/line";

import { formatNumber } from "~/utils/formatNumber";
import { suffixNumber } from "~/utils/suffixNumber";

export interface IResultsChartProps {
  data: {
    id: string;
    data: { x: string; y: number | undefined }[];
  }[];
}

const ResultsChart = ({ data }: IResultsChartProps): JSX.Element => (
  <ResponsiveLine
    useMesh
    axisBottom={{
      renderTick: ({ textAnchor, textX, textY, value, x, y }) => (
        <g transform={`translate(${x},${y})`}>
          <text fontSize={10} textAnchor={textAnchor} transform={`translate(${textX},${textY}) rotate(${-20})`}>
            <tspan>{value}</tspan>
          </text>
        </g>
      ),
    }}
    axisLeft={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legendOffset: -40,
      legendPosition: "middle",
      renderTick: ({ textAnchor, textX, textY, value, x, y }) => (
        <g transform={`translate(${x},${y})`}>
          <text fontSize={10} textAnchor={textAnchor} transform={`translate(${textX},${textY})`}>
            <tspan>{suffixNumber(Number(value))}</tspan>
          </text>
        </g>
      ),
    }}
    axisRight={null}
    axisTop={null}
    curve="monotoneX"
    data={data}
    margin={{ top: 30, right: 60, bottom: 60, left: 60 }}
    pointBorderColor={{ from: "serieColor" }}
    pointBorderWidth={2}
    pointColor={{ theme: "background" }}
    pointLabelYOffset={-12}
    pointSize={10}
    yFormat={(v) => formatNumber(Number(v))}
    yScale={{
      type: "linear",
      min: "auto",
      max: "auto",
    }}
  />
);

export default ResultsChart;
