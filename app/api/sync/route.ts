import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { icons, settings, isWelcomeComplete } = body

    if (!icons || !settings) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    let syncCode = generateCode()
    let attempts = 0

    while (attempts < 10) {
      const existing = await sql`SELECT id FROM sync_profiles WHERE sync_code = ${syncCode}`
      if (existing.length === 0) break
      syncCode = generateCode()
      attempts++
    }

    if (attempts >= 10) {
      return NextResponse.json({ error: "Falha ao gerar codigo unico" }, { status: 500 })
    }

    const stateData = JSON.stringify({ icons, settings, isWelcomeComplete })

    await sql`
      INSERT INTO sync_profiles (sync_code, state_data)
      VALUES (${syncCode}, ${stateData}::jsonb)
    `

    return NextResponse.json({ syncCode }, { status: 201 })
  } catch (error) {
    console.error("Sync POST error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
