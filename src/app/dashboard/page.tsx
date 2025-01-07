'use client'

import Link from 'next/link'
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

export default function Dashboard() {
  const barChartData = {
    labels: ['Lattices', 'POSET', 'Permutations'],
    datasets: [
      {
        label: 'Score',
        data: [65, 59, 80],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1,
      },
    ],
  }

  const lineChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Progress',
        data: [12, 19, 3, 5],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  }

  return (
    <div className="flex flex-col min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Game Scores</h2>
          <Bar data={barChartData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Weekly Progress</h2>
          <Line data={lineChartData} />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link href="/games/lattices" className="bg-blue-600 text-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold">Lattice Builder</h3>
          <p>Build and explore lattice structures</p>
        </Link>
        <Link href="/games/posets" className="bg-green-600 text-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold">POSET Challenge</h3>
          <p>Test your knowledge of partially ordered sets</p>
        </Link>
        <Link href="/games/permutations" className="bg-yellow-600 text-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold">Permutation Puzzles</h3>
          <p>Solve puzzles using permutation concepts</p>
        </Link>
      </div>
    </div>
  )
}

