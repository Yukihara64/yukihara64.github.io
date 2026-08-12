# Especificación de réplica 1:1 — Blue Archive y Escape from Tarkov

**Propósito.** Este documento transforma la investigación en una matriz de implementación. Cada decisión visual o interactiva deberá trazarse a una referencia y verificarse a 16:9 antes de considerarse terminada. La prioridad es conservar la **arquitectura de interfaz de cada juego**, no combinar convenciones de ambos ni reinterpretarlas como un dashboard de portfolio.

> **Regla de trabajo:** una pantalla solo se incorpora después de definir su estado base, su respuesta a hover/tap, su transición de entrada y su salida de retorno.

## A. Contrato de fidelidad común

| Criterio | Norma obligatoria | Método de validación |
|---|---|---|
| Resolución de referencia | Diseñar primero a 1920×1080 y comprobar también 1440×900 y 390×844. | Captura automatizada en cada tamaño. |
| Jerarquía | La ubicación, el orden, la densidad y el contraste deben preceder a detalles decorativos. | Superposición visual de referencia y réplica. |
| Assets | Logotipos, iconos y texturas proceden de fuentes públicas guardadas localmente; no hay peticiones remotas en ejecución. | Inspección de red local y listado de assets. |
| Interacción | Cada control visible abre una superficie coherente con el juego o un equivalente funcional del portfolio. | Matriz de clicks y estados. |
| Movimiento | Ninguna transición se sustituye por cambios instantáneos cuando la referencia muestra carga, fade, popup o slide. | Registro de transición por superficie. |
| Separación de modos | Blue Archive y Tarkov tienen árboles de componentes y tokens visuales independientes. | Sin selectores o assets híbridos fuera del conmutador de modo. |

## B. Blue Archive — especificación canónica

El Home debe tomar como base el patrón documentado por la guía de navegación, el FAQ y las capturas de MobyGames: perfil y recursos arriba, selector/mail/menú arriba a la derecha, tres accesos a la izquierda, ocho accesos inferiores, Work separado a la derecha y un personaje Memorial Lobby delante del fondo. [1] [2] [3] [4]

| Área | Geometría objetivo a 16:9 | Contenido exacto | Estado e interacción |
|---|---|---|---|
| Perfil | Esquina superior izquierda; ancho aprox. 18–21% de viewport, altura aprox. 7%. | Nivel, nombre Sensei, nivel de cuenta y progreso. | Tap abre ficha de perfil; pop-up centrado de escala 0.92→1. |
| Recursos | Franja superior, del 35% al 72% de ancho. Tres cápsulas estrechas. | AP + `+`, Credits y Pyroxenes + `+`. | AP abre confirmación de recarga; `+` premium abre compra/portfolio. |
| Utilidades | Superior derecha, iconos compactos y separados. | Selector Memorial Lobby, Mailbox y menú de ocho cuadrados; control de ocultar UI y de variante Memorial/estática. | Selector abre cuadrícula; menú abre cuatro acciones; hide UI apaga HUD con fundido. |
| Navegación izquierda | Borde izquierdo, centrada en tercio medio. | Notice, MomoTalk, Missions. | Badge rojo en MomoTalk; MomoTalk abre phone/chat, no modal genérico. |
| Escena Memorial | Centro o centro-izquierda con área de seguridad libre para HUD. | Fondo de escena, personaje, capa de partículas y caja de voz. | Idle: respiración + blink; tap: reacción + línea; selector cambia estudiante. |
| Work / Campaign | Lado derecho, por encima del dock. Botón azul irregular de alto contraste. | Etiqueta `WORK`/`CAMPAIGN` según referencia seleccionada. | Capa de transición completa con wipe/flash → selector de misiones/portfolio. |
| Dock inferior | Banda baja continua, no nueve tarjetas separadas. Ocho columnas equivalentes. | Cafe, Schedule, Students, Formation, Circle, Crafting, Shop, Recruit. | Hover/tap: destello blanco breve y selección de superficie específica. |

### Estados de Blue Archive

| Estado | Entrada | Salida | Implementación requerida |
|---|---|---|---|
| Home normal | Fundido leve desde carga o retorno | Wipe para Work y popup para utilidades | Escena + HUD independiente. |
| Character selector | Flash blanco breve | Tap de slot o cancel | Cuadrícula de hasta cinco/diez ranuras con estado locked/unlocked. |
| Resource purchase | Popup centrado sobre oscurecimiento ligero | Cancel / OK | Dos botones, gris y amarillo; no reutilizar modal de perfil. |
| MomoTalk | Despliegue tipo smartphone desde lateral | Cerrar / volver | Lista de chats, conversación y opciones de respuesta. |
| Cafe | Pantalla de salón con chibis y acciones | Back | No confundir con Drawing Board; drawing será una actividad secundaria claramente nombrada. |
| Recruit | Banner de gacha, pool y confirmación | Back / recruit | Animación de tirada separada de firma/dibujo. |

### Movimiento de Blue Archive

| Evento | Ritmo de referencia | Receta de réplica |
|---|---|---|
| Carga | 0.8–1.2 s, azul claro y Arona | Capa `loading` con icono y transición de opacidad. |
| Tap de personaje | 250–550 ms | Alternar expresión, desplazamiento vertical pequeño, burbuja y audio opcional. |
| Botón | 80–140 ms | Flash blanco, compresión mínima y click agudo. |
| Modal | 180–260 ms | Backdrop semitransparente y escala 0.92→1. |
| Work | 450–650 ms | Wipe de pantalla de izquierda a derecha + pausa de carga. |

## C. Escape from Tarkov — especificación canónica

