import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to <span className="text-blue-600">Discreta</span>
        </h1>
        <p className="mt-3 text-2xl">
          Learning Discrete Mathematics made easy!
        </p>
        <div className="flex mt-6">
          <Link href="/login" className="mx-4 px-6 py-3 rounded-md bg-blue-600 text-white">
            Login
          </Link>
          <Link href="/signup" className="mx-4 px-6 py-3 rounded-md bg-green-600 text-white">
            Sign Up
          </Link>
        </div>
      </main>
    </div>
  )
}