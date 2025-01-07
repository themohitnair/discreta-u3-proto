'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type PosetElement = {
  value: string
  relations: string[]
}

const initialPoset: PosetElement[] = [
  { value: 'A', relations: ['B', 'C'] },
  { value: 'B', relations: ['D'] },
  { value: 'C', relations: ['D'] },
  { value: 'D', relations: [] },
]

export function PosetGame() {
  const [poset, setPoset] = useState<PosetElement[]>(initialPoset)
  const [newElement, setNewElement] = useState('')
  const [newRelation, setNewRelation] = useState('')
  const [feedback, setFeedback] = useState('')

  const addElement = () => {
    if (newElement && !poset.some(el => el.value === newElement)) {
      setPoset([...poset, { value: newElement, relations: [] }])
      setNewElement('')
      setFeedback('Element added successfully!')
    } else {
      setFeedback('Invalid element or element already exists.')
    }
  }

  const addRelation = () => {
    const [from, to] = newRelation.split('-')
    if (from && to && from !== to) {
      const updatedPoset = poset.map(el => 
        el.value === from ? { ...el, relations: [...el.relations, to] } : el
      )
      setPoset(updatedPoset)
      setNewRelation('')
      setFeedback('Relation added successfully!')
    } else {
      setFeedback('Invalid relation format. Use "A-B" to relate A to B.')
    }
  }

  const checkPosetProperties = () => {
    if (!isReflexive() || !isAntisymmetric() || !isTransitive()) {
      setFeedback('Not a valid poset. Check reflexivity, antisymmetry, and transitivity.')
      return
    }
    setFeedback('Congratulations! This is a valid poset.')
  }

  const isReflexive = () => {
    return poset.every(el => el.relations.includes(el.value))
  }

  const isAntisymmetric = () => {
    for (const el1 of poset) {
      for (const el2 of poset) {
        if (el1.value !== el2.value && el1.relations.includes(el2.value) && el2.relations.includes(el1.value)) {
          return false
        }
      }
    }
    return true
  }

  const isTransitive = () => {
    for (const el1 of poset) {
      for (const el2 of el1.relations) {
        const el2Relations = poset.find(el => el.value === el2)?.relations || []
        for (const el3 of el2Relations) {
          if (!el1.relations.includes(el3)) {
            return false
          }
        }
      }
    }
    return true
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>POSET Builder</CardTitle>
        <CardDescription>Build a partially ordered set and test its properties</CardDescription>
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
            <Label htmlFor="newRelation">Add Relation</Label>
            <div className="flex space-x-2">
              <Input
                id="newRelation"
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value)}
                placeholder="A-B"
              />
              <Button onClick={addRelation}>Relate</Button>
            </div>
          </div>
          <Button onClick={checkPosetProperties}>Check POSET Properties</Button>
          <div>
            <h3 className="font-bold">Current POSET:</h3>
            <ul>
              {poset.map((el) => (
                <li key={el.value}>
                  {el.value} -&gt; {el.relations.join(', ')}
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
