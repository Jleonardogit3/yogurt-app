# Ficha Técnica: Micro App de Gestión de Producción, Finanzas y Ventas de Yogures

## 1. Definición y Objetivos del Proyecto

Aplicación web progresiva (*Mobile-First* y *Desktop-Friendly*) de uso interno para gestionar de punta a punta un negocio artesanal de venta de yogures, completamente **dockerizada** y estructurada para control de versiones en **GitHub**.

### Objetivos Principales:

1. **Trazabilidad por Lote de Producción:** Controlar cuántos yogures se fabrican en cada tanda y descontar el inventario exactamente del lote, tamaño y sabor seleccionado al momento de vender.
2. **Gestión Bimonetaria (\$ USD / Bs. BCV):** Manejar precios base configurables en dólares con cálculo inmediato en Bolívares según la tasa oficial del BCV (con consulta automática y opción de edición manual).
3. **Control de Cuentas por Cobrar y Alertas:** Identificar pagos pendientes mediante notificaciones internas, permitiendo filtrar deudores por **Lote de Producción**, cliente o fecha.
4. **Separación Financiera Clara:** Distinguir los gastos operativos del negocio (`Yogurts`) de los gastos personales (`Casa`) para conocer la rentabilidad neta real del emprendimiento.
5. **Arquitectura Híbrida (*Local-First* + Nube):** Operación instantánea en el dispositivo mediante almacenamiento local (`LocalStorage`) con sincronización y respaldo en la nube (**Supabase**) + exportación en JSON/CSV.
6. **Portabilidad con Docker y GitHub:** Entorno contenerizado listo para levantar con un solo comando (`docker compose up -d`) y preparado con buenas prácticas de seguridad para publicar en un repositorio de GitHub sin exponer credenciales.

---

## 2. Catálogos Base y Reglas de Negocio

### 2.1. Catálogo de Tamaños y Precios Base (Editables)

Los precios predeterminados pueden modificarse globalmente en el panel de configuración o puntualmente dentro de cada fila de venta:

* **Pequeño ($120\text{g}$):** $\$1.50\text{ USD}$
* **Mediano ($350\text{g}$):** $\$3.50\text{ USD}$
* **Grande ($500\text{g}$):** $\$5.00\text{ USD}$

### 2.2. Catálogo de Sabores Fijos (8 Opciones)

1. Piña
2. Durazno
3. Fresa
4. Mora
5. Piña con coco
6. Durazno con fresa
7. Piña con fresa
8. Natural

### 2.3. Fórmulas de Negocio y Conversión

* **Peso Total Procesado (en Kg/Litros equivalentes):**
  $$\text{Peso Total (Kg)} = \frac{\sum (\text{Cantidad}_i \times \text{Gramos del Tamaño}_i)}{1000}$$

* **Conversión Cambiaria BCV:**
  $$\text{Monto en Bs.} = \text{Monto en USD} \times \text{Tasa BCV del Día}$$

* **Rentabilidad Neta del Negocio:**
  $$\text{Rentabilidad Neta} = \text{Ingresos Totales por Ventas} - \text{Gastos Categoría Yogurts}$$
  *(Nota: Se muestra tanto la Rentabilidad Devengada [incluyendo ventas pendientes de cobro] como la Rentabilidad en Caja [solo ventas cobradas]).*

---

## 3. Alcance Funcional por Módulo (Navegación Lateral)

### Barra Superior Global (Header)

* **Control de Tasa BCV:** Muestra la tasa del día en $\text{Bs./USD}$ (obtenida automáticamente de API pública como `ve.dolarapi.com/v1/dolares/oficial` con botón de refrescar y edición manual).
* **Campana / Badge de Notificaciones de Cobro:** Contador en vivo con el número de clientes con **Pagos Pendientes** y el monto total por cobrar en $\text{USD}$ y $\text{Bs.}$ Al hacer clic, despliega o filtra la lista de cuentas pendientes.
* **Botón de Configuración de Precios y Sincronización:** Permite ajustar los precios base ($120\text{g}$, $350\text{g}$, $500\text{g}$) y ver el estado de sincronización Local / Nube.

### Módulo 1: Producciones (Lotes e Inventario)

