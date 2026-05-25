/**
 * Arquivo de configuração para injeção de dependências
 * Permite trocar implementações de Controller e DAO sem modificar código cliente
 * Implementa polimorfismo via configuração
 */

import { ProfileDAO_Neon } from "./dao/ProfileDAO_Neon"
import { ProfileController } from "./controllers/ProfileController"
import type { IProfileDAO } from "./dao/IProfileDAO"
import type { IProfileController } from "./controllers/IProfileController"

/**
 * Configuração das implementações a serem utilizadas
 * Para trocar a implementação, basta alterar estas constantes
 */
const config = {
  // DAO: Define qual implementação de persistência usar
  // Opções: "ProfileDAO_Neon" (PostgreSQL via Neon)
  // Futuras opções: "ProfileDAO_Supabase", "ProfileDAO_MongoDB", etc.
  DAO: "ProfileDAO_Neon",

  // Controller: Define qual implementação de controller usar
  // Opções: "ProfileController" (implementação padrão)
  // Futuras opções: "ProfileControllerEncap" (com encapsulamento), etc.
  Controller: "ProfileController",
}

/**
 * Factory para criar instância do DAO baseado na configuração
 */
function createDAO(): IProfileDAO {
  switch (config.DAO) {
    case "ProfileDAO_Neon":
      return new ProfileDAO_Neon()
    // Adicione novos cases para outras implementações:
    // case "ProfileDAO_Supabase":
    //   return new ProfileDAO_Supabase()
    default:
      return new ProfileDAO_Neon()
  }
}

/**
 * Factory para criar instância do Controller baseado na configuração
 * O Controller recebe o DAO via injeção de dependência
 */
function createController(): IProfileController {
  const dao = createDAO()
  
  switch (config.Controller) {
    case "ProfileController":
      return new ProfileController(dao)
    // Adicione novos cases para outras implementações:
    // case "ProfileControllerEncap":
    //   return new ProfileControllerEncap(dao)
    default:
      return new ProfileController(dao)
  }
}

/**
 * Instância singleton do Controller
 * Exportada para uso em todas as API routes
 */
export const profileController = createController()

/**
 * Exporta a configuração atual para referência
 */
export { config }
