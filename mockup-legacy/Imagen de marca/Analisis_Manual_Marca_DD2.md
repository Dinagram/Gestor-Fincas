# Análisis del Manual de Marca · Edificio Dr. Domagk 2 (DD²)

**Documento:** Manual de Marca — Identidad Visual 2026 · Versión 1.0
**Marca:** Edificio Dr. Domagk 2 — Comunidad de Propietarios
**Símbolo:** monograma `DD²`
**Naturaleza del proyecto:** identidad institucional de un edificio residencial (registro *brand*: la propia imagen es el producto, no una herramienta de uso).

> Análisis elaborado con las lentes de las skills `impeccable` (leyes de diseño, color OKLCH, test anti-slop, prohibiciones) y `ui-ux-pro-max` (accesibilidad WCAG, jerarquía, sistema de color y tipografía). Incluye una auditoría de contraste con datos reales y recomendaciones de implementación.

---

## 1. Síntesis ejecutiva

El manual define una identidad **sobria, atemporal y coherente** construida alrededor de un único símbolo: el monograma `DD²` en una didone de alto contraste, centrado sobre un disco bronce. La ejecución documental es notable: cubre el sistema completo (símbolo, logotipo, área de respeto, versiones, usos incorrectos, color, tipografía, iconografía y aplicaciones) en diez páginas bien organizadas y bilingües (ES/EN).

**Veredicto general:** es un sistema maduro, disciplinado y muy bien resuelto para su propósito. Las decisiones cromáticas y tipográficas son consistentes con el concepto («paleta mineral inspirada en la fachada»). Los puntos débiles no están en la concepción sino en **dos zonas concretas de accesibilidad de color** y en algunas **especificaciones que conviene cerrar** para que terceros (imprentas, web, señalética) lo apliquen sin ambigüedad.

| Eje | Valoración | Comentario |
|---|---|---|
| Concepto e idea rectora | Sobresaliente | Un símbolo, tres principios, una historia (la fachada) que justifica la paleta. |
| Sistema de logotipo | Muy bueno | Anatomía, área de respeto y tamaño mínimo bien definidos. |
| Color | Bueno con reservas | Pares principales excelentes; el terracota y el taupe fallan contraste de texto en varios fondos. |
| Tipografía | Muy bueno | Tres familias con roles claros; ver matiz sobre el «lane» editorial. |
| Accesibilidad | Mejorable | Falta documentar contraste, usos de color mínimos y alternativas. |
| Listo para producción | Mejorable | Faltan códigos CMYK/Pantone, formatos de archivo y especificaciones de export. |

---

## 2. Concepto e idea rectora

La marca se apoya en tres principios explícitos, que funcionan como criterio de decisión ante cualquier duda:

- **Sobriedad** — «mucho aire, pocos elementos».
- **Atemporalidad** — serif clásica y paleta mineral.
- **Coherencia** — un solo sistema aplicado igual en todo.

El símbolo es una narrativa comprimida: dos «D» mayúsculas más un «2» elevado (al cuadrado) que identifica al **segundo** edificio del conjunto, dentro de un disco bronce que actúa como sello. La paleta se ancla en un referente físico real —el bronce de los balcones y el beige de la piedra de la fachada—, lo que da al sistema una razón de ser más allá del gusto. Esto es exactamente lo que distingue una identidad con punto de vista de una decoración intercambiable.

---

## 3. El logotipo

### 3.1 Anatomía

El logotipo es un **conjunto indivisible** con tres componentes:

| Componente | Descripción | Función |
|---|---|---|
| **A · Las iniciales** | «DD» en Bodoni Moda Bold; serifs finas y contraste marcado. | Carácter editorial, núcleo de la marca. |
| **B · El numeral** | «2» elevado como exponente («al cuadrado»). | Identifica al segundo edificio del conjunto. |
| **C · El disco** | Contenedor circular bronce. | Centra ópticamente el conjunto y funciona como sello. |

### 3.2 Construcción y área de respeto

- **Área de respeto:** margen libre equivalente a **½ del diámetro del disco** por cada lado. Ningún texto, imagen o borde debe invadir esa zona.
- **Tamaño mínimo:** no reproducir el sello por debajo de **14 mm** (impresión) o **40 px** (pantalla), para garantizar la legibilidad del «2».
- Tamaños de referencia documentados: 40 px (mínimo) · 64 px · 96 px.

### 3.3 Versiones

Regla rectora: **usar siempre la versión de mayor contraste con el fondo.** El positivo sobre bronce es la versión preferente.

