import React from "react";
import { AnalyzedMaterial } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface SupplierChartProps {
  data: AnalyzedMaterial[];
}

export const SupplierChart: React.FC<SupplierChartProps> = ({ data }) => {
  // 1. Group shortage quantities by Supplier for the Pie Chart
  const supplierShortages: { [supplier: string]: number } = {};
  data.forEach((item) => {
    if (item.shortageQty > 0) {
      supplierShortages[item.supplier] = (supplierShortages[item.supplier] || 0) + item.shortageQty;
    }
  });

  const pieData = Object.entries(supplierShortages)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 2. Filter Top 6 items with actual shortages for the Gap Comparison Bar Chart
  const shortageItems = data
    .filter((item) => item.shortageQty > 0)
    .slice(0, 6)
    .map((item) => ({
      name: item.materialName.length > 10 ? item.materialName.slice(0, 10) + "..." : item.materialName,
      required: item.requiredQty,
      delivered: item.deliveredQty,
      shortage: item.shortageQty
    }));

  const COLORS = [
    "#dc2626", // Red-600
    "#ea580c", // Orange-600
    "#d97706", // Amber-600
    "#4f46e5", // Indigo-600
    "#0d9488", // Teal-600
    "#7c3aed"  // Violet-600
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-lg border border-slate-700 font-sans">
          <p className="font-semibold mb-1">{payload[0].name}</p>
          <p className="text-rose-400">부족 수량: <span className="font-mono">{payload[0].value} 개</span></p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-lg border border-slate-700 font-sans">
          <p className="font-semibold mb-1.5">{payload[0].payload.name}</p>
          <p className="text-indigo-300">필요 수량: <span className="font-mono">{payload[0].payload.required} 개</span></p>
          <p className="text-emerald-300">입고 수량: <span className="font-mono">{payload[0].payload.delivered} 개</span></p>
          <p className="text-rose-400 font-semibold mt-1">부족 수량: <span className="font-mono">{payload[0].payload.shortage} 개</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Supplier Shortage Distribution */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-md flex flex-col h-[320px]">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-100">협력사별 결품 비중 (부족 수량 합계 기준)</h3>
          <p className="text-xs text-slate-400">현재 어느 공급업체에 납기 지연 수량이 집중되어 있는지 나타냅니다.</p>
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-between">
          {pieData.length === 0 ? (
            <div className="w-full text-center text-slate-500 text-sm py-12">
              결품 내역이 없습니다. (수급 매칭 완벽)
            </div>
          ) : (
            <>
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend List */}
              <div className="w-1/2 overflow-y-auto max-h-[220px] pr-2 flex flex-col justify-center">
                <ul className="space-y-2 text-xs">
                  {pieData.slice(0, 5).map((entry, index) => {
                    const totalShortages = pieData.reduce((acc, d) => acc + d.value, 0);
                    const percentage = totalShortages > 0 ? ((entry.value / totalShortages) * 100).toFixed(1) : "0";
                    return (
                      <li key={entry.name} className="flex items-start gap-2">
                        <span
                          className="w-3 h-3 rounded-full mt-0.5 shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-200 truncate" title={entry.name}>
                            {entry.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {entry.value} 개 ({percentage}%)
                          </p>
                        </div>
                      </li>
                    );
                  })}
                  {pieData.length > 5 && (
                    <li className="text-[10px] text-slate-500 pl-5">
                      외 {pieData.length - 5}개 업체 포함...
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chart 2: Material Shortage Gap */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-md flex flex-col h-[320px]">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-100">주요 지연 자재 수급 격차</h3>
          <p className="text-xs text-slate-400">지연이 큰 자재들의 필요 목표 수량과 실제 입고수량의 격차를 비교합니다.</p>
        </div>
        <div className="flex-1 min-h-0">
          {shortageItems.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm py-12">
              결품 내역이 없습니다. (수급 매칭 완벽)
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={shortageItems}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                barSize={16}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(30, 41, 59, 0.4)" }} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px", color: "#94a3b8" }} />
                <Bar name="필요 수량" dataKey="required" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar name="입고 수량" dataKey="delivered" fill="#10b981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
