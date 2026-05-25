import { profileController } from "@/lib/config"
import { NextResponse } from "next/server"

/**
 * GET /api/stats
 * Obtém estatísticas gerais sobre os perfis
 * Usa o controller polimórfico injetado via configuração
 */
export async function GET() {
  try {
    const stats = await profileController.stats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Stats GET error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
