import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const syncCode = code.toUpperCase()

    if (!/^[A-Z0-9]{6}$/.test(syncCode)) {
      return NextResponse.json({ error: "Codigo invalido" }, { status: 400 })
    }

    // Obtem a senha do body da requisicao
    let password: string | null = null
    try {
      const body = await request.json()
      password = body.password || null
    } catch {
      // Body vazio ou invalido
    }

    // Verifica se o perfil existe e se tem senha
    const existing = await sql`
      SELECT sync_code, delete_password FROM sync_profiles WHERE sync_code = ${syncCode}
    `

    if (existing.length === 0) {
      return NextResponse.json({ error: "Perfil nao encontrado" }, { status: 404 })
    }

    const storedPassword = existing[0].delete_password

    // Se o perfil tem senha, exige que seja fornecida
    if (storedPassword) {
      if (!password) {
        return NextResponse.json({ error: "Senha obrigatoria para deletar este perfil", requiresPassword: true }, { status: 401 })
      }
      if (password !== storedPassword) {
        return NextResponse.json({ error: "Senha incorreta" }, { status: 403 })
      }
    }

    const result = await sql`
      DELETE FROM sync_profiles
      WHERE sync_code = ${syncCode}
      RETURNING id, sync_code
    `

    return NextResponse.json({
      success: true,
      message: `Perfil ${syncCode} deletado com sucesso`,
      deletedCode: result[0].sync_code,
    })
  } catch (error) {
    console.error("Sync DELETE error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