| Versión | Composición | Uso |
|---|---|---|
| **Principal** | Beige sobre bronce | Preferente, máxima identidad. |
| **Negativo** | Bronce sobre beige | Fondos claros de papel/piedra. |
| **Contorno** | Una tinta, disco en línea | Sellos, grabados, troqueles, una sola tinta. |
| **Sobre oscuro** | Beige sobre tinta | Fondos muy oscuros sin disco. |
| **Lockup horizontal** | `DD²` + «EDIFICIO Dr. Domagk 2» | Cabeceras, firmas, señalética con nombre. |

### 3.4 Usos incorrectos (catálogo de prohibiciones)

El manual prohíbe expresamente seis manipulaciones, todas correctas y exhaustivas para el tipo de marca:

1. No deformar ni alterar las proporciones del sello.
2. No girar ni inclinar el logotipo.
3. No usar colores fuera de la paleta.
4. No sustituir la tipografía dentro del disco.
5. No añadir sombras, brillos ni efectos.
6. No colocar el sello sobre fondos sin contraste.

> **Observación de coherencia interna:** la prohibición 6 («fondos sin contraste») es precisamente el riesgo que reaparece en el análisis de color de §5 con el terracota y el taupe. El manual acierta al prohibirlo a nivel de logotipo; conviene extender esa misma exigencia a texto y a iconografía (ver recomendaciones).

---

## 4. Sistema de color

Paleta mineral derivada de la fachada. Se añaden a continuación las equivalencias **OKLCH** (espacio perceptualmente uniforme, recomendado por `impeccable` frente a HSL) para facilitar la construcción de escalas y variantes.

### 4.1 Primarios

| Nombre | HEX | OKLCH (aprox.) | Rol |
|---|---|---|---|
| **Bronce** | `#3D332A` | `oklch(32.9% 0.021 64)` | Fondo principal · sellos |
| **Beige** | `#E9DDC6` | `oklch(90.1% 0.033 84)` | Logotipo · contraste |
| **Papel** | `#FBF8F2` | `oklch(98.0% 0.009 85)` | Fondo de documento |

### 4.2 Secundarios

| Nombre | HEX | OKLCH (aprox.) | Rol |
|---|---|---|---|
| **Tinta** | `#2A2520` | `oklch(26.8% 0.012 67)` | Texto principal |
| **Taupe** | `#756650` | `oklch(51.8% 0.038 77)` | Texto secundario · inglés |
| **Terracota** | `#A85D2B` | `oklch(55.6% 0.117 52)` | Acento · numeración |

**Lectura del sistema:** todos los tonos comparten una familia cálida (hue OKLCH entre ~52 y ~85), lo que explica su cohesión. Los neutros no son grises puros: llevan croma bajo (0.009–0.038) tintado hacia el ámbar de la marca, exactamente la práctica que `impeccable` recomienda para evitar el «gris muerto». El terracota es el único color con croma alto (0.117) y por eso funciona como acento; bien usado, refuerza la regla 60-30-10 (acento ≤10 % del peso visual).

### 4.3 Auditoría de contraste WCAG 2.1 (datos calculados)

Ratios reales calculados sobre los HEX del manual. Umbrales: **texto normal 4.5:1**, **texto grande / iconos / UI 3:1**.

| Primer plano | Fondo | Ratio | Texto normal | Texto grande · UI |
|---|---|---|---|---|
| Beige | Bronce | **9.16:1** | ✅ | ✅ |
| Bronce | Beige | **9.16:1** | ✅ | ✅ |
| Beige | Tinta | **11.29:1** | ✅ | ✅ |
| Tinta | Papel | **14.31:1** | ✅ | ✅ |
| Bronce | Papel | **11.62:1** | ✅ | ✅ |
| Taupe | Papel | **5.25:1** | ✅ | ✅ |
| Taupe | Beige | **4.14:1** | ⚠️ falla | ✅ |
| Terracota | Papel | **4.64:1** | ✅ (al límite) | ✅ |
| Terracota | Beige | **3.66:1** | ❌ falla | ✅ |
| Terracota | Bronce | **2.50:1** | ❌ falla | ❌ falla |

**Conclusiones:**

- El **par identitario (beige/bronce) y los textos principales (tinta/papel)** tienen un contraste excelente (9:1–14:1). El corazón del sistema es sólido y muy accesible.
- **Taupe sobre beige** (4.14:1) no alcanza el mínimo para texto corrido pequeño. Es válido solo para texto grande o etiquetas; conviene reservarlo para papel (5.25:1) cuando sea cuerpo de texto.
- **Terracota** es el punto frágil: como **texto** falla sobre beige y es inviable sobre bronce. Como **acento gráfico, numeración grande o icono** (umbral 3:1) sí cumple en papel y beige. La recomendación es tratarlo como color de acento/decoración, **no como color de texto pequeño**, y nunca sobre bronce.

