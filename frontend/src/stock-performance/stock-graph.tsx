import { AllSeriesType } from "@mui/x-charts/models";
import { StockHistoryResponse } from "../api/stocks-api";
import { axisClasses, BarPlot, ChartsAxisHighlight, ChartsTooltip, ChartsXAxis, ChartsYAxis, LineHighlightPlot, LinePlot, ResponsiveChartContainer } from "@mui/x-charts";

export default function StockGraph({
  history,
  showOpen,
  showClose,
  showLow,
  showHigh,
  showVolume,
}: {
  history: StockHistoryResponse[],
  showOpen: boolean;
  showClose: boolean;
  showLow: boolean;
  showHigh: boolean;
  showVolume: boolean;
}) {
  const series: AllSeriesType[] = [];

  showOpen && series.push({
    type: 'line',
    yAxisId: 'price',
    color: 'blue',
    label: 'Open',
    data: history.map((day) => day.open),
  });

  showClose && series.push({
    type: 'line',
    yAxisId: 'price',
    color: 'orange',
    label: 'Close',
    data: history.map((day) => day.close),
  });

  showLow && series.push({
    type: 'line',
    yAxisId: 'price',
    color: 'red',
    label: 'Low',
    data: history.map((day) => day.low),
  });

  showHigh && series.push({
    type: 'line',
    yAxisId: 'price',
    color: 'green',
    label: 'High',
    data: history.map((day) => day.high),
  });

  showVolume && series.push({
    type: 'bar',
    yAxisId: 'volume',
    label: 'Volume',
    color: 'lightgray',
    data: history.map((day) => day.volume),
  });

  return (
    <div className="bg-slate-50 rounded-lg p-4 px-6 shadow-lg">
      <ResponsiveChartContainer
        height={500}
        series={series}
        xAxis={[{
          id: "date",
          data: history.map((day) => new Date(day.timestamp)),
          scaleType: "band",
          valueFormatter: (value: Date) => value.toLocaleDateString(),
        }]}
        yAxis={[
          {
            id: "price",
            scaleType: "linear",
          },
          {
            id: "volume",
            scaleType: "linear",
            valueFormatter: (value) => `${(value / 1000000).toLocaleString()}M`,
          },
        ]}
      >
        <ChartsAxisHighlight x="line" />
        <BarPlot />
        <LinePlot />

        <LineHighlightPlot />
        <ChartsXAxis
          label="Date"
          position="bottom"
          axisId="date"
          tickInterval={(_, index) => {
            return index % 30 === 0;
          }}
          tickLabelStyle={{
            fontSize: 10,
          }}
        />
        <ChartsYAxis
          label="Price (USD)"
          position="left"
          axisId="price"
          tickLabelStyle={{ fontSize: 10 }}
          sx={{
            [`& .${axisClasses.label}`]: {
              transform: 'translateX(-5px)',
            },
          }}
        />
        <ChartsYAxis
          label="Volume"
          position="right"
          axisId="volume"
          tickLabelStyle={{ fontSize: 10 }}
          sx={{
            [`& .${axisClasses.label}`]: {
              transform: 'translateX(5px)',
            },
          }}
        />
        <ChartsTooltip />
      </ResponsiveChartContainer>
    </div>
  );
}
