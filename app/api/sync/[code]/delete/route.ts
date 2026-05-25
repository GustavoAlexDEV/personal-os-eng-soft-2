import { profileController } from "@/lib/config"
import { NextResponse } from "next/server"

/**
 * DELETE /api/sync/[code]/delete
 * Remove um perfil (requer senha se configurada)
 * Usa o controller polimórfico injetado via configuração
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const syncCode = code.toUpperCase()

    if (!/^[A-Z0-9]{6,8}$/.test(syncCode)) {
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

    // Verifica se perfil existe e tem senha
    const hasPassword = await profileController.hasPassword(syncCode)
    
    if (hasPassword && !password) {
      return NextResponse.json({ 
        error: "Senha obrigatoria para deletar este perfil", 
        requiresPassword: true 
      }, { status: 401 })
    }

    const success = await profileController.destroy(syncCode, password || undefined)

    if (!success) {
      // Se tinha senha e falhou, a senha estava incorreta
      if (hasPassword && password) {
        return NextResponse.json({ error: "Senha incorreta" }, { status: 403 })
      }
      return NextResponse.json({ error: "Perfil nao encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Perfil ${syncCode} deletado com sucesso`,
      deletedCode: syncCode,
    })
  } catch (error) {
    console.error("Sync DELETE error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
