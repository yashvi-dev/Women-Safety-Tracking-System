"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Shield, User } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const [role, setRole] = useState<"tracked" | "guardian">("tracked")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/dashboard/${role}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required placeholder="Enter your email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required placeholder="Enter your password" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Select Role</Label>
        <RadioGroup
          defaultValue="tracked"
          className="grid grid-cols-2 gap-4"
          onValueChange={(value) => setRole(value as "tracked" | "guardian")}
        >
          <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900">
            <RadioGroupItem value="tracked" id="tracked" />
            <Label htmlFor="tracked" className="flex items-center cursor-pointer">
              <User className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" />
              Tracked User
            </Label>
          </div>
          <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900">
            <RadioGroupItem value="guardian" id="guardian" />
            <Label htmlFor="guardian" className="flex items-center cursor-pointer">
              <Shield className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" />
              Guardian
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
      >
        Sign In
      </Button>

      <div className="text-center text-sm">
        <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">
          Forgot password?
        </a>
      </div>
    </form>
  )
}

