# catalog-import

Objective: render the client's Cloudinary (HEIC) images and make the product spreadsheet import strict, readable and able to replace the whole catalog.
Branch: `feat/catalog-import` in both repos. Delivery: ask-on-risk. Test runner: backend `pnpm test` (node:test + supertest); frontend has none (build + manual check).

## Specs

- **S1** Images pasted as Cloudinary URLs must render, e.g. `https://res.cloudinary.com/n5snes6x/image/upload/v1794238309/IMG_0193.heic`. Reuse dulce-mood `optimizeImage` (`f_auto,q_auto,w_800,c_limit`) in `productImageUrl()`; the stored link stays as the admin typed it.
- **S2** Import parsing: accept only `.xlsx`, `.xls`, `.csv` (clear error otherwise); detect the header row within the first 10 rows; headers ignore case, accents and spaces; image aliases include "URL", "Link", "Imagen URL"; ignore unknown columns; skip rows whose required fields are all empty; parse Argentine prices (`$1.500,50` → 1500.5), ambiguous or negative values are row errors; the image URL must start with `http(s)://`.
- **S3** "todo o nada": any invalid row rejects the whole file; errors are reported as `{ row, column, message }` "hay que mostrar bien lo que fallo, asi mi amigo pueda corregir la planilla y subirla bien". Brand and category must already exist (no auto-create). Product identity = normalized name + capacity + brand. Duplicate rows inside the file and rows matching several existing products are errors. Error responses never carry `success: true`.
- **S4** Import option "importar y reemplazar el catalogo completo": validate the whole file first; only then delete all products and insert the new ones, atomically (Mongo transaction, Atlas support to be confirmed).
- **S5** Template endpoint returning an empty workbook with the export headers: nombre, descripcion, imagen, precio, precioMayorista, stock, categoria, capacidad, marca.
- **S6** Admin import UI: mode picker (add/update vs replace, replace needs a strong confirmation such as typing "REEMPLAZAR"), accept `.csv`, "Descargar plantilla" button, real counts (new / updated), per-row error table.

## Tasks

- [x] **F1** (S1) front, inline: `optimizeImage` in `src/lib/product-image.js`, admin previews optimized, edit form keeps the raw link. Commit 16a63bd (pushed).
- [x] **B1** (S2) back, inline: `src/utils/product-sheet.js` + controller; all-or-nothing response `INVALID_SHEET` with details. Commit fb247ea.
- [ ] **B2** (S3) back, inline: all-or-nothing validation, identity key, brand/category must exist.
- [ ] **B3** (S4) back, inline + independent verifier (Risk item 1: deletes stored data).
- [ ] **B4** (S5) back, inline: template endpoint.
- [ ] **F2** (S6) front, inline: import UI.

## Log

- **L1** (2026-11-10) User request: "me dice que subio todas sus imagenes a cloudinary, quiere poder copiar las url de las imagenes y subirlas a la pagina, ahora mismo no se esta pudiendo, hay que hacer un ajuste en el codigo para que las lea? Luego me dijo que se confundio y subio una planilla de productos que no era, y ahora tiene muchos productos duplicados y que no tienen que ir, me pidio si podia hacer algo para que el pueda borrar todos los productos y subir una planilla limpia. De paso, ajustemos el codigo y mejoremos todo el tema este de la subida de la planilla, para que no falle si se sube una planilla con otro formato, y que solo acepte los campos validos."
- **L2** Decisions: replace-catalog import option instead of a delete-all button; all-or-nothing in both modes; off-table content handled as in S2; identity without category or SKU; brands/categories must exist; the existing junk brands/categories are cleaned by hand from the admin.
- **L3** Cause of S1: the client's photos are HEIC, which only Safari renders; the code never blocked Cloudinary.
- **L4** F1 evidence: node check of the rewrite (HEIC URL gets the transformation, idempotent, non-Cloudinary unchanged, bare file name → null); `curl` of the transformed real URL returned `200 image/jpeg`; `pnpm build` passed. The edit form fills its input with `productImageLink` so saving never stores the transformed URL.
- **L5** B1 evidence: RED 4 failing (3 HTTP + parser suite), GREEN `pnpm test` 459/459. B1 also delivers the all-or-nothing response part of S3. Running count ~640 authored lines (F1 ~42 + B1 ~600 incl. tests): over 400, delivery strategy asked.
