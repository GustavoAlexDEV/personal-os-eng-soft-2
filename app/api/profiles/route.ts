import { profileController } from "@/lib/config"
import { NextResponse } from "next/server"

/**
 * GET /api/profiles
 * Lista todos os perfis com paginação
 * Usa o controller polimórfico injetado via configuração
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")))

    const result = await profileController.index(page, limit)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Profiles GET error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
