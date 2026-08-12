# Investigación de referencia — Blue Archive Home

## Fuentes consultadas

La investigación partió de la guía de navegación de Blue Archive y de capturas de la galería de MobyGames. El vídeo analizado es `https://www.youtube.com/watch?v=MmAwhN6WJYw`. La página de Memorial Lobby de Blue Archive Wiki confirma que el fondo de personaje es un lobby animado asociado a estudiantes y que incorpora tres clases de interacción: caricias, seguimiento de ojos y toques que reproducen líneas. La galería de MobyGames lista capturas independientes para la selección de estudiantes Home, la pulsación sobre estudiante, pantalla completa y alternancia entre Lobby Memorial y retrato regular.

## Inventario verificable del Home

| Zona | Elementos y orden observado | Comportamiento que se debe replicar |
|---|---|---|
| Superior izquierda | Perfil, nivel, nombre y progreso | Abre perfil de Sensei con identidad, rango y estadísticas. |
| Superior central | AP, Credits y Pyroxenes | Cada cápsula contiene valor y control `+`; AP abre una compra modal. |
| Superior derecha | Selector de Memorial Lobby, Mailbox y menú de ocho cuadrados | El selector permite elegir estudiantes; el menú expone Options, Account, Team e Items. |
| Lateral izquierdo | Notice, MomoTalk y Missions | MomoTalk abre una interfaz de mensajería; las notificaciones usan badge rojo. |
| Lateral derecho | Botón Work / Campaign | Navega a contenido de combate mediante transición completa. |
| Inferior | Cafe, Schedule, Students, Formation, Circle, Crafting, Shop y Recruit | Ocho acciones, en ese orden, dentro de un dock de navegación persistente. |
| Centro | Personaje Memorial Lobby | Idle sutil, respuesta al toque y bocadillo de voz; queda detrás del HUD y delante del fondo. |

## Movimiento y feedback

El análisis de vídeo indica una transición breve a blanco al seleccionar personaje, pop-up de modales con escala aproximada de 0.9 a 1, y destello blanco de pulsación. El flujo hacia Work utiliza una transición de pantalla completa. El HUD puede ocultarse mediante control de ojo y el Home permite cambiar entre fondo animado Memorial Lobby y retrato estático.

## Decisiones técnicas provisionales

La versión final deberá dejar de tratar el dock como una barra de tarjetas genérica. Se construirá como ocho accesos persistentes en orden oficial, con un panel Work separado a la derecha. El selector de personaje será una cuadrícula de ranuras y no un simple cambio circular de imagen. El área central requerirá tres estados explícitos: `idle`, `tap reaction` y `speech bubble`. Las transiciones se implementarán como capas de pantalla, no como cambios instantáneos de modal.

## Referencias

