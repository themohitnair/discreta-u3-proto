'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PermutationGame() {
  const [elements, setElements] = useState<string[]>(['A', 'B', 'C'])
  const [permutation, setPermutation] = useState<string>('')
  const [feedback, setFeedback] = useState('')

  const addElement = (element: string) => {
    if (element && !elements.includes(element)) {
      setElements([...elements, element])
      setFeedback('Element added successfully!')
    } else {
      setFeedback('Invalid element or element already exists.')
    }
  }

  const checkPermutation = () => {
    const permArray = permutation.split('')
    if (permArray.length !== elements.length) {
      setFeedback('Invalid permutation length.')
      return
    }
    if (!permArray.every(el => elements.includes(el))) {
      setFeedback('Permutation contains invalid elements.')
      return
    }
    if (new Set(permArray).size !== elements.length) {
      setFeedback('Permutation must contain each element exactly once.')
      return
    }
    setFeedback('Valid permutation!')
  }

  const calculateOrder = () => {
    const cycles = findCycles()
    const order = cycles.reduce((lcm, cycle) => lcm * cycle.length / gcd(lcm, cycle.length), 1)
    setFeedback(`The order of this permutation is ${order}.`)
  }

  const findCycles = () => {
    const permArray = permutation.split('')
    const visited = new Set()
    const cycles: string[][] = []

    for (let i = 0; i < permArray.length; i++) {
      if (!visited.has(i)) {
        const cycle: string[] = []
        let current = i
        while (!visited.has(current)) {
          visited.add(current)
          cycle.push(elements[current])
          current = elements.indexOf(permArray[current])
        }
        if (cycle.length > 1) {
          cycles.push(cycle)
        }
      }
    }

    return cycles
  }

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Permutation Explorer</CardTitle>
        <CardDescription>Explore properties of permutations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="newElement">Add Element</Label>
            <div className="flex space-x-2">
              <Input
                id="newElement"
                placeholder="New element"
                onChange={(e) => addElement(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="permutation">Enter Permutation</Label>
            <div className="flex space-x-2">
              <Input
                id="permutation"
                value={permutation}
                onChange={(e) => setPermutation(e.target.value.toUpperCase())}
                placeholder="ABC"
              />
              <Button onClick={checkPermutation}>Check</Button>
            </div>
          </div>
          <Button onClick={calculateOrder}>Calculate Order</Button>
          <div>
            <h3 className="font-bold">Current Elements:</h3>
            <p>{elements.join(', ')}</p>
          </div>
          {feedback && <p className="text-sm font-medium text-blue-500">{feedback}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