El menú seguirá la variante contemporánea visible en ambos vídeos: fondo 3D/desenfocado, marca superior, cinco acciones en pila vertical y navegación rápida inferior. El modo Beta Testing se mantiene como variante visual con banner naranja y cámara colgante, pero no se mezclará con la variante sin advertencia. [5] [6] [7] [8]

| Área | Geometría objetivo a 16:9 | Contenido exacto | Estado e interacción |
|---|---|---|---|
| Fondo | Todo el viewport, de baja saturación y profundidad de campo fuerte. | Bosque/búnker/industrial según variante, grano muy leve y viñeta. | Parallax mínimo; elementos ambientales con oscilación lenta si la fuente los muestra. |
| Branding | Parte superior central o superior izquierda según variante declarada; ancho aprox. 25–33% del viewport. | `ESCAPE FROM TARKOV`, posible `BETA TESTING` y aviso naranja. | Estático; nunca reescrito como tipografía genérica. |
| Navegación principal | Centro vertical; ancho aprox. 20–27%; separación densa de 34–44 px. | ESCAPE FROM TARKOV, CHARACTER, TRADING, HIDEOUT, EXIT. | Hover blanco brillante; regla/indicador fino; click metálico. |
| Footer | Borde inferior, altura de 28–42 px. | MAIN MENU, HIDEOUT, CHARACTER, TRADERS, FLEA MARKET, PRESETS, HANDBOOK, MESSENGER, WATCHLIST, SETTINGS. | Icono + etiqueta, opacidad base baja y luminancia mayor en hover. |
| Acción contextual | Solo detalles de variante declarada, como el aviso Beta o cámara. | No usar dog tag como estructura primaria salvo en una captura que la contenga. | Secundario, no tapa el menú. |

### Estados de Tarkov

| Estado | Entrada | Salida | Réplica mínima funcional |
|---|---|---|---|
| Main menu | Carga breve/fade | Click de navegación | Cinco acciones centrales y footer completo. |
| Prepare to Escape | Fade a negro de aprox. 0.3 s | Back / Next | Dos opciones PMCs/SCAV con panel de preparación. |
| Character | Corte o fade breve | Back | Silueta, ranuras de equipo, equipo táctico y grid de stash. |
| Trading | Cambio de superficie | Back / elegir trader | Cuadrícula de traders y vista de transacción simplificada. |
| Hideout | Loading mayor con icono hexagonal | Back | Escena de refugio con estaciones activables. |
| Flea Market | Cambio de superficie | Back | Categorías, ofertas y acción de compra no transaccional. |
| Messenger | Popup sobre superficie | Close | Lista de conversaciones y chat. |

### Movimiento de Tarkov

| Evento | Ritmo de referencia | Receta de réplica |
|---|---|---|
| Hover menú | 100–160 ms | Elevar luminancia + indicador fino, sin scale bouncy. |
| Cambio de sección | 220–350 ms | Fundido a negro o crossfade controlado. |
| Hideout | 1.2–2.0 s para demo web | Spinner hexagonal, texto de carga y fade a escena. |
| Fondo | 8–20 s por ciclo | Drift de cámara de 4–8 px y movimiento ambiental subordinado. |
| Click | Instantáneo | Sonido metálico breve; fallback visual si audio no está habilitado. |

## D. Matriz de assets y componentes por construir

| Paquete | Blue Archive | Escape from Tarkov |
|---|---|---|
| Marca | Iconos del HUD, recursos, dock, selector y estados de badge. | Wordmark, iconos footer, avisos, spinner hexagonal. |
| Escena | Fondo Memorial, personaje con expresiones o sprites, partículas y burbuja. | Fondo 3D/desenfocado, ruido, viñeta y detalle ambiental opcional. |
| Superficies | Perfil, selector, compras, MomoTalk, Cafe, Recruit, Work. | Prepare, Character, Trading, Hideout, Flea, Messenger, Settings. |
| Audio | Tap, confirmación, UI open, voz opcional y BGM deshabilitada por defecto. | Click metálico, hover discreto, loading y ambiente deshabilitado por defecto. |

## E. Puertas de aprobación interna

1. **No se modifica la vista actual** hasta completar la extracción y el inventario local de assets de referencia.
2. Blue Archive no pasa a validación hasta que los ocho elementos inferiores, el panel Work y los cinco controles superiores tengan acciones distintas.
3. Tarkov no pasa a validación hasta que las cinco acciones centrales y las nueve acciones inferiores tengan una superficie de destino, aunque sea una réplica simplificada del portfolio.
4. Cada pase visual se compara en 1920×1080, 1440×900 y 390×844; los fallos de clipping, jerarquía u orden bloquean la siguiente fase.

## Referencias

[1] [Blue Archive JP — Navigation Guide / Menu Information](https://www.youtube.com/watch?v=MmAwhN6WJYw)

[2] [Blue Archive Wiki — Memorial Lobby](https://bluearchive.wiki/wiki/Memorial_Lobby)

[3] [Blue Archive Wiki — FAQ](https://bluearchive.fandom.com/wiki/FAQ)

[4] [MobyGames — Blue Archive screenshots](https://www.mobygames.com/game/175548/blue-archive/screenshots/)

[5] [Brand New to Tarkov: Part 2 Menu Navigation](https://www.youtube.com/watch?v=5aAociolU8s)

[6] [Tarkov 101 — Episode 1: Main Menu](https://www.youtube.com/watch?v=PPwt1fCXkmk)

[7] [Saving Content — Interface screenshots released for Escape from Tarkov](https://www.savingcontent.com/2016/04/22/interface-screenshots-released-for-escape-from-tarkov/)

[8] [MMOs.com — New Escape From Tarkov screenshots show off the interface](https://mmos.com/news/new-escape-from-tarkov-screenshots-show-off-the-interface)
