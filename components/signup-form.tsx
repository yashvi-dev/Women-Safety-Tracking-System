"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Shield, User } from "lucide-react"

export function SignupForm() {
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
          <Label htmlFor="fullname">Full Name</Label>
          <Input id="fullname" type="text" required placeholder="Enter your full name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input id="signup-email" type="email" required placeholder="Enter your email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" required placeholder="Enter your phone number" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input id="signup-password" type="password" required placeholder="Create a password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input id="confirm-password" type="password" required placeholder="Confirm your password" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>I am a</Label>
        <RadioGroup
          defaultValue="tracked"
          className="grid grid-cols-2 gap-4"
          onValueChange={(value) => setRole(value as "tracked" | "guardian")}
        >
          <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900">
            <RadioGroupItem value="tracked" id="signup-tracked" />
            <Label htmlFor="signup-tracked" className="flex items-center cursor-pointer">
              <User className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" />
              Tracked User
            </Label>
          </div>
          <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900">
            <RadioGroupItem value="guardian" id="signup-guardian" />
            <Label htmlFor="signup-guardian" className="flex items-center cursor-pointer">
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
        Create Account
      </Button>
    </form>
  )
}

