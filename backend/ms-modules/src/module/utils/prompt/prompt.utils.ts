import { ModuleRequestDto } from '../../dto/module/module-request.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptUtils {
  async getPrompt(generate: ModuleRequestDto): Promise<string> {
    const payload = {
      configurationUi: generate.configurationUi,
      orchestrationDetails: generate.orchestrationDetails ?? {},
    };

    return `
      ## ROL
      Eres un Arquitecto de UI Dinámica. Tu responsabilidad es tomar el JSON de entrada (DATA_SOURCE_JSON) y realizar el **razonamiento lógico** para elegir los mejores componentes, validaciones y estructuras de datos. No te preocupes por la expansión de SVGs o CamelCase, ya que un post-procesador se encargará de ello.

      ---

      ## CATÁLOGO DE COMPONENTES SOPORTADOS (Vue3 renderer)
      Los únicos valores válidos para "type" son: text | password | email | number | select | textarea | button | checkbox | radio | datepicker | toggle | phone | draw | table | table-products

      ---

      ## TU TRABAJO (Heurísticas y Razonamiento)

      ### 1. ELECCIÓN DE TIPOS DE COMPONENTE
      - Analiza la propiedad "label" y elige el "type" más adecuado.
      - Ejemplo: Contiene "Password" -> "password" | "Email" -> "email" | "País" -> "select".

      ### 2. ESTRUCTURA DE COLUMNAS (Layout)
      - Distribuye los componentes en el grid usando "column" (ej: "col-6", "col-12").
      - Mantén un balance visual (ej: dos campos de texto seguidos suelen ser "col-6" cada uno).

      ### 3. MAPEO DE REGLAS DE VALIDACIÓN
      - Si el componente necesita validación, asígnale una "rule" en el objeto "validation".
      - Reglas estándar: "nombre" | "userName" | "password" | "email" | "number" | "phone" | "default".
      - No necesitas escribir el "pattern" ni el "message", solo elige la "rule" correcta.

      ### 4. REGLA ESPECIAL DRAW
      - Si un componente tipo "draw" depende de la selección de otro campo, incluye "dataSource" dentro de "config" con la "property" del campo origen.

      ### 5. LÓGICA DE BOTONES Y ENDPOINTS
      - Configura el objeto "endpoint" para botones de acción.
      - Asegúrate de usar la clave "endpoint" para la ruta y "backend" para el servicio.

      ### 6. SEGURIDAD — RE-AUTENTICACIÓN
      - Si el módulo es sensible (ej: "Mi Perfil", "Seguridad", "Cambio de Contraseña"), establece "isReauthenticating": true dentro de "config". 
      - Esto obligará al usuario a ingresar su contraseña antes de ver o editar el contenido.

      ### 7. NAVEGACIÓN INTERNA Y SUBMÓDULOS (schemaChild)
      - NUNCA inventes sub-módulos (como "Configuración de Colores" o "Ajustes") si no están explícitamente requeridos en el orchestrationDetails o solicitados.
      - Si el módulo requiere vistas secundarias legítimas, genéralas dentro del array "schemaChild".
      - Cada hijo debe tener su propio "moduleId" (ej: "setting"), "path" (ej: "/setting") y un array "module" con sus propios componentes.
      - IMPORTANTE: El "moduleId" es un hermano de "config" en los hijos. NUNCA pongas "moduleId" dentro del objeto "config" principal ni de los hijos.
      - Asegúrate de que un botón en el toolbar o en el schema principal tenga una acción que coincida con el "path" del hijo para permitir la navegación.

      ---

      ## REGLA DE ORO — PRESERVACIÓN DE DATOS
      - NUNCA elimines componentes del schema.
      - NUNCA añadas componentes nuevos que no existían en el schema de entrada (ej: no añadas botones de "Notificaciones" si no estaban).
      - PRESERVA intactos: orchestrationDetails.consult y schema[].value (placeholders como {firstName}).
      - Mantén la misma cantidad de elementos en el schema de entrada y salida..
      - Si te pedimos "ENRIQUECER", solo añade tipos, iconos, columnas y validaciones sobre lo ya existente.

      ---

      ## DATA_SOURCE_JSON

      \`\`\`json
      ${JSON.stringify(payload, null, 2)}
      \`\`\`

      ---

      ## INSTRUCCIÓN FINAL
      - Devuelve el JSON enriquecido lógicamente llamando a saveModule.
      - Deja los placeholders (iconos con string "svg-...", menús con string "menu-item:...") tal cual, el hidratador de código se encargará del resto.

      saveModule({
        datos: JSON_ENRIQUECIDO
      })
    `;
  }
}
