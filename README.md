# Sistema de Información Hospitalaria (HIS)

Este proyecto es un **Sistema de Información Hospitalaria (HIS)** desarrollado como parte de la carrera de Desarrollo de Software. 
Permite gestionar pacientes, admisiones, habitaciones, historiales clínicos y movimientos dentro del hospital.

## 🏥 Objetivos del Proyecto

- Facilitar la gestión y visualización de datos hospitalarios.
- Simular flujos reales de ingreso, atención y movimiento de pacientes.
- Desarrollar habilidades de desarrollo backend y frontend aplicadas a un caso real.

## 🚀 Tecnologías utilizadas

- Node.js + Express
- MySQL (modelo relacional)
- Motor de plantillas Pug
- Bootstrap (para la interfaz)
- HTML, CSS, JavaScript

## 📁 Estructura del Proyecto

```
/public
  /css
  /js
/views
  /components
    layout.pug
  paciente.pug
  admision.pug
  habitacion.pug
  historiaClinica.pug
/routes
  paciente.js
  admision.js
  habitacion.js
/models
  paciente.js
  admision.js
/app.js
```

## ⚙️ Instalación y ejecución

```bash
# Clonar el repositorio
git clone https://github.com/tuusuario/his-hospitalario.git

# Ingresar al proyecto
cd his-hospitalario

# Instalar dependencias
npm install

# Configurar la base de datos en .env o config.js

# Ejecutar el servidor
npm start
```

Abrir el navegador en [http://localhost:3000](http://localhost:3000)

## 🧪 Funcionalidades

- Registro y edición de pacientes
- Gestión de admisiones y habitaciones
- Visualización de historia clínica por paciente
- Listado de movimientos entre habitaciones
- Interfaz dinámica con Pug y Bootstrap
- Separación clara de vistas, rutas y modelos

## 📷 Capturas de Pantalla

_Añadir imágenes en la carpeta `/screenshots` para visualización_

## 👨‍⚕️ Autor

- Nombre: Romanela Ricchiardi
- Carrera: Desarrollo de Software
- Materia: Desarrollo Web II (2025)

## 📄 Licencia

Este proyecto se distribuye bajo la licencia MIT.
