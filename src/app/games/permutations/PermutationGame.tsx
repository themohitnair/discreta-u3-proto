"use client";

import React, { useState } from "react";
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

/**
 * Optional: If you want a drag-and-drop library, you'd install something like react-beautiful-dnd or dnd-kit.
 * For simplicity, this example uses a table-based approach, but you can adapt to any method you prefer.
 */

// Helper to compute GCD (used for LCM)
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// Compute cycle decomposition & return array of cycles, each cycle is an array of element labels
function computeCycles(elements: string[], permutation: string[]): string[][] {
  // Example: elements = ["A", "B", "C"], permutation = ["B", "C", "A"]
  // That means: A->B, B->C, C->A => single cycle (A B C).

  const visited = new Set<number>();
  const cycles: string[][] = [];

  for (let i = 0; i < elements.length; i++) {
    if (!visited.has(i)) {
      const cycle: string[] = [];
      let current = i;
      while (!visited.has(current)) {
        visited.add(current);
        cycle.push(elements[current]);
        // Next = index of permutation[current] in the "elements" array
        const next = elements.indexOf(permutation[current]);
        current = next;
      }
      if (cycle.length > 1) {
        cycles.push(cycle);
      } else {
        // If it's a 1-cycle, let's still show it as a cycle, or skip if you prefer
        cycles.push(cycle);
      }
    }
  }

  return cycles;
}

/**
 * Main Component
 */
export function PermutationGame() {
  // The set of unique elements (in a fixed "domain" order).
  const [elements, setElements] = useState<string[]>(["A", "B", "C"]);

  /**
   * `mapping[i] = ?` means "the element at position i (elements[i]) is sent to ???"
   * We'll store the *codomain* positions directly as strings.
   *
   * e.g. if mapping = ["B", "C", "A"],
   * that means:
   *  - elements[0] = "A" -> "B"
   *  - elements[1] = "B" -> "C"
   *  - elements[2] = "C" -> "A"
   */
  const [mapping, setMapping] = useState<string[]>(["B", "C", "A"]);

  // For user input to add a new element
  const [newElement, setNewElement] = useState("");
  const [feedback, setFeedback] = useState("");

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------
  const handleAddElement = () => {
    const el = newElement.trim().toUpperCase();
    if (!el) {
      setFeedback("Please enter a valid element name.");
      return;
    }
    if (elements.includes(el)) {
      setFeedback(`Element "${el}" already exists.`);
      return;
    }
    // Add new element
    const newArr = [...elements, el];
    // Expand the mapping by default (we can map the new element to itself)
    const newMap = [...mapping, el];
    setElements(newArr);
    setMapping(newMap);
    setFeedback(`Added element "${el}" successfully!`);
    setNewElement("");
  };

  /**
   * Called when the user changes the target of the element at index `idx`.
   * e.g. if the user picks that "A -> C," then `idx` might be 0 (for A),
   * we set mapping[0] = "C".
   */
  const handleChangeMapping = (idx: number, newValue: string) => {
    const newMap = [...mapping];
    newMap[idx] = newValue;
    setMapping(newMap);
    setFeedback("");
  };

  // Validate the permutation
  const handleCheckPermutation = () => {
    // The permutation must contain exactly the same set of elements, once each
    // i.e. "mapping" must be a rearrangement of "elements".
    const usedSet = new Set(mapping);
    if (usedSet.size !== elements.length) {
      setFeedback("Invalid permutation: each element must appear exactly once in the codomain.");
      return;
    }
    // Also verify that all values in mapping are from "elements".
    for (const val of mapping) {
      if (!elements.includes(val)) {
        setFeedback(`Invalid permutation: "${val}" is not in the set of elements.`);
        return;
      }
    }
    setFeedback("Permutation is valid!");
  };

  // Calculate & display the order of the permutation (LCM of cycle lengths).
  const handleCalculateOrder = () => {
    // First, confirm we have a valid permutation
    const usedSet = new Set(mapping);
    if (usedSet.size !== elements.length) {
      setFeedback("Cannot calculate order: permutation is invalid (duplicate or missing).");
      return;
    }

    const cycles = computeCycles(elements, mapping);
    const lengths = cycles.map((c) => c.length);
    const permutationOrder = lengths.reduce((acc, len) => (acc * len) / gcd(acc, len), 1);

    // Build a user-friendly message
    let msg = `Cycle decomposition: `;
    msg += cycles
      .map((cycle) => `(${cycle.join(" ")})`)
      .join(" ");
    msg += `\nOrder of this permutation: ${permutationOrder}`;
    setFeedback(msg);
  };

  // A helper to get a list of elements as <option> for selects.
  const elementOptions = elements.map((e) => (
    <option key={e} value={e}>
      {e}
    </option>
  ));

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Permutation Explorer</CardTitle>
        <CardDescription>
          Build & explore permutations on a custom set of elements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">

          {/* Add new element */}
          <div>
            <Label htmlFor="newElement">Add Element</Label>
            <div className="flex space-x-2">
              <Input
                id="newElement"
                placeholder="e.g. D"
                value={newElement}
                onChange={(e) => setNewElement(e.target.value)}
              />
              <Button onClick={handleAddElement}>Add</Button>
            </div>
          </div>

          {/* Show the permutation in a 2-row table */}
          <div className="border p-4 rounded-md space-y-2">
            <h4 className="font-semibold text-sm text-gray-600">
              Define your permutation:
            </h4>
            <table className="min-w-full text-center">
              <thead>
                <tr>
                  {elements.map((el, idx) => (
                    <th key={el} className="border px-2 py-1 bg-gray-100">
                      {el}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {mapping.map((val, idx) => (
                    <td key={idx} className="border px-2 py-1">
                      <select
                        className="focus:outline-none"
                        value={val}
                        onChange={(e) => handleChangeMapping(idx, e.target.value)}
                      >
                        {elementOptions}
                      </select>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Buttons for checks */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCheckPermutation}>Check Permutation</Button>
            <Button onClick={handleCalculateOrder}>Calculate Order</Button>
          </div>

          {/* Display elements */}
          <div>
            <h3 className="font-bold">Current Elements:</h3>
            <p>{elements.join(", ")}</p>
          </div>

          {/* Feedback */}
          {feedback && (
            <p className="text-sm font-medium text-blue-600 whitespace-pre-wrap">
              {feedback}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
