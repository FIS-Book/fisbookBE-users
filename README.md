# 👥 Microservicio REST - Users Service
---

Este proyecto es un microservicio REST diseñado para gestionar los usuarios de la aplicación FISBook. Proporciona funcionalidades para registrar, autenticar y gestionar los perfiles de los usuarios a través de una API REST.


## 🚀 Características Principales

- **Gestión de usuarios:** proporciona endpoints REST para consultar y gestionar datos de usuarios.
- **Persistencia:** utiliza MongoDB como base de datos NoSQL para almacenar y gestionar la información de los usuarios.
- **Documentación interactiva:** documentación de la API generada automáticamente con Swagger para visualizar y probar los endpoints.
- **Pruebas automatizadas:** pruebas unitarias y de integración implementadas con Jest y Supertest.
- **Dockerización:** preparado para ejecutarse en contenedores Docker.
- **Middleware robusto:** gestión de autenticación y autorización mediante JSON Web Tokens (JWT).
- **Configuración de CORS:** configurado para permitir solicitudes seguras desde orígenes autorizados.

---

## 🛠️ Tecnologías y Herramientas Usadas

- **Node.js:** plataforma de desarrollo utilizada como base del microservicio.
- **Express.js:** framework para la creación de APIs REST.
- **MongoDB + Mongoose:** base de datos NoSQL utilizada junto con un ORM para modelado de datos.
- **Swagger:** herramienta para la documentación interactiva de la API.
- **Docker:** utilizado para empaquetar y desplegar el microservicio en contenedores.
- **Jest + Supertest:** frameworks para pruebas unitarias y de integración.
- **dotenv:** para la gestión de variables de entorno.
- **CORS:** configuración para manejo seguro de solicitudes entre dominios.

---

## 📋 Operaciones Disponibles

El microservicio expone las siguientes APIs REST para interactuar con los datos de los usuarios:

### 📋 Endpoints Disponibles

### 1. Verificar el estado de salud del servicio
- **Método:** `GET`
- **URL:** `/api/v1/auth/healthz`
- **Descripción:** Endpoint para verificar el estado de salud del servicio.
- **Respuestas:**
  - **200:** El servicio está saludable.
    - **Cuerpo de la respuesta:**
      ```json
      {
        "message": "Servicio saludable."
      }
      ```
  - **500:** Error en el servidor.
    - **Cuerpo de la respuesta:**
      ```json
      {
        "message": "Error en el servidor."
      }
      ```

#### 2. Obtener lista de usuarios
- **Método:** `GET`
- **URL:** `/api/v1/auth/users`
- **Descripción:** Obtiene una lista de todos los usuarios registrados.
- **Respuestas:**
  - **200:** Retorna una lista de usuarios.
  - **500:** Error en el servidor.

#### 3. Obtener un usuario por ID
- **Método:** `GET`
- **URL:** `/api/v1/auth/users/:id`
- **Descripción:** Obtiene los detalles de un usuario específico mediante su ID.
- **Parámetros:**
  - **id:** string (path) - ID del usuario.
- **Respuestas:**
  - **200:** Retorna los detalles del usuario.
  - **404:** Usuario no encontrado.
  - **500:** Error en el servidor.

#### 4. Actualizar un usuario
- **Método:** `PUT`
- **URL:** `/api/v1/auth/users/:id`
- **Descripción:** Actualiza los datos de un usuario existente.
- **Parámetros:**
  - **id:** string (path) - ID del usuario a actualizar.
- **Cuerpo de la solicitud:**
  ```json
  {
    "nombre": "string",
    "apellidos": "string",
    "username": "string",
    "email": "string",
    "plan": "string",
    "rol": "string"
  }

#### 5. Eliminar un usuario
- **Método:** `DELETE`
- **URL:** `/api/v1/auth/users/:id`
- **Descripción:** Elimina un usuario específico.
- **Parámetros:**
  - **id:** string (path) - ID del usuario a eliminar.
- **Respuestas:**
  - **200:** Usuario eliminado exitosamente.
  - **400:** ID inválido.
  - **404:** Usuario no encontrado.
  - **500:** Error en el servidor.

#### 6. Registrar un nuevo usuario
- **Método:** `POST`
- **URL:** `/api/v1/auth/users/register`
- **Descripción:** Crea un nuevo usuario en la base de datos con los datos proporcionados.
- **Cuerpo de la solicitud:**
  ```json
  {
    "nombre": "string",
    "apellidos": "string",
    "username": "string",
    "email": "string",
    "password": "string",
    "plan": "string",
    "rol": "string"
  }

