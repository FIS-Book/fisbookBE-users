# 👥 Microservicio REST - Users Service

Este proyecto es un microservicio REST diseñado para gestionar usuarios. Implementa una arquitectura moderna orientada a microservicios y está desarrollado utilizando tecnologías avanzadas.

## 🚀 Características Principales
- **Gestión de usuarios:** Proporciona endpoints REST para gestionar datos de usuarios, incluyendo la creación, consulta, actualización y eliminación.
- **Persistencia:** UUtiliza MongoDB Atlas como base de datos NoSQL para almacenar la información de los usuarios.
- **Documentación interactiva:** Swagger para visualizar y probar los endpoints de forma sencilla.
- **Pruebas:** Incluye pruebas unitarias e integración para garantizar la calidad del código.
- **Despliegue:** El microservicio está preparado y desplegado en Azure, utilizando contenedores Docker para garantizar portabilidad y escalabilidad.

## 🛠️ Tecnologías y Herramientas Usadas
- **Node.js:** Plataforma de desarrollo utilizada como base del microservicio.
- **Express.js** Framework para la creación de APIs REST.
- **Swagger:** Herramienta para la documentación interactiva de la API.
- **Docker:** Utilizado para empaquetar y desplegar el microservicio en contenedores.
- **Jest:** Framework para pruebas unitarias e integración.
- **MongoDB Atlas:** Base de datos NoSQL en la nube para almacenar y gestionar la información de los usuarios.

## 📋 Operaciones Disponibles
El microservicio expone las siguientes APIs REST para interactuar con los datos de los usuarios:

### 1. Obtener lista de usuarios
- **Método:** GET
- **URL:** `/users`
- **Descripción:** Obtiene una lista de todos los usuarios.
- **Respuestas:**
  - **200:** Lista de usuarios.
  - **500:** Error en el servidor.

### 2. Crear un usuario
- **Método:** POST
- **URL:** `/users`
- **Descripción:** Crea un nuevo usuario.
- **Cuerpo de la solicitud:**
  ```json
  {
        "id": "string",
        "nombre": "string",
        "apellidos": "string",
        "email": "string",
        "plan": "string",
        "tipo": "string",
        "listaLecturasId": ["string"],
        "numDescargas": 0,
        "resenasId": ["string"]
      }
  ```
- **Respuestas:**
  - **201:** Usuario creado con éxito.
  - **500:** Error en el servidor.

### 3. Obtener un usuario por ID
- **Método:** GET
- **URL:** `/users/{id}`
- **Descripción:** Obtiene un usuario por su ID.
- **Parámetros:**
  - **id:** string (path) - ID del usuario.
- **Respuestas:**
  - **200:** Detalles del usuario.
  - **404:** Usuario no encontrado.
  - **500:** Error en el servidor.

### 4. Actualizar un usuario
- **Método:** PUT
- **URL:** `/users/{id}`
- **Descripción:** Actualiza los datos de un usuario.
- **Parámetros:**
  - **id:** string (path) - ID del usuario a actualizar.
- **Cuerpo de la solicitud:**
  ```json
  {
        "id": "string",
        "nombre": "string",
        "apellidos": "string",
        "email": "string",
        "plan": "string",
        "tipo": "string",
        "listaLecturasId": ["string"],
        "numDescargas": 0,
        "resenasId": ["string"]
      }
  ```
- **Respuestas:**
  - **200:** Usuario actualizado exitosamente.
  - **400:** ID inválido.
  - **404:** Usuario no encontrado.
  - **500:** Error en el servidor.

### 5. Eliminar un usuario
- **Método:** DELETE
- **URL:** `/users/{id}`
- **Descripción:** Elimina un usuario por su ID.
- **Parámetros:**
  - **id:** string (path) - ID del usuario a eliminar.
- **Respuestas:**
  - **200:** Usuario eliminado exitosamente.
  - **400:** ID inválido.
  - **404:** Usuario no encontrado.
  - **500:** Error en el servidor.

## 📦 Estructura del Proyecto
- **bin/:** Contiene la configuración para iniciar el servidor, como el archivo www.
- **database/:** Incluye los detalles para conectarse a la base de datos MongoDB Atlas.
- **models/:** Define los esquemas de los datos utilizados en MongoDB, como el modelo user.js.
- **routes/:** Maneja las rutas de la API REST, incluyendo rutas base (index.js) y específicas de usuarios (users.js).
- **authentication/:** Contiene la lógica de autenticación y la configuración de JWT para gestionar accesos seguros.
- **tests/:** Directorio de pruebas automatizadas con Jest, organizadas por módulos (user.test.js y auth.test.js).
- **public/:** Carpeta para archivos estáticos como imágenes, CSS y JavaScript accesibles desde el navegador.
- **app.js:** Archivo principal que configura la aplicación Express, conecta rutas y middleware.
- **Dockerfile:** Contiene las instrucciones para crear y ejecutar el contenedor Docker.
- **package.json:** Especifica las dependencias del proyecto y scripts de ejecución.

## 🔐 Autenticación y Seguridad
- **JWT (JSON Web Tokens):** Se utiliza JWT para autenticar y autorizar solicitudes. El token se genera al inicio de la sesión y se envía en las solicitudes subsecuentes.
- **Generador de token:** Crea un JWT firmado con la información del usuario y la fecha de expiración.
- **Validador de token:** Valida el token en cada solicitud para asegurar que la autenticación sea válida.
- **Roles de usuario:** Implementación de roles (administrador, usuario estándar) para gestionar permisos y controlar el acceso a recursos.
- **Validación de permisos:** Verifica que el usuario tenga el rol adecuado para acceder a recursos específicos.

---