# Matriz de fidelidad y usabilidad — iteración de iconos y paneles

## Principio de aceptación

Cada control visible debe conservar **una ruta interactiva verificable**. La fidelidad visual se revisa junto con la función equivalente de interfaz: apertura de modal, cambio de estado, navegación, cierre, retroceso o acción de datos.

| Superficie | Patrón de referencia | Estado observado | Corrección / prueba obligatoria |
|---|---|---|---|
| Blue Archive — placa de perfil | Nivel, nombre de Sensei y recursos en el encabezado | La identidad está codificada como texto de demostración | Derivar el nombre visible de `@tsk_yk64`; conservar un fallback local. |
| Blue Archive — rail lateral | Notice, MomoTalk y Mission con iconos enteros y etiquetas | Notice aparece corrupto; los assets del dock heredan el mismo procesamiento defectuoso | Sustituir el set completo por recursos limpios con SVG o PNG independientes; abrir la acción asignada de cada botón. |
| Blue Archive — dock | Ocho accesos de módulo con iconografía consistente | Las ocho rutas poseen handlers, pero no todos comunican un destino específico | Mantener Cafe, Schedule, Students, Formation, Circle, Crafting, Shop y Recruit navegables y con diálogo/estado. |
| Blue Archive — Memorial | Personaje táctil, diálogo, selector y control de HUD | Flujos ya implementados | Probar selector, respuesta al toque, ocultación/restauración de HUD y Work. |
| Tarkov — menú principal | Pila central: raid, character, trading, hideout y salida; marca y ambiente industrial | Estructura presente | Conservar los cinco destinos, foco de teclado y retorno consistente. |
| Tarkov — footer | Accesos a character, traders, flea, presets, handbook, messenger, watchlist y settings | La navegación está presente; los glifos deben mejorar visualmente | Reemplazar los símbolos genéricos por iconos tácticos limpios, y abrir cada superficie. |
| Tarkov — superficies | Prepare, Character, Trading, Hideout, Flea, Settings y mensajería | Destinos locales presentes | Verificar apertura, contenido, Back y cierre mediante Escape. |
| Admin — acceso | Terminal de autorización de Schale | Login y carga existen, diseño dependiente de Bootstrap y estados mínimos | Preservar login, errores, logout y Enter. |
| Admin — mensajes/dibujos | Tablero de moderación legible | Mensajes y dibujos renderizan, pero tabs y eliminaciones carecen de feedback | Añadir resumen, navegación accesible, estados vacíos/carga/error y confirmación de borrado. |

## Fuentes de referencia

La suite de interfaz de Blue Archive utiliza una jerarquía modular de banner principal, contadores de recursos, bandeja, accesos sociales y submenús; el proyecto adapta esa jerarquía a un sitio web, manteniendo rutas propias. [1] La galería de Tarkov documenta las superficies de menú principal, preparación de raid, datos de personaje, inventario y ajustes, que conforman las rutas de interacción esperadas. [2]

[1] [Xenon257R — Blue Archive Rainmeter Suite](https://github.com/Xenon257R/blue-archive-rainmeter)

[2] [Saving Content — Escape from Tarkov interface screenshots](https://www.savingcontent.com/2016/04/22/interface-screenshots-released-for-escape-from-tarkov/)
