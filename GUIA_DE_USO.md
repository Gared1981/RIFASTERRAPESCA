# 📋 Guía de Uso - Sorteos Terrapesca

## 🌐 Acceso a la Aplicación
**URL de Producción:** https://voluble-marigold-f68bd1.netlify.app

---

## 👥 Tipos de Usuarios

### 🔓 Usuario Público (Sin registro)
- Ver sorteos disponibles
- Comprar boletos
- Verificar estado de boletos
- Contactar soporte

### 🔐 Administrador
- **Email:** admin@terrapesca.com
- **Contraseña:** Terrapesca2025!
- Gestión completa de sorteos y boletos

---

## 🎯 Funcionalidades Principales

### 1. 🏠 Página de Inicio
- **Acceso:** Página principal
- **Funciones:**
  - Ver sorteos activos destacados
  - Acceso rápido a compra de boletos
  - Verificación de boletos
  - Información de la empresa

### 2. 🎫 Compra de Boletos
- **Acceso:** Menú "Boletos" o botón "Ver todos los sorteos"
- **Proceso:**
  1. Navega por nuestro catálogo de sorteos activos
  2. Reserva en línea - Completa el formulario con tus datos personales para reservar los boletos seleccionados
  3. Paga directamente tus boletos con pago seguro de Mercado Pago o bien puedes realizar el proceso vía WhatsApp
  4. ¡Espera el sorteo! - Una vez confirmado tu pago, solo queda esperar al día del sorteo. ¡Buena suerte!

### 3. 🔍 Verificar Boletos
- **Acceso:** Menú "Verificar"
- **Función:** Consultar estado de cualquier boleto por número
- **Estados posibles:**
  - ✅ Disponible
  - ⏳ Reservado
  - 💰 Pagado

### 4. 📞 Contacto
- **Acceso:** Menú "Contacto"
- **Información disponible:**
  - Teléfono: +52 668 688 9571
  - Email: ventasweb@terrapesca.com
  - WhatsApp directo
  - Redes sociales

---

## 🛠 Panel de Administración

### Acceso al Admin
1. Ir a `/admin` en la URL
2. Iniciar sesión con credenciales de administrador
3. Acceso a dos módulos principales:

### 📊 Gestión de Boletos
- **Funciones:**
  - Ver todos los boletos por sorteo
  - Filtrar por estado (disponible, reservado, pagado)
  - Buscar por número, nombre o teléfono
  - Confirmar pagos manualmente
  - Liberar boletos reservados
  - Exportar datos a CSV
  - Ver estadísticas en tiempo real

### 👥 Gestión de Promotores
- **Funciones:**
  - Crear/editar promotores
  - Generar enlaces personalizados
  - Ver estadísticas de ventas
  - Gestionar comisiones
  - Activar/desactivar promotores

### 🎰 Gestión de Sorteos
- **Acceso:** `/admin/sorteos`
- **Funciones:**
  - Crear nuevos sorteos
  - Editar sorteos existentes
  - Cambiar estados (borrador → activo → completado)
  - Gestionar galería de imágenes y videos
  - Configurar lista de premios
  - Ver enlaces públicos

---

## 💳 Sistema de Pagos

### Mercado Pago (Automático)
- **Métodos aceptados:**
  - Tarjetas de crédito/débito
  - Transferencias bancarias
  - Billeteras digitales
- **Proceso:**
  1. Selección de boletos
  2. Datos personales
  3. Redirección a Mercado Pago
  4. Confirmación automática

### WhatsApp (Manual)
- **Proceso:**
  1. Selección de boletos
  2. Datos personales
  3. Mensaje automático a WhatsApp
  4. Coordinación manual del pago
  5. Confirmación por administrador

---

## 🏆 Sistema de Promotores

### Para Promotores
- **Enlace personalizado:** `/boletos?promo=CODIGO`
- **Comisiones:**
  - $1,000 MXN por boleto vendido
  - $1,000 MXN adicional si su boleto gana
- **Seguimiento:** Dashboard con estadísticas

### Para Administradores
- **Gestión completa:**
  - Crear códigos de promotor
  - Generar enlaces personalizados
  - Ver estadísticas de ventas
  - Gestionar comisiones

---

## 📱 Características Técnicas

### Responsive Design
- ✅ Móviles
- ✅ Tablets
- ✅ Desktop

### Funcionalidades Avanzadas
- 🔄 Actualización en tiempo real
- ⏰ Sistema de reservas (3 horas)
- 🔒 Seguridad con RLS
- 📊 Analytics integrado
- 🎨 Galería multimedia
- 🎬 Soporte para videos

---

## 🚀 Flujo de Trabajo Típico

### Para Usuarios (Compra)
1. **Entrar** → Página principal
2. **Explorar** → Navegar por catálogo de sorteos activos
3. **Seleccionar** → Elegir sorteo y boletos
4. **Reservar** → Completar formulario con datos personales
5. **Pagar** → Mercado Pago seguro o WhatsApp
6. **Esperar** → ¡Buena suerte en el sorteo!

### Para Administradores (Gestión)
1. **Login** → Panel de administración
2. **Crear** → Nuevo sorteo con detalles
3. **Activar** → Cambiar estado a activo
4. **Monitorear** → Ver ventas en tiempo real
5. **Gestionar** → Confirmar pagos manuales
6. **Finalizar** → Realizar sorteo y asignar ganador

---

## 📞 Soporte y Contacto

### Información de Contacto
- **WhatsApp:** +52 668 688 9571
- **Email:** ventasweb@terrapesca.com
- **Dirección:** Calle Niños Héroes 775, Los Mochis, Sinaloa

### Redes Sociales
- **Facebook:** @Terrapesca
- **Instagram:** @terrapesca
- **YouTube:** @terrapesca
- **TikTok:** @terrapesca

---

## ⚠️ Notas Importantes

### Reservas de Boletos
- Los boletos se reservan por **3 horas**
- Después de este tiempo, vuelven a estar disponibles
- Se requiere pago para confirmar la reserva

### Estados de Sorteos
- **Borrador:** No visible públicamente
- **Activo:** Disponible para compra
- **Completado:** Sorteo realizado

### Seguridad
- Todos los pagos son procesados de forma segura
- Datos personales protegidos
- Sistema de auditoría completo

---

## 🔧 Configuración Técnica (Solo Administradores)

### Variables de Entorno Requeridas
```
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
MERCADO_PAGO_ACCESS_TOKEN=token_de_produccion
MERCADO_PAGO_PUBLIC_KEY=clave_publica
```

### Base de Datos
- **Supabase:** Base de datos principal
- **RLS:** Seguridad a nivel de fila
- **Webhooks:** Integración con Mercado Pago

---

*Esta guía cubre todas las funcionalidades principales de la aplicación. Para soporte adicional, contacta al equipo técnico.*