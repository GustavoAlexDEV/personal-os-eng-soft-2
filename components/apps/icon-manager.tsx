"use client"

import type React from "react"

import { useOS } from "@/contexts/os-context"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon, TrashIcon, SaveIcon, ImageIcon } from "lucide-react"

export function IconManager() {
  const { icons, addIcon, removeIcon, updateIconAppearance, settings, saveState } = useOS()

  // Social Link State
  const [socialName, setSocialName] = useState("")
  const [socialUrl, setSocialUrl] = useState("")

  // Script State
  const [scriptName, setScriptName] = useState("")
  const [scriptContent, setScriptContent] = useState("")

  // Image State
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [imageName, setImageName] = useState("")

  const [selectedIconId, setSelectedIconId] = useState<string | null>(null)
  const [showIconSelector, setShowIconSelector] = useState(false)

  const handleAddSocial = () => {
    if (!socialName || !socialUrl) {
      alert("Preencha todos os campos!")
      return
    }

    // Validate URL
    try {
      const url = new URL(socialUrl)
      if (!url.protocol.startsWith("http")) {
        throw new Error("Invalid protocol")
      }
    } catch {
      alert("URL inválida! Use http:// ou https://")
      return
    }

    addIcon({
      type: "social",
      name: socialName,
      icon: "",
      position: { x: 20 + icons.length * 100, y: 20 },
      data: { url: socialUrl },
    })

    setSocialName("")
    setSocialUrl("")
    saveState()
  }

  const handleAddScript = () => {
    if (!scriptName || !scriptContent) {
      alert("Preencha todos os campos!")
      return
    }

    if (scriptName.length > 50) {
      alert("Nome do script muito longo! Máximo 50 caracteres.")
      return
    }

    addIcon({
      type: "script",
      name: scriptName,
      icon: "",
      position: { x: 20 + icons.length * 100, y: 20 },
      data: { script: scriptContent },
    })

    setScriptName("")
    setScriptContent("")
    saveState()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo muito grande! Máximo 5MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      addIcon({
        type: "image",
        name: imageName || file.name,
        icon: event.target?.result as string,
        position: { x: 20 + icons.length * 100, y: 20 },
        data: { imageUrl: event.target?.result as string },
      })
      setImageName("")
      saveState()
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveIcon = (id: string) => {
    removeIcon(id)
    saveState()
  }

  const handleSelectIconForDesktop = (selectedIcon: string) => {
    if (selectedIconId) {
      updateIconAppearance(selectedIconId, selectedIcon)
      setSelectedIconId(null)
      setShowIconSelector(false)
      saveState()
    }
  }

  return (
    <div className="h-full p-6">
      <Tabs defaultValue="social" className="h-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="social">Redes Sociais</TabsTrigger>
          <TabsTrigger value="script">Scripts</TabsTrigger>
          <TabsTrigger value="image">Imagens</TabsTrigger>
          <TabsTrigger value="manage">Gerenciar</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="social-name">Nome da Rede Social</Label>
            <Input
              id="social-name"
              value={socialName}
              onChange={(e) => setSocialName(e.target.value)}
              placeholder="Instagram"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social-url">URL da Rede Social</Label>
            <Input
              id="social-url"
              type="url"
              value={socialUrl}
              onChange={(e) => setSocialUrl(e.target.value)}
              placeholder="https://instagram.com/usuario"
            />
            <p className="text-xs text-muted-foreground">Deve começar com http:// ou https://</p>
          </div>

          <Button onClick={handleAddSocial} className="w-full">
            <PlusIcon className="mr-2 h-4 w-4" />
            Adicionar Link Social
          </Button>
        </TabsContent>

        <TabsContent value="script" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="script-name">Nome do Script</Label>
            <Input
              id="script-name"
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              placeholder="Meu Script"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">Máximo 50 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="script-content">Código JavaScript</Label>
            <Textarea
              id="script-content"
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              placeholder="console.log('Hello World!');"
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <Button onClick={handleAddScript} className="w-full">
            <PlusIcon className="mr-2 h-4 w-4" />
            Adicionar Script
          </Button>
        </TabsContent>

        <TabsContent value="image" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="image-name">Nome da Imagem (opcional)</Label>
            <Input
              id="image-name"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              placeholder="Minha Foto"
            />
          </div>

          <div className="space-y-2">
            <Label>Arquivo de Imagem</Label>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => imageInputRef.current?.click()}>
              Selecionar Imagem
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleImageUpload}
            />
            <p className="text-xs text-muted-foreground">JPG ou PNG, máximo 5MB</p>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Ícones no Desktop ({icons.length})</Label>
              <Button onClick={saveState} size="sm" variant="outline">
                <SaveIcon className="mr-2 h-4 w-4" />
                Salvar Tudo
              </Button>
            </div>
            <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-md border border-border p-2">
              {icons.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">Nenhum ícone adicionado ainda</p>
              ) : (
                icons.map((icon) => (
                  <div key={icon.id} className="flex items-center justify-between rounded-md bg-muted p-3">
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-muted-foreground/10 rounded px-2 py-1"
                      onClick={() => {
                        setSelectedIconId(icon.id)
                        setShowIconSelector(true)
                      }}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-background text-xl flex-shrink-0">
                        {typeof icon.icon === "string" && icon.icon.startsWith("data:") ? (
                          <img
                            src={icon.icon || "/placeholder.svg"}
                            alt={icon.name}
                            className="h-full w-full object-cover rounded"
                          />
                        ) : typeof icon.icon === "string" && icon.icon.length <= 2 ? (
                          <span className="text-xl">{icon.icon}</span>
                        ) : (
                          <span className="text-sm font-medium text-muted-foreground capitalize">{icon.type}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{icon.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{icon.type}</p>
                      </div>
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveIcon(icon.id)}>
                      <TrashIcon className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {showIconSelector && selectedIconId && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-background rounded-lg border border-border p-6 max-w-sm w-full max-h-96 overflow-y-auto">
                  <h3 className="font-semibold mb-4">Selecionar Ícone Personalizado</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {/* Default icons */}
                    {["⚙️", "🎨", "💣", "🐸", "📋"].map((emoji, idx) => (
                      <button
                        key={`default-${idx}`}
                        onClick={() => handleSelectIconForDesktop(emoji)}
                        className="flex h-12 w-12 items-center justify-center rounded border border-border hover:bg-muted text-xl cursor-pointer transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}

                    {/* Custom icons from settings */}
                    {(settings.customIcons || []).map((customIcon) => (
                      <button
                        key={`custom-${customIcon.id}`}
                        onClick={() => handleSelectIconForDesktop(customIcon.data)}
                        className="flex h-12 w-12 items-center justify-center rounded border border-border hover:bg-muted overflow-hidden cursor-pointer transition-colors"
                        title={customIcon.name}
                      >
                        {typeof customIcon.data === "string" && customIcon.data.startsWith("data:") ? (
                          <img
                            src={customIcon.data || "/placeholder.svg"}
                            alt={customIcon.name}
                            className="h-full w-full object-cover"
                          />
                        ) : typeof customIcon.data === "string" && customIcon.data.length <= 2 ? (
                          <span className="text-xl">{customIcon.data}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Custom</span>
                        )}
                      </button>
                    ))}

                    {/* Desktop image icons */}
                    {icons
                      .filter((i) => i.type === "image" && typeof i.icon === "string" && i.icon.startsWith("data:"))
                      .map((customIcon) => (
                        <button
                          key={`desktop-${customIcon.id}`}
                          onClick={() => handleSelectIconForDesktop(customIcon.icon)}
                          className="flex h-12 w-12 items-center justify-center rounded border border-border hover:bg-muted overflow-hidden cursor-pointer transition-colors"
                          title={customIcon.name}
                        >
                          <img
                            src={customIcon.icon || "/placeholder.svg"}
                            alt={customIcon.name}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-transparent"
                    onClick={() => {
                      setSelectedIconId(null)
                      setShowIconSelector(false)
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
