import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
} from "fintrabit-charts";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import { fetchChartData } from "../../store/slices/chartSlice";

type Candle = {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

const TV_UP = "#26A69A";
const TV_DOWN = "#EF5350";
const TV_LINE = "#2962FF";
const TV_EMA = "#FF9800";
const TV_SMA = "#9C27B0";
const TV_RSI = "#4CAF50";
const TV_MACD = "#03A9F4";

/* utils - simplified for chart compatibility */
function normalizeTime(t: number | string) {
  const n = typeof t === "string" ? Number(t) : t;
  // Lightweight-charts expects timestamps in seconds
  if (n > 1_000_000_000_000) return Math.floor(n / 1000);
  return Math.floor(n);
}

/* --- simple indicator implementations --- */
function calcSMA(data: Candle[], period = 20) {
  const out: Array<{ time: number; value: number }> = [];
  if (data.length < period) return out;
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i].close;
    if (i >= period) sum -= data[i - period].close;
    if (i >= period - 1) {
      out.push({ time: normalizeTime(data[i].time), value: sum / period });
    }
  }
  return out;
}

function calcEMA(data: Candle[], period = 20) {
  const out: Array<{ time: number; value: number }> = [];
  if (data.length < period) return out;
  const k = 2 / (period + 1);
  // seed with SMA of first period
  let seed = 0;
  for (let i = 0; i < period; i++) seed += data[i].close;
  let prev = seed / period;
  out.push({ time: normalizeTime(data[period - 1].time), value: prev });
  for (let i = period; i < data.length; i++) {
    const val = data[i].close * k + prev * (1 - k);
    prev = val;
    out.push({ time: normalizeTime(data[i].time), value: val });
  }
  return out;
}

function calcRSI(data: Candle[], period = 14) {
  // returns array with {time, value}
  const out: Array<{ time: number; value: number }> = [];
  if (data.length <= period) return out;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  let rs = avgGain / (avgLoss || 1e-9);
  out.push({
    time: normalizeTime(data[period].time),
    value: 100 - 100 / (1 + rs),
  });

  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rs = avgGain / (avgLoss || 1e-9);
    out.push({
      time: normalizeTime(data[i].time),
      value: 100 - 100 / (1 + rs),
    });
  }
  return out;
}

