import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { 
  ChevronDown, 
  ChevronUp, 
  RefreshCcw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Activity 
} from 'lucide-react';
import { useOrderBookStore } from '@/stores/orderbook-store';

const useBinanceData = (symbol: string, timeframe: string) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const limit = 500;
      const endTime = Date.now();
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=${limit}&endTime=${endTime}`;
      
      const response = await fetch(url);
      const rawData = await response.json();

      const processedData = rawData.map((candle: any[]) => ({
        timestamp: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5]),
      }));

      setData(processedData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, refetch: fetchData };
};

// Tooltip Component
const Tooltip = React.memo(({ 
  visible, 
  x, 
  y, 
  data 
}: { 
  visible: boolean, 
  x: number, 
  y: number, 
  data: any 
}) => {
  if (!visible || !data) return null;

  return (
    <div 
      className="absolute bg-zinc-800 text-white p-2 rounded shadow-lg text-sm"
      style={{
        left: `${x + 10}px`,
        top: `${y - 10}px`,
        pointerEvents: 'none'
      }}
    >
      <div>Date: {new Date(data.timestamp).toLocaleString()}</div>
      <div>Open: ${data.open.toFixed(2)}</div>
      <div>High: ${data.high.toFixed(2)}</div>
      <div>Low: ${data.low.toFixed(2)}</div>
      <div>Close: ${data.close.toFixed(2)}</div>
      <div>Volume: {data.volume.toLocaleString()}</div>
    </div>
  );
});

const AdvancedCandlestickChart: React.FC = React.memo(() => {
  const orderBookState = useOrderBookStore();

  const [symbol, setSymbol] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('1h');
  const [chartMode, setChartMode] = useState<'pan' | 'zoom'>('pan');
  const [tooltipData, setTooltipData] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, refetch } = useBinanceData(symbol, timeframe);

  useEffect(() => {
    const disconnectWs = orderBookState.connectWebSocket(symbol);
    return () => {
      disconnectWs();
    };
  }, [symbol, orderBookState.connectWebSocket]);

  const renderChart = useCallback(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 50, bottom: 50, left: 50 };
    const width = containerRef.current?.clientWidth || 800;
    const height = 500;

    const timeExtent = d3.extent(data, d => new Date(d.timestamp)) as [Date, Date];
    timeExtent[1] = new Date(Math.min(timeExtent[1].getTime(), Date.now() + 30 * 60 * 1000));

    const chartSvg = svg
      .attr('width', width)
      .attr('height', height);

    const g = chartSvg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(timeExtent)
      .range([0, width - margin.left - margin.right]);

    const y = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.low) as number * 0.99,
        d3.max(data, d => d.high) as number * 1.01
      ])
      .range([height - margin.top - margin.bottom, 0]);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 50])
      .extent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        const newX = event.transform.rescaleX(x);
        const newY = event.transform.rescaleY(y);

        g.select('.x-axis').call(d3.axisBottom(newX) as any);
        g.select('.y-axis').call(d3.axisLeft(newY) as any);

        g.selectAll('.candle')
          .attr('x', d => newX(new Date((d as any).timestamp)))
          .attr('width', (width / data.length) * event.transform.k * 0.8);
      });

    chartSvg.call(zoom as any);

    const candles = g.selectAll('.candle')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'candle cursor-pointer')
      .attr('x', d => x(new Date(d.timestamp)))
      .attr('y', d => y(Math.max(d.open, d.close)))
      .attr('width', width / data.length * 0.8)
      .attr('height', d => Math.abs(y(d.open) - y(d.close)))
      .attr('fill', d => d.close > d.open ? 'rgba(52, 211, 153, 0.7)' : 'rgba(239, 68, 68, 0.7)')
      .on('mousemove', (event, d) => {
        setTooltipData(d);
        setTooltipPosition({ x: event.pageX, y: event.pageY });
      })
      .on('mouseout', () => {
        setTooltipData(null);
      });

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x));

    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));

  }, [data]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT'];
  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

  const currentPrice = useMemo(() => orderBookState.prices[symbol], [orderBookState.prices, symbol]);

  return (
    <div className="bg-zinc-950 text-white rounded-xl shadow-2xl overflow-hidden relative">
      <div className="flex justify-between items-center p-4 bg-zinc-900">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity className="text-emerald-500" />
            <span className="font-bold text-lg">{symbol}</span>
          </div>
          {currentPrice && (
            <div className={`text-xl font-semibold ${currentPrice > (data[data.length - 1]?.close || 0) ? 'text-emerald-500' : 'text-red-500'}`}>
              ${currentPrice.toFixed(2)}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <select 
            value={symbol} 
            onChange={(e) => { orderBookState.setAsset(e.target.value);  setSymbol(e.target.value); }}
            className="bg-zinc-800 text-white p-2 rounded"
          >
            {symbols.map(sym => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>

          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-zinc-800 text-white p-2 rounded"
          >
            {timeframes.map(tf => (
              <option key={tf} value={tf}>{tf}</option>
            ))}
          </select>

          <div className="flex items-center bg-zinc-800 rounded">
            <button 
              onClick={() => setChartMode('pan')}
              className={`p-2 ${chartMode === 'pan' ? 'bg-emerald-600' : ''} rounded`}
            >
              <Move className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setChartMode('zoom')}
              className={`p-2 ${chartMode === 'zoom' ? 'bg-emerald-600' : ''} rounded`}
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>

          <button 
            onClick={refetch}
            disabled={isLoading}
            className="bg-zinc-800 p-2 rounded hover:bg-emerald-700 disabled:opacity-50"
          >
            <RefreshCcw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="w-full relative">
        <svg 
          ref={svgRef} 
          className="w-full h-[500px]"
        />
      </div>

      <Tooltip 
        visible={!!tooltipData} 
        x={tooltipPosition.x} 
        y={tooltipPosition.y} 
        data={tooltipData} 
      />
    </div>
  );
});

export default AdvancedCandlestickChart;