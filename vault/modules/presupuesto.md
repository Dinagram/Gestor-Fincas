---
id: mod_presupuesto
type: module
name: Módulo Presupuesto
path: src/app/(app)/c/[communityId]/presupuesto/
description: >
  Resumen visual del presupuesto anual. KPIs, gráficas Recharts 3.x,
  tabla de movimientos con selector de ejercicio. NO es contabilidad compleja.

parents:
  - id: sys_gestionfinca

children: []

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 1.0
  - target: sys_supabase
    type: uses
    weight: 1.0

tags:
  - presupuesto
  - budget
  - recharts
  - charts

state: active

db_tables: [budget_movements]

key_components:
  - CategoryChart — barras horizontales por categoría (Recharts)
  - MonthlyChart — área mensual (Recharts)
  - MovementsTable — tabla con filtros y selector de ejercicio

dependency: recharts@3.8.1

pending:
  - /presupuesto/importar — enlazado desde MovementsTable pero no implementado
---

# Módulo Presupuesto

Ofrece una visión visual del estado financiero de la comunidad para el ejercicio actual y anteriores. No es un sistema de contabilidad — es un dashboard de transparencia económica para los vecinos. Los movimientos se introducen manualmente (o se importarán en el futuro).

---

## Páginas

### `page.tsx` — Dashboard presupuestario
Server Component. Carga los `budget_movements` del ejercicio seleccionado, calcula los KPIs y pasa todo a los componentes visuales.

**Parámetro de ejercicio:** El año fiscal se lee de los search params (`?year=2024`). Si no se especifica, usa el año actual. El `YearSelector` (client) permite cambiar de ejercicio actualizando la URL.

---

## Componentes

### KPIs superiores (4 `KpiCard`)
Calculados en el Server Component a partir de los movimientos:
- **Presupuesto anual:** suma del presupuesto aprobado en junta (campo meta en BD o configurado manualmente).
- **Ejecutado:** suma de todos los movimientos del ejercicio con `type = 'gasto'`.
- **Pendiente de ejecutar:** presupuesto anual − ejecutado.
- **Desviación:** `(ejecutado / presupuesto) * 100 − 100`. Positivo = sobre presupuesto (en rojo), negativo = por debajo (en verde).

### `CategoryChart` (client, Recharts)
Gráfica de **barras horizontales** agrupadas. Eje Y: categorías de gasto (fontanería, electricidad, limpieza, jardinería, seguros, administración, obras, otros). Para cada categoría, dos barras: presupuesto asignado vs. ejecutado real. Permite identificar en qué categorías se está desviando la comunidad. Responsive con `ResponsiveContainer`.

### `MonthlyChart` (client, Recharts)
Gráfica de **área** con eje X mensual (Enero–Diciembre). Dos series: gasto acumulado real y presupuesto mensual previsto (línea horizontal o distribuido linealmente). Muestra si el ritmo de gasto es consistente o hay picos anómalos. Útil para detectar gastos extraordinarios.

### `MovementsTable`
Tabla de todos los movimientos del ejercicio seleccionado. Columnas: fecha, descripción, categoría, importe (con color verde entrada/rojo gasto), proveedor. Filtros: por categoría y por mes. Paginada (15 registros por página). El botón "Importar" enlaza a `/presupuesto/importar` que **aún no está implementado** — es un placeholder para futura importación CSV/Excel.

### `YearSelector` (client)
Select simple con los ejercicios disponibles (años con movimientos en BD + año actual). Al cambiar, actualiza el URL param `year` sin navegar — el Server Component padre re-fetcha los datos.

---

## Modelo de datos (`budget_movements`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `date` | date | Fecha del movimiento |
| `description` | text | Descripción del gasto o ingreso |
| `category` | enum | fontanería, electricidad, limpieza, etc. |
| `amount` | decimal | Positivo = ingreso, negativo = gasto |
| `vendor` | text | Proveedor o beneficiario |
| `year` | int | Ejercicio fiscal |
| `community_id` | uuid | Aislamiento multi-tenant |

---

## Limitaciones actuales

- Los movimientos se insertan manualmente (no hay integración contable).
- La importación desde CSV/Excel está planificada pero no implementada.
- El "presupuesto anual aprobado" no tiene su propia tabla — se calcula o hardcodea. En el futuro debería venir de un acta de junta votada en el módulo de Votaciones.

---

## Conexiones

**Sistema:** [[gestionfinca]] · [[supabase]]
**Módulos relacionados:** [[dashboard]] · [[votaciones]]
