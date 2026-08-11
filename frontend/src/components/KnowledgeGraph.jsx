import { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";

const typeColors = {
  skill: "#3b82f6",
  project: "#8b5cf6",
  certificate: "#10b981",
  internship: "#f59e0b",
  career: "#ef4444",
  achievement: "#ec4899",
};

const relationshipLabels = {
  USED_IN: "used in",
  LEARNED_FROM: "learned from",
  DEMONSTRATED_BY: "demonstrated by",
  SUPPORTS: "supports",
  REQUIRES: "requires",
  LEADS_TO: "leads to",
  ACHIEVED_IN: "achieved in",
};

export default function KnowledgeGraph({ relationships }) {
  const { nodes, edges } = useMemo(() => {
    if (!relationships || relationships.length === 0) return { nodes: [], edges: [] };

    const nodeMap = new Map();

    relationships.forEach((r) => {
      const sourceKey = `${r.source_type}:${r.source_name}`;
      const targetKey = `${r.target_type}:${r.target_name}`;

      if (!nodeMap.has(sourceKey)) {
        nodeMap.set(sourceKey, {
          id: sourceKey,
          data: { label: r.source_name },
          position: { x: Math.random() * 600, y: Math.random() * 400 },
          style: {
            background: typeColors[r.source_type] || "#6b7280",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: "600",
          },
        });
      }

      if (!nodeMap.has(targetKey)) {
        nodeMap.set(targetKey, {
          id: targetKey,
          data: { label: r.target_name },
          position: { x: Math.random() * 600, y: Math.random() * 400 },
          style: {
            background: typeColors[r.target_type] || "#6b7280",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: "600",
          },
        });
      }
    });

    const nodes = Array.from(nodeMap.values());

    const edges = relationships.map((r, i) => ({
      id: `edge-${i}`,
      source: `${r.source_type}:${r.source_name}`,
      target: `${r.target_type}:${r.target_name}`,
      label: relationshipLabels[r.relationship_type] || r.relationship_type,
      style: { stroke: "#94a3b8" },
      labelStyle: { fontSize: "10px", fill: "#64748b" },
      animated: true,
    }));

    return { nodes, edges };
  }, [relationships]);

  if (!relationships || relationships.length === 0) {
    return <p className="text-gray-500 text-sm">No knowledge graph data yet. Upload documents to generate connections.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(typeColors).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1 text-xs text-gray-600">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }}></span>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        ))}
      </div>
      <div style={{ height: 500 }} className="rounded-lg border border-gray-200">
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
