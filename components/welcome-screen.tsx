"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useOS } from "@/contexts/os-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadIcon, UserIcon } from "lucide-react"

export function WelcomeScreen() {
  const { updateSettings, completeWelcome } = useOS()
  const [username, setUsername] = useState("")
  const [profilePicture, setProfilePicture] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfilePicture(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else if (file) {
      alert("Arquivo muito grande! Máximo 2MB.")
    }
  }

  const handleContinue = () => {
    if (!username.trim()) {
      alert("Por favor, insira seu nome de usuário.")
      return
    }

    updateSettings({
      username: username.trim(),
      profilePicture,
    })
    completeWelcome()
  }

  const handleSkip = () => {
    updateSettings({
      username: "Usuário",
      profilePicture: "",
    })
    completeWelcome()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo!</h1>
          <p className="text-muted-foreground">Configure seu perfil para começar</p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-2 border-border bg-muted flex items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <img
                    src={profilePicture || "/placeholder.svg"}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <UploadIcon className="mr-2 h-4 w-4" />
              Escolher Foto de Perfil
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleProfilePictureUpload}
            />
            <p className="text-xs text-muted-foreground text-center">JPG ou PNG, máximo 2MB (opcional)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Nome de Usuário</Label>
            <Input
              id="username"
              type="text"
              placeholder="Digite seu nome"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handleSkip}>
              Pular
            </Button>
            <Button className="flex-1" onClick={handleContinue}>
              Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
