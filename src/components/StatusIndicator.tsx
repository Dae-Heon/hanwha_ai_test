import React from "react";
import { ShortageStatus } from "../types";
import { AlertCircle, AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface StatusIndicatorProps {
  status: ShortageStatus;
  delayDays?: number;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, delayDays }) => {
  switch (status) {
    case "CRITICAL":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold bg-rose-50 text-rose-600 border-rose-100">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          위험 (Critical)
        </span>
      );
    case "OVERDUE":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold bg-orange-50 text-orange-600 border-orange-100">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          지연 (Overdue) {delayDays && delayDays > 0 ? `+${delayDays}일` : ""}
        </span>
      );
    case "WARNING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold bg-amber-50 text-amber-600 border-amber-100">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          경고 (Warning)
        </span>
      );
    case "NORMAL":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold bg-emerald-50 text-emerald-600 border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          정상 (Normal)
        </span>
      );
  }
};

