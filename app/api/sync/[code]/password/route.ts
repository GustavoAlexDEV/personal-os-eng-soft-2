import { profileController } from "@/lib/config"
import { NextResponse } from "next/server"

/**
 * POST /api/sync/[code]/password
 * Define senha de proteção para o perfil
 * Usa o controller polimórfico injetado via configuração
 */
export async function POST(
  request: Request, 
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const syncCode = code.toUpperCase()
    const { password } = await request.json()

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Senha invalida" }, { status: 400 })
    }

    if (password.length > 20) {
      return NextResponse.json({ error: "Senha deve ter no maximo 20 caracteres" }, { status: 400 })
    }

    // Verifica se perfil existe
    const profile = await profileController.show(syncCode)
    if (!profile) {
      return NextResponse.json({ error: "Perfil nao encontrado" }, { status: 404 })
    }

    // Verifica se ja tem senha definida
    if (profile.hasPassword) {
      return NextResponse.json({ error: "Este perfil ja possui uma senha definida" }, { status: 400 })
    }

    // Define a senha (hash é gerado no controller)
    const success = await profileController.setPassword(syncCode, password)

    if (!success) {
      return NextResponse.json({ error: "Erro ao definir senha" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Senha definida com sucesso" })
  } catch (error) {
    console.error("Password POST error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

/**
 * GET /api/sync/[code]/password
 * Verifica se perfil possui senha de proteção
 * Usa o controller polimórfico injetado via configuração
 */
export async function GET(
  request: Request, 
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const syncCode = code.toUpperCase()

    const profile = await profileController.show(syncCode)
    
    if (!profile) {
      return NextResponse.json({ error: "Perfil nao encontrado" }, { status: 404 })
    }

    return NextResponse.json({ hasPassword: profile.hasPassword })
  } catch (error) {
    console.error("Password GET error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
