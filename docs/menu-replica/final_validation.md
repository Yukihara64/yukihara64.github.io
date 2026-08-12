# Validación final — reconstrucción por etapas

## Resumen de resultados

La reconstrucción se validó contra una especificación desarrollada a partir de capturas, documentación y vídeos de navegación. Blue Archive usa un Home separado de Tarkov en markup, estilos y estados, evitando que un tema sea una recolorización del otro. Las referencias de comportamiento de Blue Archive incluyen guía de navegación y Memorial Lobby; Tarkov se contrastó con dos recorridos de menú y una galería de interfaces. [1] [2] [3] [4] [5] [6]

| Comprobación | Resultado | Evidencia |
|---|---:|---|
| Compilación de producción | Correcta | `npm run build` terminó sin errores. |
| Auditoría de referencias DOM | Correcta | `npm run check:dom` inspeccionó 106 IDs sin referencias inválidas. |
| Selector Memorial de Blue Archive | Correcto | Abre el modal de ranuras y permite escoger estado de personaje. |
| Ocultar HUD de Blue Archive | Correcto | Alterna `ba-ui-hidden` y revela el control de retorno. |
| Acción Work de Blue Archive | Correcta | Abre su superficie mediante la transición de wipe existente. |
| Cambio a Tarkov | Correcto | Cambia `data-mode`, muestra el árbol Tarkov y guarda `tarkov` en `localStorage`. |
| Persistencia de modo | Correcta | Tras volver a cargar sin parámetro `mode`, Tarkov permanece activo. |
| Retorno a Blue Archive | Correcto | Devuelve `data-mode=ba`, oculta Tarkov y persiste `ba`. |
| Superficie Trading de Tarkov | Correcta | Se abre con ocho traders e indicador de Jaeger bloqueado. |
| Superficie Prepare to Escape | Correcta | Se abre con las decisiones PMC y SCAV. |
| Escritorio y móvil | Correcto | Revisado en 1920×1080 y 390×844 para ambos modos. |

## Resultado visual por modo

**Blue Archive** replica la lectura del Home: placa de perfil, recursos AP/Credits/Pyroxenes, utilidades, rail Notice/MomoTalk/Mission, Memorial Lobby con reacción a toque, Work aislado y dock persistente de ocho acciones. El selector Memorial dispone de estados de estudiante activos, alternativos y bloqueados. Las transiciones usan wipe, pop-up y ocultación de HUD, en línea con el flujo documentado. [1] [2]

**Escape from Tarkov** replica una variante de menú Beta Testing: marca y aviso en el cuadrante superior izquierdo, ambiente industrial oscuro, cinco acciones textuales en la pila central y footer de utilidades. Las superficies Prepare to Escape, Character, Traders, Hideout, Flea Market, Messenger y Settings emplean la misma jerarquía oscura y técnica, con fundido de entrada y retorno explícito. [4] [5] [6]

> El objetivo de esta entrega es una réplica de interfaz web de inspiración y estructura fieles. No reproduce la lógica online, economía, autenticación ni contenido protegido de los juegos originales.

## Archivos de evidencia

| Archivo | Descripción |
|---|---|
| `ba-phase4-desktop.png` | Home Blue Archive a 1920×1080. |
| `ba-phase5-mobile.png` | Home Blue Archive a 390×844. |
| `ba-character-selector.png` | Selector Memorial validado. |
| `tarkov-phase6-desktop.png` | Menú Tarkov a 1920×1080. |
| `tarkov-phase6-mobile.png` | Menú Tarkov a 390×844. |
| `tarkov-trading-surface.png` | Superficie Trading validada. |
| `tarkov-prepare-surface.png` | Flujo Prepare to Escape validado. |

## Referencias

[1] [Blue Archive JP — Navigation Guide / Menu Information](https://www.youtube.com/watch?v=MmAwhN6WJYw)

[2] [Blue Archive Wiki — Memorial Lobby](https://bluearchive.wiki/wiki/Memorial_Lobby)

[3] [MobyGames — Blue Archive screenshots](https://www.mobygames.com/game/175548/blue-archive/screenshots/)

[4] [Brand New to Tarkov: Part 2 Menu Navigation](https://www.youtube.com/watch?v=5aAociolU8s)

[5] [Tarkov 101 — Episode 1: Main Menu](https://www.youtube.com/watch?v=PPwt1fCXkmk)

[6] [Saving Content — Interface screenshots released for Escape from Tarkov](https://www.savingcontent.com/2016/04/22/interface-screenshots-released-for-escape-from-tarkov/)
