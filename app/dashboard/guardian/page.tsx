"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MapPin, User, Bell, Clock, AlertTriangle } from "lucide-react"
import { GuardianMap } from "@/components/guardian-map"

export default function GuardianDashboard() {
  const [trackedUsers, setTrackedUsers] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      relationship: "Daughter",
      status: "active",
      lastUpdated: "Just now",
      location: { lat: 37.7749, lng: -122.4194, name: "San Francisco, CA" },
    },
    {
      id: 2,
      name: "Emily Parker",
      relationship: "Sister",
      status: "inactive",
      lastUpdated: "2 hours ago",
      location: { lat: 37.3382, lng: -121.8863, name: "San Jose, CA" },
    },
    {
      id: 3,
      name: "Lisa Thompson",
      relationship: "Friend",
      status: "inactive",
      lastUpdated: "Yesterday",
      location: { lat: 37.4419, lng: -122.143, name: "Palo Alto, CA" },
    },
  ])

  const [selectedUser, setSelectedUser] = useState(trackedUsers[0])
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      user: "Sarah Johnson",
      type: "panic",
      time: "10 minutes ago",
      location: "Market Street, San Francisco",
      resolved: false,
    },
  ])

  const handleUserSelect = (user) => {
    setSelectedUser(user)
  }

  const resolveAlert = (alertId) => {
    setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, resolved: true } : alert)))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="map" className="mt-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-80 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tracked Users</CardTitle>
                  <CardDescription>People you are monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackedUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedUser.id === user.id
                            ? "bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              user.status === "active"
                                ? "bg-green-100 dark:bg-green-900"
                                : "bg-gray-100 dark:bg-gray-800"
                            }`}
                          >
                            <User
                              className={`h-4 w-4 ${
                                user.status === "active"
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{user.name}</h4>
                            <p className="text-xs text-muted-foreground">{user.relationship}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge variant={user.status === "active" ? "success" : "secondary"}>
                            {user.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-muted-foreground mt-1">{user.lastUpdated}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <User className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </CardContent>
              </Card>

              {selectedUser && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>{selectedUser.name}</CardTitle>
                    <CardDescription>Location details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                          <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Current Location</h4>
                          <p className="text-sm text-muted-foreground">{selectedUser.location.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Last Updated</h4>
                          <p className="text-sm text-muted-foreground">{selectedUser.lastUpdated}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1" variant="outline">
                          Message
                        </Button>
                        <Button className="flex-1" variant="outline">
                          Call
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Location Map</CardTitle>
                  <CardDescription>Real-time location of tracked users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px] rounded-lg overflow-hidden border">
                    <GuardianMap
                      trackedUsers={trackedUsers}
                      selectedUser={selectedUser}
                      onUserSelect={handleUserSelect}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Safety Alerts</CardTitle>
              <CardDescription>Recent alerts from tracked users</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.type === "panic" && !alert.resolved
                          ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                          : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2 rounded-full ${
                            alert.type === "panic" ? "bg-red-100 dark:bg-red-900" : "bg-yellow-100 dark:bg-yellow-900"
                          }`}
                        >
                          <AlertTriangle
                            className={`h-5 w-5 ${
                              alert.type === "panic"
                                ? "text-red-600 dark:text-red-400"
                                : "text-yellow-600 dark:text-yellow-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{alert.user}</h4>
                            <Badge variant={alert.resolved ? "outline" : "destructive"}>
                              {alert.resolved ? "Resolved" : "Active Alert"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.type === "panic" ? "Panic Button Pressed" : "Safety Alert"}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{alert.time}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{alert.location}</span>
                          </div>
                          {!alert.resolved && (
                            <div className="mt-4 flex gap-2">
                              <Button className="flex-1" variant="outline" onClick={() => resolveAlert(alert.id)}>
                                Mark as Resolved
                              </Button>
                              <Button className="flex-1">Contact User</Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Active Alerts</h3>
                  <p className="text-muted-foreground mt-1">
                    All tracked users are safe. You'll be notified when there's an alert.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

