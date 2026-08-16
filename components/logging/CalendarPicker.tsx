"use client";

// ============================================
// GGLOG — Calendar Picker (Logging Page)
// ============================================
// Custom calendar UI. Today selected by default,
// future dates disabled. No browser native input.
// ============================================

import { useState, useMemo } from "react";

interface CalendarPickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isFutureDay(date: Date, today: Date): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return d.getTime() > t.getTime();
}

export default function CalendarPicker({ value, onChange }: CalendarPickerProps) {
  const today = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState(value.getMonth());
  const [viewYear, setViewYear] = useState(value.getFullYear());

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{ date: Date; currentMonth: boolean }> = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - i),
        currentMonth: false,
      });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(viewYear, viewMonth, i),
        currentMonth: true,
      });
    }

    // Next month padding
    const remaining = 42 - days.length; // 6 rows × 7 columns
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(viewYear, viewMonth + 1, i),
        currentMonth: false,
      });
    }

    return days;
  }, [viewMonth, viewYear]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    // Don't allow navigating into future months
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    const firstOfNext = new Date(nextY, nextM, 1);
    if (firstOfNext > today) return;

    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDateClick = (day: { date: Date; currentMonth: boolean }) => {
    if (!day.currentMonth) return;
    if (isFutureDay(day.date, today)) return;
    onChange(day.date);
  };

  const isNextDisabled = (() => {
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    return new Date(nextY, nextM, 1) > today;
  })();

  return (
    <section className="log-section">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-pixel text-[10px] text-text tracking-wider flex items-center gap-2">
          <span className="text-lime">📅</span>
          WHEN DID YOU PLAY?
        </h2>
        <span className="font-mono text-[9px] text-text-muted/40 tracking-wider border border-border/50 px-2 py-0.5">
          FILL
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Calendar Grid */}
        <div className="flex-shrink-0">
          {/* Month/Year Nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="font-mono text-sm text-text-dim hover:text-lime transition-colors px-2 py-1"
            >
              ◀
            </button>
            <span className="font-pixel text-[9px] text-lime tracking-wider">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              disabled={isNextDisabled}
              className={`
                font-mono text-sm px-2 py-1 transition-colors
                ${isNextDisabled
                  ? "text-text-muted/20 cursor-not-allowed"
                  : "text-text-dim hover:text-lime"
                }
              `}
            >
              ▶
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-0 mb-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="w-9 h-6 flex items-center justify-center font-space text-[8px] text-text-muted/60 tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-0">
            {calendarDays.map((day, i) => {
              const selected = isSameDay(day.date, value);
              const isToday = isSameDay(day.date, today);
              const future = isFutureDay(day.date, today);
              const disabled = !day.currentMonth || future;

              return (
                <button
                  key={i}
                  onClick={() => handleDateClick(day)}
                  disabled={disabled}
                  className={`
                    calendar-day w-9 h-8 flex items-center justify-center
                    font-mono text-[11px] transition-all duration-150
                    ${disabled
                      ? "text-text-muted/15 cursor-default"
                      : selected
                        ? "bg-lime text-bg font-bold"
                        : isToday
                          ? "text-lime border border-lime/30"
                          : "text-text-dim hover:bg-surface-lighter hover:text-lime"
                    }
                  `}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Display */}
        <div className="flex-1 flex flex-col justify-center">
          <span className="font-mono text-[9px] text-text-muted tracking-wider mb-2">
            SELECTED DATE
          </span>
          <div className="font-terminal text-2xl md:text-3xl text-lime glow-lime tracking-wider">
            {value.getDate()} {MONTHS[value.getMonth()]} {value.getFullYear()}
          </div>
        </div>
      </div>
    </section>
  );
}
