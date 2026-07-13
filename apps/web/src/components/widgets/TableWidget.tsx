import * as React from "react";
import type { ShapedRow } from "@/lib/shapeWidgetData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TableWidgetProps {
  rows: ShapedRow[];
  pageSize?: number;
  stripedRows?: boolean;
}

export function TableWidget({ rows, pageSize = 5, stripedRows = false }: TableWidgetProps) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<1 | -1>(1);
  const [page, setPage] = React.useState(0);

  const columns = React.useMemo(() => (rows[0] ? Object.keys(rows[0]) : []), [rows]);

  const sorted = React.useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sortDir;
      return String(av).localeCompare(String(bv)) * sortDir;
    });
  }, [rows, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const clampedPage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(clampedPage * pageSize, clampedPage * pageSize + pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  if (rows.length === 0) {
    return <div className="flex h-full items-center justify-center text-[11px] text-ink-3">No data yet</div>;
  }

  return (
    <div className="flex h-full flex-col gap-2 overflow-hidden">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col}
                  onClick={() => toggleSort(col)}
                  className="cursor-pointer select-none whitespace-nowrap"
                >
                  {col} {sortKey === col ? (sortDir === 1 ? "▲" : "▼") : ""}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row, i) => (
              <TableRow key={i} className={cn(stripedRows && i % 2 === 1 && "bg-bg-2")}>
                {columns.map((col) => (
                  <TableCell key={col} className="whitespace-nowrap text-[12px]">
                    {String(row[col])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-end gap-2 text-[11px] text-ink-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={clampedPage === 0}
            className="cursor-pointer disabled:cursor-default disabled:opacity-30"
          >
            ←
          </button>
          <span>
            {clampedPage + 1} / {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={clampedPage === pageCount - 1}
            className="cursor-pointer disabled:cursor-default disabled:opacity-30"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
