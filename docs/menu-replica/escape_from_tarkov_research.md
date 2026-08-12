# Investigación de referencia — Escape from Tarkov Main Menu

## Fuentes consultadas

La investigación combina un vídeo de navegación de menú, la galería de interfaces publicada por Saving Content y la reproducción directa de dicho vídeo. El vídeo analizado es `https://www.youtube.com/watch?v=5aAociolU8s`. La galería enumera específicamente una captura de `eft_alpha_interface_mainmenu`, además de pantallas de personaje, raid y ajustes.

## Estructura verificada del menú principal

| Zona | Elementos y orden observado | Comportamiento que se debe replicar |
|---|---|---|
| Fondo | Escena naturalista oscura y desenfocada, con vegetación o estructuras industriales según variante | Atmósfera visible pero sacrificada en favor de la legibilidad; grano sutil y viñeta. |
| Superior central | Wordmark `ESCAPE FROM TARKOV` | Marca compacta, alto contraste y textura desgastada. |
| Centro | Escape from Tarkov, Character, Trading, Hideout, Exit | Pila vertical centrada, sin tarjetas; selección por texto/indicador luminoso. |
| Borde inferior | Main Menu, Hideout, Character, Traders, Flea Market, Presets, Handbook, Messenger, Watchlist | Barra persistente de navegación rápida, icono + texto, con brillo ligero en hover. |
| Estado de selección | Texto blanco/gris, acento naranja para advertencia/selección | Feedback mecánico/metálico, no rebote ni glow de estilo arcade. |

## Flujos y transiciones observados

| Destino | Transición | Estado de destino útil para la réplica |
|---|---|---|
| Escape from Tarkov | Fundido rápido a negro | `PREPARE TO ESCAPE`, con elección SCAV/PMC y navegación Next/Back. |
| Character | Corte o fundido muy breve | Inventario con silueta y ranuras de equipo a la izquierda, carga táctica al centro y stash a la derecha. |
| Trading | Cambio de pantalla | Cuadrícula de comerciantes con retrato, lealtad y saldo. |
| Hideout | Carga larga con icono hexagonal | Entorno de búnker 3D con puntos de estación flotantes. |
| Flea Market | Cambio de pantalla | Categorías a la izquierda y listado de ofertas con compra. |
| Messenger | Popup superpuesto | Lista de conversaciones y panel de chat, sin abandonar necesariamente la superficie principal. |

## Motricidad e implementación

El menú no necesita animaciones grandes. Se utilizarán fundidos de aproximadamente 0.3 s para cambios de superficie, una secuencia de carga específica para Hideout y un sonido metálico corto para activación. El hover será discreto: aumento leve de luminancia, reducción de opacidad de elementos no seleccionados y expansión mínima de una regla horizontal, sin escalado elástico.

## Restricciones de fidelidad

La versión anterior usaba una dog tag como elemento dominante. La referencia más sólida muestra que la lectura dominante debe ser marca + ambiente + navegación textual. Cualquier dog tag solo se conservará si la referencia definitiva seleccionada la contiene como detalle secundario, no como sustituto del fondo o de la arquitectura de menú.

## Referencias

[1] [Brand New to Tarkov: Part 2 Menu Navigation](https://www.youtube.com/watch?v=5aAociolU8s)

[2] [Saving Content — Interface screenshots released for Escape from Tarkov](https://www.savingcontent.com/2016/04/22/interface-screenshots-released-for-escape-from-tarkov/)

[3] [MMOs.com — New Escape From Tarkov screenshots show off the interface](https://mmos.com/news/new-escape-from-tarkov-screenshots-show-off-the-interface)

## Contraste entre versiones de vídeo

El segundo vídeo confirma como núcleo estable la pila de cinco entradas (`ESCAPE FROM TARKOV`, `CHARACTER`, `TRADING`, `HIDEOUT`, `EXIT`) y el footer de accesos rápidos. Añade a la variante de Beta Testing un rótulo superior y una banda naranja de advertencia bajo la marca, además de una cámara de seguridad con oscilación mínima en el fondo de búnker. Para una réplica coherente se fijará explícitamente una variante: la arquitectura contemporánea de cinco entradas y footer estable, con el tratamiento atmosférico y de advertencia de Beta Testing como una variante estética opcional, no mezclada accidentalmente con una composición de versión antigua.

### Fuente adicional

[4] [Tarkov 101 — Episode 1: Main Menu](https://www.youtube.com/watch?v=PPwt1fCXkmk)

## Assets locales confirmados para implementación

El fondo local `tarkov2.jpeg` es una imagen 1920×1080 con soldado armado, construcción industrial y oscurecimiento periférico; permite una variante de menú más dramática y legible que el fondo de bosque descrito en un vídeo, manteniendo la arquitectura oficial de navegación. El wordmark `tarkov_logo.png` usa la proporción ancha y compacta de la marca y requiere renderizado sobre fondo oscuro con filtro claro de bajo contraste para no perder detalle.

## Primera comprobación de implementación

La primera captura reveló una regla heredada que mantenía la navegación con posicionamiento absoluto y la superponía al encabezado. Se anuló de forma explícita y la segunda captura muestra la arquitectura objetivo: wordmark y aviso Beta en el cuadrante superior izquierdo, cinco acciones legibles en pila central y footer persistente con utilidades. El fondo se conserva oscuro y contenido para mantener contraste de navegación, como la referencia investigada.

## Verificación de superficies

La prueba automatizada abrió correctamente las superficies `TRADERS` y `PREPARE TO ESCAPE`, verificando los títulos devueltos por el DOM y generando capturas. Trading muestra ocho traders y el estado bloqueado de Jaeger; Prepare to Escape presenta los dos bloques PMC/SCAV y la acción Next. Ambas superficies conservan la paleta desaturada, el fade oscuro y el borde técnico de Tarkov, sin reutilizar los modales de Blue Archive.

## Comprobación móvil

La captura a 390×844 conserva la marca, aviso Beta, cinco acciones principales y el footer. La barra inferior mantiene las acciones fuera de la zona de navegación principal y puede desplazarse horizontalmente para acomodar su densidad de interfaz; el menú central no se corta y conserva el contraste con el fondo.