* **Formulario de Registro:**
  * `Fecha de preparación` (por defecto hoy).
  * `Código/Nombre de Lote` (autogenerado editable, ej. `Lote #01 - 19 Oct`).
  * `Notas del lote` (opcional).
  * `Filas dinámicas de producción`: Selector de **Tamaño** ($500\text{g}$, $350\text{g}$, $120\text{g}$) + Selector de **Sabor** (los 8 sabores) + **Cantidad Producida**.
* **Lógica de Inventario por Lote:**
  * Cada ítem de una tanda guarda `cantidad_producida` y `cantidad_disponible`.
* **KPIs en Pantalla:**
  * Total de yogures producidos (en la tanda seleccionada y acumulado del mes) vs. stock disponible actual.
  * Desglose rápido de unidades por tamaño ($500\text{g}$ / $350\text{g}$ / $120\text{g}$).
  * Gramos y Kilogramos/Litros totales procesados.

### Módulo 2: Gastos (Negocio vs. Hogar)

* **Formulario de Registro:**
  * `Fecha`
  * `Descripción del consumo` (ej. Leche, fruta, envases, azúcar o Mercado familiar).
  * `Categoría`: Selector entre **Yogurts** (Insumos y producción) y **Casa** (Gastos personales/hogar).
  * `Monto`: Ingreso en $\text{USD}$ (o en $\text{Bs.}$ convirtiendo automáticamente con la tasa BCV activa).
  * `Lote asociado` (opcional, por si se desea vincular un gasto de insumos a una producción específica).
* **KPIs y Filtros en Pantalla:**
  * **Total Gastos de Yogurts** ($\text{USD}$ y $\text{Bs.}$).
  * **Total Gastos de Casa** ($\text{USD}$ y $\text{Bs.}$).
  * **Filtro rápido por pestañas:** `Todos` | `Solo Negocio (Yogurts)` | `Solo Personal (Casa)` + filtro por mes.

### Módulo 3: Ingresos, Ventas Mixtas y Cuentas por Cobrar

* **Formulario de Venta Mixta (Carrito Interno):**
  * `Fecha de venta`
  * `Nombre del Cliente`: Input con **autocompletado** de clientes registrados; si el nombre no existe, lo crea automáticamente en el directorio de clientes.
  * `Estado del Pago`: Selector `Pagado` o `Pendiente de pago` (Fiado / Por cobrar).
  * `Filas de Venta (Multiproducto)`:
    1. **Selector de Lote de Producción** (solo muestra lotes con stock $> 0$).
    2. **Selector de Tamaño + Sabor** disponible en ese lote (muestra entre paréntesis cuántos quedan disponibles, ej. `Grande 500g - Fresa (Quedan 6)`).
    3. **Cantidad a vender** (valida que no supere el stock disponible del lote).
    4. **Precio Unitario ($\text{USD}$)**: Se autocompleta con $\$1.50$, $\$3.50$ o $\$5.00$ según el tamaño, pero es **100% editable** en el momento.
    5. **Subtotal de fila**: Calcula $\text{Cantidad} \times \text{Precio}$ en $\text{USD}$ y su equivalente en $\text{Bs.}$
* **Gestión de Pagos Pendientes (Notificaciones y Filtros):**
  * Alerta destacada con listado de ventas en estado `Pendiente`.
  * **Filtro de Cuentas por Cobrar por Lote de Producción**, por Cliente y por rango de fechas (permite responder: *"¿Quiénes me deben yogures de la producción del lunes?"*).
  * Botón de acción rápida **"Marcar como Pagado"** que actualiza el estado y recalcula el flujo de caja al instante.
* **KPIs e Historial en Pantalla:**
  * **Ingresos Totales Acumulados** (Desglosado en *Cobrado* y *Por Cobrar*, en $\text{USD}$ y $\text{Bs.}$).
  * **Rentabilidad Neta del Negocio** ($\text{Ingresos} - \text{Gastos de Yogurts}$).
  * **Directorio e Historial por Cliente:** Al seleccionar un cliente, muestra todas sus compras históricas, sabores preferidos, total comprado y saldo pendiente.

---

## 4. Arquitectura de Datos (Local + Supabase)

### 4.1. Estrategia Dual (Offline-First + Cloud Backup)

