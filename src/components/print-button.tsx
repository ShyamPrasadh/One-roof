"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="no-print rounded-xl bg-brand-700 px-5 py-2 font-semibold text-white">
      Print / Save as PDF
    </button>
  );
}
