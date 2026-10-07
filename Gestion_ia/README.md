# Fiscalizacion IA - Gestion Ia

Plataforma web de fiscalización inteligente construida con Angular 22 y un backend API en Node.js/Express con PostgreSQL. Incluye módulos de análisis individual, análisis comportamental, procesos de fiscalización, reglas, auditoría y administración de usuarios/roles/permisos.

---

## Requisitos previos

| Herramienta | Versión mínima | Comando de verificación |
|-------------|---------------|------------------------|
| Node.js | 22+ | `node --version` |
| npm | 10+ | `npm --version` |
| Angular CLI | 22.1.5+ | `ng version` |
| PostgreSQL | 15+ | Solo para el backend |

> **Nota:** Este proyecto fue desarrollado con Node.js v24.18.0, npm 12.0.1 y Angular CLI 22.1.5.

---

## Instalación

```bash
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd Gestion_ia

# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend (opcional, solo si se ejecuta el server local)
cd server
npm install
cd ..
```

---

## Desarrollo

```bash
# Iniciar el servidor de desarrollo (frontend)
ng serve

# La aplicación estará disponible en:
# http://localhost:4200
#
# El proxy redirige /api/* al backend en http://99.0.3.8:8002
```

### Backend local (opcional)

```bash
cd server
node index.js
# API disponible en http://localhost:8002
```

---

## Build de producción

```bash
ng build --configuration production
```

El build se genera en `dist/Fiscalizacion_ia/`. Los archivos están optimizados, minificados y con hash para cache-busting.

### Build de desarrollo

```bash
ng build --configuration development
```

---

## Estructura del proyecto

```
Gestion_ia/
├── src/
│   ├── app/
│   │   ├── core/              # Servicios core (auth, interceptors, guards)
│   │   ├── features/          # Módulos de funcionalidad
│   │   │   ├── admin/         # Administración (usuarios, roles, permisos, auditoría)
│   │   │   ├── analisis/      # Análisis individual y comportamental
│   │   │   ├── auth/          # Login y autenticación
│   │   │   ├── dashboard/     # Panel principal
│   │   │   ├── fiscalizacion/ # Procesos y reglas de fiscalización
│   │   │   └── home/          # Landing page
│   │   ├── layout/            # Componentes de layout (header, sidebar)
│   │   └── shared/            # Componentes reutilizables (mapa, tablas, modales)
│   ├── environments/          # Configuración por entorno
│   │   ├── environment.ts                  # Base (desarrollo por defecto)
│   │   ├── environment.development.ts      # Desarrollo (proxy local)
│   │   └── environment.production.ts       # Producción (API remota)
│   ├── index.html
│   ├── main.ts
│   └── styles.css             # Estilos globales (Bootstrap + Angular Material)
├── server/                    # Backend API (Node.js/Express + PostgreSQL)
│   ├── index.js               # Servidor principal con auth JWT
│   └── package.json
├── database/
│   └── security/              # Scripts SQL (schema, índices, funciones, triggers, seeds)
├── public/                    # Assets estáticos
├── postman/                   # Colección Postman para testing de la API
├── angular.json               # Configuración de Angular CLI
├── proxy.conf.js              # Proxy para desarrollo (redirige /api al backend)
├── vite.config.ts             # Configuración Vitest para tests
└── package.json               # Dependencias del frontend
```

---

## Testing

```bash
# Ejecutar tests unitarios (Vitest)
ng test
```

---

## Entrega de artefactos

- **Código fuente:** Repositorio Git completo con `.gitignore` configurado
- **Build de producción:** `dist/Fiscalizacion_ia_production.zip` (empaquetado listo para deploy)

---

## Variables de entorno

| Archivo | Propósito | Production API URL |
|---------|-----------|-------------------|
| `environment.ts` | Base (desarrollo por defecto) | `/api/v1` (proxy) |
| `environment.development.ts` | Desarrollo local | `/api/v1` (proxy) |
| `environment.production.ts` | Producción | `http://99.0.3.8:8002/api/v1` |

---

## Tecnologías

- **Frontend:** Angular 22, Angular Material, Bootstrap 5, Leaflet (mapas), SweetAlert2
- **Backend:** Node.js, Express 4, PostgreSQL (pg), JWT (jsonwebtoken), bcryptjs
- **Testing:** Vitest
- **Build:** Angular CLI 22.1.5, Vite