1. **Capa Local Inmediata:** Todo cambio se guarda instantáneamente en `LocalStorage` para operar incluso sin internet.
2. **Capa de Sincronización en la Nube (Supabase):** Si el usuario configura sus credenciales (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`) por variables de entorno o desde el modal de configuración en la app, los datos se sincronizan con PostgreSQL en Supabase. Además, incluye exportación/importación manual en JSON y CSV.

### 4.2. Script SQL para Supabase (`supabase/schema.sql`)

```sql
-- 1. Tabla de Configuración (Tasa BCV y Precios Editables)
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bcv_rate NUMERIC(12,2) NOT NULL DEFAULT 40.00,
  price_120g NUMERIC(10,2) NOT NULL DEFAULT 1.50,
  price_350g NUMERIC(10,2) NOT NULL DEFAULT 3.50,
  price_500g NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Lotes de Producción (Cabecera)
CREATE TABLE production_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code TEXT NOT NULL,
  prep_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Ítems por Lote de Producción (Detalle y Stock)
CREATE TABLE production_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES production_batches(id) ON DELETE CASCADE,
  size TEXT NOT NULL CHECK (size IN ('120g', '350g', '500g')),
  flavor TEXT NOT NULL,
  quantity_produced INTEGER NOT NULL CHECK (quantity_produced > 0),
  quantity_remaining INTEGER NOT NULL CHECK (quantity_remaining >= 0)
);

-- 5. Tabla de Gastos
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Yogurts', 'Casa')),
  amount_usd NUMERIC(12,2) NOT NULL,
  bcv_rate_used NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabla de Ventas / Ingresos (Cabecera)
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_date DATE NOT NULL,
  client_id UUID REFERENCES clients(id),
  client_name TEXT NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('Pagado', 'Pendiente')),
  total_usd NUMERIC(12,2) NOT NULL,
  bcv_rate_used NUMERIC(12,2) NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Tabla de Detalle de Venta (Conectada al Lote de Producción)
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES production_batches(id),
  production_item_id UUID REFERENCES production_items(id),
  size TEXT NOT NULL,
  flavor TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_usd NUMERIC(10,2) NOT NULL,
  subtotal_usd NUMERIC(12,2) NOT NULL
);
```

---

## 5. Arquitectura Docker y Despliegue en GitHub

### 5.1. Estructura de Archivos del Proyecto

```text
yogurt-manager-app/
├── src/                      # Código fuente React + TypeScript
├── supabase/
│   └── schema.sql            # Script SQL para inicializar la nube
├── Dockerfile                # Construcción multi-etapa (Node 20 Alpine -> Nginx Alpine)
├── docker-compose.yml        # Perfiles para desarrollo (hot-reload) y producción
├── nginx.conf                # Configuración SPA para rutas de React
├── .dockerignore             # Evita copiar node_modules y .git al contenedor
├── .gitignore                # Protege .env y archivos temporales al subir a GitHub
├── .env.example              # Plantilla de variables para clonar desde GitHub
└── README.md                 # Documentación de instalación con Docker y Git
```

### 5.2. Configuración de Contenedores (Archivos Base)

#### `Dockerfile` (Multi-stage optimizado)
```dockerfile
# Etapa 1: Construcción (Build)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor de Producción ligero con Nginx
FROM nginx:stable-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### `docker-compose.yml` (Producción y Desarrollo en un comando)
```yaml
services:
  # Servicio de Producción (Puerto 8080)
  yogurt-app-prod:
    build:
      context: .
      target: production
    container_name: yogurt-manager-prod
    ports:
      - "8080:80"
    env_file:
      - .env
    restart: unless-stopped

  # Servicio de Desarrollo con Hot-Reload (Puerto 5173)
  yogurt-app-dev:
    image: node:20-alpine
    container_name: yogurt-manager-dev
    working_dir: /app
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    env_file:
      - .env
    command: sh -c "npm install && npm run dev -- --host 0.0.0.0"
    profiles:
      - dev
```

### 5.3. Flujo Rápido para Subir a GitHub y Ejecutar en Docker

Una vez que **Antigravity** genere los archivos del proyecto, solo debes abrir la terminal integrada y ejecutar:

```bash
# 1. Inicializar Git y crear el primer commit
git init
git add .
git commit -m "feat: versión inicial del sistema de gestión de yogures dockerizado"

# 2. Conectar con tu repositorio de GitHub y subir el código
git branch -M main
git remote add origin https://github.com/TU_USUARIO/yogurt-manager-app.git
git push -u origin main

# 3. Levantar la app en Docker (Modo Producción en http://localhost:8080)
docker compose up -d --build

# (Opcional) Levantar en Modo Desarrollo con recarga en vivo (http://localhost:5173)
docker compose --profile dev up
```

