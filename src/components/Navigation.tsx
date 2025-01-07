import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex justify-around">
        <li><Link href="/dashboard">Dashboard</Link></li>
        <li><Link href="/games/lattices">Lattice Builder</Link></li>
        <li><Link href="/games/posets">POSET Challenge</Link></li>
        <li><Link href="/games/permutations">Permutation Puzzles</Link></li>
        <li><Link href="/">Logout</Link></li>
      </ul>
    </nav>
  )
}

