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

  // 選択された日のイベントを取得
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
          <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="text-slate-300 hover:text-slate-900 transition-colors font-black text-[10px] tracking-widest uppercase"
          >
            Next
          </button>
        </div>
        <div className="grid grid-cols-7 bg-slate-50/50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
            <div key={i} className="py-3 text-center text-[8px] font-black uppercase tracking-widest text-slate-300">
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

      {/* 選択された日のイベントを表示するエリア */}
      <div className="rounded-[32px] bg-white p-6 border border-slate-100 shadow-sm transition-all animate-in fade-in slide-in-from-top-2">
        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4 flex justify-between items-center">
          <span>Schedule / {selectedDate ? format(selectedDate, "MMM dd") : "Select Date"}</span>
          <span className="text-lime-600 italic">[{selectedDateEvents.length} Items]</span>
        </h3>
        
        <div className="space-y-3">
          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map((event) => (
              <div key={event.id} className="flex flex-col gap-1 border-l-4 border-slate-900 pl-4 py-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-lime-600">
                  {event.category}
                </span>
                <p className="text-xs font-black text-slate-900 leading-tight">
                  {event.title}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  Time : {format(parseISO(event.start_at), "HH:mm")} / Loc : {event.location}
                </p>
              </div>
            ))
          ) : (
            <p className="text-[9px] font-black text-slate-200 uppercase tracking-[0.4em] text-center py-4">
              No Events
            </p>
          )}
        </div>
      </div>
    </div>
  );
}