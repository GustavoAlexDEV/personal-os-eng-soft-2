import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const syncCode = code.toUpperCase()

    if (!/^[A-Z0-9]{6}$/.test(syncCode)) {
      return NextResponse.json({ error: "Codigo invalido" }, { status: 400 })
    }

    const rows = await sql`
      SELECT state_data, updated_at FROM sync_profiles WHERE sync_code = ${syncCode}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: "Perfil nao encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      stateData: rows[0].state_data,
      updatedAt: rows[0].updated_at,
    })
  } catch (error) {
    console.error("Sync GET error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const syncCode = code.toUpperCase()

    if (!/^[A-Z0-9]{6}$/.test(syncCode)) {
      return NextResponse.json({ error: "Codigo invalido" }, { status: 400 })
    }

    const body = await request.json()
    const { icons, settings, isWelcomeComplete } = body

    if (!icons || !settings) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const stateData = JSON.stringify({ icons, settings, isWelcomeComplete })

    const result = await sql`
      UPDATE sync_profiles
      SET state_data = ${stateData}::jsonb, updated_at = NOW()
      WHERE sync_code = ${syncCode}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Perfil nao encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Sync PUT error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
