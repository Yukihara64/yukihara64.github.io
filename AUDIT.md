# Auditoría y correcciones de `yukihara64.github.io`

## Resumen ejecutivo

La causa principal de los fallos interactivos era que `index.html` y `admin.html` usaban handlers inline (`onclick`, `oninput`, `onkeydown`) mientras `src/main.ts` y `src/admin.ts` se cargaban como módulos ES. Las funciones declaradas en un módulo no se publican automáticamente en `window`, por lo que acciones como Recruit, MomoTalk, dibujo, roster y login podían terminar en `ReferenceError`.

También faltaba en `index.html` el markup que el código ya esperaba para el avatar central, los widgets Spotify/Steam, el reloj y el selector Tarkov. Finalmente, la raíz `.ba-lobby` mezclaba reglas legacy de pantalla completa con utilidades Tailwind de posicionamiento y la hoja legacy contenía overrides que ocultaban el avatar y los widgets cuando `body.arona-active` estaba activo.

## Hallazgos y disposición

| Área | Hallazgo | Disposición aplicada |
|---|---|---|
| Handlers de `index.html` | Las funciones de eventos inline no eran globales en un módulo ES. | `src/main.ts` publica explícitamente en `window` todas las funciones usadas por el HTML y por las plantillas dinámicas. |
| Handlers de `admin.html` | Login, logout, tabs y borrado dependían de globals inexistentes. | `src/admin.ts` publica `doLogin`, `logout`, `showTab`, `deleteMsg` y `deleteDraw`. |
| Dibujo del Cafe Board | `setTool`, `clearCanvas` y `sendDrawing` se invocaban desde HTML pero no existían. | Se implementó canvas con Pointer Events, borrador, limpieza y POST a `/api/drawings`. |
| Lobby principal | Faltaban `avatar-img`, `lobby-quote-bubble`, `spotify-content`, `steam-content`, `lobby-time-display` y `tarkov-btn`. | Se restauró el markup y se agregaron fallbacks visibles para Spotify y Steam. |
| Contenedor raíz | `.ba-lobby` mezclaba `height:100vh` legacy con utilidades Tailwind `h-full`, lo que podía colapsar el layout. | Se eliminaron las utilidades conflictivas del elemento raíz y el sizing queda definido en CSS del lobby. |
| Override Arona | La sección legacy `LOBBY VISUAL EXACT MATCHES OVERRIDES` ocultaba `.avatar-frame` y `.lobby-widgets-container` bajo `body.arona-active`. | Se retiraron esos overrides incompatibles; Arona ahora es un avatar seleccionable y los widgets permanecen disponibles. |
| Tarkov | Existía un toggle incompleto y sólo había estilos parciales. | Se añadió una pantalla paralela `#tarkov-lobby` con navegación táctica, estado de operador, briefings y destinos equivalentes. El modo se persiste en `localStorage`. |
| CSS de entrada | Los imports legacy estaban anidados dentro de `@layer components`. | Se movieron a imports top-level y se añadió `css/lobby-fixes.css` para estilos restaurados y aislados. |

## Arquitectura elegida

Se eligió una variante de **dos árboles de markup**. El lobby Blue Archive conserva sus modales y navegación existentes; la pantalla Tarkov se representa en `#tarkov-lobby` con clases `tarkov-*` propias y se muestra u oculta con el estado único `document.body.dataset.mode`. Los destinos de ambos modos reutilizan las mismas funciones de modal y los mismos endpoints.

El modo se guarda como `lobby-mode` en `localStorage`. Al cargar el módulo se aplica el modo persistido y se sincroniza el atributo `hidden` de `#tarkov-lobby`; el selector visible está disponible en ambos árboles.

## Referencias DOM

Se añadió `scripts/check-dom-refs.mjs` y el comando `npm run check:dom`. El chequeo valida IDs usados con `getElementById`, IDs estáticos/dinámicos declarados en plantillas y nombres de funciones invocados por handlers inline.

Resultado actual: `DOM reference check passed (100 IDs inspected).`

## APIs

Los contratos existentes son compatibles con el frontend:

- `/api/spotify` devuelve `{ track, source }`; el frontend maneja `track: null` y muestra un fallback.
- `/api/steam` devuelve `{ game, source }`; el frontend maneja `game: null` y muestra un fallback.
- `/api/messages` devuelve `{ success: true }` para POST y `{ messages }` para GET administrativo.
- `/api/drawings` devuelve `{ success: true }` para POST y `{ drawings }` para GET administrativo.

Las respuestas de Spotify/Steam fallan en la preview estática porque requieren secretos y llamadas externas, pero el fallo queda contenido en el widget y no rompe el lobby.

## Assets externos

Se mantienen como dependencias externas los recursos que requieren actualización o que ya son parte del diseño: Google Fonts, Bootstrap CDN, imagen de fondo de Imgur, video de YouTube, imagen de Mika, avatar de Unavatar, banderas, LinkedIn y los endpoints API de Spotify/Steam. El código incluye fallbacks para los widgets y el avatar local de Arona evita que la vista quede vacía si Unavatar no responde.

La imagen GIF referenciada en la antigua variante full-screen de Arona quedó sin uso al retirar ese override. No se considera una dependencia crítica del layout actual.

## `!important`

El legacy contiene 188 declaraciones `!important`, principalmente en reglas antiguas de modales y componentes. No se añadieron nuevas reglas `!important`. Se retiró específicamente el bloque de overrides que provocaba el fallo de layout. La limpieza integral del legacy puede hacerse en una iteración posterior, pero no es necesaria para corregir el fallo actual.

## Verificaciones

Se ejecutaron correctamente:

```text
npm run check:dom
npm run build
```

Además, el build se sirvió en una preview local y se comprobó que se renderizan el avatar, el selector de modo, los widgets, el reloj, la navegación y la pantalla Tarkov. Al recargar en modo Tarkov, la interfaz táctica apareció directamente, confirmando la persistencia en `localStorage`.

## Actualización de rediseño visual

Se rediseñó el lobby Blue Archive para respetar la composición de referencia: HUD superior, accesos laterales, dock horizontal inferior, botón Campaign separado, burbuja central y avatar visible. Las clases semánticas `lobby-topbar`, `lobby-left-stack`, `lobby-right-menu`, `lobby-bottom-actions` y `lobby-campaign-button` desacoplan el layout de las utilidades Tailwind que faltaban o se compilaban de forma incompleta.

El modo Tarkov se sustituyó por una composición de menú principal: fondo de operador local `img/tarkov2.jpeg`, viñeta y scanlines, navegación vertical izquierda, identidad de operador y recursos en la zona inferior derecha y footer de estado. Se añadieron filtros, drift sutil del fondo, animación de entrada y soporte de `prefers-reduced-motion`.

Para que el build sirva iconos y personajes correctamente, se añadió `public/img/` como copia de los activos estáticos del proyecto. También se eliminó el iframe de YouTube del fondo Blue Archive, que bloqueaba la preview y no aportaba una dependencia fiable; el fondo remoto de Mika conserva un fallback local a `img/event_banner.jpg`.

La preview de verificación acepta `?preview=1&mode=ba` o `?preview=1&mode=tarkov`, oculta el boot screen y permite comprobar cada interfaz de forma determinista. Esta ruta sólo facilita inspección y no modifica el flujo normal cuando no se incluye el parámetro.

## Segunda revisión visual basada en capturas del usuario

La revisión final reemplazó el HUD Blue Archive anterior por una composición explícita de referencia: placa inclinada de Sensei, cápsulas blancas de AP/créditos/piroxenos, acciones superiores compactas, accesos Notice/MomoTalk/Mission, dock blanco continuo y Campaign lateral.

La pantalla Tarkov anterior de operador lateral fue reemplazada por un menú central de cinco opciones. El logo se centra mediante animaciones que preservan `translateX(-50%)`; el fondo es la escena cálida local `tarkov1.jpeg`, con dog tag, etiqueta PVE ZONE y barra inferior de navegación.

La verificación final se hizo a 1440×900 mediante `?preview=1&mode=ba` y `?preview=1&mode=tarkov`. El chequeo DOM inspecciona 101 IDs y el build TypeScript/Vite termina sin errores.