#### 7. Iniciar sesión
- **Método:** `POST`
- **URL:** `/api/v1/auth/users/login`
- **Descripción:** Permite a un usuario autenticarse con su email y contraseña, y devuelve un token JWT.
- **Cuerpo de la solicitud:**
  ```json
  {
    "email": "string",
    "password": "string"
  }


### 8. Actualizar número de descargas de un usuario
- **Método:** `PATCH`
- **URL:** `/api/v1/auth/users/{userId}/downloads`
- **Descripción:** Permite a un administrador o al propio usuario actualizar la cantidad de descargas asociadas a un usuario.
- **Parámetros:**
  - **userId:** `string` (path) - ID del usuario cuya cantidad de descargas se actualizará.
- **Cuerpo de la solicitud:**
  ```json
  {
    "numDescargas": 100
  }

### 9. Obtener listas de lectura de un usuario
- **Método:** `GET`
- **URL:** `/api/v1/auth/users/{userId}/readings`
- **Descripción:** Permite obtener las listas de lecturas de un usuario dado su `userId`.
- **Parámetros:**
  - **userId:** `string` (path) - ID del usuario cuyas listas de lecturas se desean obtener.
- **Respuestas:**
  - **200:** Se han obtenido las listas de lecturas del usuario exitosamente.
    - **Cuerpo de la respuesta:**
      ```json
      {
        "message": "Listas de lectura obtenidas con éxito.",
        "readings": [
          {
            "id": "string",
            "name": "Lista de Lectura 1",
            "description": "Descripción de la lista de lectura."
          }
        ]
      }
      ```
  - **404:** No se encontraron listas de lecturas para el usuario.
  - **500:** Error inesperado del servidor.

### 10. Obtener reseñas de un usuario para un libro
- **Método:** `GET`
- **URL:** `/api/v1/auth/users/reviews/user/{userId}/book`
- **Descripción:** Permite obtener todas las reseñas que un usuario ha realizado para libros específicos.
- **Parámetros:**
  - **userId:** `string` (path) - ID del usuario cuyas reseñas se desean consultar.
- **Respuestas:**
  - **200:** Reseñas del usuario para libros obtenidas exitosamente.
    - **Cuerpo de la respuesta:**
      ```json
      {
        "message": "Reseñas del usuario para libros obtenidas exitosamente.",
        "reviews": [
          {
            "bookId": "string",
            "review": "Contenido de la reseña.",
            "rating": 4.5
          }
        ]
      }
      ```
  - **404:** No se encontraron reseñas para este usuario.
  - **500:** Error inesperado en el servidor.


## 📦 Estructura del Proyecto
- **authentication/:** contiene la lógica de autenticación y la configuración de JWT para gestionar accesos seguros.
- **bin/:** contiene la configuración para iniciar el servidor, como el archivo `www`.
- **models/:** define los esquemas de los datos utilizados en MongoDB, como el modelo `user.js`.
- **routes/:** maneja las rutas de la API REST, incluyendo rutas base (`index.js`) y específicas de usuarios (`users.js`).
- **tests/:** directorio de pruebas automatizadas con Jest, organizadas por módulos (`user.test.js` y `auth.test.js`).
- **app.js:** archivo principal que configura la aplicación Express, conecta rutas y middleware.
- **Dockerfile:** contiene las instrucciones para crear y ejecutar el contenedor Docker.
- **db.js:** conexión a la base de datos MongoDB usando `mongoose`. Establece la conexión con MongoDB Atlas a través de la URI configurada en `process.env.MONGO_URI_USERS`. También maneja los errores de conexión y confirma la conexión exitosa a la base de datos.
- **package.json:** especifica las dependencias del proyecto y scripts de ejecución.

## 🔐 Autenticación y Seguridad
- **JWT (JSON Web Tokens):** se utiliza JWT para autenticar y autorizar solicitudes. El token se genera al inicio de la sesión y se envía en las solicitudes subsecuentes.
- **Generador de token:** crea un JWT firmado con la información del usuario y la fecha de expiración.
- **Validador de token:** valida el token en cada solicitud para asegurar que la autenticación sea válida.
- **Roles de usuario:** implementación de roles (administrador, usuario estándar) para gestionar permisos y controlar el acceso a recursos.
- **Validación de permisos:** verifica que el usuario tenga el rol adecuado para acceder a recursos específicos.
---