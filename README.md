# Yogurt Manager App 🍦📊

Micro aplicación web progresiva (*Local-First*, *Mobile-First* y *Desktop-Friendly*) para la gestión integral de producción artesanal de yogures, balance de stock por lote, finanzas bimonetarias ($ USD y Bs. BCV), ventas mixtas con cuentas por cobrar y respaldo dual (Local + Supabase).

---

## 🚀 Características Principales

1. **Trazabilidad por Lote e Inventario Dinámico:**
   - Control exacto de cuántas unidades se fabrican por lote, tamaño (120g, 350g, 500g) y sabor (8 opciones).
   - Descuento automático de stock al vender y reposición inmediata si se elimina una venta.
   - Cálculo automático de materia prima procesada en Kilogramos y Litros equivalentes.

2. **Gestión Bimonetaria ($ USD / Bs. BCV):**
   - Consulta automática de la tasa oficial del BCV desde `ve.dolarapi.com` con actualización manual editable.
   - Todos los precios, subtotales, totales y balances calculados y mostrados en ambas monedas en vivo.

3. **Ventas Mixtas y Carrito Interno:**
   - Permite agregar múltiples combinaciones de lotes y sabores en una misma compra.
   - Precios unitarios base configurables ($1.50, $3.50, $5.00) y editables libremente en cada fila.
   - Autocompletado de directorio de clientes con registro automático de nuevos clientes.

4. **Control de Cuentas por Cobrar (Deudores y Fiados):**
   - Badge y campana de notificaciones con alerta de ventas pendientes y monto total por cobrar.
   - Filtros de cobro por **Lote de producción**, por **Cliente** y por fecha.
   - Botón de acción rápida *"Marcar como Pagado"* con confeti festivo y recálculo instantáneo de flujo de caja.

5. **Separación Financiera Estricta:**
   - Distingue gastos operativos del negocio (`Yogurts`) de gastos personales (`Casa`).
   - Muestra la **Rentabilidad Devengada** (proyectada) y la **Rentabilidad en Caja** (dinero real cobrado menos insumos).

6. **Arquitectura Híbrida (Local-First + Supabase Cloud):**
   - Funciona sin internet ni configuración inicial guardando todo en `LocalStorage`.
   - Conexión opcional a Supabase PostgreSQL con prueba de conexión y sincronización en la nube.
   - Descarga y restauración completa en `.json` y exportación a `.csv` compatible con Excel.

---

## 🛠️ Requisitos

- **Node.js**: v20+ (para desarrollo local sin Docker)
- **Docker y Docker Compose**: Para levantar en contenedores

---

## 💻 Ejecución Local con Docker (Recomendado)

### 1. Levantar en Modo Producción (Puerto 8080)

Servido con Nginx de alto rendimiento:

```bash
docker compose up -d --build
```

Abre tu navegador en: [http://localhost:8080](http://localhost:8080)

Para detener los contenedores:
```bash
docker compose down
```

### 2. Levantar en Modo Desarrollo con Hot-Reload (Puerto 5173)

```bash
docker compose --profile dev up
```

Abre tu navegador en: [http://localhost:5173](http://localhost:5173)

---

## 💻 Ejecución Local con Node / NPM

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build
```

---

## 📦 Subir a GitHub

```bash
# 1. Inicializar repositorio Git (si no está iniciado)
git init

# 2. Agregar archivos y hacer el primer commit
git add .
git commit -m "feat: sistema completo de gestión de yogures artesanales dockerizado"

# 3. Vincular con tu repositorio en GitHub
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# 4. Subir el código
git push -u origin main
```

---

## ☁️ Configuración de Supabase (Opcional)

1. En tu proyecto de [Supabase](https://supabase.com), dirígete al **SQL Editor**.
2. Copia y ejecuta el contenido del archivo `supabase/schema.sql` (también disponible para copiar desde el módulo de *Nube y Respaldos* dentro de la app).
3. Copia tu **Project URL** y tu **anon public key**.
4. Puedes agregarlas en tu archivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```
   o configurarlas directamente desde el modal de ajustes en la barra superior de la aplicación.
