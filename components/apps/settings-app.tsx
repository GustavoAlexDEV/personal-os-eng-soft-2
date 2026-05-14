"use client"

import type React from "react"

import { useOS } from "@/contexts/os-context"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SaveIcon, UploadIcon, TrashIcon, UserIcon, CloudIcon, DownloadIcon, RefreshCwIcon, CopyIcon, CheckIcon, Loader2Icon } from "lucide-react"

export function SettingsApp() {
  const { settings, updateSettings, saveState, syncToCloud, loadFromCloud, updateCloud, syncCode, isSyncing } = useOS()
  const [themeColor, setThemeColor] = useState(settings.themeColor)
  const [fontFamily, setFontFamily] = useState(settings.fontFamily)
  const [username, setUsername] = useState(settings.username)
  const [profilePicture, setProfilePicture] = useState(settings.profilePicture)
  const [importCode, setImportCode] = useState("")
  const [syncMessage, setSyncMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)

  const handleSyncToCloud = async () => {
    setSyncMessage(null)
    const code = await syncToCloud()
    if (code) {
      setSyncMessage({ type: "success", text: `Salvo na nuvem! Seu codigo: ${code}` })
    } else {
      setSyncMessage({ type: "error", text: "Erro ao salvar na nuvem. Tente novamente." })
    }
  }

  const handleLoadFromCloud = async () => {
    if (!importCode.trim()) {
      setSyncMessage({ type: "error", text: "Digite um codigo para importar." })
      return
    }
    setSyncMessage(null)
    const success = await loadFromCloud(importCode.trim())
    if (success) {
      setSyncMessage({ type: "success", text: "Dados carregados com sucesso!" })
      setImportCode("")
    } else {
      setSyncMessage({ type: "error", text: "Codigo nao encontrado ou erro ao carregar." })
    }
  }

  const handleUpdateCloud = async () => {
    setSyncMessage(null)
    const success = await updateCloud()
    if (success) {
      setSyncMessage({ type: "success", text: "Dados atualizados na nuvem!" })
    } else {
      setSyncMessage({ type: "error", text: "Erro ao atualizar. Verifique sua conexao." })
    }
  }

  const handleCopyCode = () => {
    if (syncCode) {
      navigator.clipboard.writeText(syncCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const handleSaveSettings = () => {
    updateSettings({ themeColor, fontFamily, username, profilePicture })
    saveState()
  }

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader()
      reader.onload = (event) => {
        updateSettings({ backgroundImage: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    } else if (file) {
      alert("Arquivo muito grande! Máximo 5MB.")
    }
  }

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

  const handleResetSystem = () => {
    const confirmed = confirm(
      "Tem certeza que deseja resetar todas as configurações?\n\n" +
        "Isso irá:\n" +
        "• Remover todos os ícones personalizados\n" +
        "• Resetar tema e cores\n" +
        "• Remover plano de fundo personalizado\n" +
        "• Restaurar ícones padrão\n\n" +
        "Esta ação não pode ser desfeita!",
    )

    if (confirmed) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const popularFonts = [
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Raleway",
    "Ubuntu",
    "Playfair Display",
    "Merriweather",
  ]

  return (
    <div className="h-full p-6">
      <Tabs defaultValue="profile" className="h-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="desktop">Desktop</TabsTrigger>
          <TabsTrigger value="sync">Sincronizar</TabsTrigger>
          <TabsTrigger value="about">Sobre</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 pt-4">
          <div className="flex flex-col items-center gap-4 pb-4 border-b border-border">
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
            <Button variant="outline" size="sm" onClick={() => profileInputRef.current?.click()}>
              <UploadIcon className="mr-2 h-4 w-4" />
              Alterar Foto de Perfil
            </Button>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleProfilePictureUpload}
            />
            <p className="text-xs text-muted-foreground text-center">JPG ou PNG, máximo 2MB</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Nome de Usuário</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu nome"
              maxLength={30}
            />
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            <SaveIcon className="mr-2 h-4 w-4" />
            Salvar Perfil
          </Button>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="theme-color">Cor do Tema</Label>
            <div className="flex gap-2">
              <Input
                id="theme-color"
                type="text"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                placeholder="#6366f1 ou rgb(99, 102, 241)"
                className="flex-1"
              />
              <Input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-16" />
            </div>
            <p className="text-xs text-muted-foreground">Aceita códigos HEX (#6366f1) ou RGB (rgb(99, 102, 241))</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-family">Fonte Principal</Label>
            <select
              id="font-family"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {popularFonts.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Fontes do Google Fonts</p>
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            <SaveIcon className="mr-2 h-4 w-4" />
            Salvar Configurações
          </Button>
        </TabsContent>

        <TabsContent value="desktop" className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label>Plano de Fundo</Label>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => backgroundInputRef.current?.click()}
            >
              <UploadIcon className="mr-2 h-4 w-4" />
              Fazer Upload de Imagem
            </Button>
            <input
              ref={backgroundInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleBackgroundUpload}
            />
            <p className="text-xs text-muted-foreground">JPG ou PNG, máximo 5MB</p>
          </div>

          {settings.backgroundImage && (
            <div className="space-y-2">
              <Label>Preview do Plano de Fundo</Label>
              <div className="relative h-32 w-full overflow-hidden rounded-md border border-border">
                <img
                  src={settings.backgroundImage || "/placeholder.svg"}
                  alt="Background preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <Button variant="destructive" size="sm" onClick={() => updateSettings({ backgroundImage: "" })}>
                Remover Plano de Fundo
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label>Ícones Personalizados</Label>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => iconInputRef.current?.click()}>
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload de Ícone (SVG/PNG)
            </Button>
            <input
              ref={iconInputRef}
              type="file"
              accept="image/svg+xml,image/png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return

                if (file.size > 2 * 1024 * 1024) {
                  alert("Arquivo muito grande! Máximo 2MB.")
                  return
                }

                const reader = new FileReader()
                reader.onload = (event) => {
                  const customIcons = settings.customIcons || []
                  const newCustomIcon = {
                    id: `custom-icon-${Date.now()}`,
                    name: file.name,
                    data: event.target?.result as string,
                  }
                  updateSettings({ customIcons: [...customIcons, newCustomIcon] })
                  iconInputRef.current!.value = ""
                }
                reader.readAsDataURL(file)
              }}
            />
            <p className="text-xs text-muted-foreground">SVG ou PNG, máximo 2MB</p>

            {settings.customIcons && settings.customIcons.length > 0 && (
              <div className="mt-4">
                <Label className="mb-2 block">Ícones Carregados:</Label>
                <div className="grid grid-cols-4 gap-2 rounded-md border border-border p-2 bg-muted/50">
                  {settings.customIcons.map((customIcon) => (
                    <div key={customIcon.id} className="relative group">
                      <img
                        src={customIcon.data || "/placeholder.svg"}
                        alt={customIcon.name}
                        className="h-full w-full object-cover rounded aspect-square"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded"
                        onClick={() => {
                          updateSettings({
                            customIcons: (settings.customIcons || []).filter((i) => i.id !== customIcon.id),
                          })
                        }}
                      >
                        <TrashIcon className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6 pt-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CloudIcon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Sincronizacao na Nuvem</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Salve suas configuracoes na nuvem e carregue em qualquer outro navegador usando um codigo de 6 caracteres.
            </p>
          </div>

          {syncCode && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
              <Label className="text-sm font-medium">Seu Codigo de Sincronizacao</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-md border border-border bg-background px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] font-bold select-all">
                  {syncCode}
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyCode} className="shrink-0 h-12 w-12">
                  {copiedCode ? <CheckIcon className="h-5 w-5 text-green-600" /> : <CopyIcon className="h-5 w-5" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Guarde este codigo para usar em outro navegador.</p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Salvar na Nuvem</h4>
            {syncCode ? (
              <Button onClick={handleUpdateCloud} disabled={isSyncing} className="w-full">
                {isSyncing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCwIcon className="mr-2 h-4 w-4" />}
                Atualizar Dados na Nuvem
              </Button>
            ) : (
              <Button onClick={handleSyncToCloud} disabled={isSyncing} className="w-full">
                {isSyncing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <CloudIcon className="mr-2 h-4 w-4" />}
                Salvar na Nuvem (Gerar Codigo)
              </Button>
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <h4 className="font-medium text-sm">Importar de Outro Navegador</h4>
            <div className="flex gap-2">
              <Input
                value={importCode}
                onChange={(e) => setImportCode(e.target.value.toUpperCase())}
                placeholder="EX: A3B7K9"
                maxLength={6}
                className="font-mono text-center tracking-widest text-lg"
              />
              <Button onClick={handleLoadFromCloud} disabled={isSyncing || !importCode.trim()} variant="outline" className="shrink-0">
                {isSyncing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <DownloadIcon className="mr-2 h-4 w-4" />}
                Importar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Digite o codigo de 6 caracteres gerado em outro navegador para carregar suas configuracoes.
            </p>
          </div>

          {syncMessage && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                syncMessage.type === "success"
                  ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                  : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
              }`}
            >
              {syncMessage.text}
            </div>
          )}
        </TabsContent>

        <TabsContent value="about" className="space-y-4 pt-4">
          <div className="rounded-lg border border-border bg-muted p-4">
            <h3 className="font-semibold text-lg mb-2">Sistema Operacional Pessoal</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Um ambiente de trabalho personalizável construído com React e Next.js.
            </p>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Versão:</strong> 1.0.0
              </p>
              <p>
                <strong>Desenvolvido por:</strong> v0.dev
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Recursos:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Área de trabalho personalizável</li>
              <li>Sistema de janelas arrastáveis e redimensionáveis</li>
              <li>Temas e fontes customizáveis</li>
              <li>Aplicativos integrados (Paint, Campo Minado)</li>
              <li>Suporte para scripts personalizados</li>
              <li>Salvamento automático de configurações</li>
              <li>Sincronizacao na nuvem entre navegadores</li>
            </ul>
          </div>

          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-3">
            <div>
              <h4 className="font-medium text-destructive mb-1">Zona de Perigo</h4>
              <p className="text-sm text-muted-foreground">
                Resetar o sistema irá apagar todas as suas personalizações e configurações.
              </p>
            </div>
            <Button variant="destructive" className="w-full" onClick={handleResetSystem}>
              <TrashIcon className="mr-2 h-4 w-4" />
              Resetar Sistema Completo
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
