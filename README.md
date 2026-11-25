# Portafolio Developer Industrial

Portafolio de Yanni josue Huayata Equice. El sitio combina una retícula de doce columnas, tipografía editorial, numeración técnica y un acento carmesí. Está hecho con HTML, CSS y JavaScript nativo.

## Ejecutar en local

Abre una terminal en la raíz del proyecto y ejecuta:

```powershell
python -m http.server 8000
```

Visita [http://localhost:8000](http://localhost:8000). El servidor local permite comprobar el acceso al portapapeles y la persistencia de idioma y bolsa. El proyecto se sirve como archivos estáticos y se puede ejecutar sin compilación.

## Publicar en GitHub Pages

1. Usa la raíz del repositorio como fuente de publicación. En esa raíz deben quedar `.nojekyll` (vacío), `index.html`, `css/`, `js/`, `assets/` y `demos/`. `.nojekyll` permite servir los archivos estáticos sin procesarlos con Jekyll.
2. Si esta carpeta es una copia sin Git, inicializa el repositorio en su raíz con `git init -b main`, o copia los archivos a un clon del repositorio destino. Antes de hacer el commit, prepara y comprueba la lista:

   ```powershell
   git add -- .nojekyll index.html css js assets demos README.md
   git ls-files -- .nojekyll index.html css js assets demos README.md
   git ls-files --others --exclude-standard -- .nojekyll index.html css js assets demos
   git ls-files --others --ignored --exclude-standard -- .nojekyll index.html css js assets demos
   ```

   Los dos últimos comandos deben quedar vacíos. Comprueba también que las rutas en Git coincidan exactamente en mayúsculas y minúsculas con el HTML y CSS. Revisa la rama y el remoto antes de hacer el commit y subirlo.
3. En GitHub abre **Settings → Pages → Build and deployment**, elige **Deploy from a branch**, selecciona la rama que subiste y **/(root)**. Guarda la configuración y espera a que termine el despliegue. Consulta la [guía oficial de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
4. Abre la URL que indique Pages. Comprueba la portada, los ocho enlaces de demos y sus enlaces de regreso. En **Network** de DevTools, verifica que el CSS y JavaScript respondan con HTTP 200 y sus tipos correspondientes (`text/css` y `text/javascript` o `application/javascript`). Si un archivo devuelve HTML o 404, comprueba la ruta y su capitalización.

### Indexación y vista previa social

La portada es indexable. Las ocho demos indican `noindex, follow` porque son experiencias de ejemplo que se descubren desde el portafolio. Los resultados de auditoría SEO de esas páginas bajan por esa decisión.

La imagen social de 1200 × 630 está en `assets/images/social/portafolio.png`. Una vez confirmada la URL pública, convierte `og:image` y `twitter:image` en URLs absolutas HTTPS con el subdirectorio del proyecto, añade `og:url` y el enlace canónico de la portada, y crea `sitemap.xml` con la URL de la portada. Verifica la vista previa en la plataforma donde quieras compartirla. Las rutas relativas actuales permiten probar la imagen localmente.

## Qué se puede probar

| Página | Flujo |
| --- | --- |
| `index.html` | Menú, proyectos numerados, ficha de Smart File Organizer, idioma ES/EN y acciones de contacto. |
| `demos/ecommerce.html` | **NOVA.** Filtros de catálogo, cantidades y total del carrito simulado. |
| `demos/dashboard.html` | **Pulse.** Rangos de 7, 30 y 90 días, indicadores, gráficos y navegación entre paneles. |
| `demos/landing.html` | **Northline.** Servicios, proceso y selector de escenarios de uso ficticios. |
| `demos/creative.html` | **FORMA.** Galería de seis fotografías con ampliación, navegación por flechas y cierre con Escape. |
| `demos/brasa.html` | **BRASA 01.** Carta en bolivianos, búsqueda, categorías, galería y simulador de reservas. |
| `demos/origen.html` | **ORIGEN CAFÉ.** Cafés calientes y fríos, postres y resumen del pedido. |
| `demos/distrito.html` | **DISTRITO 01.** Búsqueda, categorías, tallas, cantidades y bolsa guardada en el navegador. |
| `demos/nexo.html` | **NEXO TECH.** Búsqueda, categorías, topes de precio, comparación de dos o tres artículos y carrito. |

Las ocho demos son conceptuales. Los productos, precios, escenarios y resultados son datos de ejemplo. Las compras, los pedidos y las reservas se completan dentro de la página. Las demos comerciales no solicitan datos personales ni realizan envíos, pagos o reservas externas.

## Estructura

- `css/style.css` define la identidad industrial, la retícula, el menú y las transiciones del portafolio.
- `css/demos.css` mantiene los cuatro temas originales. `css/commerce.css` comparte los controles de los cuatro comercios. `brasa.css`, `origen.css`, `distrito.css` y `nexo.css` definen sus composiciones y paletas independientes.
- `js/script.js` contiene las traducciones del índice, navegación, revelados y copia de correo. `js/demos.js` gestiona el idioma de las demos y las interacciones originales. `js/commerce.js` gestiona los cuatro flujos comerciales.
- `assets/images/previews/` contiene ocho capturas WebP en tamaños de 800 × 500 y 1200 × 750. El portafolio usa `srcset` y `sizes` para elegir una según el espacio disponible. Añade `?preview` a una demo para capturarla sin la barra general ni el pie.
- `assets/images/commerce/` contiene fotografías de concepto generadas con ImageGen y servidas localmente. Los originales encargados muestran parrilla con carne y vegetales, café y repostería, moda urbana monocroma y periféricos de escritorio. Las tomas adicionales muestran choclo, verduras, tres prendas y dos periféricos aislados. Algunas fichas reutilizan fotografías WebP de los materiales originales del proyecto.
- `assets/fonts/` incluye Space Grotesk y IBM Plex Mono en WOFF2 latino, con sus textos de licencia SIL OFL 1.1. Hay alternativas locales en CSS.

## Mantenimiento

- El índice usa `data-i18n` y el diccionario de `js/script.js`. Las demos usan pares `data-es` / `data-en` y sus variantes para etiquetas y texto alternativo.
- El idioma se guarda en `localStorage`. DISTRITO 01 guarda únicamente el identificador, talla y cantidad de cada variante de la bolsa.
- El portafolio respeta la preferencia de movimiento reducido. Los enlaces, textos y catálogos permanecen visibles con JavaScript desactivado.
- Las rutas son relativas para funcionar tanto en un dominio propio como debajo del nombre del repositorio. Los recursos actualizados en esta auditoría usan `?v=9`. Al cambiar un recurso publicado, actualiza su versión en todas las referencias, incluidas las de `srcset`.

## Datos de contacto

El nombre, el perfil público de GitHub y el correo autorizado se muestran en el portafolio principal. Las demos comerciales utilizan identidades ficticias y no incluyen estos datos.