---

## 6. Prompt Maestro para Antigravity (Copiar y Pegar)

Copia el bloque a continuación y pégalo directamente en **Antigravity** para que construya tanto la aplicación completa como toda la infraestructura de Docker y GitHub:

```text
Actúa como un Arquitecto de Software Senior, Especialista DevOps y Desarrollador Full-Stack experto en React, TypeScript, Tailwind CSS, Supabase y Docker. Construye una micro aplicación web completa, moderna, responsiva (Mobile-First y Desktop con Sidebar lateral) para la gestión integral de mi negocio de venta de yogures artesanales, totalmente dockerizada y lista para subir a GitHub.

### 1. REGLAS DE NEGOCIO Y CATÁLOGOS FIJOS
- **Tamaños y Pesos:**
  - Pequeño (120g) -> Precio base por defecto: $1.50 USD
  - Mediano (350g) -> Precio base por defecto: $3.50 USD
  - Grande (500g) -> Precio base por defecto: $5.00 USD
  *Los precios base deben ser configurables globalmente en un modal de ajustes y también editables manualmente en cada fila de venta.*
- **Sabores (8 opciones fijas):** Piña, Durazno, Fresa, Mora, Piña con coco, Durazno con fresa, Piña con fresa, Natural.
- **Moneda Dual ($ USD y Bs. a tasa BCV):**
  - Incluye en la barra superior un control de "Tasa BCV (Bs./$)" que intente consultar automáticamente `https://ve.dolarapi.com/v1/dolares/oficial` al iniciar, pero permita editar el valor manualmente en cualquier momento.
  - Todos los totales, precios y KPIs deben mostrar el monto principal en Dólares ($ USD) y debajo o al lado su equivalente en Bolívares (Bs.).

### 2. ESTRUCTURA DE NAVEGACIÓN (SIDEBAR LATERAL + HEADER CON NOTIFICACIONES)
Crea una barra lateral (y navegación inferior en móvil) con estas vistas:
1. **Producciones (Lotes y Stock)**
2. **Ingresos y Ventas (Con Cuentas por Cobrar)**
3. **Gastos (Yogurts vs. Casa)**
4. **Clientes y Deudores (Historial y Alertas)**
5. **Respaldo y Nube (Local + Supabase)**

En el Header superior incluye una **Campana de Notificaciones de Pagos Pendientes** con un badge numérico que indique cuántas ventas están en estado "Pendiente" y cuánto dinero suman en $ y Bs. Al hacer clic, debe llevar directo al listado filtrado de cuentas por cobrar.

### 3. REQUERIMIENTOS FUNCIONALES POR MÓDULO

#### A. Módulo 1: Producciones
- Formulario para crear una tanda/lote de producción con:
  - Fecha de preparación, Nombre/Código automático del lote (ej. "Lote #01 - [Fecha]") y Notas opcionales.
  - Filas dinámicas para agregar múltiples combinaciones en la misma tanda: [Tamaño (500g/350g/120g)] + [Sabor (los 8 definidos)] + [Cantidad].
- Cada fila producida genera stock disponible asociado a ese Lote específico (`cantidad_producida` y `cantidad_disponible`).
- **KPIs en pantalla:**
  - Total de yogures producidos (en la tanda, en el mes y cuántos quedan disponibles en stock).
  - Desglose rápido por tamaño (500g / 350g / 120g).
  - Gramos y Kilogramos/Litros totales procesados (calculando 500g, 350g y 120g por unidad).
- Lista de lotes creados mostrando una barra de progreso del stock restante por cada sabor y tamaño en ese lote.

#### B. Módulo 2: Gastos
- Formulario con: Fecha, Descripción del consumo (ej. Leche, fruta, envases o Mercado), Categoría ("Yogurts" para insumos del negocio o "Casa" para gastos personales/hogar), y Monto (permitiendo ingresar en $ USD o en Bs. convirtiendo a $ según la tasa BCV activa).
- **KPIs en pantalla:**
  - Total Gastos de Yogurts ($ y Bs.).
  - Total Gastos de Casa ($ y Bs.).
  - Filtro rápido por botones/pestañas para separar las cuentas del negocio ("Yogurts") de las personales ("Casa").

