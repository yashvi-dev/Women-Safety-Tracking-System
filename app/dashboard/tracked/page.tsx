"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, AlertTriangle, Shield, User, Clock } from "lucide-react"
import { TrackedUserMap } from "@/components/tracked-user-map"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function TrackedUserDashboard() {
  const [isTracking, setIsTracking] = useState(false)
  const [guardians, setGuardians] = useState([
    { id: 1, name: "John Smith", relationship: "Father", isActive: true },
    { id: 2, name: "Emma Wilson", relationship: "Sister", isActive: true },
  ])

  const toggleTracking = () => {
    setIsTracking(!isTracking)
  }

  const sendPanicAlert = () => {
    alert("Panic alert sent to all guardians!")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Location Tracking</CardTitle>
                  <CardDescription>Your current location and tracking status</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="tracking-toggle" className="text-sm font-medium">
                    {isTracking ? "Tracking Active" : "Tracking Inactive"}
                  </Label>
                  <Switch id="tracking-toggle" checked={isTracking} onCheckedChange={toggleTracking} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] rounded-lg overflow-hidden border">
                <TrackedUserMap isTracking={isTracking} />
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  className={`flex-1 ${isTracking ? "bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800" : "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"}`}
                  onClick={toggleTracking}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isTracking ? "Stop Tracking" : "Start Tracking"}
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                  onClick={sendPanicAlert}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Panic Alert
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent tracking sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-start gap-4 p-3 rounded-lg border">
                    <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Tracking Session #{item}</h4>
                        <Badge variant="outline">2 hours ago</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">From Home to Work - Duration: 35 minutes</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-80 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Guardians</CardTitle>
              <CardDescription>People who can track your location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {guardians.map((guardian) => (
                  <div key={guardian.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                        <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{guardian.name}</h4>
                        <p className="text-xs text-muted-foreground">{guardian.relationship}</p>
                      </div>
                    </div>
                    <Badge variant={guardian.isActive ? "success" : "secondary"}>
                      {guardian.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <User className="mr-2 h-4 w-4" />
                Add Guardian
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Safety Tips</CardTitle>
              <CardDescription>Stay safe with these tips</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="bg-purple-100 dark:bg-purple-900 p-1 rounded-full mt-0.5">
                    <Shield className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span>Share your location with trusted contacts</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-purple-100 dark:bg-purple-900 p-1 rounded-full mt-0.5">
                    <Shield className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span>Keep your phone charged and accessible</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-purple-100 dark:bg-purple-900 p-1 rounded-full mt-0.5">
                    <Shield className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span>Test the panic button with guardians regularly</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

