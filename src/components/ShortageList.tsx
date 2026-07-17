import React, { useState } from "react";
import { AnalyzedMaterial, ShortageStatus } from "../types";
import { StatusIndicator } from "./StatusIndicator";
import { Search, Filter, Download, ArrowUpDown, ChevronLeft, ChevronRight, Check } from "lucide-react";

interface ShortageListProps {
  materials: AnalyzedMaterial[];
}

export const ShortageList: React.FC<ShortageListProps> = ({ materials }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShortageStatus | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"code" | "qty" | "date" | "status">("status");
  const [sortAsc, setSortAsc] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const itemsPerPage = 8;

  // Filter logic
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort logic
  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    let valA: any = "";
    let valB: any = "";

    if (sortBy === "code") {
      valA = a.materialCode;
      valB = b.materialCode;
    } else if (sortBy === "qty") {
      valA = a.shortageQty;
      valB = b.shortageQty;
    } else if (sortBy === "date") {
      valA = a.targetDate;
      valB = b.targetDate;
    } else if (sortBy === "status") {
      const statusPriority = { CRITICAL: 0, OVERDUE: 1, WARNING: 2, NORMAL: 3 };
      valA = statusPriority[a.status];
      valB = statusPriority[b.status];
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedMaterials.length / itemsPerPage) || 1;
  const paginatedMaterials = sortedMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
    setCurrentPage(1);
  };

  // Convert table to CSV and trigger browser download
  const handleDownloadCSV = () => {
    if (sortedMaterials.length === 0) return;

    const BOM = "\uFEFF"; // Fix Korean encoding issue in Excel
    const headers = [
      "자재코드",
      "자재명",
      "상태",
      "필요수량",
      "입고수량",
      "부족수량",
      "투입예정일",
      "최종입고일",
      "공정단계",
      "협력사명"
    ];

    const rows = sortedMaterials.map((m) => [
      m.materialCode,
      m.materialName,
      m.status === "CRITICAL" ? "위험" : m.status === "OVERDUE" ? "지연" : m.status === "WARNING" ? "경고" : "정상",
      m.requiredQty,
      m.deliveredQty,
      m.shortageQty,
      m.targetDate,
      m.deliveryDate,
      m.processStage,
      m.supplier
    ]);

    const csvContent =
      BOM +
      [headers.join(","), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join(
        "\n"
      );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Shortage_Analysis_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="자재명, 코드, 협력사 검색..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-hanwha-orange bg-white text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            {(["ALL", "CRITICAL", "OVERDUE", "WARNING", "NORMAL"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setStatusFilter(filter);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  statusFilter === filter
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {filter === "ALL"
                  ? "전체"
                  : filter === "CRITICAL"
                  ? "위험"
                  : filter === "OVERDUE"
                  ? "지연"
                  : filter === "WARNING"
                  ? "경고"
                  : "정상"}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleDownloadCSV}
          disabled={sortedMaterials.length === 0}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-950 border border-slate-900 text-white disabled:opacity-50 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          {downloadSuccess ? (
            <>
              <Check size={14} className="text-emerald-400" />
              다운로드 완료
            </>
          ) : (
            <>
              <Download size={14} />
              보고서 엑셀 다운로드 (CSV)
            </>
          )}
        </button>
      </div>

      {/* Main Table Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wide">
              <th className="py-3 px-4">자재명 / 자재코드</th>
              <th
                onClick={() => handleSort("status")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  위기 등급
                  <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">수급률 (입고 / 필요)</th>
              <th
                onClick={() => handleSort("qty")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  부족 수량
                  <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("date")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  투입 예정일
                  <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">공정 단계</th>
              <th className="py-3 px-4">책임 협력사</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {paginatedMaterials.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                  해당하는 자재 내역이 없습니다. 검색어 또는 필터를 변경해 주세요.
                </td>
              </tr>
            ) : (
              paginatedMaterials.map((item) => {
                const progressPct =
                  item.requiredQty > 0 ? Math.min(100, Math.round((item.deliveredQty / item.requiredQty) * 100)) : 0;

                return (
                  <tr key={item.materialCode} className="hover:bg-slate-50/50 transition-colors">
                    {/* Name & Code */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900 leading-normal">{item.materialName}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.materialCode}</p>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusIndicator status={item.status} delayDays={item.delayDays} />
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3 px-4 max-w-[150px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono font-medium">
                          <span>
                            {item.deliveredQty} / {item.requiredQty} 개
                          </span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded h-1.5 overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.status === "CRITICAL"
                                ? "bg-rose-500"
                                : item.status === "OVERDUE"
                                ? "bg-orange-500"
                                : item.status === "WARNING"
                                ? "bg-amber-400"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Shortage Qty */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {item.shortageQty > 0 ? (
                        <span className="text-rose-600 font-extrabold">-{item.shortageQty} 개</span>
                      ) : (
                        <span className="text-emerald-600 font-extrabold">충족 완료</span>
                      )}
                    </td>

                    {/* Target Date */}
                    <td className="py-3 px-4 font-mono text-slate-600 font-medium whitespace-nowrap">{item.targetDate}</td>

                    {/* Process Stage */}
                    <td className="py-3 px-4 text-slate-500 font-medium max-w-[140px] truncate" title={item.processStage}>
                      {item.processStage}
                    </td>

                    {/* Supplier */}
                    <td className="py-3 px-4 text-slate-600 font-semibold truncate max-w-[140px]" title={item.supplier}>
                      {item.supplier}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
        <p>
          총 <span className="font-bold text-slate-800">{sortedMaterials.length}</span>개 중{" "}
          <span className="font-bold text-slate-800">
            {sortedMaterials.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, sortedMaterials.length)}
          </span>
          개 항목 표시
        </p>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 border border-slate-200 bg-white rounded-md hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer text-slate-600"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                currentPage === page
                  ? "bg-hanwha-orange text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 border border-slate-200 bg-white rounded-md hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer text-slate-600"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
