code
Markdown
# NBL Cinemax - Plataforma Web de Cine Full-Stack 
Autores
*  Brayan Yecid Aparicio Goyeneche
*  Neider Alirio Piza Basto
*  Leider Joanny Esteban Lozano

*  GitHub: [https://github.com/NeyderPiza/ProyectoEntornosFinal/tree/rama3]

![Captura de pantalla de la Cartelera de NBL Cinemax](/image.png)
## Introducción

**NBL Cinemax** es una aplicación web full-stack completa que simula la plataforma de una cadena de cines moderna. Permite a los usuarios explorar la cartelera de películas, filtrar por ciudad, ver detalles y horarios, seleccionar asientos en un mapa interactivo y realizar reservas. Además, cuenta con un robusto panel de administración para gestionar todos los aspectos del cine: películas, salas, ciudades y funciones.

Este proyecto fue desarrollado como una demostración integral de habilidades en desarrollo frontend con **React** y desarrollo backend con **Node.js, Express y PostgreSQL**.

---

## Características Principales

### Para Clientes y Visitantes:
*   **Autenticación de Usuarios:** Sistema completo de registro e inicio de sesión con tokens JWT para seguridad.
*   **Cartelera Interactiva:** Visualización de todas las películas disponibles con un diseño moderno y responsivo.
*   **Búsqueda y Filtrado:** Filtra películas por título y por ciudad para encontrar funciones relevantes.
*   **Página de Detalles:** Vista inmersiva para cada película con sinopsis, información técnica y horarios disponibles.
*   **Selección de Asientos:** Interfaz gráfica para seleccionar asientos en un mapa de la sala en tiempo real.
*   **Proceso de Reserva:** Flujo completo de compra con resumen y confirmación.
*   **Confirmación por Email:** Envío automático de un correo de confirmación al usuario tras una compra exitosa, utilizando **SendGrid**.
*   **Historial de Compras:** Página de perfil donde el usuario puede ver todas sus reservas pasadas y futuras.

### Para Administradores:
*   **Panel de Administración Seguro:** Ruta protegida accesible solo para usuarios con rol de administrador.
*   **Gestión CRUD Completa:**
    *   **Ciudades:** Añadir, editar y eliminar las ciudades donde opera el cine.
    *   **Salas:** Crear, actualizar y eliminar salas, asignándolas a una ciudad.
    *   **Películas:** Gestionar el catálogo completo de películas con todos sus detalles (título, sinopsis, director, póster, etc.).
    *   **Funciones:** Programar nuevas funciones (horarios) para una película en una sala específica.
*   **Interfaz Optimizada:** Diseño basado en modales y una interfaz limpia para una gestión de datos eficiente.

---

## Tecnologías Utilizadas

### Frontend:
*   **React 18:** Para la construcción de la interfaz de usuario.
*   **Vite:** Herramienta de desarrollo frontend ultrarrápida.
*   **React Router v6:** Para el enrutamiento del lado del cliente.
*   **Axios:** Para realizar peticiones HTTP al backend.
*   **FontAwesome:** Para la iconografía en toda la aplicación.
*   **CSS Puro:** Estilización personalizada para lograr un diseño único y moderno.

### Backend:
*   **Node.js:** Entorno de ejecución de JavaScript.
*   **Express.js:** Framework para la construcción de la API REST.
*   **PostgreSQL:** Base de datos relacional para el almacenamiento de datos.
*   **JWT (JSON Web Tokens):** Para la autenticación y autorización segura.
*   **bcrypt.js:** Para el hasheo seguro de contraseñas.
*   **cors:** Para habilitar peticiones de origen cruzado.
*   **dotenv:** Para la gestión de variables de entorno.

### Servicios Externos y Base de Datos:
*   **Neon.tech:** Proveedor de base de datos PostgreSQL serverless.
*   **SendGrid:** Servicio para el envío de correos electrónicos transaccionales.

---

## Despliegue y Puesta en Marcha

Sigue estos pasos para levantar el proyecto en un entorno de desarrollo local.

### Prerrequisitos
*   Node.js (v18 o superior)
*   npm
*   Git
*   Una base de datos PostgreSQL (se recomienda [Neon.tech](https://neon.tech/))

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
2. Configuración del Backend
Navega a la carpeta del backend:
code
Bash
cd backend
Instala las dependencias:
code
Bash
npm install
Crea el archivo de variables de entorno:
Crea un archivo llamado .env en la raíz de la carpeta /backend y añade las siguientes variables. Reemplaza los valores con tus propias credenciales.
code
Env
# /backend/.env

# URL de conexión a tu base de datos PostgreSQL
DATABASE_URL="postgresql://usuario:contraseña@host:port/database?sslmode=require"

# Secreto para firmar los JSON Web Tokens (JWT)
JWT_SECRET="UNA_CADENA_DE_TEXTO_MUY_SECRETA_Y_LARGA"

# Credenciales del servicio de correo SendGrid
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="el_correo_que_verificaste@ejemplo.com"
Inicia el servidor del backend:
code
Bash
npm run dev
El servidor se estará ejecutando en http://localhost:5000.
3. Configuración del Frontend
Abre una nueva terminal y navega a la carpeta del frontend:
code
Bash
cd frontend
Instala las dependencias:
code
Bash
npm install
Inicia la aplicación de React:
code
Bash
npm run dev
La aplicación estará disponible en http://localhost:5173 (o el puerto que indique Vite).
¡Y listo! La aplicación debería estar completamente funcional en tu máquina local.
