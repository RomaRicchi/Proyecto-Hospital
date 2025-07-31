# Sistema de Información Hospitalaria (HIS)

**Sistema de Información Hospitalaria** es una aplicación web desarrollada en **Node.js con Express y Sequelize**, diseñada para **gestionar pacientes, admisiones hospitalarias, asignación de camas, habitaciones y registros clínicos**. El sistema ofrece una experiencia fluida para la administración de internaciones, adaptándose a entornos hospitalarios reales.

---
## 🚀 Tecnologías utilizadas

- **Node.js + Express**
- **Sequelize (ORM)** con **MySQL**
- **Pug** (renderizado en servidor)
- **Bootstrap 5** + **SweetAlert2**
- **FullCalendar.js** (gestión visual de turnos)
- **express-session** (autenticación con sesiones)
- **bcrypt** (encriptación de contraseñas)
- **nodemailer** (recuperación de contraseña por correo)
- **node-cron** (tareas automáticas para limpieza de reservas)
- **dotenv**, **morgan**, **axios**, entre otras.

## 📑 Tabla de Contenidos

1. [Introducción](#-introducción)  
2. [Características](#-características)  
3. [Arquitectura](#-arquitectura)  
4. [Requisitos](#-requisitos)  
5. [Instalación](#-instalación)  
6. [Estructura del Proyecto](#-estructura-del-proyecto)  
7. [Uso](#-uso)  
8. [Credenciales de Acceso](#-credenciales-de-acceso)  
9. [Licencia](#-licencia)  

---

## 📌 Introducción

**Sistema de Información Hospitalaria**  permite:

- **Registrar y gestionar pacientes** y su historial clínico.  
- **Administrar admisiones hospitalarias**, incluyendo el flujo de ingreso y egreso.  
- **Asignar habitaciones y camas** disponibles de manera dinámica.  
- **Controlar usuarios y roles del sistema**, con autenticación segura.  

Construido con arquitectura **MVC**, incorpora **Pug** para las vistas, **MySQL** como base de datos y manejo de sesiones para usuarios autenticados.
Todas las fechas almacenadas en la base se guardan en UTC y son convertidas a horario argentino (UTC-3) mediante el helper timezone.helper.js. 
---

## 🚀 Características

✅ **Gestión de Pacientes y Familiares**  
✅ **Admisiones y Egresos** con lógica de validación  
✅ **Manejo de Camas y Habitaciones**  
✅ **Historial Clínico Registrado** por tipo y motivo. Evaluaciones médicas y de enfermería. Historial clínico por paciente. Filtro por tipo y fecha.
✅ **Sistema de Usuarios con Roles (admin, salud, etc.)**
✅ **Turnos médicos** Calendario interactivo (FullCalendar). Validación de agenda y horarios. Asignación de paciente, motivo y estado.
✅ **Interfaz web con Bootstrap + Pug**  
✅ **Autenticación y Sesiones**  Alta, baja, edición de usuarios. Control de acceso según rol.
✅ **Conexión a base de datos MySQL usando Sequelize**  
✅ **Recuperación de contraseña** Formulario SweetAlert2 + envío de token por correo (Nodemailer).
✅ **Automatización** Limpieza diaria de reservas vencidas (node-cron).
---

## 🏗️ Arquitectura

El proyecto está organizado en una estructura **MVC**:

- **Modelos (Sequelize):** `Paciente`, `Admision`, `Cama`, `Habitacion`, `Usuario`, etc.  
- **Controladores:** lógica de negocio desacoplada, conexión con modelos.  
- **Vistas (Pug):** componentes renderizados desde el servidor.  
- **Rutas (Express):** API REST modularizada por entidad.  
- **Middleware:** autenticación, sesión, logs.

---

## ⚙️ Requisitos

- Node.js v18+  
- MySQL Server  
- npm (gestor de paquetes)  
- Git  
- Editor de texto (recomendado: VS Code)  

---

## 📥 Instalación

### 1️⃣ Clonar este repositorio


git clone https://github.com/RomaRicchi/Proyecto-Hospital
cd proyecto-hospital


### 2️⃣ Instalar dependencias


npm install


### 3️⃣ Configurar entorno 

Crear un archivo `.env` con las variables necesarias:

```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=hospital_db
PORT=3000
SESSION_SECRET=supersecreto
```

### 4️⃣ Inicializar base de datos

Ejecutar el archivo SQL:

```sql
BD/hospital_db.sql
```

Asegúrate de tener creado el schema `hospital_db`.

---

## 📂 Estructura del Proyecto

```
Proyecto-Hospital/
│
├── BD/                            # Script de base de datos
├── .env                          # Variables de entorno
├── package.json                  # Dependencias y scripts
├── src/
│   ├── app/
│   │   ├── config/               # Configuración de Sequelize
│   │   ├── controllers/          # Lógica de negocio
│   │   ├── models/               # Modelos Sequelize
│   │   ├── routes/               # Endpoints REST
│   │   ├── middlewares/          # Autenticación, sesión
│   ├── public/                   # JS, CSS, imágenes
│   ├── views/                    # Vistas Pug
│   └── server.js                 # Punto de entrada
```

---

## ▶️ Uso

```bash
npm run dev
```

Luego accede a: [http://localhost:3000/home](http://localhost:3000/home)

---

## 🔐 Credenciales de Acceso

| Usuario  | Contraseña | Tipo          |
|----------|------------|---------------|
| admin    | admin      | Root          |
| RamonC   | RamonC     | Medico        |
| VivianaC | VivianaC   | Enfermero     |
| GDiaz    | GDiaz      | Recepcionista |

---
## 👨‍💻 Autor

Romanela Ricchiardi-- Contacto: roma.ricchiardi@gmail.com

Carrera: Desarrollo de Software – Universidad de La Punta

Materia: Desarrollo Web II (2025)

## 🖼️ Galería del Sistema

<img width="1876" height="869" alt="image" src="https://github.com/user-attachments/assets/5fcff80d-e270-4593-90be-b81caa69f8eb" />

### 🏥 Panel de Gestión

![Dashboard del Sistema] <img width="1883" height="869" alt="image" src="https://github.com/user-attachments/assets/23de8ea3-9bff-4940-b562-61cda1d68f3e" />


### 📅 Turnos Médicos

![Calendario de Turnos] <img width="1896" height="871" alt="image" src="https://github.com/user-attachments/assets/b0d67b29-f721-4e6b-802e-3bf5406c9c6b" />


### 👥 Admisión de Pacientes

![Formulario de Admisión]  <img width="1876" height="873" alt="image" src="https://github.com/user-attachments/assets/4a5e262f-a1c7-4d06-aee3-20bb2abc96a3" />

<img width="1878" height="871" alt="image" src="https://github.com/user-attachments/assets/456ce647-1f74-43bc-b77d-fa3787953444" />


## 📜 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Puedes usarlo, modificarlo y distribuirlo libremente bajo los términos de esta licencia.
