# Park4Learn — Bitácora de verano

App educativa de repaso para **5º de Educación Primaria** y **1º de ESO** (currículo LOMLOE, Andalucía).

- Funciona en navegador (web) e instalable en móvil/tablet como **PWA**.
- Soporta actividades **digitales** (autocorregidas) y de **cuaderno** (para resolver en papel).
- **Gamificación**: XP, niveles, rachas diarias, avatar personalizable.
- **Tope de 1 hora al día**: la app no propone más actividades cuando se alcanza el límite.
- **Contenido separado del código**: las actividades viven en archivos JSON dentro de `public/content/`.

---

## Puesta en marcha

Requisitos: **Node.js 18+** y **npm**.

```bash
# 1. Instalar dependencias
npm install

# 2. Arrancar en modo desarrollo
npm run dev
# → abre http://localhost:5173

# 3. Generar versión de producción
npm run build

# 4. Previsualizar la build
npm run preview
```

## Subirlo a GitHub

```bash
git init
git add .
git commit -m "Esqueleto inicial"
git branch -M main
git remote add origin https://github.com/<TU_USUARIO>/repaso-app.git
git push -u origin main
```

## Despliegue en GitHub Pages

1. Asegúrate de que el nombre del repositorio coincide con la constante `REPO_BASE` en `vite.config.ts` (por defecto `/repaso-app/`). Si usas otro nombre, edítalo.
2. En GitHub: **Settings → Pages → Source → GitHub Actions**.
3. Crea el workflow `.github/workflows/deploy.yml` (te lo paso en el siguiente paso si lo confirmas).

Cuando esté desplegada, la app será instalable en móvil:
- **Android (Chrome)**: aparece banner "Añadir a pantalla principal".
- **iOS (Safari)**: botón compartir → "Añadir a pantalla de inicio".

---

## Estructura del proyecto

```
repaso-app/
├── public/
│   ├── content/                    ← Todo el contenido educativo (JSON)
│   │   ├── 5-primaria/
│   │   │   ├── matematicas/
│   │   │   │   ├── _index.json     ← Lista de unidades
│   │   │   │   ├── decimales.json
│   │   │   │   └── fracciones.json
│   │   │   └── lengua/
│   │   └── 1-eso/
│   │       ├── matematicas/
│   │       └── lengua/
│   └── icons/                      ← Iconos PWA
├── src/
│   ├── App.tsx                     ← Máquina de estados de pantallas
│   ├── main.tsx                    ← Entrada React
│   ├── types/                      ← Tipos TypeScript compartidos
│   ├── lib/
│   │   ├── storage.ts              ← Wrapper de localStorage
│   │   ├── progress.ts             ← XP, rachas, perfiles
│   │   ├── content.ts              ← Carga de JSON
│   │   └── session.ts              ← Construcción de la sesión diaria
│   ├── components/                 ← Avatar, XPBar, SessionTimer, …
│   ├── activities/                 ← Un renderizador por tipo de actividad
│   ├── screens/                    ← ProfileSelect, Home, SessionRunner
│   └── styles/index.css            ← Tailwind + estilos base
├── tailwind.config.js              ← Paleta y tipografías
├── vite.config.ts                  ← Configuración + PWA
└── package.json
```

---

## Añadir actividades nuevas

**Las actividades no requieren tocar código**, solo JSON.

### Pasos

1. Identifica la materia y el nivel: `public/content/<nivel>/<materia>/`.
2. Si es una **unidad nueva**, créa un archivo JSON nuevo (p.ej. `geometria.json`) y registra la unidad en `_index.json` de esa materia.
3. Si es una actividad para una unidad existente, **añádela al array** del archivo JSON correspondiente.

### Tipos de actividad disponibles

| `type` | Formato | Para qué |
|---|---|---|
| `multiple_choice` | digital | Una opción correcta entre varias |
| `fill_blank` | digital | Completar huecos `{0}`, `{1}`… en una frase |
| `number_input` | digital | Respuesta numérica con tolerancia opcional |
| `cuaderno_problema` | cuaderno | Problema para resolver en el cuaderno físico |

### Campos comunes de toda actividad

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | Único en toda la app. Convenio: `<nivel>-<materia>-<unidad>-<NNN>` |
| `type` | string | Uno de los tipos de la tabla anterior |
| `formato` | `digital` \| `cuaderno` \| `mixto` | Debe coincidir con el tipo |
| `nivel` | `5-primaria` \| `1-eso` | |
| `materia` | `matematicas` \| `lengua` | |
| `saber_basico` | string | Código del saber del currículo |
| `dificultad` | 1, 2 o 3 | 1 = calentamiento, 3 = más difícil |
| `xp` | number | XP que otorga (típico: 10/15/20/25) |
| `tiempo_estimado_s` | number | Para el planificador del día |
| `enunciado` | string | Texto principal de la actividad |

### Ejemplos

Mira los archivos existentes:
- `public/content/5-primaria/matematicas/decimales.json` — incluye los 3 tipos
- `public/content/1-eso/lengua/categorias-gramaticales.json` — incluye análisis sintáctico

---

## Notas técnicas

- **Estado del alumno**: localStorage. Sin backend, sin cuentas. Cada navegador/dispositivo lleva su propio progreso.
- **Selección diaria**: determinista por fecha. Si el alumno abre la app dos veces el mismo día, ve la misma sesión.
- **Tope de 1 hora**: codificado en `src/lib/session.ts` (`LIMITE_DIARIO_S`).
- **PWA**: configurada en `vite.config.ts` con `vite-plugin-pwa`. Funciona offline tras la primera carga.

---

## Próximos pasos sugeridos

- [ ] Workflow de GitHub Actions para desplegar automáticamente en GitHub Pages.
- [ ] Más tipos de actividad: `drag_match` (sintaxis), `order_sequence`, `draw_canvas`.
- [ ] Mapa de progreso visual por materia.
- [ ] Sistema de logros / medallas.
- [ ] Refuerzo adaptativo: priorizar saberes que falla el alumno.
- [ ] Vista de profesor para programar la sesión del día manualmente.
