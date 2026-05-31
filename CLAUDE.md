# GestiónFinca — Contexto de Producto

## Regla de Memoria Externa (Obligatoria)

El sistema debe mantener actualizado de forma continua el vault en `/vault/` como memoria externa del proyecto.

El vault es el grafo de conocimiento del proyecto en formato YAML. Ante cualquier cambio de arquitectura, nuevo módulo, decisión técnica o flujo nuevo, se deben crear o actualizar los nodos correspondientes en `/vault/` y mantener las relaciones bidireccionales del grafo.

Punto de entrada: `/vault/index.yaml`

---

## Descripción General

GestiónFinca es una aplicación web responsive para comunidades de propietarios (fincas / edificios residenciales) en España.

El objetivo es centralizar:
- comunicación vecinal
- incidencias
- votaciones
- notificaciones oficiales
- directorio de vecinos
- documentación
- seguimiento presupuestario

La plataforma sustituye procesos fragmentados actualmente gestionados por:
- WhatsApp
- emails
- tablones físicos
- llamadas
- herramientas dispersas

La aplicación debe transmitir:
- transparencia
- trazabilidad
- simplicidad
- confianza
- gobernanza vecinal moderna

---

# Objetivo Actual

Generar una DEMO VISUAL navegable en HTML estático para validar:
- UX
- arquitectura de información
- flujo de navegación
- jerarquía funcional
- percepción del producto

NO es necesario backend.
NO es necesario persistencia.
NO es necesario autenticación real.

La demo debe parecer una aplicación SaaS moderna funcional.

---

# Tipo de Aplicación

Aplicación web responsive:
- escritorio
- tablet
- móvil

Estilo:
- clean SaaS
- dashboard moderno
- minimalista
- accesible
- tonos neutros
- UX clara
- inspirada en:
  - Linear
  - Notion
  - Stripe Dashboard
  - Slack
  - monday.com

---

# Roles del Sistema

## Superadmin
Control total de plataforma.

## Administrador de finca
Gestiona toda la comunidad.

## Miembro de junta
Co-gestiona incidencias y decisiones.

## Propietario
Participa, consulta y vota.

## Inquilino
Acceso limitado.
Puede participar en incidencias.
No participa en votaciones económicas.

---

# Módulos Principales

## 1. Dashboard Principal

Debe incluir:
- resumen de incidencias abiertas
- últimas notificaciones
- votaciones activas
- estado presupuesto
- accesos rápidos
- actividad reciente

Debe sentirse vivo y real.

---

## 2. Incidencias

Módulo más importante del MVP.

Características:
- listado de incidencias
- filtros
- estados:
  - abierta
  - en revisión
  - en curso
  - resuelta
- votos de apoyo
- comentarios
- prioridad visual
- categorías
- adjuntos

Ejemplos:
- ascensor averiado
- gotera
- ruido nocturno
- iluminación portal

---

## 3. Notificaciones Oficiales

Sistema unidireccional.

Tipos:
- aviso general
- convocatoria
- resolución
- urgente

Debe mostrar:
- estado de lectura
- importancia
- fecha
- destinatarios

---

## 4. Votaciones

Características:
- votaciones activas
- barra temporal
- porcentaje participación
- votos:
  - a favor
  - en contra
  - abstención
- resultados visuales

Ejemplos:
- reforma portal
- instalación placas solares
- cambio empresa limpieza

---

## 5. Directorio Vecinal

Vista del edificio y unidades.

Mostrar:
- planta
- puerta
- propietario/inquilino
- estado ocupación
- privacidad limitada

---

## 6. Presupuesto

Resumen visual.

Mostrar:
- presupuesto anual
- gasto ejecutado
- desviación
- categorías
- gráficas simples

NO hacer contabilidad compleja.

---

## 7. Repositorio de Documentos

Mostrar:
- actas
- estatutos
- seguros
- contratos
- certificados

Vista tipo:
- Google Drive simple
- listado limpio

---

# Navegación Deseada

Sidebar izquierda:
- Dashboard
- Incidencias
- Votaciones
- Notificaciones
- Directorio
- Presupuesto
- Documentos
- Configuración

Topbar:
- búsqueda
- notificaciones
- perfil usuario

---

# Requisitos UX

## Muy importante:
La demo debe parecer REAL.

Incluir:
- datos mock realistas
- nombres reales españoles
- fechas
- estadísticas
- estados
- gráficos fake
- badges
- avatars
- timelines
- actividad reciente

NO usar lorem ipsum.

---

# Responsive

Debe adaptarse:
- desktop
- móvil

En móvil:
- sidebar colapsable
- cards verticales
- navegación usable

---

# Tecnología Deseada

Generar:
- HTML
- CSS
- JS vanilla

Preferiblemente:
- Tailwind via CDN

Evitar:
- frameworks complejos
- build steps
- dependencias innecesarias

Debe abrirse directamente en navegador.

---

# Estructura Esperada

Idealmente:
- index.html
- styles.css
- app.js

O incluso:
- single-file HTML

---

# Objetivo Visual

La demo debe ser suficientemente buena para:
- enseñar a stakeholders
- validar concepto
- presentar a potenciales clientes
- enseñar visión del producto

Debe parecer una startup SaaS real.

---

# Prioridades MVP

Prioridad máxima:
1. Dashboard
2. Incidencias
3. Notificaciones
4. Votaciones

Prioridad media:
5. Directorio
6. Presupuesto

Prioridad baja:
7. Configuración avanzada

---

# Tono de la UI

Profesional pero cercano.

No corporativo frío.
No diseño gubernamental.
No aspecto ERP antiguo.

Debe transmitir:
- claridad
- confianza
- comunidad
- modernidad

---

# Importante

NO implementar backend.
NO implementar login real.
NO implementar base de datos.

Todo puede ser mockeado.

Lo importante es:
- experiencia
- navegación
- arquitectura visual
- sensación de producto terminado