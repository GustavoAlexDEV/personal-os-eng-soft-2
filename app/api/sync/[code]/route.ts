import { profileController } from "@/lib/config"
import { NextResponse } from "next/server"

/**
 * GET /api/sync/[code]
 * Busca um perfil específico por código
 * Usa o controller polimórfico injetado via configuração
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const syncCode = code.toUpperCase()

    if (!/^[A-Z0-9]{6,8}$/.test(syncCode)) {
      return NextResponse.json({ error: "Codigo invalido" }, { status: 400 })
    }

    const profile = await profileController.show(syncCode)

    if (!profile) {
      return NextResponse.json({ error: "Perfil nao encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      stateData: profile.stateData,
      updatedAt: profile.updatedAt,
    })
  } catch (error) {
    console.error("Sync GET error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

/**
 * PUT /api/sync/[code]
 * Atualiza um perfil existente
 * Usa o controller polimórfico injetado via configuração
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const syncCode = code.toUpperCase()

    if (!/^[A-Z0-9]{6,8}$/.test(syncCode)) {
      return NextResponse.json({ error: "Codigo invalido" }, { status: 400 })
    }

    const body = await request.json()
    const { icons, settings, isWelcomeComplete } = body

    if (!icons || !settings) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const success = await profileController.update(syncCode, { icons, settings, isWelcomeComplete })

    if (!success) {
      return NextResponse.json({ error: "Perfil nao encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Sync PUT error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