> Nota: el contraste de color es solo una de las dos lentes de daltonismo. Como el sistema es esencialmente monocromo cálido, no depende de oposiciones rojo/verde y se comporta bien para visión cromática deficiente, siempre que la información no se transmita **solo** por color.

---

## 5. Tipografía

Tres familias cubren todos los usos, con roles bien separados:

| Familia | Clasificación | Uso documentado |
|---|---|---|
| **Bodoni Moda** | Didone (serif alto contraste) | Titulares, el logotipo y cifras destacadas. |
| **Spectral** | Serif de lectura | Texto corrido, párrafos y notas (incluye cursiva). |
| **IBM Plex Mono** | Monoespaciada | Etiquetas, secciones y numeración. |

El reparto display / lectura / etiqueta es un esquema clásico de revista y está bien elegido: la didone aporta el carácter editorial, la serif humanista facilita la lectura larga y la mono da el tono técnico-administrativo de avisos y señalética. Cumple las leyes tipográficas básicas (jerarquía por escala y peso, no por una sola variable).

**Matiz de honestidad crítica (test anti-slop):** la combinación *didone display + mono en versalitas espaciadas + reglas finas + paleta mineral monocroma* es justamente el «lane editorial-typographic» que en 2026 se ha vuelto omnipresente en marcas tipo Stripe/Notion. Para una identidad nueva sería un reflejo de segundo orden a evitar. **Aquí no es un defecto**: es una identidad ya comprometida y coherente con su concepto (sobriedad atemporal de un edificio), y la regla de preservación de identidad manda sobre la de evitar el lane. Se menciona solo para que, si en el futuro se amplía el sistema, no se confunda «familiar» con «genérico».

---

## 6. Iconografía

Set de pictogramas de **línea fina, trazo uniforme y esquinas suaves**, encerrados en un círculo a juego con el sello. Cada zona común tiene el suyo:

- Acceso y circulación · *Access & circulation*
- Garaje y trasteros · *Car park & storage*
- Bicicletero · *Bicycle storage*
- Piscina y parque · *Pool & play area*
- Gimnasio · *Gym*
- Sala multiusos · *Multipurpose room*

El círculo contenedor rima con el disco del logotipo, lo que da unidad al sistema. **Recomendación:** fijar como token el grosor de trazo (p. ej. 1.5–2 px a tamaño base) y un tamaño de icono estándar, para mantener la consistencia de trazo que el manual describe pero no cuantifica.

---

## 7. Aplicaciones

El manual muestra el sistema en uso, demostrando que rejilla, paleta y sello se combinan igual en cualquier soporte:

- **Portada de documento** — «Normas de Convivencia».
- **Cabecera web** — navegación Inicio / Zonas / Normas / Contacto + bienvenida.
- **Señalética** — placa circular de planta (p. ej. «Garaje, Planta -1»).
- **Aviso a vecinos** — comunicación operativa (limpieza de fachada).

Es un buen rango de aplicaciones para una comunidad de propietarios: cubre lo institucional (normas), lo digital (web), lo físico permanente (señalética) y lo efímero (avisos).

---

## 8. Diagnóstico de diseño y recomendaciones

### 8.1 Lo que funciona (mantener)

1. **Un único símbolo, bien construido.** La indivisibilidad del lockup y el área de respeto en proporción al disco son decisiones profesionales que protegen la marca.
2. **Paleta con relato.** Derivar el color de la fachada da cohesión y atemporalidad reales, no declarativas.
3. **Disciplina documental.** El catálogo de usos incorrectos y la regla «máximo contraste» previenen el 80 % de los errores de aplicación.

### 8.2 Cuestiones prioritarias (corregir o documentar)

1. **Contraste del terracota como texto.** Documentar explícitamente que el terracota es color de **acento/numeración**, no de texto pequeño, y prohibir terracota sobre bronce (2.50:1). *(Impacto: accesibilidad — prioridad crítica en `ui-ux-pro-max`.)*
2. **Taupe sobre beige.** Limitar el taupe a texto grande sobre beige; para cuerpo de texto, usarlo sobre papel (5.25:1) o subir el peso/tamaño.
3. **Especificación de producción ausente.** Añadir equivalencias **CMYK y Pantone** (impresión), perfiles de color, y los **formatos de archivo** de cada versión del logo (SVG/EPS para vector, PNG con fondo transparente para pantalla) con su nomenclatura.
4. **Tokens cuantificados.** Fijar valores numéricos para: grosor de trazo de iconos, tamaño de icono base, escala tipográfica (ratios ≥1.25 entre pasos) e interlineado de cuerpo (objetivo 1.5, medida 65–75 caracteres por línea).

