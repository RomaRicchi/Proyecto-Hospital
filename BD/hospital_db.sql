-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-06-2025 a las 04:14:53
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `hospital_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admision`
--

CREATE TABLE `admision` (
  `id_admision` int(10) UNSIGNED NOT NULL,
  `id_paciente` int(10) UNSIGNED NOT NULL,
  `id_obra_social` smallint(5) UNSIGNED NOT NULL,
  `num_asociado` int(11) NOT NULL,
  `fecha_hora_ingreso` datetime NOT NULL,
  `id_motivo` int(11) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `fecha_hora_egreso` datetime DEFAULT NULL,
  `motivo_egr` varchar(255) DEFAULT NULL,
  `id_personal_salud` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `admision`
--

INSERT INTO `admision` (`id_admision`, `id_paciente`, `id_obra_social`, `num_asociado`, `fecha_hora_ingreso`, `id_motivo`, `descripcion`, `fecha_hora_egreso`, `motivo_egr`, `id_personal_salud`) VALUES
(101, 21, 1, 1001, '2025-06-05 10:00:00', 1, 'Internación por cirugía', NULL, NULL, NULL),
(102, 22, 2, 1002, '2025-06-06 08:00:00', 2, 'Internación por urgencia', '2025-06-07 12:00:00', 'Alta médica', NULL),
(103, 23, 1, 1003, '2025-06-10 09:00:00', 1, 'Reserva futura', NULL, NULL, NULL),
(104, 11, 4, 332049, '2025-06-07 04:50:41', 8, 'estoy re loco', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cama`
--

CREATE TABLE `cama` (
  `id_cama` tinyint(3) UNSIGNED NOT NULL,
  `nombre` varchar(1) NOT NULL,
  `id_habitacion` int(10) UNSIGNED NOT NULL,
  `desinfeccion` tinyint(1) NOT NULL,
  `estado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cama`
--

INSERT INTO `cama` (`id_cama`, `nombre`, `id_habitacion`, `desinfeccion`, `estado`) VALUES
(16, 'A', 3, 1, 0),
(17, 'B', 3, 1, 1),
(19, 'A', 4, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especialidad`
--

CREATE TABLE `especialidad` (
  `id_especialidad` smallint(5) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `especialidad`
--

INSERT INTO `especialidad` (`id_especialidad`, `nombre`) VALUES
(1, 'Clínica médica'),
(2, 'Cardiología'),
(3, 'Pediatría'),
(4, 'Ginecología'),
(5, 'Dermatología'),
(6, 'Neurología'),
(7, 'Psiquiatría'),
(8, 'Traumatología'),
(9, 'Infectología');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `familiar`
--

CREATE TABLE `familiar` (
  `id_familiar` int(10) UNSIGNED NOT NULL,
  `id_paciente` int(10) UNSIGNED NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `id_parentesco` smallint(5) UNSIGNED NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `familiar`
--

INSERT INTO `familiar` (`id_familiar`, `id_paciente`, `apellido`, `nombre`, `id_parentesco`, `telefono`, `estado`) VALUES
(1, 1, 'Pérez', 'María', 1, '2664000011', 1),
(2, 2, 'Gómez', 'Pedro', 2, '2664000012', 1),
(3, 3, 'Rodríguez', 'Ana', 3, '2664000013', 1),
(4, 4, 'Fernández', 'Luis', 4, '2664000014', 1),
(5, 5, 'López', 'Jorge', 5, '2664000015', 1),
(6, 6, 'Martínez', 'Laura', 19, '2664000016', 1),
(7, 7, 'García', 'Miguel', 7, '2664000017', 1),
(8, 8, 'Sánchez', 'Verónica', 8, '2664000018', 1),
(9, 9, 'Romero', 'Carlos', 9, '2664000019', 1),
(10, 10, 'Torres', 'Paula', 10, '2664000020', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `genero`
--

CREATE TABLE `genero` (
  `id_genero` tinyint(3) UNSIGNED NOT NULL,
  `nombre` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `genero`
--

INSERT INTO `genero` (`id_genero`, `nombre`) VALUES
(1, 'Masculino'),
(2, 'Femenino'),
(5, 'no binario');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `habitacion`
--

CREATE TABLE `habitacion` (
  `id_habitacion` int(10) UNSIGNED NOT NULL,
  `id_sector` smallint(5) UNSIGNED DEFAULT NULL,
  `num` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `habitacion`
--

INSERT INTO `habitacion` (`id_habitacion`, `id_sector`, `num`) VALUES
(3, 1, 1),
(4, 2, 2),
(5, 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `localidad`
--

CREATE TABLE `localidad` (
  `id_localidad` smallint(5) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `localidad`
--

INSERT INTO `localidad` (`id_localidad`, `nombre`) VALUES
(1, 'San Luis'),
(2, 'Villa Mercedes'),
(3, 'Villa de Merlo'),
(4, 'La Punta'),
(5, 'Juana Koslay'),
(6, 'Justo Daract'),
(7, 'Quines'),
(8, 'La Toma'),
(9, 'Santa Rosa del Conlara'),
(10, 'Tilisarao'),
(11, 'San Francisco del Monte de Oro'),
(12, 'Villa de la Quebrada'),
(13, 'Villa Larca'),
(14, 'Villa General Roca'),
(15, 'Villa del Carmen'),
(16, 'Las Chacras'),
(17, 'Las Aguadas'),
(18, 'Las Lagunas'),
(19, 'Las Vertientes'),
(20, 'La Vertiente'),
(21, 'La Florida'),
(22, 'La Calera'),
(23, 'La Bajada'),
(24, 'La Punilla'),
(25, 'La Maroma'),
(26, 'La Carolina'),
(27, 'La Estrechura'),
(28, 'La Ribera'),
(29, 'Lavaisse'),
(30, 'Lafínur'),
(31, 'Leandro N. Alem'),
(32, 'Liborio Luna'),
(33, 'Luján'),
(34, 'Los Cajones'),
(35, 'Los Molles'),
(36, 'Los Overos'),
(37, 'Los Alanices'),
(38, 'Los Argüelos'),
(39, 'Los Chañares'),
(40, 'Los Chilcas'),
(41, 'Los Coros'),
(42, 'Los Duraznitos'),
(43, 'Los Lobos'),
(44, 'Los Ranchos'),
(45, 'Manantial Blanco'),
(46, 'Manantiales'),
(47, 'Martín de Loyola'),
(48, 'Merlo'),
(49, 'Molino Chico'),
(50, 'Mosmota'),
(51, 'Nahuel Mapá'),
(52, 'Naschel'),
(53, 'Navia'),
(54, 'Nogolí'),
(55, 'Nueva Constitución'),
(56, 'Nueva Escocia'),
(57, 'Nueva Galia'),
(58, 'Ojo de Agua'),
(59, 'Ojos del Río'),
(60, 'Pantanillo'),
(61, 'Papagayos'),
(62, 'Paso Grande'),
(63, 'Paso del Rey'),
(64, 'Pedernera'),
(65, 'Pescadores'),
(66, 'Piedras Chatas'),
(67, 'Polledo'),
(68, 'Potrerillo'),
(69, 'Potrero de los Funes'),
(70, 'Pozo del Carril'),
(71, 'Pozo del Tala'),
(72, 'Punta del Agua'),
(73, 'Ranquelcó'),
(74, 'Renca'),
(75, 'Rincón del Carmen'),
(76, 'Riocito'),
(77, 'Río Grande'),
(78, 'Río Juan Gómez'),
(79, 'Río Quinto'),
(80, 'Rosario'),
(81, 'Saladillo'),
(82, 'Salado'),
(83, 'Salinas del Bebedero'),
(84, 'San Ambrosio'),
(85, 'San Antonio'),
(86, 'San Eduardo'),
(87, 'San Felipe'),
(88, 'San Gerónimo'),
(89, 'San Ignacio'),
(90, 'San Isidro'),
(91, 'San José del Morro'),
(92, 'San Martín del Alto Negro'),
(93, 'San Miguel'),
(94, 'San Pablo'),
(95, 'San Pedro'),
(96, 'San Roque'),
(97, 'San Salvador'),
(98, 'Santa Rosa'),
(99, 'Santa Rosa del Conlara'),
(100, 'Santo Tomás'),
(101, 'Socoscora'),
(102, 'Soven'),
(103, 'Suyuque Nuevo'),
(104, 'Suyuque Viejo'),
(105, 'Tala Verde'),
(106, 'Talita'),
(107, 'Talleres'),
(108, 'Tilisarao'),
(109, 'Toro Negro'),
(110, 'Toscal'),
(111, 'Trapiche'),
(112, 'Travesía'),
(113, 'Tres Amigos'),
(114, 'Unión'),
(115, 'Usiyal'),
(116, 'Vaca Parada'),
(117, 'Valle de Pancanta'),
(118, 'Varela'),
(119, 'Villa de la Quebrada'),
(120, 'Villa de Praga'),
(121, 'Villa del Carmen'),
(122, 'Villa General Roca'),
(123, 'Villa Larca'),
(124, 'Villa Mercedes'),
(125, 'Villa Reynolds'),
(126, 'Villa Salles'),
(127, 'Zanjitas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `motivo_ingreso`
--

CREATE TABLE `motivo_ingreso` (
  `id_motivo` int(11) NOT NULL,
  `tipo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `motivo_ingreso`
--

INSERT INTO `motivo_ingreso` (`id_motivo`, `tipo`) VALUES
(1, 'Cirugía programada'),
(2, 'Cirugia de urgencia'),
(3, 'Enfermedades agudas graves'),
(4, 'Descompensación de enfermedades crónicas'),
(5, 'Traumatismos o accidentes'),
(6, 'Atención neonatal o pediátrica especializada'),
(7, 'Tratamientos como quimioterapia o diálisis'),
(8, 'Problemas psiquiátricos agudos'),
(9, 'Parto y cuidados postparto'),
(10, 'Observación y diagnóstico hospitalario'),
(11, 'Ingreso por emergencia');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimiento`
--

CREATE TABLE `movimiento` (
  `id_mov` smallint(5) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimiento`
--

INSERT INTO `movimiento` (`id_mov`, `nombre`) VALUES
(1, 'Ingresa/Ocupa'),
(2, 'Egresa/Libera'),
(3, 'Reserva');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimiento_habitacion`
--

CREATE TABLE `movimiento_habitacion` (
  `id_movimiento` int(10) UNSIGNED NOT NULL,
  `id_admision` int(10) UNSIGNED NOT NULL,
  `id_habitacion` int(10) UNSIGNED NOT NULL,
  `id_cama` tinyint(3) UNSIGNED DEFAULT NULL,
  `fecha_hora_ingreso` datetime NOT NULL,
  `fecha_hora_egreso` datetime DEFAULT NULL,
  `id_mov` smallint(5) UNSIGNED NOT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimiento_habitacion`
--

INSERT INTO `movimiento_habitacion` (`id_movimiento`, `id_admision`, `id_habitacion`, `id_cama`, `fecha_hora_ingreso`, `fecha_hora_egreso`, `id_mov`, `estado`) VALUES
(201, 101, 3, 16, '2025-06-05 10:00:00', NULL, 1, 1),
(202, 102, 3, 17, '2025-06-06 08:00:00', '2025-06-07 12:00:00', 1, 1),
(203, 103, 4, 19, '2025-06-10 09:00:00', NULL, 3, 1),
(204, 104, 4, 19, '2025-06-07 04:50:41', NULL, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `obra_social`
--

CREATE TABLE `obra_social` (
  `id_obra_social` smallint(5) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `obra_social`
--

INSERT INTO `obra_social` (`id_obra_social`, `nombre`) VALUES
(1, 'OSDE'),
(2, 'PAMI'),
(3, 'Swiss Medical'),
(4, 'Medife'),
(5, 'Galeno'),
(6, 'Federada Salud'),
(7, 'Osecac Salud'),
(10, 'Sin obra social');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente`
--

CREATE TABLE `paciente` (
  `id_paciente` int(10) UNSIGNED NOT NULL,
  `dni_paciente` int(11) NOT NULL,
  `apellido_p` varchar(100) NOT NULL,
  `nombre_p` varchar(100) NOT NULL,
  `fecha_nac` date DEFAULT NULL,
  `id_genero` tinyint(3) UNSIGNED NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `id_localidad` smallint(5) UNSIGNED DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `paciente`
--

INSERT INTO `paciente` (`id_paciente`, `dni_paciente`, `apellido_p`, `nombre_p`, `fecha_nac`, `id_genero`, `telefono`, `direccion`, `id_localidad`, `email`, `estado`) VALUES
(1, 12345678, 'Pérez', 'Juan', '1985-05-15', 1, '2664000001', 'Calle Falsa 123', 1, 'juan.perez@mail.com', 1),
(2, 22345678, 'Gómez', 'Ana', '1990-07-20', 2, '2664000002', 'Avenida Siempreviva 742', 2, 'ana.gomez@mail.com', 1),
(3, 32345678, 'Rodríguez', 'Carlos', '1978-12-01', 1, '2664000003', 'Calle Mitre 456', 3, 'carlos.rodriguez@mail.com', 1),
(4, 42345678, 'Fernández', 'Laura', '1992-09-12', 2, '2664000004', 'Calle Belgrano 789', 4, 'laura.fernandez@mail.com', 1),
(5, 52345678, 'López', 'María', '1988-03-18', 2, '2664000005', 'Calle San Martín 321', 5, 'maria.lopez@mail.com', 1),
(6, 62345678, 'Martínez', 'Pedro', '1995-11-30', 1, '2664000006', 'Avenida Rivadavia 555', 6, 'pedro.martinez@mail.com', 1),
(7, 72345678, 'García', 'Lucía', '1983-02-22', 2, '2664000007', 'Calle Pueyrredón 654', 7, 'lucia.garcia@mail.com', 1),
(8, 82345678, 'Sánchez', 'Jorge', '1975-04-10', 1, '2664000008', 'Calle Sarmiento 987', 8, 'jorge.sanchez@mail.com', 1),
(9, 92345678, 'Romero', 'Sofía', '2000-06-05', 2, '2664000009', 'Calle 25 de Mayo 112', 9, 'sofia.romero@mail.com', 1),
(10, 102345678, 'Torres Pacheco', 'Martín', '1999-08-25', 1, '2664000010', 'Calle España 334', 17, 'martin.torres@mail.com', 1),
(11, 33539061, 'Fernandez', 'Fermin', '1988-03-13', 1, '2664297704', 'Barrio 123 viviendas manzana 430 casa 22', 1, 'tecdeso.fernandez@gmail.com', 1),
(12, 33001, 'NN', 'No identificado', NULL, 1, NULL, NULL, NULL, NULL, 0),
(13, 34001, 'NN', 'No identificado', NULL, 2, NULL, NULL, NULL, NULL, 1),
(14, 35001, 'NN', 'No identificado', NULL, 1, NULL, NULL, NULL, NULL, 1),
(15, 34587895, 'Richiardi', 'Romanela', '1992-12-30', 2, '2664010208', 'Barrio 123 viviendas manzana 430 casa 22', 1, 'roma@gmail.com', 1),
(21, 11111111, 'Pérez', 'Juan', '1980-01-01', 1, '2664000101', 'Calle Uno 123', 1, 'juan.perez@demo.com', 1),
(22, 22222222, 'Gómez', 'Ana', '1990-02-02', 2, '2664000102', 'Calle Dos 456', 2, 'ana.gomez@demo.com', 1),
(23, 33333333, 'Fernández', 'Laura', '1985-03-03', 2, '2664000103', 'Calle Tres 789', 3, 'laura.fernandez@demo.com', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `parentesco`
--

CREATE TABLE `parentesco` (
  `id_parentesco` smallint(5) UNSIGNED NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `parentesco`
--

INSERT INTO `parentesco` (`id_parentesco`, `nombre`) VALUES
(1, 'Madre'),
(2, 'Padre'),
(3, 'Tutor legal'),
(4, 'Persona de confianza'),
(5, 'Hermano'),
(6, 'Hermana'),
(7, 'Hijo'),
(8, 'Hija'),
(9, 'Tío'),
(10, 'Tía'),
(11, 'Primo'),
(12, 'Prima'),
(13, 'Abuelo'),
(14, 'Abuela'),
(15, 'Sobrino'),
(16, 'Sobrina'),
(17, 'Esposo'),
(18, 'Esposa'),
(19, 'Pareja'),
(21, 'tatarabuelo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_administrativo`
--

CREATE TABLE `personal_administrativo` (
  `id_personal_admin` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `id_rol_usuario` tinyint(3) UNSIGNED NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `personal_administrativo`
--

INSERT INTO `personal_administrativo` (`id_personal_admin`, `id_usuario`, `apellido`, `nombre`, `id_rol_usuario`, `activo`) VALUES
(1, 1, 'Admin', 'General', 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_salud`
--

CREATE TABLE `personal_salud` (
  `id_personal_salud` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `id_rol_usuario` tinyint(3) UNSIGNED NOT NULL,
  `id_especialidad` smallint(5) UNSIGNED NOT NULL,
  `matricula` varchar(50) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registro_historia_clinica`
--

CREATE TABLE `registro_historia_clinica` (
  `id_registro` int(10) UNSIGNED NOT NULL,
  `id_admision` int(10) UNSIGNED DEFAULT NULL,
  `id_usuario` int(10) UNSIGNED DEFAULT NULL,
  `fecha_hora_reg` datetime NOT NULL,
  `id_tipo` int(50) NOT NULL,
  `detalle` varchar(500) NOT NULL,
  `estado` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_usuario`
--

CREATE TABLE `rol_usuario` (
  `id_rol_usuario` tinyint(3) UNSIGNED NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol_usuario`
--

INSERT INTO `rol_usuario` (`id_rol_usuario`, `nombre`) VALUES
(1, 'Administracion General'),
(2, 'Recepcionista'),
(3, 'Enfermera/o'),
(4, 'Doctor/a');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sector`
--

CREATE TABLE `sector` (
  `id_sector` smallint(5) UNSIGNED NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sector`
--

INSERT INTO `sector` (`id_sector`, `nombre`) VALUES
(1, 'Ala Norte'),
(2, 'Ala Sur'),
(3, 'Terapia Intensiva'),
(4, 'Quirofano'),
(6, 'Ala Oeste'),
(7, 'B'),
(8, 'B');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_registro`
--

CREATE TABLE `tipo_registro` (
  `id_tipo` int(11) NOT NULL,
  `nombre` varchar(70) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_registro`
--

INSERT INTO `tipo_registro` (`id_tipo`, `nombre`) VALUES
(1, 'Enfermedades previas y crónicas'),
(2, 'Alergias'),
(3, 'Cirugías anteriores'),
(4, 'Medicamentos que toma habitualmente'),
(5, 'Historial familiar de enfermedades'),
(6, 'Exploración física'),
(7, 'Presión arterial'),
(8, 'Temperatura'),
(9, 'Pulso'),
(10, 'Frecuencia respiratoria'),
(11, 'Diagnóstico'),
(12, 'Diagnóstico secundario'),
(13, 'Código de diagnóstico (CIE-10 o similar)'),
(14, 'Estudios y exámenes complementarios'),
(15, 'Resultados de laboratorio (análisis de sangre, orina, etc.)'),
(16, 'Estudios de imagen (radiografías, ecografías, reso'),
(17, 'Otros estudios específicos (ECG, pruebas funcionales, biopsias)'),
(18, 'Tratamientos y procedimientos realizados'),
(19, 'Medicamentos indicados y dosis'),
(20, 'Procedimientos quirúrgicos'),
(21, 'Cuidados especiales o monitoreo'),
(22, 'Evolución clínica'),
(23, 'Cambios en síntomas, respuesta al tratamiento'),
(24, 'Resumen de alta o egreso'),
(25, 'Diagnóstico final'),
(26, 'Tratamiento recomendado para continuar en domicilio'),
(27, 'Indicaciones de seguimiento'),
(28, 'Consentimientos informados'),
(29, 'Grupo Sanguíneo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `username`, `password`, `estado`) VALUES
(1, 'admin', '$2b$10$TXLGnPIXH3XdeAsl6dqXM.w0u71y0bByHSmW1Zxmr1NfBIOaT2Dme', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `admision`
--
ALTER TABLE `admision`
  ADD PRIMARY KEY (`id_admision`),
  ADD KEY `id_paciente` (`id_paciente`),
  ADD KEY `id_obra_social` (`id_obra_social`),
  ADD KEY `id_personal_salud` (`id_personal_salud`),
  ADD KEY `admision_ibfk_204` (`id_motivo`);

--
-- Indices de la tabla `cama`
--
ALTER TABLE `cama`
  ADD PRIMARY KEY (`id_cama`),
  ADD KEY `id_habitacion` (`id_habitacion`);

--
-- Indices de la tabla `especialidad`
--
ALTER TABLE `especialidad`
  ADD PRIMARY KEY (`id_especialidad`);

--
-- Indices de la tabla `familiar`
--
ALTER TABLE `familiar`
  ADD PRIMARY KEY (`id_familiar`),
  ADD KEY `id_paciente` (`id_paciente`),
  ADD KEY `id_parentesco` (`id_parentesco`);

--
-- Indices de la tabla `genero`
--
ALTER TABLE `genero`
  ADD PRIMARY KEY (`id_genero`);

--
-- Indices de la tabla `habitacion`
--
ALTER TABLE `habitacion`
  ADD PRIMARY KEY (`id_habitacion`),
  ADD KEY `id_sector` (`id_sector`);

--
-- Indices de la tabla `localidad`
--
ALTER TABLE `localidad`
  ADD PRIMARY KEY (`id_localidad`);

--
-- Indices de la tabla `motivo_ingreso`
--
ALTER TABLE `motivo_ingreso`
  ADD PRIMARY KEY (`id_motivo`);

--
-- Indices de la tabla `movimiento`
--
ALTER TABLE `movimiento`
  ADD PRIMARY KEY (`id_mov`);

--
-- Indices de la tabla `movimiento_habitacion`
--
ALTER TABLE `movimiento_habitacion`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `id_admision` (`id_admision`),
  ADD KEY `id_habitacion` (`id_habitacion`),
  ADD KEY `id_mov` (`id_mov`),
  ADD KEY `fk_movimiento_cama` (`id_cama`);

--
-- Indices de la tabla `obra_social`
--
ALTER TABLE `obra_social`
  ADD PRIMARY KEY (`id_obra_social`);

--
-- Indices de la tabla `paciente`
--
ALTER TABLE `paciente`
  ADD PRIMARY KEY (`id_paciente`),
  ADD UNIQUE KEY `dni_paciente` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_2` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_3` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_4` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_5` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_6` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_7` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_8` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_9` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_10` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_11` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_12` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_13` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_14` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_15` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_16` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_17` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_18` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_19` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_20` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_21` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_22` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_23` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_24` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_25` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_26` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_27` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_28` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_29` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_30` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_31` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_32` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_33` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_34` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_35` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_36` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_37` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_38` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_39` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_40` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_41` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_42` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_43` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_44` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_45` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_46` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_47` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_48` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_49` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_50` (`dni_paciente`),
  ADD UNIQUE KEY `dni_paciente_51` (`dni_paciente`),
  ADD KEY `id_genero` (`id_genero`),
  ADD KEY `id_localidad` (`id_localidad`);

--
-- Indices de la tabla `parentesco`
--
ALTER TABLE `parentesco`
  ADD PRIMARY KEY (`id_parentesco`);

--
-- Indices de la tabla `personal_administrativo`
--
ALTER TABLE `personal_administrativo`
  ADD PRIMARY KEY (`id_personal_admin`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_rol_usuario` (`id_rol_usuario`);

--
-- Indices de la tabla `personal_salud`
--
ALTER TABLE `personal_salud`
  ADD PRIMARY KEY (`id_personal_salud`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_rol_usuario` (`id_rol_usuario`),
  ADD KEY `id_especialidad` (`id_especialidad`);

--
-- Indices de la tabla `registro_historia_clinica`
--
ALTER TABLE `registro_historia_clinica`
  ADD PRIMARY KEY (`id_registro`),
  ADD UNIQUE KEY `id_tipo` (`id_tipo`),
  ADD KEY `id_admision` (`id_admision`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `rol_usuario`
--
ALTER TABLE `rol_usuario`
  ADD PRIMARY KEY (`id_rol_usuario`);

--
-- Indices de la tabla `sector`
--
ALTER TABLE `sector`
  ADD PRIMARY KEY (`id_sector`);

--
-- Indices de la tabla `tipo_registro`
--
ALTER TABLE `tipo_registro`
  ADD PRIMARY KEY (`id_tipo`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `username_2` (`username`),
  ADD UNIQUE KEY `username_3` (`username`),
  ADD UNIQUE KEY `username_4` (`username`),
  ADD UNIQUE KEY `username_5` (`username`),
  ADD UNIQUE KEY `username_6` (`username`),
  ADD UNIQUE KEY `username_7` (`username`),
  ADD UNIQUE KEY `username_8` (`username`),
  ADD UNIQUE KEY `username_9` (`username`),
  ADD UNIQUE KEY `username_10` (`username`),
  ADD UNIQUE KEY `username_11` (`username`),
  ADD UNIQUE KEY `username_12` (`username`),
  ADD UNIQUE KEY `username_13` (`username`),
  ADD UNIQUE KEY `username_14` (`username`),
  ADD UNIQUE KEY `username_15` (`username`),
  ADD UNIQUE KEY `username_16` (`username`),
  ADD UNIQUE KEY `username_17` (`username`),
  ADD UNIQUE KEY `username_18` (`username`),
  ADD UNIQUE KEY `username_19` (`username`),
  ADD UNIQUE KEY `username_20` (`username`),
  ADD UNIQUE KEY `username_21` (`username`),
  ADD UNIQUE KEY `username_22` (`username`),
  ADD UNIQUE KEY `username_23` (`username`),
  ADD UNIQUE KEY `username_24` (`username`),
  ADD UNIQUE KEY `username_25` (`username`),
  ADD UNIQUE KEY `username_26` (`username`),
  ADD UNIQUE KEY `username_27` (`username`),
  ADD UNIQUE KEY `username_28` (`username`),
  ADD UNIQUE KEY `username_29` (`username`),
  ADD UNIQUE KEY `username_30` (`username`),
  ADD UNIQUE KEY `username_31` (`username`),
  ADD UNIQUE KEY `username_32` (`username`),
  ADD UNIQUE KEY `username_33` (`username`),
  ADD UNIQUE KEY `username_34` (`username`),
  ADD UNIQUE KEY `username_35` (`username`),
  ADD UNIQUE KEY `username_36` (`username`),
  ADD UNIQUE KEY `username_37` (`username`),
  ADD UNIQUE KEY `username_38` (`username`),
  ADD UNIQUE KEY `username_39` (`username`),
  ADD UNIQUE KEY `username_40` (`username`),
  ADD UNIQUE KEY `username_41` (`username`),
  ADD UNIQUE KEY `username_42` (`username`),
  ADD UNIQUE KEY `username_43` (`username`),
  ADD UNIQUE KEY `username_44` (`username`),
  ADD UNIQUE KEY `username_45` (`username`),
  ADD UNIQUE KEY `username_46` (`username`),
  ADD UNIQUE KEY `username_47` (`username`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `admision`
--
ALTER TABLE `admision`
  MODIFY `id_admision` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=105;

--
-- AUTO_INCREMENT de la tabla `cama`
--
ALTER TABLE `cama`
  MODIFY `id_cama` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `especialidad`
--
ALTER TABLE `especialidad`
  MODIFY `id_especialidad` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `familiar`
--
ALTER TABLE `familiar`
  MODIFY `id_familiar` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `genero`
--
ALTER TABLE `genero`
  MODIFY `id_genero` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `habitacion`
--
ALTER TABLE `habitacion`
  MODIFY `id_habitacion` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `localidad`
--
ALTER TABLE `localidad`
  MODIFY `id_localidad` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=128;

--
-- AUTO_INCREMENT de la tabla `motivo_ingreso`
--
ALTER TABLE `motivo_ingreso`
  MODIFY `id_motivo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `movimiento`
--
ALTER TABLE `movimiento`
  MODIFY `id_mov` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `movimiento_habitacion`
--
ALTER TABLE `movimiento_habitacion`
  MODIFY `id_movimiento` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=205;

--
-- AUTO_INCREMENT de la tabla `obra_social`
--
ALTER TABLE `obra_social`
  MODIFY `id_obra_social` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `paciente`
--
ALTER TABLE `paciente`
  MODIFY `id_paciente` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `parentesco`
--
ALTER TABLE `parentesco`
  MODIFY `id_parentesco` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `personal_administrativo`
--
ALTER TABLE `personal_administrativo`
  MODIFY `id_personal_admin` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `personal_salud`
--
ALTER TABLE `personal_salud`
  MODIFY `id_personal_salud` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `registro_historia_clinica`
--
ALTER TABLE `registro_historia_clinica`
  MODIFY `id_registro` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rol_usuario`
--
ALTER TABLE `rol_usuario`
  MODIFY `id_rol_usuario` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `sector`
--
ALTER TABLE `sector`
  MODIFY `id_sector` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `tipo_registro`
--
ALTER TABLE `tipo_registro`
  MODIFY `id_tipo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `admision`
--
ALTER TABLE `admision`
  ADD CONSTRAINT `admision_ibfk_202` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `admision_ibfk_203` FOREIGN KEY (`id_obra_social`) REFERENCES `obra_social` (`id_obra_social`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `admision_ibfk_204` FOREIGN KEY (`id_motivo`) REFERENCES `motivo_ingreso` (`id_motivo`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `admision_ibfk_205` FOREIGN KEY (`id_personal_salud`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `cama`
--
ALTER TABLE `cama`
  ADD CONSTRAINT `fk_cama_habitacion` FOREIGN KEY (`id_habitacion`) REFERENCES `habitacion` (`id_habitacion`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `familiar`
--
ALTER TABLE `familiar`
  ADD CONSTRAINT `familiar_ibfk_93` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `familiar_ibfk_94` FOREIGN KEY (`id_parentesco`) REFERENCES `parentesco` (`id_parentesco`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `habitacion`
--
ALTER TABLE `habitacion`
  ADD CONSTRAINT `habitacion_ibfk_93` FOREIGN KEY (`id_sector`) REFERENCES `sector` (`id_sector`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `movimiento_habitacion`
--
ALTER TABLE `movimiento_habitacion`
  ADD CONSTRAINT `fk_movimiento_cama` FOREIGN KEY (`id_cama`) REFERENCES `cama` (`id_cama`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `movimiento_habitacion_ibfk_139` FOREIGN KEY (`id_admision`) REFERENCES `admision` (`id_admision`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `movimiento_habitacion_ibfk_140` FOREIGN KEY (`id_habitacion`) REFERENCES `habitacion` (`id_habitacion`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `movimiento_habitacion_ibfk_141` FOREIGN KEY (`id_mov`) REFERENCES `movimiento` (`id_mov`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `paciente`
--
ALTER TABLE `paciente`
  ADD CONSTRAINT `paciente_ibfk_93` FOREIGN KEY (`id_genero`) REFERENCES `genero` (`id_genero`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `paciente_ibfk_94` FOREIGN KEY (`id_localidad`) REFERENCES `localidad` (`id_localidad`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `personal_administrativo`
--
ALTER TABLE `personal_administrativo`
  ADD CONSTRAINT `personal_administrativo_ibfk_93` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `personal_administrativo_ibfk_94` FOREIGN KEY (`id_rol_usuario`) REFERENCES `rol_usuario` (`id_rol_usuario`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `personal_salud`
--
ALTER TABLE `personal_salud`
  ADD CONSTRAINT `personal_salud_ibfk_76` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `personal_salud_ibfk_77` FOREIGN KEY (`id_rol_usuario`) REFERENCES `rol_usuario` (`id_rol_usuario`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `personal_salud_ibfk_78` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidad` (`id_especialidad`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `registro_historia_clinica`
--
ALTER TABLE `registro_historia_clinica`
  ADD CONSTRAINT `registro_historia_clinica_ibfk_111` FOREIGN KEY (`id_admision`) REFERENCES `admision` (`id_admision`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `registro_historia_clinica_ibfk_112` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `registro_historia_clinica_ibfk_113` FOREIGN KEY (`id_tipo`) REFERENCES `tipo_registro` (`id_tipo`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
