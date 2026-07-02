"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { Deal } from "@/lib/types";

const STAGES: { key: string; label: string; color: string }[] = [
  { key: "draft", label: "Draft", color: "#94A3B8" },
  { key: "active", label: "Active", color: "#0F766E" },
  { key: "in_review", label: "In review", color: "#0EA5A2" },
  { key: "disputed", label: "Disputed", color: "#C2410C" },
  { key: "appealed", label: "Appealed", color: "#D97706" },
  { key: "completed", label: "Completed", color: "#15803D" },
  { key: "cancelled", label: "Cancelled", color: "#B91C1C" },
  { key: "archived", label: "Archived", color: "#667085" },
];

/** D3 horizontal bar chart of deals across lifecycle stages. */
export function DealFlowChart({ deals }: { deals: Deal[] }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const counts = STAGES.map((s) => ({ ...s, v: deals.filter((d) => d.status === s.key).length }));
    const W = 520, rowH = 30, M = { top: 6, right: 30, bottom: 6, left: 92 };
    const H = M.top + M.bottom + counts.length * rowH;
    const svg = d3.select(el).attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%").attr("height", H);
    svg.selectAll("*").remove();

    const max = Math.max(1, d3.max(counts, (d) => d.v) ?? 1);
    const x = d3.scaleLinear().domain([0, max]).range([0, W - M.left - M.right]);
    const y = d3.scaleBand<string>().domain(counts.map((d) => d.key)).range([M.top, H - M.bottom]).padding(0.3);
    const g = svg.append("g").attr("transform", `translate(${M.left},0)`);

    g.selectAll("line.track").data(counts).join("line")
      .attr("x1", 0).attr("x2", x(max)).attr("y1", (d) => (y(d.key) ?? 0) + y.bandwidth() / 2).attr("y2", (d) => (y(d.key) ?? 0) + y.bandwidth() / 2)
      .attr("stroke", "#E5EAF0").attr("stroke-width", 1);

    g.selectAll("rect.bar").data(counts).join("rect")
      .attr("x", 0).attr("y", (d) => y(d.key) ?? 0).attr("height", y.bandwidth()).attr("rx", 3)
      .attr("fill", (d) => d.color).attr("opacity", 0.9)
      .attr("width", 0).transition().duration(550).attr("width", (d) => Math.max(d.v > 0 ? 4 : 0, x(d.v)));

    svg.append("g").selectAll("text.lbl").data(counts).join("text")
      .attr("x", M.left - 10).attr("y", (d) => (y(d.key) ?? 0) + y.bandwidth() / 2 + 4).attr("text-anchor", "end")
      .attr("fill", "#667085").attr("font-size", 11).text((d) => d.label);

    g.selectAll("text.val").data(counts).join("text")
      .attr("x", (d) => x(d.v) + 6).attr("y", (d) => (y(d.key) ?? 0) + y.bandwidth() / 2 + 4)
      .attr("fill", "#111827").attr("font-size", 11).attr("font-family", "ui-monospace, monospace").text((d) => d.v);
  }, [deals]);

  return <svg ref={ref} role="img" aria-label="Deal pipeline" />;
}
