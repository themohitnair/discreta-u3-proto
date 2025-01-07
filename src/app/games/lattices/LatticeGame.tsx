'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LatticeElement = {
  value: string
  connections: string[]
}

const initialLattice: LatticeElement[] = [
  { value: 'A', connections: ['B', 'C'] },
  { value: 'B', connections: ['D'] },
  { value: 'C', connections: ['D'] },
  { value: 'D', connections: [] },
]

export function LatticeGame() {
  const [lattice, setLattice] = useState<LatticeElement[]>(initialLattice)
  const [newElement, setNewElement] = useState('')
  const [newConnection, setNewConnection] = useState('')
  const [feedback, setFeedback] = useState('')

  const addElement = () => {
    if (newElement && !lattice.some(el => el.value === newElement)) {
      setLattice([...lattice, { value: newElement, connections: [] }])
      setNewElement('')
      setFeedback('Element added successfully!')
    } else {
      setFeedback('Invalid element or element already exists.')
    }
  }

  const addConnection = () => {
    const [from, to] = newConnection.split('-')
    if (from && to && from !== to) {
      const updatedLattice = lattice.map(el => 
        el.value === from ? { ...el, connections: [...el.connections, to] } : el
      )
      setLattice(updatedLattice)
      setNewConnection('')
      setFeedback('Connection added successfully!')
    } else {
      setFeedback('Invalid connection format. Use "A-B" to connect A to B.')
    }
  }

  const checkLatticeProperties = () => {
    // Check if every pair of elements has a unique supremum and infimum
    for (let i = 0; i < lattice.length; i++) {
      for (let j = i + 1; j < lattice.length; j++) {
        const sup = findSupremum(lattice[i].value, lattice[j].value)
        const inf = findInfimum(lattice[i].value, lattice[j].value)
        if (!sup || !inf) {
          setFeedback('Not a lattice: missing supremum or infimum for some pair.')
          return
        }
      }
    }
    setFeedback('Congratulations! This is a valid lattice.')
  }

  const findSupremum = (a: string, b: string): string | null => {
    const candidates = lattice.filter(el => 
      el.connections.includes(a) && el.connections.includes(b)
    )
    return candidates.length > 0 ? candidates[0].value : null
  }

  const findInfimum = (a: string, b: string): string | null => {
    const aConnections = new Set(lattice.find(el => el.value === a)?.connections || [])
    const bConnections = new Set(lattice.find(el => el.value === b)?.connections || [])
    const commonConnections = [...aConnections].filter(x => bConnections.has(x))
    return commonConnections.length > 0 ? commonConnections[0] : null
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Lattice Builder</CardTitle>
        <CardDescription>Build a lattice and test its properties</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="newElement">Add Element</Label>
            <div className="flex space-x-2">
              <Input
                id="newElement"
                value={newElement}
                onChange={(e) => setNewElement(e.target.value)}
                placeholder="New element"
              />
              <Button onClick={addElement}>Add</Button>
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
              <Button onClick={addConnection}>Connect</Button>
            </div>
          </div>
          <Button onClick={checkLatticeProperties}>Check Lattice Properties</Button>
          <div>
            <h3 className="font-bold">Current Lattice:</h3>
            <ul>
              {lattice.map((el) => (
                <li key={el.value}>
                  {el.value} -&gt; {el.connections.join(', ')}
                </li>
              ))}
            </ul>
          </div>
          {feedback && <p className="text-sm font-medium text-blue-500">{feedback}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
