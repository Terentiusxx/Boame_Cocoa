'use client';
import { useState } from "react";
import Link from "next/link";
import DiseaseCard from "./DiseaseCard";
import { ScanItem } from "@/lib/types";
import { getDiseaseLocalImage } from "@/lib/utils";
import IconComponent from "@/components/IconComponent";

function urgencyToClass(urgency: string) {
  const u = urgency.toLowerCase()
  if (u.includes('high')) return 'text-red-500'
  if (u.includes('medium')) return 'text-orange-500'
  if (u.includes('low')) return 'text-green-600'
  return 'text-gray-400'
}

export default function Historydetails({ allScans }: { allScans: ScanItem[] }) {
  const [scans, setScans] = useState<ScanItem[]>(allScans);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set()); // stores history_id values
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function toggleSelect(historyId: number) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(historyId)) next.delete(historyId);
      else next.add(historyId);
      return next;
    });
  }

  function enterSelectMode() {
    setSelected(new Set());
    setDeleteError(null);
    setSelectMode(true);
  }

  function exitSelectMode() {
    setSelected(new Set());
    setDeleteError(null);
    setSelectMode(false);
  }

  async function handleDelete() {
    if (selected.size === 0) return;
    setDeleting(true);
    setDeleteError(null);

    const ids = Array.from(selected);
    const results = await Promise.allSettled(
      ids.map(id =>
        fetch(`/api/history/${id}`, { method: 'DELETE' })
          .then(r => ({ id, ok: r.ok }))
      )
    );

    const failed = results
      .filter(r => r.status === 'fulfilled' && !(r.value as { ok: boolean }).ok)
      .map(r => (r as PromiseFulfilledResult<{ id: number; ok: boolean }>).value.id);

    // Remove successfully deleted scans from local state (match by history_id)
    const deletedIds = new Set(
      ids.filter(id => !failed.includes(id))
    );
    setScans(prev => prev.filter(s => !deletedIds.has(s.history_id)));
    setSelected(new Set());
    setDeleting(false);

    if (failed.length > 0) {
      setDeleteError(`${failed.length} item(s) could not be deleted. Please try again.`);
    } else {
      setSelectMode(false);
    }
  }

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="px-6 pb-28">
        <div className="flex items-center justify-between py-4 mb-6">
          {/* Back / Cancel */}
          {selectMode ? (
            <button
              onClick={exitSelectMode}
              className="bg-transparent border-none text-sm font-medium text-brand-sub-text cursor-pointer p-2 rounded-full hover:bg-black/5"
            >
              Cancel
            </button>
          ) : (
            <Link
              href="/home"
              className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
            >
              <span className="text-xl">‹</span>
            </Link>
          )}

          <h1 className="text-xl font-semibold text-brand-text-titles">History</h1>

          {/* Delete / Trash icon */}
          {selectMode ? (
            <div className="w-9" />
          ) : (
            <button
              onClick={enterSelectMode}
              aria-label="Select items to delete"
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 text-brand-sub-text"
            >
              <IconComponent icon="trash" size={18} />
            </button>
          )}
        </div>

        {selectMode && (
          <p className="text-sm text-brand-sub-text mb-4">
            {selected.size === 0
              ? 'Tap scans to select'
              : `${selected.size} selected`}
          </p>
        )}

        {deleteError && (
          <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {deleteError}
          </p>
        )}

        <div>
          <h2 className="text-lg font-semibold text-brand-sub-titles mb-4">Previous Scans</h2>

          {scans.length === 0 && (
            <p className="text-sm text-brand-sub-text">No scans yet.</p>
          )}

          {scans.map((scan) => {
            const isSelected = selected.has(scan.history_id);
            return (
              <div key={scan.history_id} className="relative">
                <DiseaseCard
                  id={String(scan.scan_id)}
                  name={scan.disease_name}
                  urgency={scan.urgency_level}
                  image={getDiseaseLocalImage(scan.disease_name)}
                  urgencyClass={urgencyToClass(scan.urgency_level)}
                  onClick={selectMode ? () => toggleSelect(scan.history_id) : undefined}
                />
                {/* Selection overlay */}
                {selectMode && (
                  <div
                    className={`absolute inset-0 rounded-brand pointer-events-none transition-colors ${
                      isSelected ? 'bg-brand-buttons/10 ring-2 ring-brand-buttons' : ''
                    }`}
                  >
                    <span
                      className={`absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                        isSelected
                          ? 'border-brand-buttons bg-brand-buttons'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky delete bar — sits above the bottom navbar (z-50) */}
      {selectMode && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile px-6 pb-6 pt-4 z-[60]">
          <button
            onClick={handleDelete}
            disabled={selected.size === 0 || deleting}
            className="w-full py-3 rounded-brand bg-red-500 text-white font-semibold text-sm shadow-lg transition disabled:opacity-40"
          >
            {deleting
              ? 'Deleting…'
              : selected.size === 0
              ? 'Select items to delete'
              : `Delete ${selected.size} item${selected.size > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  )
}