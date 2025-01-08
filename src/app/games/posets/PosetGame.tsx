"use client";

import { useState, useCallback } from "react";
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

type PosetElement = {
  value: string;
  relations: string[]; // elements that this element "relates to" (i.e., a ≤ b)
  x?: number;          // optional x-coord for visualization
  y?: number;          // optional y-coord for visualization
};

/** 
 * Initial Poset:
 * A -> B, A -> C, B -> D, C -> D 
 */
const initialPoset: PosetElement[] = [
  { value: "A", relations: ["B", "C"], x: 100, y: 100 },
  { value: "B", relations: ["D"], x: 100, y: 250 },
  { value: "C", relations: ["D"], x: 250, y: 250 },
  { value: "D", relations: [], x: 180, y: 400 },
];

/**
 * Example Puzzle:
 *   P -> Q -> R 
 * (We might want a puzzle that is NOT reflexive or transitive to start with,
 *  so the student can fix it)
 */
const puzzlePoset: PosetElement[] = [
  { value: "P", relations: ["Q"], x: 100, y: 100 },
  { value: "Q", relations: ["R"], x: 100, y: 250 },
  { value: "R", relations: [], x: 100, y: 400 },
];

/**
 * Convert PosetElement[] into React Flow nodes & edges
 */
function buildGraph(poset: PosetElement[]) {
  // Create nodes
  const nodes: Node[] = poset.map((el) => ({
    id: el.value,
    position: { x: el.x ?? Math.random() * 400, y: el.y ?? Math.random() * 300 },
    data: { label: el.value },
    style: {
      border: "1px solid #999",
      padding: 10,
      borderRadius: 6,
      background: "white",
      fontWeight: "bold",
    },
  }));

  // Create edges
  const edges: Edge[] = [];
  poset.forEach((el) => {
    el.relations.forEach((rel) => {
      edges.push({
        id: `${el.value}-${rel}`,
        source: el.value,
        target: rel,
        label: `${el.value} ≤ ${rel}`, // optional edge label
      });
    });
  });

  return { nodes, edges };
}

