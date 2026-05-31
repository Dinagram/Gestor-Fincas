---
id: mod_documentos
type: module
name: Módulo Documentos
path: src/app/(app)/c/[communityId]/documentos/
description: >
  Repositorio de documentos en 6 carpetas temáticas. Descarga firmada vía signed URL,
  upload vía Server Action al bucket Supabase Storage.

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
  - documentos
  - storage
  - signed-urls

state: active

db_tables: [documents, document_versions]
storage_bucket: documents
folder_types: [actas, estatutos, seguros, contratos, certificados, otros]
---

# Módulo Documentos

Repositorio centralizado de documentos legales y administrativos de la comunidad. Sustituye el uso de emails y USBs para compartir el acta de la última junta o el contrato con la empresa de limpieza. Los documentos se almacenan en Supabase Storage con descarga segura vía signed URLs de corta duración.

---

## Páginas

### `page.tsx` — Explorador de documentos
Server Component. Carga todos los documentos de la comunidad agrupados por categoría. Renderiza el grid de carpetas.

---

## Componentes

### `FolderGrid`
Grid de 6 tarjetas, una por categoría de documentos. Cada card muestra:
- **Ícono** representativo de la categoría (lucide-react).
- **Nombre** de la carpeta.
- **Contador** de documentos que contiene.

Las 6 carpetas son fijas (no configurables):
1. **Actas** — Actas de juntas de propietarios.
2. **Estatutos y normas** — Estatutos de la comunidad, reglamento de régimen interior.
3. **Seguros** — Pólizas de seguro del edificio.
4. **Contratos** — Contratos con proveedores (limpieza, ascensor, portería).
5. **Certificados** — ITE, eficiencia energética, cédulas, etc.
6. **Otros** — Documentación que no encaja en las anteriores.

Al clicar en una carpeta, se muestra su contenido.

### `FolderContent`
Lista de archivos dentro de la carpeta seleccionada. Cada item muestra:
- **Nombre del archivo.**
- **Extensión** (badge: PDF, DOCX, JPG...).
- **Fecha de subida** y **tamaño** en KB/MB.
- **Descripción** si se añadió al subir.
- **`DownloadButton`** (client) — genera la URL firmada.
- **Botón "Subir documento"** — solo visible para admin_finca.

### `DownloadButton` (client)
Botón que al hacer clic llama al Server Action `signDocumentUrl()`. Este genera una signed URL de Supabase Storage con expiración de 60 segundos. La URL se abre en una nueva pestaña para iniciar la descarga. Las URLs caducan para evitar que se compartan enlaces de descarga indefinidos.

### `UploadForm` (client)
Formulario de subida visible solo para admin_finca. Campos: archivo (input file, max 50MB según `config.toml`), nombre personalizable, descripción opcional, categoría (preseleccionada según la carpeta activa). Al confirmar, llama al Server Action que:
1. Sube el archivo al bucket `documents` con una ruta `{communityId}/{category}/{uuid}-{filename}`.
2. Inserta un row en la tabla `documents` con `storage_path`, `file_name`, `file_size`, `mime_type`, `category`.

---

## Seguridad y acceso

- **Ver y descargar:** Todos los miembros activos de la comunidad (RLS `is_member`).
- **Subir documentos:** Solo `admin_finca` (verificado en Server Action + RLS).
- **Eliminar:** Solo `admin_finca`.
- Las signed URLs caducan en 60 segundos — imposible compartir acceso permanente a un documento.
- Los archivos en el bucket no son públicos — requieren always la signed URL.

---

## Modelo de datos

| Tabla | Propósito |
|-------|-----------|
| `documents` | Metadatos: nombre, categoría, storage_path, tamaño, fecha, autor |
| `document_versions` | Historial de versiones del mismo documento (pendiente de uso en UI) |

El campo `storage_path` es la ruta dentro del bucket `documents` para generar la signed URL.

---

## Conexiones

**Sistema:** [[gestionfinca]] · [[supabase]]
**Conceptos:** [[con-rls]]
