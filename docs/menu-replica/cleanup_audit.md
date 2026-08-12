# Auditoría de limpieza del repositorio

**Alcance.** Esta auditoría identifica candidatos de eliminación mediante revisión de `package.json`, rutas emitidas por la compilación, referencias en código fuente y comparación SHA-256. No se ha eliminado ningún archivo durante la auditoría.

## Candidatos seguros de eliminar

Los siguientes archivos no aparecen en los scripts de `package.json` ni en las referencias de código activas. Los tres archivos `.cjs` son utilidades de Puppeteer para revisar una URL desplegada desde una ruta local de Windows; no forman parte de la compilación ni del despliegue.

| Grupo | Archivo | Tamaño | Motivo |
|---|---|---:|---|
| Utilidad temporal | `catch_errors.cjs` | 528 B | Captura puntual de consola y errores remotos; sin referencias. |
| Utilidad temporal | `fetch_html.cjs` | 328 B | Vuelca HTML de una URL remota; sin referencias. |
| Utilidad temporal | `screenshot_live.cjs` | 694 B | Captura manual con una ruta local de Windows; sin referencias. |
| Asset no usado | `public/img/ba-reference/arona_room.jpg` | 402,696 B | Fondo de referencia que no es cargado por el Home final. |
| Asset no usado | `public/img/ba_arona.png` | 27,310 B | Ilustración sustituida por el render Memorial activo. |
| Asset no usado | `public/img/ba_icon_ap.png` | 4,866 B | Duplicado funcional sustituido por `ba-reference/icon_stamina.png`. |
| Asset no usado | `public/img/ba_icon_credits.png` | 5,754 B | Duplicado funcional sustituido por `ba-reference/icon_gold.png`. |
| Asset no usado | `public/img/ba_icon_pyroxene.png` | 520 B | Icono de variante previa sin referencia. |
| Asset no usado | `public/img/ba_logo.png` | 12,419 B | Marca de variante previa sin referencia. |
| Asset no usado | `public/img/tarkov_dogtag.png` | 75,410 B | Dog tag de la composición Tarkov anterior, retirada de la interfaz nueva. |
| Asset no usado | `public/img/tarkov_logo.webp` | 16,762 B | Variante de logo sin referencia. |
| Asset no usado | `public/img/tarkov_logo_white.png` | 32,685 B | Variante de logo sin referencia. |
| Asset no usado | `public/img/tarkov_logo_white.webp` | 16,762 B | Variante de logo sin referencia. |

> **Ahorro directo estimado: 596,734 B (aprox. 0.57 MiB).**

## Candidatos que requieren una depuración adicional del código antiguo

Las cuatro imágenes siguientes no participan en el menú reconstruido, pero todavía aparecen en el array histórico `tarkovBackgrounds` de `src/main.ts`. Ese array ya no se usa tras la migración a un fondo determinista, por lo que estos recursos pueden eliminarse **solo junto con el array muerto** y una nueva compilación.

| Archivo | Tamaño |
|---|---:|
| `public/img/tarkov3.jpeg` | 426,774 B |
| `public/img/tarkov5.jpeg` | 399,486 B |
| `public/img/tarkov6.jpeg` | 456,684 B |
| `public/img/tarvko4.jpeg` | 424,956 B |

> **Ahorro adicional estimado: 1,707,900 B (aprox. 1.63 MiB).**

## Archivos preservados deliberadamente

No se propone borrar los assets activos de Blue Archive ni los recursos de referencia que la compilación actual sirve desde `dist/img`. Tampoco se borran `public/img/tarkov1.jpeg` ni `public/img/tarkov_mainmenu_reference.jpg` todavía, porque reglas CSS heredadas aún los mencionan y deben retirarse o consolidarse antes de considerarlos sin uso. Los assets de `img/` de la raíz se conservan: Vite los empaqueta directamente en `dist/assets` cuando las plantillas HTML los referencian.

Los documentos de investigación en `docs/menu-replica/` se conservan como trazabilidad del rediseño y de la validación. La regla `scripts/check-dom-refs.mjs` también se conserva, porque es el control de regresión que validó 106 IDs.

## Propuesta de ejecución

1. Eliminar los 13 candidatos seguros.
2. Eliminar el array `tarkovBackgrounds` y sus variables históricas sin uso.
3. Eliminar las cuatro variantes de fondo Tarkov indicadas.
4. Ejecutar `npm run check:dom` y `npm run build`.
5. Crear un único commit con la reconstrucción, la limpieza y la documentación, y publicarlo únicamente tras confirmación del usuario.

> **Ahorro total estimado de la propuesta: 2,304,634 B (aprox. 2.20 MiB).**
