import ChartComponent from "../../components/chartComponent/ChartComponent";

const Charts = () => {
  const height = "calc(100vh - 150px)";
  return (
    <div>
      <ChartComponent height={height} />
    </div>
  );
};

export default Charts;

// const chartData = [
//   { time: "2018-12-22", value: 32.51 },
//   { time: "2018-12-23", value: 31.11 },
//   { time: "2018-12-24", value: 27.02 },
//   { time: "2018-12-25", value: 27.32 },
//   { time: "2018-12-26", value: 25.17 },
//   { time: "2018-12-27", value: 28.89 },
//   { time: "2018-12-28", value: 25.46 },
//   { time: "2018-12-29", value: 23.92 },
//   { time: "2018-12-30", value: 22.68 },
//   { time: "2018-12-31", value: 22.67 },
// ];
// // --- Sample Data for a Candlestick Chart ---
// const candlestickData: BarData<Time>[] = [];
// const startDate = new Date(2024, 0, 1).getTime() / 1000;

// for (let i = 0; i < 100; i++) {
//   const time = (startDate + i * 24 * 60 * 60) as Time;
//   const open = 20 + Math.sin(i * 0.5) * 5 + Math.random() * 2;
//   const high = open + Math.random() * 2;
//   const low = open - Math.random() * 2;
//   const close = low + Math.random() * 4;
//   candlestickData.push({ time, open, high, low, close });
// }

// // --- Sample Data for an Area Chart ---
// // const areaData: LineData<Time>[] = candlestickData.map((item) => ({
// //   time: item.time,
// //   value: item.close, // Use the closing price for the area chart value
// // }));
