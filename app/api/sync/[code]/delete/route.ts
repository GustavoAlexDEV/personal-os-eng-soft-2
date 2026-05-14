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

    const result = await sql`
      DELETE FROM sync_profiles
      WHERE sync_code = ${syncCode}
      RETURNING id, sync_code
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Perfil nao encontrado" }, { status: 404 })
    }

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
