"use client"

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"

interface Location {
  lat: number
  lng: number
  name: string
}

interface TrackedUser {
  id: number
  name: string
  relationship: string
  status: string
  lastUpdated: string
  location: Location
}

interface GuardianMapProps {
  trackedUsers: TrackedUser[]
  selectedUser: TrackedUser
  onUserSelect: (user: TrackedUser) => void
}

export function GuardianMap({ trackedUsers, selectedUser, onUserSelect }: GuardianMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  // Simulate active user location updates
  useEffect(() => {
    const activeUsers = trackedUsers.filter((user) => user.status === "active")
    if (activeUsers.length === 0) return

    const interval = setInterval(() => {
      // This would be replaced with real-time updates from a backend
      // For now, we're just simulating small location changes
    }, 5000)

    return () => clearInterval(interval)
  }, [trackedUsers])

  return (
    <div className="relative h-full w-full bg-gray-100 dark:bg-gray-800">
      {/* This would be replaced with an actual map integration */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=500&width=800')] bg-cover bg-center opacity-50"></div>

      {/* Map overlay with simulated content */}
      <div className="absolute inset-0">
        {trackedUsers.map((user) => (
          <div
            key={user.id}
            className="absolute"
            style={{
              left: `${(((user.location.lng + 122.5) * 100) % 80) + 10}%`,
              top: `${(((user.location.lat - 37.7) * 100) % 80) + 10}%`,
            }}
            onClick={() => onUserSelect(user)}
          >
            <div className={`relative cursor-pointer ${selectedUser.id === user.id ? "z-10" : "z-0"}`}>
              {user.status === "active" && selectedUser.id === user.id && (
                <div className="animate-ping absolute h-12 w-12 rounded-full bg-purple-400 opacity-75"></div>
              )}
              <div
                className={`relative rounded-full p-2 ${
                  user.status === "active"
                    ? selectedUser.id === user.id
                      ? "bg-purple-600 dark:bg-purple-500"
                      : "bg-green-500 dark:bg-green-600"
                    : "bg-gray-400 dark:bg-gray-500"
                }`}
              >
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div
                className={`mt-1 bg-white dark:bg-gray-900 px-2 py-1 rounded-lg shadow-md text-center ${
                  selectedUser.id === user.id ? "block" : "hidden"
                }`}
              >
                <p className="text-xs font-medium">{user.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Map controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600 dark:text-gray-400"
          >
            <path d="m5 12 7-7 7 7"></path>
          </svg>
        </button>
        <button className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600 dark:text-gray-400"
          >
            <path d="m19 12-7 7-7-7"></path>
          </svg>
        </button>
        <button className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600 dark:text-gray-400"
          >
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </button>
        <button className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600 dark:text-gray-400"
          >
            <path d="m12 19-7-7 7-7"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}

