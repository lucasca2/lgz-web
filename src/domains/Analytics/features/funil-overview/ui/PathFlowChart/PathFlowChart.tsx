"use client";

import type { FlowTransition } from "../../types";
import styles from "./PathFlowChart.module.css";

type Props = {
  transitions: FlowTransition[];
  rootStage: string;
  labels: {
    step: string;
    ofStart: string;
  };
};

const TERMINAL: Record<string, string> = {
  Aprovado: "#34d399",
  Reprovado: "#f87171",
  "Base de Talentos": "#a78bfa",
};

const COL_W = 164;
const COL_GAP = 88;
const CHART_H = 420;
const NODE_MIN_H = 48;
const NODE_GAP = 8;

function nodeColor(id: string): string {
  return TERMINAL[id] ?? "var(--wave-accent)";
}

type ColNode = {
  id: string;
  count: number;
  pct: number;
  parentId: string | null;
  y: number;
  h: number;
};

type Edge = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  count: number;
  color: string;
};

export function PathFlowChart({ transitions, rootStage, labels }: Props) {
  const rootChildren = transitions
    .filter((t) => t.from === rootStage)
    .sort((a, b) => b.count - a.count);
  const rootTotal = rootChildren.reduce((s, t) => s + t.count, 0);

  if (rootTotal === 0) return null;

  // Build columns iteratively until all leaves are terminal
  const columns: ColNode[][] = [];

  const rootNode: ColNode = {
    id: rootStage,
    count: rootTotal,
    pct: 100,
    parentId: null,
    y: 0,
    h: CHART_H,
  };
  columns.push([rootNode]);

  let currentNodes: ColNode[] = [rootNode];

  while (true) {
    const nonTerminalParents = currentNodes.filter((n) => !TERMINAL[n.id]);
    if (nonTerminalParents.length === 0) break;

    const nextColNodes: ColNode[] = [];

    for (const parent of nonTerminalParents) {
      const children = transitions
        .filter((t) => t.from === parent.id)
        .sort((a, b) => b.count - a.count);
      if (children.length === 0) continue;

      const groupTotal = children.reduce((s, t) => s + t.count, 0);
      const minGroupH =
        children.length * NODE_MIN_H + (children.length - 1) * NODE_GAP;
      const targetGroupH = Math.max(parent.h, minGroupH);

      let relY = 0;
      const groupNodes: ColNode[] = children.map((t) => {
        const h = Math.max(NODE_MIN_H, (t.count / groupTotal) * targetGroupH);
        const n: ColNode = {
          id: t.to,
          count: t.count,
          pct: Math.round((t.count / rootTotal) * 100),
          parentId: parent.id,
          y: relY,
          h,
        };
        relY += h + NODE_GAP;
        return n;
      });

      // Center group on parent's vertical center
      const groupH = relY - NODE_GAP;
      const parentCenter = parent.y + parent.h / 2;
      const startY = Math.max(0, parentCenter - groupH / 2);
      groupNodes.forEach((n) => {
        n.y += startY;
      });

      nextColNodes.push(...groupNodes);
    }

    if (nextColNodes.length === 0) break;

    // Resolve overlaps: sort by y, push down any node that overlaps the previous
    nextColNodes.sort((a, b) => a.y - b.y);
    for (let i = 1; i < nextColNodes.length; i++) {
      const prev = nextColNodes[i - 1];
      const curr = nextColNodes[i];
      const minY = prev.y + prev.h + NODE_GAP;
      if (curr.y < minY) curr.y = minY;
    }

    columns.push(nextColNodes);
    currentNodes = nextColNodes;
  }

  const numCols = columns.length;
  const totalH =
    columns.flat().reduce((max, n) => Math.max(max, n.y + n.h), 0) + 4;
  const totalW = numCols * COL_W + (numCols - 1) * COL_GAP;

  // Build bezier edges using proportional bands within each parent
  const edges: Edge[] = [];

  for (let c = 0; c < columns.length - 1; c++) {
    const parentCol = columns[c];
    const childCol = columns[c + 1];
    const colX = c * (COL_W + COL_GAP);
    const nextColX = (c + 1) * (COL_W + COL_GAP);

    for (const parent of parentCol) {
      if (TERMINAL[parent.id]) continue;
      const children = childCol.filter((n) => n.parentId === parent.id);
      if (children.length === 0) continue;

      const childTotal = children.reduce((s, n) => s + n.count, 0);
      let bandY = parent.y;

      for (const child of children) {
        const bandH = (child.count / childTotal) * parent.h;
        const bandMid = bandY + bandH / 2;
        bandY += bandH;

        edges.push({
          x1: colX + COL_W,
          y1: bandMid,
          x2: nextColX,
          y2: child.y + child.h / 2,
          count: child.count,
          color: nodeColor(child.id),
        });
      }
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.scrollWrapper}>
        {/* Column headers scroll together with the chart */}
        <div
          className={styles.colHeaderRow}
          style={{ gap: COL_GAP, minWidth: totalW }}
        >
          {columns.map((_, i) => (
            <div key={i} className={styles.colHeader} style={{ width: COL_W }}>
              {i === 0 ? rootStage : `${labels.step} ${i}`}
            </div>
          ))}
        </div>

        {/* Chart canvas */}
        <div className={styles.chart} style={{ width: totalW, height: totalH }}>
          <svg
            width={totalW}
            height={totalH}
            className={styles.svg}
            aria-hidden="true"
          >
            {edges.map((e, i) => {
              const cx = (e.x1 + e.x2) / 2;
              const sw = Math.max(1.5, (e.count / rootTotal) * 18);
              return (
                <path
                  key={i}
                  d={`M${e.x1},${e.y1} C${cx},${e.y1} ${cx},${e.y2} ${e.x2},${e.y2}`}
                  fill="none"
                  stroke={e.color}
                  strokeWidth={sw}
                  strokeOpacity={0.28}
                />
              );
            })}
          </svg>

          {/* Root node (full height) */}
          <div
            className={styles.nodeL0}
            style={{ width: COL_W, height: totalH }}
          >
            <span className={styles.nodeNameL0}>{rootStage}</span>
            <span className={styles.nodeCountL0}>{rootTotal}</span>
            <span className={styles.nodeSub}>candidatos</span>
          </div>

          {/* All other columns */}
          {columns.slice(1).map((col, ci) =>
            col.map((node) => {
              const c = ci + 1;
              const x = c * (COL_W + COL_GAP);
              return (
                <div
                  key={`c${c}-${node.id}-${node.y}`}
                  className={styles.node}
                  style={{
                    left: x,
                    top: node.y,
                    width: COL_W,
                    height: node.h,
                    borderLeftColor: nodeColor(node.id),
                  }}
                >
                  <span className={styles.nodeName}>{node.id}</span>
                  <div className={styles.nodeStats}>
                    <span className={styles.nodeCount}>{node.count}</span>
                    <span
                      className={styles.nodePct}
                      style={{ color: nodeColor(node.id) }}
                    >
                      {node.pct}%
                    </span>
                  </div>
                  <span className={styles.nodeSub}>{labels.ofStart}</span>
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
