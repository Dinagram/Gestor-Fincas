# Mockup Legacy — GestiónFinca v0

Esta carpeta contiene el **mockup original** del producto: HTML estático + Tailwind CDN + JS vanilla.

Fue la primera versión visual del proyecto y sirvió como especificación de UX. Se conserva aquí porque sigue siendo la mejor representación viva de las pantallas finales del producto.

## Cómo abrirlo

Simplemente abre [index.html](index.html) en cualquier navegador. No requiere build ni servidor.

Para servirlo en local (opcional):

```powershell
python -m http.server 8080
# luego abre http://localhost:8080
```

## Contenido

- `index.html` — SPA principal con sidebar + topbar + todas las vistas
- `app.js` — ~2800 líneas: data mock + renderers + state
- `styles.css` — estilos custom complementarios a Tailwind
- `Dr-Domagk-2-demo.html` — versión all-in-one (estilos inline) lista para enviar
- `Foto Dr Domagk.png` — foto de referencia del edificio
- `Diseño_Funcional_GestionFinca_v0.1.docx` — documento funcional v0.1

## Módulos cubiertos

Dashboard, Incidencias (con chat), Votaciones, Comunicados, Directorio (tabla + plano), Presupuesto (charts), Documentos, Configuración.

## Datos mock

Comunidad: **Dr. Domagk 2** (Madrid, 28033). 24 propietarios con nombres realistas españoles, 14 incidencias con conversaciones, 8 votaciones, 14 comunicados, presupuesto 2026.

Estos datos se han portado al `supabase/seed.sql` del proyecto real para mantener continuidad entre el mockup y la app productiva.

## ¿Por qué se mantiene?

- Validación visual rápida sin levantar la app real
- Referencia de UX para decisiones de diseño durante el desarrollo
- Demo presentable a stakeholders sin necesidad de cuentas Supabase

No se sirve en producción ni desde Next.js. Es código congelado.