[1] [Blue Archive JP — Navigation Guide / Menu Information](https://www.youtube.com/watch?v=MmAwhN6WJYw)

[2] [Blue Archive Wiki — Memorial Lobby](https://bluearchive.wiki/wiki/Memorial_Lobby)

[3] [Blue Archive Wiki — FAQ](https://bluearchive.fandom.com/wiki/FAQ)

[4] [MobyGames — Blue Archive screenshots](https://www.mobygames.com/game/175548/blue-archive/screenshots/)

## Modelo de personaje y escena Memorial Lobby

Un segundo análisis de vídeo, centrado en el Memorial Lobby de Ui, permite separar correctamente el concepto de "personaje en Home" de una simple ilustración fija. El montaje inicia con fundido desde negro y flash blanco hacia la composición principal. Una vez en idle, el personaje usa respiración suave, parpadeo irregular y oscilación ligera de accesorios; el fondo incorpora profundidad por desenfoque y motas ambientales. Los subtítulos o bocadillos se ubican sobre una franja inferior semitransparente y las reacciones cambian expresión y pose.

| Estado | Señales visuales de referencia | Implementación web necesaria |
|---|---|---|
| Entrada | Fundido oscuro, plano de introducción y flash breve | Overlay negro con opacidad decreciente y flash blanco de 120–180 ms. |
| Idle | Respiración, blink y movimiento mínimo de cabello/accesorio | Transformación vertical de 4–7 px, cambio de ojos aleatorio cada 3–6 s y partículas. |
| Tap | Cambio de diálogo y voz; reacción breve | Secuencia `tap` con expresión/transform alternativa, texto contextual y audio opcional. |
| Diálogo | Texto inferior y elecciones del jugador | Caja inferior y opciones con bloqueo temporal del avance. |

En consecuencia, el personaje de la implementación no se resolverá solo con un PNG de cuerpo completo. Se definirá una capa de escena, una capa de personaje con estados y una capa de diálogo. Cuando no haya material Live2D autorizado para ejecución local, se simularán los estados con assets estáticos cuidadosamente preparados y animaciones CSS/JS de baja amplitud.

### Fuente adicional

[5] [Ui Memorial Lobby — video de referencia](https://www.youtube.com/watch?v=bI6oAHId-XU)

## Consulta de fuentes navegadas

La navegación directa de Blue Archive Wiki quedó bloqueada por su comprobación anti-bot; el contenido textual se obtuvo mediante extracción de página. La ficha oficial de Google Play confirma la presentación contemporánea de Blue Archive bajo NEXON y aporta recursos promocionales consistentes con su identidad anime, aunque no sustituye a las capturas de interfaz de la galería de MobyGames ni al vídeo de navegación.

## Inventario inicial de assets de referencia

La suite descargada contiene el marco `Img_Deco_LobbyBottom.png`, que confirma el tratamiento de banda azul/blanca con diagonales discretas propio del dock inferior, además de iconos de stamina, oro, diamante, ocultar UI, cambio de personaje, MomoTalk y pantallas de carga. También incluye `BG_AronaRoom.jpg`, una escena de aula inundada y abierta al cielo que ofrece espacio seguro para personaje y HUD. Los assets se usarán como recursos locales de referencia; no se ejecutó código de la suite.

## Primera comprobación de implementación

La primera captura a 1920×1080 ya reproduce la jerarquía de Home: perfil y recursos arriba, rail izquierdo, figura Memorial central, Work separado y dock continuo inferior. Se detectó que el asset de Campaign es una silueta azul con fondo claro; el filtro de inversión la convierte en un bloque blanco dentro de Work. El botón se ajustará para usar el icono sin inversión y con tratamiento de mezcla apropiado. También se ocultó el control `SHOW UI` en el estado inicial, tal como requiere la función de ocultar HUD.

## Verificación inicial de controles

La vista previa enumera correctamente el perfil, los dos controles de compra, selector Memorial, mailbox, menú rápido, ocultar UI, rail de tres accesos, personaje, Work y los ocho accesos del dock. La primera acción de navegador quedó invalidada por una instantánea de DOM obsoleta inmediatamente después de la navegación; la prueba se reanudará desde una vista actualizada sin afectar al proyecto.

## Comparación de viewport de la reconstrucción

A 1920×1080 la jerarquía coincide con el plano de implementación: HUD superior compacto, rail izquierdo, personaje central, diálogo bajo, Work separado y ocho accesos inferiores. A 390×844 el dock se mantiene dentro de la pantalla y el personaje es visible, pero la parte inferior del render llega muy cerca del dock y el botón Work cruza la zona de piernas. Se desplazará y reducirá ligeramente la figura en móvil para liberar una zona de interacción clara sobre el footer.

## Resultado de validación Blue Archive

Tras el ajuste, la captura 390×844 mantiene a Arona completa por encima del dock y deja una separación práctica entre la figura, el diálogo, Work y la navegación inferior. La revisión de referencias DOM inspeccionó 101 IDs sin errores y la compilación de producción se completó correctamente. La implementación de Blue Archive queda lista para la validación integrada final junto a Tarkov.