### 8.3 Mejoras recomendadas (subir el listón)

- **Modo accesible documentado.** Una nota de a11y por aplicación: contraste mínimo, no transmitir información solo por color (los iconos de zona deben llevar etiqueta de texto, no solo el pictograma).
- **Estados para la web.** Definir foco visible (anillo 2–4 px), hover/activo y tamaño de área táctil ≥44×44 px para la cabecera y la navegación mostradas en las aplicaciones.
- **Versión monocroma de seguridad.** Un positivo en una sola tinta a 100 % para fax/grabado/sellado en caliente, además del contorno.
- **Favicon y app icon.** Especificar cómo se comporta el sello a 16/32 px (donde el «2» puede perderse) — posiblemente una versión simplificada.

---

## 9. Tokens de diseño (implementación)

Variables listas para CSS, en HEX y OKLCH, con roles semánticos. Tintar los neutros hacia el ámbar de la marca ya está reflejado en el croma.

```css
:root {
  /* Primarios */
  --dd-bronce:    #3D332A;  /* oklch(32.9% 0.021 64)  — fondo principal, sellos */
  --dd-beige:     #E9DDC6;  /* oklch(90.1% 0.033 84)  — logotipo, contraste     */
  --dd-papel:     #FBF8F2;  /* oklch(98.0% 0.009 85)  — fondo de documento      */

  /* Secundarios */
  --dd-tinta:     #2A2520;  /* oklch(26.8% 0.012 67)  — texto principal         */
  --dd-taupe:     #756650;  /* oklch(51.8% 0.038 77)  — texto secundario        */
  --dd-terracota: #A85D2B;  /* oklch(55.6% 0.117 52)  — acento, numeración      */

  /* Roles semánticos */
  --color-bg:           var(--dd-papel);
  --color-surface:      var(--dd-beige);
  --color-ink:          var(--dd-tinta);   /* 14.3:1 sobre papel */
  --color-ink-muted:    var(--dd-taupe);   /* usar sobre papel; no cuerpo sobre beige */
  --color-accent:       var(--dd-terracota); /* solo acento/numeración, nunca texto pequeño */
  --color-seal-bg:      var(--dd-bronce);
  --color-seal-fg:      var(--dd-beige);   /* 9.2:1 */

  /* Tipografía */
  --font-display: "Bodoni Moda", "Didot", Georgia, serif;
  --font-body:    "Spectral", Georgia, serif;
  --font-mono:    "IBM Plex Mono", ui-monospace, monospace;

  /* Reglas de marca */
  --logo-min-screen: 40px;   /* tamaño mínimo en pantalla */
  --logo-clear-space: 0.5;   /* ½ del diámetro del disco, por lado */
}
```

**Reglas de uso seguro del color (resumen):**

- Texto de cuerpo: `--dd-tinta` sobre `--dd-papel` o `--dd-beige`. ✅
- Texto sobre bronce: solo `--dd-beige`. ✅
- `--dd-terracota`: acentos, cifras grandes e iconos; **nunca** texto pequeño ni nada sobre bronce. ⚠️
- `--dd-taupe`: secundario sobre papel; sobre beige, solo a tamaño grande. ⚠️

---

## 10. Inventario de archivos generados

Junto a este análisis se entregan reproducciones del logotipo en PNG, fieles al manual (tipografía Bodoni Moda Bold, paleta exacta):

| Archivo | Contenido |
|---|---|
| `logo_principal.png` | Versión principal — beige sobre disco bronce (1200×1200, fondo transparente). |
| `logo_negativo.png` | Negativo — bronce sobre disco beige. |
| `logo_contorno.png` | Contorno — disco en línea, una tinta, fondo transparente. |
| `logo_oscuro.png` | Sobre oscuro — beige sobre disco tinta. |
| `logo_horizontal.png` | Lockup horizontal con «EDIFICIO · Dr. Domagk 2». |
| `logo_versiones.png` | Hoja de versiones (réplica de la página 04 del manual). |
| `marca_bronce.png` | Monograma `DD²` en bronce, sin disco, fondo transparente. |
| `marca_beige.png` | Monograma `DD²` en beige, sin disco, fondo transparente. |

> Las reproducciones son una interpretación a partir de las especificaciones del manual para uso de trabajo; para producción final conviene contar con los archivos vectoriales originales (SVG/EPS) de la comunidad.
