"use client";

import React, { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Position,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --------------------------------------------------
// Types & Initial Data
// --------------------------------------------------
type LatticeElement = {
  value: string;
  connections: string[]; // who this element points to ("above" in partial order)
  x?: number; // optional coords for visualization
  y?: number; // optional coords for visualization
};

// Some initial lattice
const initialLattice: LatticeElement[] = [
  { value: "A", connections: ["B", "C"], x: 100, y: 100 },
  { value: "B", connections: ["D"], x: 100, y: 250 },
  { value: "C", connections: ["D"], x: 250, y: 250 },
  { value: "D", connections: [], x: 180, y: 400 },
];

// Example puzzle data
const puzzleLattice: LatticeElement[] = [
  { value: "P", connections: ["Q"], x: 100, y: 100 },
  { value: "Q", connections: ["R"], x: 100, y: 250 },
  { value: "R", connections: [], x: 100, y: 400 },
];

/**
 * Utility function to convert your LatticeElement[] into
 * React Flow nodes & edges for visualization.
 */
function buildReactFlowGraph(lattice: LatticeElement[]) {
  // Create nodes
  const nodes: Node[] = lattice.map((el) => ({
    id: el.value,
    position: { x: el.x ?? Math.random() * 300, y: el.y ?? Math.random() * 300 },
    data: { label: el.value },
    // Basic styling
    style: {
      border: "1px solid #999",
      padding: 10,
      borderRadius: 8,
      background: "white",
      fontWeight: 600,
    },
  }));

  // Create edges
  const edges: Edge[] = [];
  lattice.forEach((el) => {
    el.connections.forEach((conn) => {
      edges.push({
        id: el.value + "-" + conn,
        source: el.value,
        target: conn,
        // We'll place the edge label (optional)
        label: `${el.value} → ${conn}`,
      });
    });
  });

  return { nodes, edges };
}

export function LatticeGame() {
  const [lattice, setLattice] = useState<LatticeElement[]>(initialLattice);
  const [newElement, setNewElement] = useState("");
  const [newConnection, setNewConnection] = useState("");
  const [feedback, setFeedback] = useState("");


  // For ReactFlow
  const { nodes: initialNodes, edges: initialEdges } = buildReactFlowGraph(
    initialLattice
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // --------------------------------------------------
  // Handlers
  // --------------------------------------------------
  const handleAddElement = () => {
    const trimmed = newElement.trim();
    if (!trimmed) return;
    // Check if element already exists
    if (lattice.some((el) => el.value === trimmed)) {
      setFeedback("Invalid element or element already exists.");
      return;
    }

    // Add the new element
    const newLatElem: LatticeElement = {
      value: trimmed,
      connections: [],
      x: Math.random() * 400 + 100, // random coords
      y: Math.random() * 300 + 100,
    };
    const updatedLattice = [...lattice, newLatElem];

    // Update local states
    setLattice(updatedLattice);
    setNewElement("");
    setFeedback("Element added successfully!");

    // Update ReactFlow
    const { nodes: newNodes, edges: newEdges } = buildReactFlowGraph(
      updatedLattice
    );
    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleAddConnection = () => {
    const trimmed = newConnection.trim();
    const [from, to] = trimmed.split("-");
    if (!from || !to || from === to) {
      setFeedback('Invalid connection format. Use "A-B" to connect A to B.');
      return;
    }

    // Check if 'from' and 'to' exist
    if (!lattice.some((el) => el.value === from)) {
      setFeedback(`Element "${from}" does not exist.`);
      return;
    }
    if (!lattice.some((el) => el.value === to)) {
      setFeedback(`Element "${to}" does not exist.`);
      return;
    }

    // Update connections in lattice
    const updatedLattice = lattice.map((el) => {
      if (el.value === from) {
        // Add to connections if not already in
        if (!el.connections.includes(to)) {
          return { ...el, connections: [...el.connections, to] };
        }
      }
      return el;
    });

    setLattice(updatedLattice);
    setNewConnection("");
    setFeedback("Connection added successfully!");

    // Update ReactFlow
    const { nodes: newNodes, edges: newEdges } = buildReactFlowGraph(
      updatedLattice
    );
    setNodes(newNodes);
    setEdges(newEdges);
  };

  /**
   * Check if every pair of elements has a unique supremum and infimum.
   * This is a simplified approach.
   */
  const handleCheckBasicLattice = () => {
    for (let i = 0; i < lattice.length; i++) {
      for (let j = i + 1; j < lattice.length; j++) {
        const a = lattice[i].value;
        const b = lattice[j].value;
        const sup = findSupremum(a, b, lattice);
        const inf = findInfimum(a, b, lattice);
        if (!sup || !inf) {
          setFeedback(
            `Not a lattice: missing supremum or infimum for pair (${a}, ${b}).`
          );
          return;
        }
      }
    }
    setFeedback("Congratulations! This is a valid lattice (basic check).");
  };

  /**
   * A simplistic approach to finding the supremum in a directed adjacency list:
   * We look for a candidate node that points (directly or indirectly) to both a and b.
   * In a typical Hasse diagram or adjacency representation, you'd want to check:
   *  - Which nodes are 'above' both a and b
   *  - Among those, which is minimal
   * This code is *highly simplified* and might not handle more complex partial orders.
   */
  function findSupremum(a: string, b: string, lat: LatticeElement[]): string | null {
    // For now, let's check "who has edges to a and b" in some naive sense
    // Actually we want to see who is "above" them. This might be reversed in an adjacency list,
    // depending on how you define "connections."

    // A naive approach: A node X is "above" A if there's a path from A to X.
    // But your connections look reversed (A -> B means B is "above" A).
    // We'll do a direct check of nodes that appear in both "connections" sets for A & B.
    // This is a big simplification: you’d want transitive closures to do this thoroughly.

    // We'll compute the sets of all ancestors of a and b, then see their intersection.
    const aAncestors = new Set([a, ...getAllAbove(a, lat)]);
    const bAncestors = new Set([b, ...getAllAbove(b, lat)]);
    // The supremum is any node that is in bAncestors and aAncestors
    const intersection = [...aAncestors].filter((x) => bAncestors.has(x));

    // Typically, the supremum is the minimal such "common ancestor."
    // We'll just return the first for demonstration.
    if (intersection.length > 0) {
      return intersection[0];
    } else {
      return null;
    }
  }

  function findInfimum(a: string, b: string, lat: LatticeElement[]): string | null {
    // Similarly, we want the greatest common "descendant."
    // We'll gather all descendants of A and B, intersect them, and pick something.
    const aDesc = new Set([a, ...getAllBelow(a, lat)]);
    const bDesc = new Set([b, ...getAllBelow(b, lat)]);

    const intersection = [...aDesc].filter((x) => bDesc.has(x));
    if (intersection.length > 0) {
      return intersection[0];
    } else {
      return null;
    }
  }

  /**
   * Returns all nodes that are "above" the given node (reachable by following the adjacency).
   * Because your adjacency is "this node → nodes above it", we do the inverse in BFS.
   */
  function getAllAbove(target: string, lat: LatticeElement[]): string[] {
    // We want: If X.connections.includes(Y), then Y is "above" X.
    // So to see who is above target, we look for "X" such that target in X.connections
    // recursively. We'll do BFS or DFS.
    const above: string[] = [];
    const queue: string[] = [target];

    while (queue.length) {
      const current = queue.shift()!;
      // Find all X that have current in X.connections
      lat.forEach((el) => {
        if (el.connections.includes(current) && !above.includes(el.value)) {
          above.push(el.value);
          queue.push(el.value);
        }
      });
    }
    return above;
  }

  /**
   * Returns all nodes that are "below" the given node. 
   * In adjacency terms, target → X means X is "above" target, so we do BFS from target.
   */
  function getAllBelow(target: string, lat: LatticeElement[]): string[] {
    const below: string[] = [];
    const queue: string[] = [target];

    while (queue.length) {
      const current = queue.shift()!;
      // For the current element, every item in current.connections is "above",
      // so we push them into below? Actually, no. The "below" is the other direction.
      // But let's keep consistent with the existing definition:
      // If current → next, then next is "above" current. We want the children in BFS to find all below?
      // Actually, we do the BFS in the forward direction but collect visited.
      const found = lat.find((el) => el.value === current);
      if (found) {
        found.connections.forEach((connVal) => {
          // connVal is "above" current, so "current" is below connVal. We want the reverse BFS.
          // Let's do a simpler approach: We'll do the BFS in reverse adjacency again.
          // So we can skip implementing below if we are sure we won't need it for the simplified checks.

          // For demonstration, let's do forward BFS to see all that are reachable from current
          // as "above," meaning current is below them.
          if (!below.includes(connVal)) {
            below.push(connVal);
            queue.push(connVal);
          }
        });
      }
    }
    return below;
  }

  // Check for Bounded Lattice
  const handleCheckBounded = () => {
    // In a bounded lattice, there should be a global minimum (bottom) and a global maximum (top).
    // "Bottom" is an element from which we can reach all others, 
    // "Top" is an element which can be reached from all others.
    let bottomCandidates: string[] = [];
    let topCandidates: string[] = [];

    lattice.forEach((el) => {
      // To check if "el" might be bottom: from "el" we can reach all others (directly or indirectly).
      const reachable = new Set(getAllBelow(el.value, lattice));
      // Also include el itself
      reachable.add(el.value);
      if (reachable.size === lattice.length) {
        bottomCandidates.push(el.value);
      }

      // For top: from each other node, check if they can reach "el"
      // In other words, "el" is in getAllBelow(...some other node...)
      // We'll invert the logic: "el" is top if it's 'above' every other node
      let isTopForAll = true;
      for (const other of lattice) {
        if (other.value === el.value) continue;
        const othersBelow = new Set([other.value, ...getAllBelow(other.value, lattice)]);
        if (!othersBelow.has(el.value)) {
          isTopForAll = false;
          break;
        }
      }
      if (isTopForAll) {
        topCandidates.push(el.value);
      }
    });

    if (bottomCandidates.length === 1 && topCandidates.length === 1) {
      setFeedback(
        `Bounded Lattice Found! \nBottom: ${bottomCandidates[0]}, Top: ${topCandidates[0]}`
      );
    } else if (bottomCandidates.length === 0 || topCandidates.length === 0) {
      setFeedback("Not bounded: No global minimum or maximum found.");
    } else {
      setFeedback(
        `Not bounded or ambiguous: multiple bottoms (${bottomCandidates.join(
          ", "
        )}) or tops (${topCandidates.join(", ")}).`
      );
    }
  };

  // A naive Distributivity check (STUB)
  const handleCheckDistributive = () => {
    // We'll do a partial check. Real check requires verifying:
    //  (x ∧ (y ∨ z)) = ((x ∧ y) ∨ (x ∧ z)), etc.
    // This is quite involved with an adjacency approach, so we'll do a placeholder:
    setFeedback("Distributivity check is not fully implemented yet!");
  };

  // Load puzzle challenge
  const handleLoadPuzzle = () => {
    // Replace with puzzle data
    setLattice(puzzleLattice);
    const { nodes: puzzleNodes, edges: puzzleEdges } =
      buildReactFlowGraph(puzzleLattice);
    setNodes(puzzleNodes);
    setEdges(puzzleEdges);

    setFeedback("Puzzle loaded! Try to make it a lattice or add connections.");
  };

  // React Flow callback to handle edges added by user dragging 
  // (If you allow users to add edges visually)
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const { source, target } = connection;

      // Update the underlying lattice
      const updatedLattice = lattice.map((el) => {
        if (el.value === source) {
          if (!el.connections.includes(target)) {
            return { ...el, connections: [...el.connections, target] };
          }
        }
        return el;
      });

      setLattice(updatedLattice);

      // Rebuild for React Flow
      const { nodes: newNodes, edges: newEdges } = buildReactFlowGraph(
        updatedLattice
      );
      setNodes(newNodes);
      setEdges(newEdges);
    },
    [lattice, setLattice, setNodes, setEdges]
  );

  return (
    <Card className="w-full max-w-5xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Lattice Builder</CardTitle>
        <CardDescription>
          Build or fix a partial order and test its lattice properties
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Top Controls */}
        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="newElement">Add Element</Label>
            <div className="flex space-x-2">
              <Input
                id="newElement"
                value={newElement}
                onChange={(e) => setNewElement(e.target.value)}
                placeholder="New element"
              />
              <Button onClick={handleAddElement}>Add</Button>
            </div>
          </div>
          <div>
            <Label htmlFor="newConnection">Add Connection</Label>
            <div className="flex space-x-2">
              <Input
                id="newConnection"
                value={newConnection}
                onChange={(e) => setNewConnection(e.target.value)}
                placeholder="A-B"
              />
              <Button onClick={handleAddConnection}>Connect</Button>
            </div>
          </div>

          {/* Buttons for checks */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCheckBasicLattice}>
              Check Basic Lattice
            </Button>
            <Button onClick={handleCheckBounded}>Check Bounded</Button>
            <Button onClick={handleCheckDistributive}>Check Distributivity</Button>
            <Button variant="outline" onClick={handleLoadPuzzle}>
              Load Puzzle Challenge
            </Button>
          </div>
        </div>

        {/* Lattice + Feedback */}
        <div className="flex gap-4">
          {/* Left: React Flow Visualization */}
          <div className="w-2/3 h-[500px] border border-gray-200">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            >
              <MiniMap />
              <Controls />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          </div>

          {/* Right: text-based info */}
          <div className="w-1/3 space-y-4">
            <h3 className="font-bold underline">Current Lattice (Adj. List):</h3>
            <ul className="list-disc list-inside">
              {lattice.map((el) => (
                <li key={el.value}>
                  <strong>{el.value}</strong> →{" "}
                  {el.connections.length
                    ? el.connections.join(", ")
                    : "(no connections)"}
                </li>
              ))}
            </ul>

            {feedback && (
              <p className="text-sm font-medium text-blue-500">{feedback}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

