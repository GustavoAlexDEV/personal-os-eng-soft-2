import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

// Definir senha para o perfil
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
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
    const existing = await sql`
      SELECT sync_code, delete_password FROM sync_profiles WHERE sync_code = ${syncCode}
    `

    if (existing.length === 0) {
      return NextResponse.json({ error: "Perfil nao encontrado" }, { status: 404 })
    }

    // Verifica se ja tem senha definida
    if (existing[0].delete_password) {
      return NextResponse.json({ error: "Este perfil ja possui uma senha definida" }, { status: 400 })
    }

    // Define a senha
    await sql`
      UPDATE sync_profiles SET delete_password = ${password} WHERE sync_code = ${syncCode}
    `

    return NextResponse.json({ success: true, message: "Senha definida com sucesso" })
  } catch (error) {
    console.error("Password POST error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// Verificar se perfil tem senha
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    const syncCode = code.toUpperCase()

    const result = await sql`
      SELECT delete_password FROM sync_profiles WHERE sync_code = ${syncCode}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Perfil nao encontrado" }, { status: 404 })
    }

    return NextResponse.json({ hasPassword: !!result[0].delete_password })
  } catch (error) {
    console.error("Password GET error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
