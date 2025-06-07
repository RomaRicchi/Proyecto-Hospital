# Sistema de Información Hospitalaria (HIS)

Un **Sistema de Información Hospitalaria** desarrollado como proyecto de fin de cursada de Desarrollo Web II. Permite gestionar pacientes, admisiones, habitaciones, historias clínicas y movimientos de internación en un entorno realista.

---

## 🏥 Objetivos

- Digitalizar el flujo de atención hospitalaria: ingreso, asignación de cama, egreso.  
- Facilitar la consulta y edición de datos de pacientes y movimientos.  
- Practicar arquitectura MVC con Node.js, Express y Pug.

---

## 🚀 Tecnologías

- **Backend**: Node.js, Express  
- **Base de datos**: MySQL (con conexión desde `src/app/database/`)  
- **ORM / Conexión**: Sequelize (o mysql2)  
- **Vistas**: Pug  
- **Frontend**: Bootstrap 5, CSS personalizado (`public/css/style.css`), JS propio (`public/js/`)  
- **Ambiente**: Variables en `.env`  
- **Control de versiones**: Git  

---

## 📁 Estructura del proyecto

/
├─ BD/ ← Base de datos
├─ data/ ← Archivos de apoyo 
├─ node_modules/
├─ public/
│ ├─ css/
│ │ └─ style.css ← Estilos globales
│ ├─ img/
│ │ ├─ docG.png
│ │ ├─ logo5.png
│ │ └─ verdepastel.png
│ └─ js/ ← Scripts front-end
│ └─ startbootstrap/ ← Plantillas de Bootstrap
├─ src/
│ └─ app/
│ ├─ config/ ← Configuración de Sequelize, MySQL, keys
│ ├─ database/ ← Inicialización de la conexión
│ ├─ middlewares/ ← Autenticación, validaciones, CORS, etc.
│ ├─ models/ ← Definición de modelos (Paciente, Admision…)
│ ├─ controllers/ ← Lógica de negocio y llamadas a modelos
│ └─ routes/ ← Rutas Express organizadas por recurso
│   ├─ paciente.js
│   ├─ admision.js
│   └─ habitacion.js
├─ views/ ← Plantillas Pug
│ ├─ partials/ ← Layouts parciales 
│ ├─ layout_modular.pug
│ ├─ paciente.pug
│ ├─ admision.pug
│ ├─ habitacion.pug
│ └─ historiaClinica.pug
├─ .env ← Variables sensibles (DB_USER, DB_PASS, etc.)
├─ .gitignore
├─ server.js ← Punto de entrada: carga HTTP y Middlewares
└─ README.md

---

## ⚙️ Instalación y uso

1. **Clonar el repositorio**  
  
   git clone https://github.com/tuusuario/his-hospitalario.git
   cd his-hospitalario

2. **Instalar dependencias** 
  npm install

3. **Configurar variables** 
  
  Crea un archivo .env (copiando .env.example si existe) y define:

      DB_HOST=localhost
      DB_USER=tu_usuario
      DB_PASS=tu_contraseña
      DB_NAME=hospital_db
      PORT=3000

4. **Inicializar base de datos**

Ejecuta los scripts SQL en BD/ para crear tablas y cargar datos iniciales.

Asegúrate de que el schema hospital_db exista.

4. **Levantar la aplicación**

npm run dev
Correrá en http://localhost:3000/home.

## 🧪 Funcionalidades

Pacientes: crear, editar, listar, buscar por DNI.

Admisiones: alta, baja, validación de admisiones activas.

Habitaciones: asignar, liberar, registrar movimientos.

Interfaz: responsive con Bootstrap y plantillas Pug.

## 👨‍💻 Autor

Romanela Ricchiardi

Carrera: Desarrollo de Software – Universidad de La Punta

Materia: Desarrollo Web II (2025)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.