#### C. Módulo 3: Ingresos / Ventas (Conectado al Stock de Producciones)
- Formulario de Venta Mixta (permite vender varios sabores/tamaños en una misma compra):
  - Fecha de venta.
  - Nombre del Cliente con **autocompletado** de clientes ya registrados (si es un nombre nuevo, lo registra automáticamente en el catálogo de clientes).
  - Estado de la cuenta: **"Pagado"** o **"Pendiente"** (por cobrar/fiado).
  - **Filas dinámicas de venta:**
    1. Seleccionar **Lote de Producción** (solo lotes con unidades disponibles).
    2. Seleccionar **Tamaño + Sabor** disponible dentro de ese lote (mostrando cuántos quedan en stock, ej: "500g - Fresa (Disp: 8)").
    3. Ingresar **Cantidad** (validando que no supere el stock disponible de ese lote).
    4. **Precio Unitario ($):** Se rellena automáticamente según el tamaño ($1.50, $3.50 o $5.00), pero el input debe ser editable por si hago un descuento o cambio de precio.
    5. Subtotal automático en $ y Bs.
- **Al guardar la venta:** Descuenta automáticamente la cantidad vendida del `stock_disponible` del Lote, Tamaño y Sabor seleccionado.
- **Sección y Filtros de Pagos Pendientes:**
  - Permite filtrar la tabla de ventas por: Estado (`Todos`, `Pagados`, `Pendientes de Pago`), por **Lote de Producción**, y por **Cliente**.
  - Incluye un botón rápido "Marcar como Pagado" en cada venta pendiente.
- **KPIs en pantalla:**
  - Ingresos Totales Acumulados (separando "Cobrado en Caja" vs. "Por Cobrar Pendiente").
  - **Rentabilidad Neta del Negocio:** `Ingresos de Yogurts - Gastos de Yogurts` (sin mezclar los gastos de Casa).
  - Vista de **Historial de compras por cliente** (total comprado, saldo pendiente y detalle de qué lotes/sabores ha llevado).

### 4. ARQUITECTURA DE DATOS: LOCAL-FIRST + SINCRONIZACIÓN SUPABASE
- Implementa un sistema de persistencia dual:
  1. **LocalStorage inmediato:** Toda la data (lotes, ventas, gastos, clientes, precios y tasa BCV) se guarda automáticamente en `localStorage` para que la app funcione sin configuración previa ni internet, cargando datos de demostración iniciales si está vacía.
  2. **Sincronización con Supabase + Respaldos:** Crea una pestaña de "Nube y Respaldos" donde pueda:
     - Leer `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` desde variables de entorno o ingresarlas manualmente desde la interfaz para sincronizar mis datos locales con Supabase.
     - Descargar toda mi base de datos en un archivo `.json` o exportar tablas a `.csv` (Excel) y restaurar desde un archivo `.json`.
  3. Genera también el archivo `supabase/schema.sql` con las tablas necesarias.

### 5. DOCKERIZACIÓN Y PREPARACIÓN PARA GITHUB (OBLIGATORIO)
Genera en la raíz del proyecto todos los archivos de infraestructura para contenedores y control de versiones:
1. **`Dockerfile`:** Multi-etapa usando `node:20-alpine` para el build de Vite y `nginx:stable-alpine` para servir la aplicación en producción en el puerto 80.
2. **`nginx.conf`:** Configurado con `try_files $uri $uri/ /index.html;` para soportar rutas SPA sin errores 404.
3. **`docker-compose.yml`:** Con dos servicios: `yogurt-app-prod` (puerto `8080:80`) y `yogurt-app-dev` con volúmenes para hot-reload en desarrollo (puerto `5173:5173` bajo el perfil `dev`).
4. **`.dockerignore` y `.gitignore`:** Configurados para excluir `node_modules`, `dist`, `.env` y archivos del sistema operativo.
5. **`.env.example`:** Plantilla limpia con `VITE_SUPABASE_URL=` y `VITE_SUPABASE_ANON_KEY=`.
6. **`README.md`:** Documentación clara con los comandos exactos para levantar el contenedor en Docker y subir el repositorio a GitHub.
```