"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"

interface TrackedUserMapProps {
  isTracking: boolean
}

export function TrackedUserMap({ isTracking }: TrackedUserMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [currentLocation, setCurrentLocation] = useState({ lat: 37.7749, lng: -122.4194 })
  const [locationName, setLocationName] = useState("San Francisco, CA")

  // Simulate location updates when tracking is active
  useEffect(() => {
    if (!isTracking) return

    const interval = setInterval(() => {
      // Simulate small location changes
      setCurrentLocation((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [isTracking])

  return (
    <div className="relative h-full w-full bg-gray-100 dark:bg-gray-800">
      {/* This would be replaced with an actual map integration */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=800')] bg-cover bg-center opacity-50"></div>

      {/* Map overlay with simulated content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isTracking ? (
          <>
            <div className="relative">
              <div className="animate-ping absolute h-12 w-12 rounded-full bg-purple-400 opacity-75"></div>
              <div className="relative rounded-full bg-purple-500 p-2">
                <MapPin className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 bg-white dark:bg-gray-900 px-4 py-2 rounded-lg shadow-md">
              <p className="font-medium text-sm">Current Location</p>
              <p className="text-xs text-muted-foreground">{locationName}</p>
              <p className="text-xs text-muted-foreground">
                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center p-4 bg-white/80 dark:bg-gray-900/80 rounded-lg shadow">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-lg font-medium">Tracking Inactive</p>
            <p className="text-sm text-muted-foreground">Click "Start Tracking" to begin sharing your location</p>
          </div>
        )}
      </div>

      {/* Status indicator */}
      {isTracking && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          Live Tracking
        </div>
      )}
    </div>
  )
}

