"use client";

// 纯 SVG 五维（或任意维）雷达图，无外部依赖
export function RadarChart({
  data,
  size = 300,
  max = 100,
}: {
  data: { name: string; score: number }[];
  size?: number;
  max?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.34; // 半径
  const n = data.length;
  const rings = [0.25, 0.5, 0.75, 1];

  // 第 i 个轴的角度（从正上方开始，顺时针）
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, ratio: number) => {
    const a = angle(i);
    return [cx + r * ratio * Math.cos(a), cy + r * ratio * Math.sin(a)];
  };

  const polygon = data
    .map((d, i) => point(i, Math.max(0, Math.min(1, d.score / max))).join(","))
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-sm"
      role="img"
      aria-label="能力五维雷达图"
    >
      {/* 网格环 */}
      {rings.map((ratio, ri) => (
        <polygon
          key={ri}
          points={data
            .map((_, i) => point(i, ratio).join(","))
            .join(" ")}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}
      {/* 轴线 */}
      {data.map((_, i) => {
        const [x, y] = point(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        );
      })}
      {/* 数据多边形 */}
      <polygon
        points={polygon}
        fill="rgba(245, 158, 11, 0.25)"
        stroke="#f59e0b"
        strokeWidth={2}
      />
      {/* 顶点 */}
      {data.map((d, i) => {
        const [x, y] = point(i, Math.max(0, Math.min(1, d.score / max)));
        return <circle key={i} cx={x} cy={y} r={3} fill="#f59e0b" />;
      })}
      {/* 维度标签 + 分值 */}
      {data.map((d, i) => {
        const [x, y] = point(i, 1.18);
        const a = angle(i);
        const anchor =
          Math.abs(Math.cos(a)) < 0.3
            ? "middle"
            : Math.cos(a) > 0
              ? "start"
              : "end";
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="fill-slate-600"
            fontSize={11}
          >
            {d.name}
            <tspan className="fill-amber-600 font-semibold"> {d.score}</tspan>
          </text>
        );
      })}
    </svg>
  );
}
