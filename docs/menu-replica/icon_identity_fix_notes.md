# Diagnóstico de iconos e identidad

La inspección de `img/icon_notice.png` y `public/img/icon_notice.png` confirma que ambas copias contienen el mismo fragmento con un área de píxeles corruptos en la esquina superior derecha. El problema proviene del asset, no de la composición CSS del Home. Se deben sustituir los iconos afectados por recursos limpios y de proporción consistente.
La copia histórica de Notice conserva el mismo defecto, por lo que no sirve como recuperación. La suite pública de Rainmeter incluye un icono MomoTalk de 100×100, pero su visualización es prácticamente blanca y no ofrece el contraste ni la lectura requeridos para el rail lateral. Se descarta como sustituto directo y se continúa con una fuente de iconos más adecuada.

## Referencias de fidelidad y usabilidad

La suite pública `Xenon257R/blue-archive-rainmeter` declara una composición modular con banner principal, indicadores de recursos, bandeja, accesos sociales y submenús; se utilizará solo como guía de jerarquía y de proporciones, no como sustitución libre de los flujos de Blue Archive. La galería de Saving Content documenta que las pantallas de Tarkov se organizan alrededor de menú principal, preparación de incursión, datos de personaje, inventario y ajustes; esas son las rutas mínimas que deberán permanecer utilizables.

Fuentes consultadas:

1. https://github.com/Xenon257R/blue-archive-rainmeter
2. https://www.savingcontent.com/2016/04/22/interface-screenshots-released-for-escape-from-tarkov/
La suite de referencia contiene spritesheets de gran formato para `Tasks` y `Phone`, con varios estados distribuidos horizontalmente. Son utilizables como fuente visual si se extrae únicamente un estado intacto, pero no deben incrustarse completos: un sprite sin recorte reproduce exactamente el defecto de icono fragmentado que se busca eliminar.

La ruta de Steam proporcionada por el usuario no está montada en este entorno, por lo que no se puede leer directamente. La réplica continuará con assets públicos locales y referencias visuales; si el usuario carga una exportación selectiva de iconos/UI desde esa instalación, se podrá sustituir el set táctico por los originales sin alterar los handlers.

La validación a 1920×1080 confirma que el rail y dock de Blue Archive ahora muestran iconos completos de trazo azul, sin sprites cortados ni píxeles corruptos. El footer de Tarkov ya utiliza símbolos tácticos consistentes de color arena y conserva todas sus etiquetas. Ambos modos mantienen legibilidad y alineación en la composición de escritorio.
La placa superior izquierda se inicializa desde `data-twitter-handle="tsk_yk64"` y muestra `@tsk_yk64` tras cargar el lobby. La captura de escritorio confirma que el cambio conserva la lectura del nivel, progreso y recursos, con los nuevos iconos limpios en el rail y dock.
