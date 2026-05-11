"use client";

import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { ja } from "date-fns/locale";

const categoryColors: Record<string, string> = {
  festival: "bg-red-500",
  food: "bg-amber-500",
  music: "bg-sky-500",
  sports: "bg-emerald-500",
  art: "bg-purple-500",
  workshop: "bg-pink-500",
  market: "bg-orange-500",
  other: "bg-slate-300",
};

export default function EventCalendar({ events }: { events: any[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const selectedDateEvents = selectedDate
    ? events.filter((e) => isSameDay(parseISO(e.start_at), selectedDate))
    : [];

  return (
    <div className="flex flex-col gap-4">
      {/* カレンダー本体 */}
      <div className="w-full bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="text-slate-300 hover:text-slate-900 transition-colors font-black text-[10px] tracking-widest uppercase"
          >
            Prev
          </button>
          {/* 月の表示を日本語に（例：2026年 5月） */}
          <span className="text-sm font-black tracking-widest text-slate-900">
            {format(currentMonth, "yyyy年 M月", { locale: ja })}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="text-slate-300 hover:text-slate-900 transition-colors font-black text-[10px] tracking-widest uppercase"
          >
            Next
          </button>
        </div>
        <div className="grid grid-cols-7 bg-slate-50/50">
          {/* 曜日を日本語に */}
          {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
            <div key={i} className={`py-3 text-center text-[10px] font-black text-slate-400 ${i === 0 ? "text-rose-400" : i === 6 ? "text-sky-400" : ""}`}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 p-1">
          {(() => {
            const rows = [];
            let days = [];
            let day = startDate;
            while (day <= endDate) {
              for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const dayEvents = events.filter((e) => isSameDay(parseISO(e.start_at), cloneDay));
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                days.push(
                  <div
                    key={day.toString()}
                    onClick={() => setSelectedDate(cloneDay)}
                    className={`relative aspect-square p-2 border border-slate-50 transition-all cursor-pointer group ${
                      !isSameMonth(day, monthStart) ? "opacity-10" : "hover:bg-yellow-50"
                    } ${isSelected ? "bg-yellow-100/50" : ""}`}
                  >
                    <span
                      className={`text-[10px] font-black transition-all ${
                        isSelected ? "text-slate-900 scale-125" : isToday ? "text-lime-600 underline decoration-2 underline-offset-4" : "text-slate-400"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <div key={e.id} className={`h-1 w-1 rounded-full ${categoryColors[e.category] || "bg-slate-200"}`} />
                      ))}
                    </div>
                  </div>
                );
                day = addDays(day, 1);
              }
              rows.push(<React.Fragment key={day.toString()}>{days}</React.Fragment>);
              days = [];
            }
            return rows;
          })()}
        </div>
      </div>

      {/* 選択した日のスケジュール表示 */}
      <div className="rounded-[32px] bg-white p-6