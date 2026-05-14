"use client"

import type React from "react"

import { useOS } from "@/contexts/os-context"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SaveIcon, UploadIcon, TrashIcon, UserIcon, CloudIcon, DownloadIcon, RefreshCwIcon, CopyIcon, CheckIcon, Loader2Icon, BarChart3Icon, UsersIcon, CalendarIcon, KeyIcon, ShuffleIcon } from "lucide-react"

export function SettingsApp() {
  const { settings, updateSettings, saveState, syncToCloud, loadFromCloud, updateCloud, syncCode, isSyncing, clearSyncCode } = useOS()
  const [themeColor, setThemeColor] = useState(settings.themeColor)
  const [fontFamily, setFontFamily] = useState(settings.fontFamily)
  const [username, setUsername] = useState(settings.username)
  const [profilePicture, setProfilePicture] = useState(settings.profilePicture)
  const [importCode, setImportCode] = useState("")
  const [syncMessage, setSyncMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [deletingProfile, setDeletingProfile] = useState(false)
  
  // Estado para criacao de senha ao sincronizar
  const [showPasswordSetup, setShowPasswordSetup] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [pendingSyncCode, setPendingSyncCode] = useState<string | null>(null)
  
  // Estado para deletar com senha
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [profileHasPassword, setProfileHasPassword] = useState(false)
  
  const [stats, setStats] = useState<{
    totalProfiles: number
    profilesCreatedToday: number
    profilesCreatedThisWeek: number
    recentProfiles: Array<{ code: string; username: string; createdAt: string }>
    oldestProfile: { code: string; username: string; createdAt: string } | null
  } | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
    let password = ""
    for (let i = 0; i < 8; i++) {
      password += chars[Math.floor(Math.random() * chars.length)]
    }
    return password
  }

  const handleSyncToCloud = async () => {
    setSyncMessage(null)
    const code = await syncToCloud()
    if (code) {
      // Apos criar o perfil, pedir para definir senha
      setPendingSyncCode(code)
      setNewPassword("")
      setShowPasswordSetup(true)
    } else {
      setSyncMessage({ type: "error", text: "Erro ao salvar na nuvem. Tente novamente." })
    }
  }

  const handleSetPassword = async () => {
    if (!pendingSyncCode) return
    
    if (!newPassword.trim()) {
      setSyncMessage({ type: "error", text: "Digite uma senha ou gere uma aleatoria." })
      return
    }

    try {
      const res = await fetch(`/api/sync/${pendingSyncCode}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword.trim() }),
      })

      if (res.ok) {
        setSyncMessage({ type: "success", text: `Perfil criado com sucesso! Codigo: ${pendingSyncCode}. Guarde sua senha: ${newPassword}` })
        setShowPasswordSetup(false)
        setPendingSyncCode(null)
        setNewPassword("")
      } else {
        const data = await res.json()
        setSyncMessage({ type: "error", text: data.error || "Erro ao definir senha." })
      }
    } catch (err) {
      setSyncMessage({ type: "error", text: "Erro de conexao ao definir senha." })
    }
  }

  const handleSkipPassword = () => {
    setSyncMessage({ type: "success", text: `Perfil criado! Codigo: ${pendingSyncCode}. (Sem senha de protecao)` })
    setShowPasswordSetup(false)
    setPendingSyncCode(null)
    setNewPassword("")
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

  const handleFetchStats = async () => {
    setLoadingStats(true)
    try {
      const res = await fetch("/api/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleInitiateDelete = async () => {
    if (!syncCode) {
      setSyncMessage({ type: "error", text: "Voce nao tem um perfil sincronizado para deletar." })
      return
    }

    // Verifica se o perfil tem senha
    try {
      const res = await fetch(`/api/sync/${syncCode}/password`)
      if (res.ok) {
        const data = await res.json()
        setProfileHasPassword(data.hasPassword)
        setDeletePassword("")
        setShowDeleteDialog(true)
      } else {
        setSyncMessage({ type: "error", text: "Erro ao verificar perfil." })
      }
    } catch (err) {
      setSyncMessage({ type: "error", text: "Erro de conexao." })
    }
  }

  const handleConfirmDelete = async () => {
    if (!syncCode) return

    if (profileHasPassword && !deletePassword.trim()) {
      setSyncMessage({ type: "error", text: "Digite a senha para deletar o perfil." })
      return
    }

    setDeletingProfile(true)
    setSyncMessage(null)

    try {
      const res = await fetch(`/api/sync/${syncCode}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword.trim() || null }),
      })
      
      if (res.ok) {
        setSyncMessage({ type: "success", text: "Perfil deletado da nuvem com sucesso! Voce pode sincronizar novamente quando quiser." })
        setShowDeleteDialog(false)
        setDeletePassword("")
        // Limpa o codigo local para permitir ressincronizar
        clearSyncCode()
      } else {
        const data = await res.json()
        if (data.requiresPassword) {
          setSyncMessage({ type: "error", text: "Este perfil requer senha para ser deletado." })
          setProfileHasPassword(true)
        } else {
          setSyncMessage({ type: "error", text: data.error || "Erro ao deletar perfil." })
        }
      }
    } catch (err) {
      setSyncMessage({ type: "error", text: "Erro de conexao ao deletar perfil." })
    } finally {
      setDeletingProfile(false)
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

        <TabsContent value="sync" className="space-y-6 pt-4 overflow-y-auto max-h-[calc(100vh-250px)]">
          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CloudIcon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Sincronizacao na Nuvem</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Salve suas configuracoes na nuvem e carregue em qualquer outro navegador usando um codigo de 6 caracteres.
            </p>
          </div>

          {/* Dialog de configuracao de senha */}
          {showPasswordSetup && (
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <KeyIcon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Definir Senha de Protecao</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Defina uma senha para proteger seu perfil. Ela sera necessaria para deletar o perfil no futuro.
              </p>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite uma senha"
                    maxLength={20}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setNewPassword(generateRandomPassword())}
                    title="Gerar senha aleatoria"
                  >
                    <ShuffleIcon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Maximo 20 caracteres. Guarde esta senha!</p>
                <div className="flex gap-2">
                  <Button onClick={handleSetPassword} className="flex-1">
                    <KeyIcon className="mr-2 h-4 w-4" />
                    Definir Senha
                  </Button>
                  <Button variant="ghost" onClick={handleSkipPassword}>
                    Pular
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Dialog de deletar com senha */}
          {showDeleteDialog && (
            <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <TrashIcon className="h-5 w-5 text-destructive" />
                <h3 className="font-semibold text-destructive">Deletar Perfil</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja deletar seu perfil da nuvem? Suas configuracoes locais serao mantidas e voce podera sincronizar novamente.
              </p>
              {profileHasPassword && (
                <div className="space-y-2">
                  <Label>Digite a senha do perfil:</Label>
                  <Input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Senha de protecao"
                    maxLength={20}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={deletingProfile}
                  className="flex-1"
                >
                  {deletingProfile ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <TrashIcon className="mr-2 h-4 w-4" />
                  )}
                  Confirmar Exclusao
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {syncCode && !showPasswordSetup && !showDeleteDialog && (
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

          {!showPasswordSetup && !showDeleteDialog && (
            <>
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

              {syncCode && (
                <div className="space-y-3 border-t border-border pt-4">
                  <h4 className="font-medium text-sm text-destructive">Zona de Perigo</h4>
                  <Button
                    variant="outline"
                    onClick={handleInitiateDelete}
                    disabled={deletingProfile}
                    className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Deletar Perfil da Nuvem
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Remove seus dados da nuvem. Voce podera sincronizar novamente depois.
                  </p>
                </div>
              )}
            </>
          )}

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

          {/* Estatísticas do Banco */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <BarChart3Icon className="h-4 w-4" />
                Estatisticas da Nuvem
              </h4>
              <Button onClick={handleFetchStats} disabled={loadingStats} variant="outline" size="sm">
                {loadingStats ? (
                  <Loader2Icon className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCwIcon className="mr-2 h-3 w-3" />
                )}
                {stats ? "Atualizar" : "Carregar"}
              </Button>
            </div>

            {stats && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-md bg-background p-3 border border-border">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <UsersIcon className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-2xl font-bold">{stats.totalProfiles}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="rounded-md bg-background p-3 border border-border">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <CalendarIcon className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-2xl font-bold">{stats.profilesCreatedToday}</p>
                    <p className="text-xs text-muted-foreground">Hoje</p>
                  </div>
                  <div className="rounded-md bg-background p-3 border border-border">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <CalendarIcon className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-2xl font-bold">{stats.profilesCreatedThisWeek}</p>
                    <p className="text-xs text-muted-foreground">Semana</p>
                  </div>
                </div>

                {stats.recentProfiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Perfis recentes:</p>
                    <div className="space-y-1">
                      {stats.recentProfiles.map((p) => (
                        <div key={p.code} className="flex items-center justify-between text-xs bg-background rounded px-2 py-1.5 border border-border">
                          <span className="font-mono font-semibold">{p.code}</span>
                          <span className="text-muted-foreground truncate max-w-[120px]">{p.username || "Sem nome"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
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
