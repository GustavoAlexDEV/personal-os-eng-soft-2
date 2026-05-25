import { profileController } from "@/lib/config"
import { NextResponse } from "next/server"

/**
 * POST /api/sync
 * Cria um novo perfil sincronizado
 * Usa o controller polimórfico injetado via configuração
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { icons, settings, isWelcomeComplete } = body

    if (!icons || !settings) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const result = await profileController.store({ icons, settings, isWelcomeComplete })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Sync POST error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
