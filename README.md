# Sistema de Información Hospitalaria (HIS)

**Sistema de Información Hospitalaria** es una aplicación web desarrollada en **Node.js con Express y Sequelize**, diseñada para **gestionar pacientes, admisiones hospitalarias, asignación de camas, habitaciones y registros clínicos**. El sistema ofrece una experiencia fluida para la administración de internaciones, adaptándose a entornos hospitalarios reales.

---

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

---

## 🚀 Características

✅ **Gestión de Pacientes y Familiares**  
✅ **Admisiones y Egresos** con lógica de validación  
✅ **Manejo de Camas y Habitaciones**  
✅ **Historial Clínico Registrado** por tipo y motivo  
✅ **Sistema de Usuarios con Roles (admin, salud, etc.)**  
✅ **Interfaz web con Bootstrap + Pug**  
✅ **Autenticación y Sesiones**  
✅ **Conexión a base de datos MySQL usando Sequelize**  

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
En servidor hasta el 1 de Julio del 2025 [https://proyecto-hospital-production.up.railway.app/home](https://proyecto-hospital-production.up.railway.app/home)
o...
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

| Usuario | Contraseña |
| ------- | ---------- |
| admin   | admin      |

---
## 👨‍💻 Autor

Romanela Ricchiardi

Carrera: Desarrollo de Software – Universidad de La Punta

Materia: Desarrollo Web II (2025)

## 📜 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Puedes usarlo, modificarlo y distribuirlo libremente bajo los términos de esta licencia.

## Vistas
![Sin título](https://github.com/user-attachments/assets/a815ece7-e5a4-4d8a-9a0a-7d3eb4f9f76a)


![image](https://github.com/user-attachments/assets/28241be8-dab9-41b2-81cf-3421a62a1cd5)


![image](https://github.com/user-attachments/assets/e9224155-3641-48e0-8c7c-8d7dcdf6db96)