function calcMACD(data: Candle[]) {
  // standard MACD: EMA12 - EMA26, signal = EMA9 of MACD
  const fast = 12;
  const slow = 26;
  const signal = 9;
  if (data.length < slow)
    return { macdLine: [], signalLine: [], histogram: [] };
  const emaFast = calcEMA(data, fast).map((d) => ({
    time: d.time,
    value: d.value,
  }));
  const emaSlow = calcEMA(data, slow).map((d) => ({
    time: d.time,
    value: d.value,
  }));
  // align by time: emaFast might start earlier than emaSlow; align to emaSlow indices
  const macd: Array<{ time: number; value: number }> = [];
  // build a map for emaFast
  const fastMap = new Map(emaFast.map((e) => [e.time, e.value]));
  for (const s of emaSlow) {
    const f = fastMap.get(s.time);
    if (f !== undefined) macd.push({ time: s.time, value: f - s.value });
  }
  // signal is EMA of macd values
  const macdAsCandles = macd.map((m) => ({
    time: m.time,
    open: 0,
    high: 0,
    low: 0,
    close: m.value,
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signalLine = calcEMA(macdAsCandles as any, signal).map((d) => ({
    time: d.time,
    value: d.value,
  }));
  // histogram
  const sigMap = new Map(signalLine.map((s) => [s.time, s.value]));
  const histogram = macd.map((m) => ({
    time: m.time,
    value: m.value - (sigMap.get(m.time) ?? 0),
    color: m.value - (sigMap.get(m.time) ?? 0) >= 0 ? TV_UP : TV_DOWN,
  }));
  return { macdLine: macd, signalLine, histogram };
}

// Sidebar component for mobile
const MobileSidebar: React.FC<{
  children: React.ReactNode;
  onClose: () => void;
}> = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
    <div
      className="w-64 h-full bg-base-100 p-4 overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="font-bold mb-4">Indicators</h2>
      {children}
      <button onClick={onClose} className="mt-4 w-full btn btn-secondary">
        Close
      </button>
    </div>
  </div>
);

interface ChartComponentProps {
  height: string;
  instrumentId: string | null;
}

export default function ChartComponent({
  height,
  instrumentId,
}: ChartComponentProps) {
  const [dark, setDark] = useState(true);
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showLine, setShowLine] = useState(false);
  const [showArea, setShowArea] = useState(false);
  const [showHollow, setShowHollow] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // console.log("instrumentId CHART", instrumentId);
  const dispatch = useDispatch<AppDispatch>();
  const chartData = useSelector(
    (state: RootState) => state.chart.data
  ) as Candle[];
  const chartStatus = useSelector((state: RootState) => state.chart.status);

  const mainRef = useRef<HTMLDivElement | null>(null);
  const chart = useRef<IChartApi | null>(null);
  const candleSeries = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeries = useRef<ISeriesApi<"Histogram"> | null>(null);
  const lineSeries = useRef<ISeriesApi<"Line"> | null>(null);
  const areaSeries = useRef<ISeriesApi<"Area"> | null>(null);
  const smaSeries = useRef<ISeriesApi<"Line"> | null>(null);
  const emaSeries = useRef<ISeriesApi<"Line"> | null>(null);
  const rsiSeries = useRef<ISeriesApi<"Line"> | null>(null);
  const macdLineSeries = useRef<ISeriesApi<"Line"> | null>(null);
  const macdSignalSeries = useRef<ISeriesApi<"Line"> | null>(null);
  const macdHistSeries = useRef<ISeriesApi<"Histogram"> | null>(null);

  const loadingMoreDataRef = useRef(false);
  const chartDataLengthRef = useRef<number>(chartData.length);
  const apiStatus = useSelector(
    (state: RootState) => state.websockets.apiStatus
  );

  // keep chartDataLengthRef up-to-date so subscription callback uses latest value
  useEffect(() => {
    chartDataLengthRef.current = chartData.length;
  }, [chartData.length]);

  /* ---------- Fetch initial data on component mount ---------- */
  useEffect(() => {
    // Only fetch if we haven't loaded any data yet and websocket is connected
    if (
      apiStatus === "connected" &&
      chartStatus === "idle" &&
      chartData.length === 0 &&
      instrumentId
    ) {
      dispatch(
        fetchChartData({
          instrumentId,
          startIndex: 0,
          endIndex: 30,
        })
      );
    }
  }, [apiStatus, chartStatus, dispatch, chartData.length, instrumentId]);

  /* ---------- Handle loading more data when scrolling ---------- */
  useEffect(() => {
    if (!chart.current) return;

    const handleVisibleLogicalRangeChange = () => {
      const logicalRange = chart.current?.timeScale().getVisibleLogicalRange();
      if (!logicalRange || loadingMoreDataRef.current) return;

      const barsInfo = candleSeries.current?.barsInLogicalRange(logicalRange);
      if (!barsInfo || !barsInfo.barsBefore) return;

      // If we're close to the start of our data and not already loading
      if (barsInfo.barsBefore < 10 && chartStatus !== "loading") {
        loadingMoreDataRef.current = true;

        // Calculate the next batch of data to load
        const currentFirstIndex = chartData.length;
        dispatch(
          fetchChartData({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            instrumentId,
            startIndex: currentFirstIndex,
            endIndex: currentFirstIndex + 30, // Load 30 more candles
          })
        ).finally(() => {
          loadingMoreDataRef.current = false;
        });
      }
    };

    chart.current
      .timeScale()
      .subscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange);

    return () => {
      chart.current
        ?.timeScale()
        .unsubscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange);
    };
  }, [chart, chartStatus, chartData.length, dispatch, instrumentId]);

  /* ---------- Handle WebSocket updates ---------- */
  useEffect(() => {
    if (!candleSeries.current) return;

    // const handleNewData = async () => {
    //   if (chartStatus === "loading" || !instrumentId) return;

    //   const currentLen = chartData.length;
    //   if (currentLen > 0) {
    //     dispatch(
    //       fetchChartData({
    //         instrumentId,
    //         startIndex: currentLen,
    //         endIndex: currentLen + 1,
    //       })
    //     );
    //   }
    // };

    return () => {};
  }, [chartStatus, chartData.length, dispatch, instrumentId]);

  /* ---------- Initialize chart and series ---------- */
  useEffect(() => {
    if (!mainRef.current) return;

    chart.current = createChart(mainRef.current, {
      width: mainRef.current.clientWidth,
      height: mainRef.current.clientHeight,
      layout: {
        background: { color: dark ? "#18191f" : "#FFFFFF" } /**"#1B1B1B" */,
        textColor: dark ? "#D9D9D9" : "#191919",
      },
      grid: {
        vertLines: { color: dark ? "#292929" : "#E6E6E6" },
        horzLines: { color: dark ? "#292929" : "#E6E6E6" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        borderColor: dark ? "#292929" : "#E6E6E6",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Create main candlestick series
    candleSeries.current = chart.current.addCandlestickSeries({
      upColor: TV_UP,
      downColor: TV_DOWN,
      borderVisible: true,
      wickUpColor: TV_UP,
      wickDownColor: TV_DOWN,
    });

    // Create volume series
    volumeSeries.current = chart.current.addHistogramSeries({
      color: TV_UP,
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    // Create line overlay series
    lineSeries.current = chart.current.addLineSeries({
      color: TV_LINE,
      lineWidth: 2,
    });

    // Create area overlay series
    areaSeries.current = chart.current.addAreaSeries({
      topColor: `${TV_LINE}50`,
      bottomColor: `${TV_LINE}00`,
      lineColor: TV_LINE,
      lineWidth: 2,
    });

    // Create SMA series
    smaSeries.current = chart.current.addLineSeries({
      color: TV_SMA,
      lineWidth: 2,
    });

    // Create EMA series
    emaSeries.current = chart.current.addLineSeries({
      color: TV_EMA,
      lineWidth: 2,
    });

    // Set initial empty data to prevent errors

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emptyData: any[] = [];
    candleSeries.current.setData(emptyData);
    volumeSeries.current.setData(emptyData);
    lineSeries.current.setData(emptyData);
    areaSeries.current.setData(emptyData);
    smaSeries.current.setData(emptyData);
    emaSeries.current.setData(emptyData);

    // Fit content
    try {
      chart.current.timeScale().fitContent();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      /* empty */
    }

    // Cleanup function
    return () => {
      if (chart.current) {
        chart.current.remove();
        chart.current = null;
        candleSeries.current = null;
        volumeSeries.current = null;
        lineSeries.current = null;
        areaSeries.current = null;
        smaSeries.current = null;
        emaSeries.current = null;
        rsiSeries.current = null;
        macdLineSeries.current = null;
        macdSignalSeries.current = null;
        macdHistSeries.current = null;
      }
    };
  }, [dark]);

  /* ---------- Handle window resize ---------- */
  useEffect(() => {
    if (!chart.current || !mainRef.current) return;

    const handleResize = () => {
      chart.current?.applyOptions({
        width: mainRef.current?.clientWidth || 0,
        height: mainRef.current?.clientHeight || 0,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ---------- Update theme ---------- */
  useEffect(() => {
    if (!chart.current) return;

    chart.current.applyOptions({
      layout: {
        background: { color: dark ? "#18191f" : "#FFFFFF" },
        textColor: dark ? "#D9D9D9" : "#191919",
      },
      grid: {
        vertLines: { color: dark ? "#292929" : "#E6E6E6" },
        horzLines: { color: dark ? "#292929" : "#E6E6E6" },
      },
      timeScale: {
        borderColor: dark ? "#292929" : "#E6E6E6",
      },
    });
  }, [dark]);

  /* ---------- Update series data and indicators ---------- */
  useEffect(() => {
    if (!chart.current || !candleSeries.current || chartData.length === 0)
      return;

    // Sort and deduplicate data
    const sorted = [...chartData].sort(
      (a, b) => normalizeTime(a.time) - normalizeTime(b.time)
    );
    const unique = sorted.filter(
      (it, idx, arr) =>
        idx === 0 || normalizeTime(it.time) !== normalizeTime(arr[idx - 1].time)
    );

    const barData = unique.map((c) => ({
      time: normalizeTime(c.time),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    // Always update candlesticks

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    candleSeries.current.setData(barData);

    // Hollow toggle (apply options on the same candle series)
    candleSeries.current.applyOptions({
      upColor: showHollow ? "transparent" : TV_UP,
      downColor: showHollow ? "transparent" : TV_DOWN,
      borderUpColor: TV_UP,
      borderDownColor: TV_DOWN,
      wickUpColor: TV_UP,
      wickDownColor: TV_DOWN,
      borderVisible: true,
    });

    // Volume
    if (showVolume) {
      if (!volumeSeries.current) {
        volumeSeries.current = chart.current.addHistogramSeries({
          color: TV_UP,
          priceFormat: { type: "volume" },
          priceScaleId: "volume",
        });
      }

      volumeSeries.current.setData(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        unique.map((c) => ({
          time: normalizeTime(c.time),
          value: c.volume ?? 0,
          color: c.close >= c.open ? TV_UP : TV_DOWN,
        }))
      );
      chart.current.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
        borderVisible: false,
      });
    } else if (volumeSeries.current) {
      chart.current.removeSeries(volumeSeries.current);
      volumeSeries.current = null;
    }

    // Line overlay
    if (showLine) {
      if (!lineSeries.current) {
        lineSeries.current = chart.current.addLineSeries({
          color: TV_LINE,
          lineWidth: 2,
        });
      }
      lineSeries.current.setData(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        barData.map((d) => ({ time: d.time, value: d.close }))
      );
    } else if (lineSeries.current) {
      chart.current.removeSeries(lineSeries.current);
      lineSeries.current = null;
    }

    // Area overlay
    if (showArea) {
      if (!areaSeries.current) {
        areaSeries.current = chart.current.addAreaSeries({
          topColor: `${TV_LINE}50`,
          bottomColor: `${TV_LINE}00`,
          lineColor: TV_LINE,
          lineWidth: 2,
        });
      }
      areaSeries.current.setData(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        barData.map((d) => ({ time: d.time, value: d.close }))
      );
    } else if (areaSeries.current) {
      chart.current.removeSeries(areaSeries.current);
      areaSeries.current = null;
    }

    // SMA
    if (showSMA) {
      if (!smaSeries.current) {
        smaSeries.current = chart.current.addLineSeries({
          color: TV_SMA,
          lineWidth: 2,
        });
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      smaSeries.current.setData(calcSMA(unique, 20));
    } else if (smaSeries.current) {
      chart.current.removeSeries(smaSeries.current);
      smaSeries.current = null;
    }

    // EMA
    if (showEMA) {
      if (!emaSeries.current) {
        emaSeries.current = chart.current.addLineSeries({
          color: TV_EMA,
          lineWidth: 2,
        });
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      emaSeries.current.setData(calcEMA(unique, 20));
    } else if (emaSeries.current) {
      chart.current.removeSeries(emaSeries.current);
      emaSeries.current = null;
    }

    // RSI
    if (showRSI) {
      if (!rsiSeries.current) {
        rsiSeries.current = chart.current.addLineSeries({
          color: TV_RSI,
          lineWidth: 2,
          priceScaleId: "rsi",
        });
        rsiSeries.current.priceScale().applyOptions({
          scaleMargins: { top: 0.7, bottom: 0.2 },
        });
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      rsiSeries.current.setData(calcRSI(unique, 14));
    } else if (rsiSeries.current) {
      chart.current.removeSeries(rsiSeries.current);
      rsiSeries.current = null;
    }

    // MACD
    if (showMACD) {
      const { macdLine, signalLine, histogram } = calcMACD(unique);

      if (!macdLineSeries.current) {
        macdLineSeries.current = chart.current.addLineSeries({
          color: TV_MACD,
          lineWidth: 2,
          priceScaleId: "macd",
        });
        macdSignalSeries.current = chart.current.addLineSeries({
          color: "red",
          lineWidth: 2,
          priceScaleId: "macd",
        });
        macdHistSeries.current = chart.current.addHistogramSeries({
          base: 0,
          priceScaleId: "macd",
        });
        chart.current.priceScale("macd").applyOptions({
          scaleMargins: { top: 0.85, bottom: 0 },
        });
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      macdLineSeries.current.setData(macdLine);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      macdSignalSeries.current?.setData(signalLine);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      macdHistSeries.current?.setData(histogram);
    } else {
      if (macdLineSeries.current) {
        chart.current.removeSeries(macdLineSeries.current);
        macdLineSeries.current = null;
      }
      if (macdSignalSeries.current) {
        chart.current.removeSeries(macdSignalSeries.current);
        macdSignalSeries.current = null;
      }
      if (macdHistSeries.current) {
        chart.current.removeSeries(macdHistSeries.current);
        macdHistSeries.current = null;
      }
    }

    // Fit content after updates
    try {
      chart.current.timeScale().fitContent();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      /* empty */
    }
  }, [
    chartData,
    showVolume,
    showLine,
    showArea,
    showHollow,
    showSMA,
    showEMA,
    showRSI,
    showMACD,
  ]);

  const renderSidebarControls = () => (
    <>
      <div className="form-control mb-2">
        <label className="cursor-pointer label">
          <span className="label-text">Dark Theme</span>
          <input
            type="checkbox"
            checked={dark}
            onChange={(e) => setDark(e.target.checked)}
            className="toggle toggle-primary"
          />
        </label>
      </div>
      <div className="form-control mb-2">
        <label className="cursor-pointer label">
          <span className="label-text">Volume</span>
          <input
            type="checkbox"
            checked={showVolume}
            onChange={(e) => setShowVolume(e.target.checked)}
            className="toggle toggle-warning"
          />
        </label>
      </div>
      <div className="form-control mb-2">
        <label className="cursor-pointer label">
          <span className="label-text">Line</span>
          <input
            type="checkbox"
            checked={showLine}
            onChange={(e) => setShowLine(e.target.checked)}
            className="toggle toggle-error"
          />
        </label>
      </div>
      <div className="form-control mb-2">
        <label className="cursor-pointer label">
          <span className="label-text">Area</span>
          <input
            type="checkbox"
            checked={showArea}
            onChange={(e) => setShowArea(e.target.checked)}
            className="toggle toggle-primary"
          />
        </label>
      </div>
      <div className="form-control mb-2">
        <label className="cursor-pointer label">
          <span className="label-text">Hollow Candles</span>
          <input
            type="checkbox"
            checked={showHollow}
            onChange={(e) => setShowHollow(e.target.checked)}
            className="toggle toggle-secondary"
          />
        </label>
      </div>
      <div className="form-control mb-2">
        <label className="cursor-pointer label">
          <span className="label-text">SMA (20)</span>
          <input
            type="checkbox"
            checked={showSMA}
            onChange={(e) => setShowSMA(e.target.checked)}
            className="toggle toggle-secondary"
          />
        </label>
      </div>
      <div className="form-control mb-2">
        <label className="cursor-pointer label">
          <span className="label-text">EMA (20)</span>
          <input
            type="checkbox"
            checked={showEMA}
            onChange={(e) => setShowEMA(e.target.checked)}
            className="toggle toggle-accent"
          />
        </label>
      </div>
      <div className="form-control mb-2">
        <label className="cursor-pointer label">
          <span className="label-text">RSI (14)</span>
          <input
            type="checkbox"
            checked={showRSI}
            onChange={(e) => setShowRSI(e.target.checked)}
            className="toggle toggle-success"
          />
        </label>
      </div>
      <div className="form-control mb-2">
        <label className="cursor-pointer label">
          <span className="label-text">MACD</span>
          <input
            type="checkbox"
            checked={showMACD}
            onChange={(e) => setShowMACD(e.target.checked)}
            className="toggle toggle-info"
          />
        </label>
      </div>
    </>
  );

  return (
    <div className="flex flex-col" style={{ height }}>
      {/* Top bar for mobile */}
      <div className="flex items-center justify-between p-2">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="btn btn-ghost"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="text-xl font-bold">Candlestick Chart</span>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Main content area */}
      <main className="flex-1 flex flex-col gap-2 overflow-auto">
        <div
          ref={mainRef}
          className="flex-1 w-full min-h-[300px] border border-base-300 rounded-lg"
        />
      </main>

      {/* Mobile Sidebar/Drawer */}
      {isSidebarOpen && (
        <MobileSidebar onClose={() => setIsSidebarOpen(false)}>
          {renderSidebarControls()}
        </MobileSidebar>
      )}
    </div>
  );
}
