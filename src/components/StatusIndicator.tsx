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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-xs font-semibold bg-red-500/10 text-red-400 border-red-500/20">
          <AlertCircle size={12} className="animate-pulse" />
          위험 (Critical)
        </span>
      );
    case "OVERDUE":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-xs font-semibold bg-orange-500/10 text-orange-400 border-orange-500/20">
          <Clock size={12} />
          지연 (Overdue) {delayDays && delayDays > 0 ? `+${delayDays}일` : ""}
        </span>
      );
    case "WARNING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-xs font-semibold bg-amber-500/10 text-amber-400 border-amber-500/20">
          <AlertTriangle size={12} />
          경고 (Warning)
        </span>
      );
    case "NORMAL":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-xs font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          <CheckCircle size={12} />
          정상 (Normal)
        </span>
      );
  }
};