export function PosetGame() {
  const [poset, setPoset] = useState<PosetElement[]>(initialPoset);
  const [newElement, setNewElement] = useState("");
  const [newRelation, setNewRelation] = useState("");
  const [feedback, setFeedback] = useState("");

  // Build initial graph data for React Flow
  const { nodes: initNodes, edges: initEdges } = buildGraph(poset);
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  // --------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------
  const rebuildGraph = (updatedPoset: PosetElement[]) => {
    const { nodes: newNodes, edges: newEdges } = buildGraph(updatedPoset);
    setNodes(newNodes);
    setEdges(newEdges);
  };

  // --------------------------------------------------------------------
  // Adding Elements & Relations
  // --------------------------------------------------------------------
  const handleAddElement = () => {
    const elTrim = newElement.trim();
    if (!elTrim) return;
    // Check for duplicates
    if (poset.some((el) => el.value === elTrim)) {
      setFeedback(`Element "${elTrim}" already exists.`);
      return;
    }
    // Add new element
    const newEl: PosetElement = {
      value: elTrim,
      relations: [],
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
    };
    const updatedPoset = [...poset, newEl];
    setPoset(updatedPoset);
    setNewElement("");
    setFeedback(`Element "${elTrim}" added successfully!`);
    rebuildGraph(updatedPoset);
  };

  const handleAddRelation = () => {
    const relTrim = newRelation.trim();
    const [from, to] = relTrim.split("-");
    if (!from || !to || from === to) {
      setFeedback('Invalid relation format. Use "A-B" to relate A to B, and A ≠ B.');
      return;
    }
    // Check if from & to exist
    if (!poset.some((el) => el.value === from)) {
      setFeedback(`Element "${from}" does not exist.`);
      return;
    }
    if (!poset.some((el) => el.value === to)) {
      setFeedback(`Element "${to}" does not exist.`);
      return;
    }
    // Update the poset
    const updatedPoset = poset.map((el) => {
      if (el.value === from) {
        if (!el.relations.includes(to)) {
          return { ...el, relations: [...el.relations, to] };
        }
      }
      return el;
    });
    setPoset(updatedPoset);
    setNewRelation("");
    setFeedback(`Relation "${from} ≤ ${to}" added successfully!`);
    rebuildGraph(updatedPoset);
  };

  /**
   * If you allow drag-to-connect in React Flow, handle it here
   */
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const { source, target } = connection;

      // Update the poset
      const updatedPoset = poset.map((el) => {
        if (el.value === source && !el.relations.includes(target)) {
          return { ...el, relations: [...el.relations, target] };
        }
        return el;
      });
      setPoset(updatedPoset);
      rebuildGraph(updatedPoset);
    },
    [poset]
  );

  // --------------------------------------------------------------------
  // POSET Property Checks
  // --------------------------------------------------------------------
  const handleCheckPoset = () => {
    // 1. Reflexive
    const reflexiveInfo = checkReflexivity(poset);
    if (!reflexiveInfo.isValid) {
      setFeedback(`Not Reflexive: ${reflexiveInfo.reason}`);
      return;
    }
    // 2. Antisymmetric
    const antisymInfo = checkAntisymmetry(poset);
    if (!antisymInfo.isValid) {
      setFeedback(`Not Antisymmetric: ${antisymInfo.reason}`);
      return;
    }
    // 3. Transitive
    const transInfo = checkTransitivity(poset);
    if (!transInfo.isValid) {
      setFeedback(`Not Transitive: ${transInfo.reason}`);
      return;
    }
    setFeedback("Congratulations! This is a valid POSET.");
  };

  /**
   * Check reflexivity: a ≤ a for all a in poset
   */
  function checkReflexivity(poset: PosetElement[]) {
    for (const el of poset) {
      if (!el.relations.includes(el.value)) {
        return {
          isValid: false,
          reason: `${el.value} is not related to itself.`,
        };
      }
    }
    return { isValid: true, reason: "" };
  }

  /**
   * Check antisymmetry: if a ≤ b and b ≤ a, then a = b.
   */
  function checkAntisymmetry(poset: PosetElement[]) {
    // We'll gather pairs that violate antisymmetry
    for (const el1 of poset) {
      for (const el2 of poset) {
        if (
          el1.value !== el2.value &&
          el1.relations.includes(el2.value) &&
          el2.relations.includes(el1.value)
        ) {
          return {
            isValid: false,
            reason: `Both "${el1.value} ≤ ${el2.value}" and "${el2.value} ≤ ${el1.value}" found.`,
          };
        }
      }
    }
    return { isValid: true, reason: "" };
  }

  /**
   * Check transitivity: if a ≤ b and b ≤ c, then a ≤ c.
   */
  function checkTransitivity(poset: PosetElement[]) {
    // A naive approach: for each el1 → el2, el2 → el3 => el1 → el3
    for (const el1 of poset) {
      for (const rel1 of el1.relations) {
        // rel1 is b
        // find b in poset
        const bElement = poset.find((el) => el.value === rel1);
        if (!bElement) continue;
        for (const rel2 of bElement.relations) {
          // rel2 is c
          // check if el1.relations includes c
          if (!el1.relations.includes(rel2)) {
            return {
              isValid: false,
              reason: `Missing transitive link: ${el1.value} ≤ ${rel1} and ${rel1} ≤ ${rel2}, but no ${el1.value} ≤ ${rel2}.`,
            };
          }
        }
      }
    }
    return { isValid: true, reason: "" };
  }

  // --------------------------------------------------------------------
  // Puzzle Mode
  // --------------------------------------------------------------------
  const handleLoadPuzzle = () => {
    setPoset(puzzlePoset);
    rebuildGraph(puzzlePoset);
    setFeedback("Puzzle loaded! Fix it to make it a POSET.");
  };

  return (
    <Card className="w-full max-w-5xl mx-auto my-8">
      <CardHeader>
        <CardTitle>POSET Builder</CardTitle>
        <CardDescription>
          Build and visualize a partially ordered set, then test its properties
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          {/* Add Element */}
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

          {/* Add Relation */}
          <div>
            <Label htmlFor="newRelation">Add Relation</Label>
            <div className="flex space-x-2">
              <Input
                id="newRelation"
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value)}
                placeholder="A-B"
              />
              <Button onClick={handleAddRelation}>Relate</Button>
            </div>
          </div>

          {/* Buttons: Check, Puzzle */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCheckPoset}>Check POSET Properties</Button>
            <Button variant="outline" onClick={handleLoadPuzzle}>
              Load Puzzle
            </Button>
          </div>
        </div>

        {/* Main Section: Graph + Info */}
        <div className="flex gap-4">
          {/* Graph Visualization */}
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

          {/* Right: Textual representation + Feedback */}
          <div className="w-1/3 space-y-4">
            <h3 className="font-bold underline">Current POSET (Adj. List):</h3>
            <ul className="list-disc list-inside">
              {poset.map((el) => (
                <li key={el.value}>
                  <strong>{el.value}</strong> →{" "}
                  {el.relations.length
                    ? el.relations.join(", ")
                    : "(no relations)"}
                </li>
              ))}
            </ul>

            {feedback && (
              <p className="text-sm font-medium text-blue-500 whitespace-pre-wrap">
                {feedback}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
