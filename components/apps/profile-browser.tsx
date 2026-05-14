"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  SearchIcon,
  Loader2Icon,
  UserIcon,
  PaletteIcon,
  LayoutGridIcon,
  ImageIcon,
  MonitorIcon,
  LinkIcon,
  CodeIcon,
  FileIcon,
  RefreshCwIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

interface RemoteProfile {
  icons: Array<{
    id: string
    type: string
    name: string
    icon: string
    position: { x: number; y: number }
    data?: any
  }>
  settings: {
    themeColor: string
    fontFamily: string
    backgroundImage: string
    username: string
    profilePicture: string
    customIcons?: Array<{ id: string; name: string; data: string }>
  }
  isWelcomeComplete: boolean
}

interface ProfileListItem {
  code: string
  username: string
  themeColor: string
  profilePicture: string
  iconCount: number
  createdAt: string
  updatedAt: string
}

export function ProfileBrowser() {
  const [code, setCode] = useState("")
  const [profile, setProfile] = useState<RemoteProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  
  // Lista de perfis
  const [viewMode, setViewMode] = useState<"search" | "list">("search")
  const [profileList, setProfileList] = useState<ProfileListItem[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [listPage, setListPage] = useState(1)
  const [totalProfiles, setTotalProfiles] = useState(0)
  const profilesPerPage = 10

  const fetchProfile = async () => {
    const trimmed = code.trim().toUpperCase()
    if (!/^[A-Z0-9]{6}$/.test(trimmed)) {
      setError("Codigo deve ter 6 caracteres alfanumericos.")
      return
    }

    setLoading(true)
    setError(null)
    setProfile(null)

    try {
      const res = await fetch(`/api/sync/${trimmed}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao buscar perfil")
      }
      const data = await res.json()
      setProfile(data.stateData)
      setUpdatedAt(data.updatedAt)
    } catch (err: any) {
      setError(err.message || "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const fetchProfileList = async (page: number = 1) => {
    setLoadingList(true)
    setError(null)
    try {
      const res = await fetch(`/api/profiles?page=${page}&limit=${profilesPerPage}`)
      if (!res.ok) throw new Error("Erro ao carregar lista de perfis")
      const data = await res.json()
      setProfileList(data.profiles)
      setTotalProfiles(data.total)
      setListPage(page)
    } catch (err: any) {
      setError(err.message || "Erro desconhecido")
    } finally {
      setLoadingList(false)
    }
  }

  const handleViewProfile = async (profileCode: string) => {
    const trimmed = profileCode.toUpperCase()
    setCode(trimmed)
    setViewMode("search")
    setLoading(true)
    setError(null)
    setProfile(null)

    try {
      const res = await fetch(`/api/sync/${trimmed}`)
      const data = await res.json()
      if (data.stateData) {
        setProfile(data.stateData)
        setUpdatedAt(data.updatedAt)
      } else {
        setError(data.error || "Perfil nao encontrado")
      }
    } catch {
      setError("Erro ao buscar perfil")
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalProfiles / profilesPerPage)

  const getIconTypeIcon = (type: string) => {
    switch (type) {
      case "social":
        return <LinkIcon className="h-3.5 w-3.5 text-blue-400" />
      case "script":
        return <CodeIcon className="h-3.5 w-3.5 text-amber-400" />
      case "image":
        return <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
      default:
        return <FileIcon className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      {/* Tabs de navegação */}
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex gap-2">
        <Button
          variant={viewMode === "search" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("search")}
        >
          <SearchIcon className="mr-2 h-4 w-4" />
          Buscar
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setViewMode("list")
            if (profileList.length === 0) fetchProfileList(1)
          }}
        >
          <UsersIcon className="mr-2 h-4 w-4" />
          Todos os Perfis
        </Button>
      </div>

      {viewMode === "search" ? (
        <>
          {/* Search bar */}
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Digite o codigo (ex: A3B7K9)"
                maxLength={6}
                className="font-mono text-center tracking-widest text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchProfile()
                }}
              />
              <Button onClick={fetchProfile} disabled={loading || !code.trim()} className="shrink-0">
                {loading ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <SearchIcon className="h-4 w-4" />
                )}
              </Button>
              {profile && (
                <Button onClick={fetchProfile} disabled={loading} variant="outline" size="icon" className="shrink-0" title="Recarregar">
                  <RefreshCwIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!profile && !error && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3 py-12">
            <MonitorIcon className="h-16 w-16 opacity-30" />
            <div className="space-y-1">
              <p className="font-medium text-foreground/70">Navegador de Perfis</p>
              <p className="text-sm max-w-[280px]">
                Digite o codigo de sincronizacao de outro usuario para visualizar o desktop dele sem alterar seus dados.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {profile && (
          <>
            {/* Profile header */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div
                className="h-16"
                style={{
                  backgroundImage: profile.settings.backgroundImage
                    ? `url(${profile.settings.backgroundImage})`
                    : undefined,
                  backgroundColor: profile.settings.themeColor || "#6366f1",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="px-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full border-2 border-border bg-muted overflow-hidden flex items-center justify-center shrink-0">
                    {profile.settings.profilePicture ? (
                      <img
                        src={profile.settings.profilePicture}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-base truncate">
                      {profile.settings.username || "Sem nome"}
                    </p>
                    {updatedAt && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Atualizado em {formatDate(updatedAt)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Codigo: <span className="font-mono font-semibold">{code.toUpperCase()}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Info */}
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <PaletteIcon className="h-4 w-4" />
                Configuracoes Visuais
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Cor:</span>
                  <div
                    className="h-5 w-5 rounded-full border border-border"
                    style={{ backgroundColor: profile.settings.themeColor }}
                  />
                  <span className="font-mono text-xs">{profile.settings.themeColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Fonte:</span>
                  <span>{profile.settings.fontFamily || "Padrao"}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <span className="text-muted-foreground">Fundo:</span>
                  <span>{profile.settings.backgroundImage ? "Imagem personalizada" : "Gradiente padrao"}</span>
                </div>
              </div>
            </div>

            {/* Icons */}
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <LayoutGridIcon className="h-4 w-4" />
                Icones do Desktop ({profile.icons.length})
              </div>
              {profile.icons.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum icone no desktop.</p>
              ) : (
                <div className="grid grid-cols-1 gap-1.5">
                  {profile.icons.map((icon) => (
                    <div
                      key={icon.id}
                      className="flex items-center gap-3 rounded-md bg-muted/40 px-3 py-2 text-sm"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-background/60 shrink-0">
                        {icon.icon &&
                        !icon.icon.startsWith("http") &&
                        !icon.icon.startsWith("data:") ? (
                          <span className="text-lg">{icon.icon}</span>
                        ) : icon.icon ? (
                          <img
                            src={icon.icon}
                            alt={icon.name}
                            className="h-5 w-5 object-contain"
                          />
                        ) : (
                          getIconTypeIcon(icon.type)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{icon.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{icon.type}</p>
                      </div>
                      {getIconTypeIcon(icon.type)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop mini-preview */}
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MonitorIcon className="h-4 w-4" />
                Previa do Desktop
              </div>
              <div
                className="relative rounded-md border border-border overflow-hidden"
                style={{
                  aspectRatio: "16 / 10",
                  backgroundImage: profile.settings.backgroundImage
                    ? `url(${profile.settings.backgroundImage})`
                    : undefined,
                  backgroundColor: profile.settings.themeColor || "#6366f1",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Overlay escuro para contraste dos icones */}
                <div className="absolute inset-0 bg-black/20" />

                {/* Container dos icones com escala proporcional */}
                <div className="absolute inset-0" style={{ bottom: 20 }}>
                  {profile.icons.map((icon) => {
                    // Escala proporcional: desktop real ~1280x800, previa ~450x280
                    const scaleX = 100 / 1280
                    const scaleY = 100 / 800
                    return (
                      <div
                        key={icon.id}
                        className="absolute flex flex-col items-center gap-0.5"
                        style={{
                          left: `${icon.position.x * scaleX}%`,
                          top: `${icon.position.y * scaleY}%`,
                        }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20 backdrop-blur-sm shadow-sm">
                          {icon.icon &&
                          !icon.icon.startsWith("http") &&
                          !icon.icon.startsWith("data:") ? (
                            <span className="text-sm leading-none">{icon.icon}</span>
                          ) : icon.icon ? (
                            <img
                              src={icon.icon}
                              alt={icon.name}
                              className="h-5 w-5 object-contain"
                            />
                          ) : (
                            <FileIcon className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <span className="text-[8px] leading-tight text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] max-w-[52px] truncate text-center">
                          {icon.name}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Mini taskbar */}
                <div className="absolute bottom-0 left-0 right-0 h-5 bg-black/50 backdrop-blur-sm flex items-center px-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-2.5 w-2.5 rounded-sm bg-white/30" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
        </>
      ) : (
        /* Lista de todos os perfis */
        <div className="flex-1 overflow-y-auto">
          {/* Header com paginação */}
          <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {totalProfiles} perfis encontrados
              </span>
              <Button
                onClick={() => fetchProfileList(listPage)}
                disabled={loadingList}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <RefreshCwIcon className={`h-4 w-4 ${loadingList ? "animate-spin" : ""}`} />
              </Button>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => fetchProfileList(listPage - 1)}
                  disabled={loadingList || listPage <= 1}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {listPage} / {totalPages}
                </span>
                <Button
                  onClick={() => fetchProfileList(listPage + 1)}
                  disabled={loadingList || listPage >= totalPages}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Lista */}
          <div className="p-4 space-y-2">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {loadingList && profileList.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : profileList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-3">
                <UsersIcon className="h-12 w-12 opacity-30" />
                <p>Nenhum perfil encontrado no banco de dados.</p>
              </div>
            ) : (
              profileList.map((p) => (
                <div
                  key={p.code}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:bg-muted/50 transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className="h-10 w-10 rounded-full border border-border overflow-hidden flex items-center justify-center shrink-0"
                    style={{ backgroundColor: p.themeColor || "#6366f1" }}
                  >
                    {p.profilePicture ? (
                      <img src={p.profilePicture} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-5 w-5 text-white/80" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm">{p.code}</span>
                      <span className="text-sm truncate">{p.username || "Sem nome"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{p.iconCount} icones</span>
                      <span>Criado: {formatDate(p.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      onClick={() => handleViewProfile(p.code)}
                      variant="outline"
                      size="sm"
                    >
                      <SearchIcon className="h-3.5 w-3.5 mr-1" />
                      Ver
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
