# SCESI App Web

Aplicación web desarrollada con Angular 21, Standalone Components, TypeScript en modo estricto y Tailwind CSS v4.

## Tecnologías

| Componente | Tecnología |
|---|---|
| Framework | Angular 21.2.x |
| Componentes | Standalone (default en Angular 21) |
| Lenguaje | TypeScript 5.x (strict mode) |
| Estilos | Tailwind CSS v4 |
| Linting | ESLint + angular-eslint |
| Tests | Karma + Jasmine |
| CI/CD | GitHub Actions |
| Arquitectura | Feature-Based / Domain-Driven |

## Inicialización

### Prerequisitos

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 10

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/scesi/scesi-app-web.git

# Entrar al directorio
cd scesi-app-web

# Cambiar a la rama de desarrollo
git checkout develop

# Instalar dependencias
pnpm install
```

### Desarrollo

```bash
# Levantar el servidor de desarrollo
pnpm start
```

Abrir [http://localhost:4200/](http://localhost:4200/) en el navegador. La aplicación se recarga automáticamente al modificar archivos fuente.

## Comandos Disponibles

| Comando | Descripción |
|---|---|
| `pnpm start` | Levantar servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm test` | Ejecutar tests unitarios |
| `pnpm test:ci` | Ejecutar tests en modo CI (headless) |
| `pnpm lint` | Verificar reglas ESLint |
| `pnpm lint:fix` | Corregir errores de ESLint automáticamente |
| `pnpm typecheck` | Validar tipos de TypeScript |

## Cliente API e Interceptores

La app habla con el [identity service](https://github.com/scesi/scesi-identity-service) a través del `HttpClient` de Angular. Las rutas se escriben relativas (`/auth/me`) y la cadena de interceptores hace el resto.

| Interceptor | Responsabilidad |
|---|---|
| `deviceInfoInterceptor` | Agrega la cabecera `device_info` con el descriptor del navegador |
| `apiUrlInterceptor` | Resuelve la ruta contra `environment.apiBaseUrl` y activa `withCredentials` |
| `authRefreshInterceptor` | Ante un 401, refresca la sesión y reintenta la petición original |

El orden importa: los dos primeros trabajan mientras la URL sigue siendo relativa, y el último va al final para ser el primero en ver la respuesta.

### Sesión y almacenamiento

Los tokens **nunca** pasan por JavaScript. El backend los emite como cookies `HttpOnly` que el navegador adjunta solo. `LocalStorage` guarda únicamente datos de UX (identificador de dispositivo, último correo escrito) — nunca credenciales.

`AuthService.refreshSession()` es *single-flight*: si diez peticiones expiran a la vez, se refresca una sola vez y se reintentan las diez. Sin eso, cada una rotaría el refresh token por su cuenta y se invalidarían entre sí.

Una petición puede quedar fuera del refresco automático con el contexto `skipAuthRefresh()` — lo usan los propios endpoints de autenticación, donde un 401 significa "credenciales inválidas" o "sesión terminada", no "token vencido".

### Entornos

| Archivo | Uso | `apiBaseUrl` |
|---|---|---|
| `src/environments/environment.ts` | Producción | `https://api.scesi.org` |
| `src/environments/environment.development.ts` | Desarrollo | `/api` |

En desarrollo `proxy.conf.json` redirige `/api` a `http://localhost:8000`. Mantener el navegador en un solo origen hace que las cookies de sesión funcionen sin CORS.

## Estructura del Proyecto

```
src/app/
├── core/                    # Servicios singleton, guards, interceptors
│   ├── api/                 # Servicio HTTP genérico
│   ├── auth/                # Sesión, guard y modelo de usuario
│   ├── device/              # Descriptor del dispositivo (`device_info`)
│   ├── http/                # Cliente HTTP: interceptores y contexto
│   └── storage/             # LocalStorage, solo para datos de UX
├── shared/                  # Componentes reutilizables
│   └── components/
│       └── button/          # Botón con variantes (primary, secondary, danger)
└── features/                # Funcionalidades de la app (cada una autocontenida)
    └── home/                # Home page
        ├── components/
        ├── services/
        ├── models/
        ├── home.component.ts
        ├── home.routes.ts
        └── index.ts
```

### Reglas de Arquitectura

- **`core/`** solo depende de librerías externas. No importa de `shared/` ni `features/`.
- **`shared/`** depende de `core/`. No importa de `features/`.
- **`features/`** dependen de `core/` y `shared/`. No importan entre sí.
- Cada feature se carga de forma **lazy** bajo demanda.

## CI/CD

Pipeline de GitHub Actions ejecutado automáticamente en cada push y PR a las ramas `main` y `develop`:

| Job | Descripción |
|---|---|
| **Lint** | Verificación de reglas ESLint |
| **Type Check** | Validación de TypeScript estricto |
| **Unit Tests** | Ejecución de tests con Karma/Jasmine |
| **Build** | Compilación de producción (se ejecuta solo si los 3 anteriores pasan) |

## Ramas

- `main` — Producción, siempre estable
- `develop` — Desarrollo, integración de nuevas funcionalidades
