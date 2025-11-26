-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 25-11-2025 a las 19:30:36
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

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
  `num_asociado` int(11) DEFAULT NULL,
  `fecha_hora_ingreso` datetime NOT NULL,
  `id_motivo` int(11) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `fecha_hora_egreso` datetime DEFAULT NULL,
  `motivo_egr` varchar(255) DEFAULT NULL,
  `id_usuario` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `admision`
--

INSERT INTO `admision` (`id_admision`, `id_paciente`, `id_obra_social`, `num_asociado`, `fecha_hora_ingreso`, `id_motivo`, `descripcion`, `fecha_hora_egreso`, `motivo_egr`, `id_usuario`) VALUES
(307, 1, 10, NULL, '2025-11-25 03:00:00', 1, '', NULL, '', NULL),
(308, 24, 5, 12354696, '2025-11-25 03:00:00', 11, '', NULL, '', 19),
(309, 10, 10, NULL, '2025-11-25 03:00:00', 1, '', NULL, '', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `agenda`
--

CREATE TABLE `agenda` (
  `id_agenda` int(11) NOT NULL,
  `id_personal_salud` int(10) UNSIGNED NOT NULL,
  `id_dia` int(11) NOT NULL,
  `duracion` int(11) NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `agenda`
--

INSERT INTO `agenda` (`id_agenda`, `id_personal_salud`, `id_dia`, `duracion`, `hora_inicio`, `hora_fin`) VALUES
(46, 1, 1, 30, '08:00:00', '13:00:00'),
(47, 3, 3, 30, '08:00:00', '15:00:00'),
(48, 12, 4, 30, '08:00:00', '14:00:00'),
(49, 2, 3, 45, '15:00:00', '19:00:00'),
(50, 9, 4, 45, '15:00:00', '21:00:00'),
(51, 9, 2, 45, '08:00:00', '16:00:00'),
(52, 8, 5, 30, '08:00:00', '15:00:00'),
(53, 4, 4, 30, '16:00:00', '18:00:00'),
(54, 7, 2, 15, '15:00:00', '20:00:00'),
(55, 12, 6, 60, '01:00:00', '23:00:00'),
(56, 12, 1, 30, '08:00:00', '16:00:00');

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
(41, 'A', 270, 1, 0),
(42, 'B', 272, 1, 0),
(43, 'B', 270, 1, 0),
(44, 'A', 271, 1, 0),
(45, 'B', 271, 1, 0),
(46, 'A', 272, 1, 0),
(47, 'A', 273, 1, 0),
(48, 'A', 235, 1, 0),
(49, 'A', 231, 1, 0),
(51, 'B', 214, 1, 0),
(54, 'A', 217, 1, 0),
(55, 'B', 217, 1, 0),
(58, 'A', 216, 1, 0),
(59, 'C', 274, 1, 0),
(62, 'A', 222, 1, 0),
(63, 'B', 223, 1, 0),
(64, 'B', 216, 1, 0),
(65, 'B', 222, 1, 0),
(66, 'B', 229, 1, 0),
(67, 'B', 231, 1, 0),
(68, 'A', 229, 1, 0),
(69, 'B', 235, 1, 0),
(70, 'B', 273, 1, 0),
(71, 'A', 218, 1, 0),
(72, 'B', 218, 1, 0),
(73, 'A', 221, 1, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dia_semana`
--

CREATE TABLE `dia_semana` (
  `id_dia` int(11) NOT NULL,
  `nombre` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `dia_semana`
--

INSERT INTO `dia_semana` (`id_dia`, `nombre`) VALUES
(7, 'Domingo'),
(4, 'Jueves'),
(1, 'Lunes'),
(2, 'Martes'),
(3, 'Miércoles'),
(6, 'Sabado'),
(5, 'Viernes');

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
(7, 'Psicologia'),
(8, 'Traumatología'),
(9, 'Infectología'),
(10, 'Sin especialidad'),
(11, 'Cuidados generales'),
(13, 'Neonatología'),
(14, 'Terapia intensiva'),
(15, 'Geriatría'),
(16, 'Psiquiatría'),
(17, 'Quirúrgica'),
(18, 'Oncología'),
(20, 'Enfermería comunitaria'),
(23, 'Cirugía'),
(24, 'Pediatría médica');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_turno`
--

CREATE TABLE `estado_turno` (
  `id_estado` int(11) NOT NULL,
  `nombre` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estado_turno`
--

INSERT INTO `estado_turno` (`id_estado`, `nombre`) VALUES
(1, 'Pendiente'),
(2, 'Atendido'),
(3, 'Cancelado'),
(4, 'Ausente');

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
(3, 3, 'Rodríguez', 'Ana', 3, '2664000013', 1),
(8, 8, 'Sánchez', 'Verónica', 8, '2664000018', 1),
(9, 9, 'Romero', 'Carlos', 9, '2664000019', 1),
(10, 10, 'Torres', 'Paula', 10, '2664000020', 1),
(11, 8, 'Soria', 'Laura', 18, '2664000010', 1),
(12, 57, 'Peña', 'Laura', 14, '7349674666', 1),
(13, 3, 'Soria', 'Laura', 19, '2664000001', 1);

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
(2, 'Femenino');

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
(270, 1, 1),
(208, 2, 1),
(214, 3, 1),
(210, 4, 1),
(216, 5, 1),
(218, 6, 1),
(271, 1, 2),
(209, 2, 2),
(276, 3, 2),
(211, 4, 2),
(217, 5, 2),
(219, 6, 2),
(221, 7, 2),
(272, 1, 3),
(222, 5, 3),
(273, 1, 4),
(232, 2, 4),
(274, 6, 4),
(235, 1, 5),
(234, 2, 5),
(231, 1, 6),
(230, 6, 6),
(229, 1, 7),
(224, 1, 8),
(223, 3, 8);

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
(1, 'San Luis - San Luis'),
(2, 'Villa Mercedes - San Luis'),
(3, 'Villa de Merlo - San Luis'),
(4, 'La Punta - San Luis'),
(5, 'Juana Koslay - San Luis'),
(6, 'Justo Daract - San Luis'),
(7, 'Quines - San Luis'),
(8, 'La Toma - San Luis'),
(9, 'Santa Rosa del Conlara - San Luis'),
(10, 'Tilisarao - San Luis'),
(11, 'San Francisco del Monte de Oro - San Luis'),
(12, 'Villa de la Quebrada - San Luis'),
(13, 'Villa Larca - San Luis'),
(14, 'Villa General Roca - San Luis'),
(15, 'Villa del Carmen - San Luis'),
(16, 'Las Chacras - San Luis'),
(17, 'Las Aguadas - San Luis'),
(18, 'Las Lagunas - San Luis'),
(19, 'Las Vertientes - San Luis'),
(20, 'La Vertiente - San Luis'),
(21, 'La Florida - San Luis'),
(22, 'La Calera - San Luis'),
(23, 'La Bajada - San Luis'),
(24, 'La Punilla - San Luis'),
(25, 'La Maroma - San Luis'),
(26, 'La Carolina - San Luis'),
(27, 'La Estrechura - San Luis'),
(28, 'La Ribera - San Luis'),
(29, 'Lavaisse - San Luis'),
(30, 'Lafínur - San Luis'),
(31, 'Leandro N. Alem - San Luis'),
(32, 'Liborio Luna - San Luis'),
(33, 'Luján - San Luis'),
(34, 'Los Cajones - San Luis'),
(35, 'Los Molles - San Luis'),
(36, 'Los Overos - San Luis'),
(37, 'Los Alanices - San Luis'),
(38, 'Los Argüelos - San Luis'),
(39, 'Los Chañares - San Luis'),
(40, 'Los Chilcas - San Luis'),
(41, 'Los Coros - San Luis'),
(42, 'Los Duraznitos - San Luis'),
(43, 'Los Lobos - San Luis'),
(44, 'Los Ranchos - San Luis'),
(45, 'Manantial Blanco - San Luis'),
(46, 'Manantiales - San Luis'),
(47, 'Martín de Loyola - San Luis'),
(48, 'Merlo - San Luis'),
(49, 'Molino Chico - San Luis'),
(50, 'Mosmota - San Luis'),
(51, 'Nahuel Mapá - San Luis'),
(52, 'Naschel - San Luis'),
(53, 'Navia - San Luis'),
(54, 'Nogolí - San Luis'),
(55, 'Nueva Constitución - San Luis'),
(56, 'Nueva Escocia - San Luis'),
(57, 'Nueva Galia - San Luis'),
(58, 'Ojo de Agua - San Luis'),
(59, 'Ojos del Río - San Luis'),
(60, 'Pantanillo - San Luis'),
(61, 'Papagayos - San Luis'),
(62, 'Paso Grande - San Luis'),
(63, 'Paso del Rey - San Luis'),
(64, 'Pedernera - San Luis'),
(65, 'Pescadores - San Luis'),
(66, 'Piedras Chatas - San Luis'),
(67, 'Polledo - San Luis'),
(68, 'Potrerillo - San Luis'),
(69, 'Potrero de los Funes - San Luis'),
(70, 'Pozo del Carril - San Luis'),
(71, 'Pozo del Tala - San Luis'),
(72, 'Punta del Agua - San Luis'),
(73, 'Ranquelcó - San Luis'),
(74, 'Renca - San Luis'),
(75, 'Rincón del Carmen - San Luis'),
(76, 'Riocito - San Luis'),
(77, 'Río Grande - San Luis'),
(78, 'Río Juan Gómez - San Luis'),
(79, 'Río Quinto - San Luis'),
(80, 'Rosario - San Luis'),
(81, 'Saladillo - San Luis'),
(82, 'Salado - San Luis'),
(83, 'Salinas del Bebedero - San Luis'),
(84, 'San Ambrosio - San Luis'),
(85, 'San Antonio - San Luis'),
(86, 'San Eduardo - San Luis'),
(87, 'San Felipe - San Luis'),
(88, 'San Gerónimo - San Luis'),
(89, 'San Ignacio - San Luis'),
(90, 'San Isidro - San Luis'),
(91, 'San José del Morro - San Luis'),
(92, 'San Martín del Alto Negro - San Luis'),
(93, 'San Miguel - San Luis'),
(94, 'San Pablo - San Luis'),
(95, 'San Pedro - San Luis'),
(96, 'San Roque - San Luis'),
(97, 'San Salvador - San Luis'),
(98, 'Santa Rosa - San Luis'),
(99, 'Santa Rosa del Conlara - San Luis'),
(100, 'Santo Tomás - San Luis'),
(101, 'Socoscora - San Luis'),
(102, 'Soven - San Luis'),
(103, 'Suyuque Nuevo - San Luis'),
(104, 'Suyuque Viejo - San Luis'),
(105, 'Tala Verde - San Luis'),
(106, 'Talita - San Luis'),
(107, 'Talleres - San Luis'),
(108, 'Tilisarao - San Luis'),
(109, 'Toro Negro - San Luis'),
(110, 'Toscal - San Luis'),
(111, 'Trapiche - San Luis'),
(112, 'Travesía - San Luis'),
(113, 'Tres Amigos - San Luis'),
(114, 'Unión - San Luis'),
(115, 'Usiyal - San Luis'),
(116, 'Vaca Parada - San Luis'),
(117, 'Valle de Pancanta - San Luis'),
(118, 'Varela - San Luis'),
(119, 'Villa de la Quebrada - San Luis'),
(120, 'Villa de Praga - San Luis'),
(121, 'Villa del Carmen - San Luis'),
(122, 'Villa General Roca - San Luis'),
(123, 'Villa Larca - San Luis'),
(124, 'Villa Mercedes - San Luis'),
(125, 'Villa Reynolds - San Luis'),
(126, 'Villa Salles - San Luis'),
(127, 'Zanjitas - San Luis');

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
(11, 'Ingreso por emergencia'),
(12, 'Consulta');

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
(383, 307, 270, 41, '2025-11-25 03:00:00', NULL, 1, 1),
(384, 308, 229, 68, '2025-11-25 03:00:00', NULL, 1, 1),
(385, 309, 270, 43, '2025-11-25 03:00:00', NULL, 1, 1);

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
(3, 32345678, 'Rodríguez', 'Carlos', '1978-12-01', 1, '2664000003', 'Calle Mitre 456', 3, 'carlos.rodriguez@mail.com', 1),
(8, 82345678, 'Sánchez', 'Jorge', '1975-04-10', 1, '2664000008', 'Calle Sarmiento 987', 8, 'jorge.sanchez@mail.com', 1),
(9, 92345678, 'Romero', 'Sofía', '2000-06-05', 2, '2664000009', 'Calle 25 de Mayo 112', 9, 'sofia.romero@mail.com', 1),
(10, 10234567, 'Torres Pacheco', 'Martín', '1999-08-25', 1, '2664000010', 'Calle España 334', 17, 'martin.torres@mail.com', 1),
(21, 11111111, 'Pérez', 'Juan', '1980-01-01', 1, '2664000101', 'Calle Uno 123', 1, 'juan.perez@demo.com', 1),
(24, 35842052, 'Ricchiardi', 'Romanela', '1991-12-30', 2, '2664750247', 'los olivos', 1, 'roma.ricchiardi@gmail.com', 1),
(39, 45361293, 'Ricchiardi', 'Carla', '2004-07-11', 2, '5646546546', 'la pampeana', 16, 'carli@gmail.com', 1),
(57, 52006237, 'Rodriguez', 'Carla', '2005-03-05', 2, '634734646', '55 Roque Saenz Peña', 124, '1236jdkfasd@jmail.com', 1),
(97, 64356348, 'Gutierrez', 'Jorge', '2000-11-11', 1, '-65647376756', '308 Julio a Roca', 18, 'jkl@gmail.com', 0),
(101, 86, 'NN', 'No identificado', NULL, 1, NULL, NULL, NULL, NULL, 0),
(102, 846, 'NN', 'No identificado', NULL, 2, NULL, NULL, NULL, NULL, 1),
(103, 56487898, 'Franco', 'Marin', '1998-06-15', 1, '6666666666', 'los cipreces 123', 4, '123@gmail.com', 1),
(104, 475987970, 'Lucero', 'Mar', '2001-07-20', 1, '266576989', '556 av libre', 1, 'dgfg@gmail.com', 1),
(105, 47555646, 'Ramirez', 'Jorge', '2001-04-21', 1, '7765447555', '308 Julio a Roca', 16, 'rami.jorge@hotmail.com', 1),
(106, 546540, 'NN', 'No identificado', NULL, 2, NULL, NULL, NULL, NULL, 1),
(107, 34252525, 'NN', 'No identificado', NULL, 1, NULL, NULL, NULL, NULL, 1),
(108, 1, 'NN', 'No identificado', NULL, 2, NULL, NULL, NULL, NULL, 1),
(109, 2, 'NN', 'No identificado', NULL, 1, NULL, NULL, NULL, NULL, 1),
(110, 8, 'NN', 'No identificado', NULL, 2, NULL, NULL, NULL, NULL, 1),
(111, 77777777, 'Gonzalez', 'Brigit', '2007-02-21', 2, '2664678787', 'calle larga 123', 1, 'bg@gmail.com', 1),
(114, 76996, 'NN', 'No identificado', NULL, 2, NULL, NULL, NULL, NULL, 1),
(115, 23589, 'NN', 'No identificado', NULL, 1, NULL, NULL, NULL, NULL, 1),
(119, 87687, 'NN', 'No identificado', NULL, 2, NULL, NULL, NULL, NULL, 1);

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
(1, 1, 'General', 'Admin', 1, 1),
(2, 4, 'Gómez', 'Lucía', 2, 0),
(6, 25, 'Diaz', 'Gustavo', 2, 1),
(7, 26, 'Pérez', 'Juan', 2, 1);

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
  `id_especialidad` smallint(5) UNSIGNED DEFAULT NULL,
  `matricula` varchar(50) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `personal_salud`
--

INSERT INTO `personal_salud` (`id_personal_salud`, `id_usuario`, `apellido`, `nombre`, `id_rol_usuario`, `id_especialidad`, `matricula`, `activo`) VALUES
(1, 3, 'Fernández', 'Carlos', 4, 2, 'MAT123456', 1),
(2, 5, 'Pérez', 'María', 3, 16, 'ENF12345', 1),
(3, 12, 'Lopez', 'Ana', 4, 1, 'MCL001', 0),
(4, 13, 'Garcia', 'Luis', 4, 2, 'MCD002', 1),
(5, 14, 'Martinez', 'Sofia', 4, 3, 'MCP003', 1),
(6, 15, 'Gomez', 'Laura', 4, 4, 'MCG0047', 0),
(7, 16, 'Diaz', 'Raul', 4, 5, 'MCD005', 1),
(8, 17, 'Suarez', 'Elena', 4, 6, 'MCN006', 1),
(9, 18, 'Romero', 'Mario', 4, 7, 'MCP007', 1),
(10, 19, 'Torres', 'Lucia', 4, 8, 'MCT008', 1),
(11, 20, 'Mendez', 'Juan', 4, 9, 'MCI009', 1),
(12, 23, 'Carrillo', 'Ramon', 4, 17, 'M0987', 1),
(13, 24, 'Colombero', 'Viviana', 3, 1, 'E987', 1);

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

--
-- Volcado de datos para la tabla `registro_historia_clinica`
--

INSERT INTO `registro_historia_clinica` (`id_registro`, `id_admision`, `id_usuario`, `fecha_hora_reg`, `id_tipo`, `detalle`, `estado`) VALUES
(183, NULL, 23, '2025-07-26 03:00:00', 30, 'Ingreso hospitalario: ', 1),
(184, NULL, 23, '2025-07-26 03:00:00', 30, 'Ingreso hospitalario: ', 1),
(185, NULL, 23, '2025-07-26 16:59:07', 24, 'Alta médica: se curo', 1),
(186, NULL, 23, '2025-07-26 19:06:20', 24, 'Alta médica: se curo', 1),
(187, NULL, 23, '2025-07-26 19:06:00', 30, 'Ingreso por emergencia.', 1),
(188, NULL, 24, '2025-07-26 19:07:00', 4, 'hgfygcjy', 1),
(189, NULL, 24, '2025-07-26 19:25:00', 7, 'jj4+4', 1),
(190, NULL, 20, '2025-07-26 19:41:00', 30, 'Ingreso por emergencia.', 1),
(191, NULL, 23, '2025-07-26 03:00:00', 30, 'Ingreso hospitalario: ', 1),
(192, NULL, 23, '2025-07-26 19:51:00', 2, 'igjhvhjvjhv', 1),
(193, NULL, 23, '2025-07-26 19:52:17', 24, 'Alta médica: se curo', 1),
(194, NULL, 16, '2025-07-26 22:24:00', 30, 'Ingreso por emergencia.', 1),
(196, NULL, 23, '2025-07-27 01:08:00', 1, 'sdfgdfg', 1),
(197, NULL, 23, '2025-07-27 01:12:31', 24, 'Alta médica: se curo', 1),
(198, NULL, 20, '2025-11-19 22:32:00', 30, 'Ingreso por emergencia.', 1),
(199, NULL, 23, '2025-11-19 23:42:00', 30, 'Ingreso por emergencia.', 1),
(200, NULL, NULL, '2025-11-20 03:00:00', 30, 'Ingreso hospitalario: ', 1),
(201, NULL, 19, '2025-11-21 01:46:00', 30, 'Ingreso por emergencia.', 1),
(202, NULL, 14, '2025-11-21 01:46:00', 30, 'Ingreso por emergencia.', 1),
(203, NULL, 17, '2025-11-21 02:48:00', 30, 'Ingreso por emergencia.', 1),
(204, NULL, 19, '2025-11-20 03:00:00', 30, 'Ingreso hospitalario: ', 1),
(205, NULL, NULL, '2025-11-20 03:00:00', 30, 'Ingreso hospitalario: ', 1),
(206, NULL, NULL, '2025-11-21 03:00:00', 30, 'Ingreso hospitalario: ', 1),
(207, NULL, 13, '2025-11-21 13:49:00', 30, 'Ingreso por emergencia.', 1),
(208, NULL, 23, '2025-11-21 03:00:00', 30, 'Ingreso hospitalario: ', 1),
(209, NULL, 23, '2025-11-21 14:46:09', 24, 'Alta médica: se curo', 1),
(210, NULL, 24, '2025-11-21 16:11:00', 7, 'normal', 1),
(211, NULL, 19, '2025-11-25 11:27:00', 30, 'Ingreso por emergencia.', 1),
(212, NULL, 19, '2025-11-25 11:37:00', 30, 'Ingreso por emergencia.', 1),
(213, NULL, 18, '2025-11-25 11:38:00', 30, 'Ingreso por emergencia.', 1),
(214, 307, NULL, '2025-11-25 03:00:00', 30, 'Ingreso hospitalario: ', 1),
(215, 308, 19, '2025-11-25 03:00:00', 30, 'Ingreso hospitalario: ', 1),
(216, 309, NULL, '2025-11-25 03:00:00', 30, 'Ingreso hospitalario: ', 1);

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
(1, 'Terapia Intermedia'),
(2, 'Terapia Intensiva'),
(3, 'Neonatología'),
(4, 'Quirofano'),
(5, 'Internación pediatrica'),
(6, 'Maternidad'),
(7, 'Urgencias'),
(8, 'Geriatría');

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
(29, 'Grupo Sanguíneo'),
(30, 'Ingreso'),
(31, 'Egreso');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `token_recuperacion`
--

CREATE TABLE `token_recuperacion` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `token` varchar(100) NOT NULL,
  `expiracion` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `token_recuperacion`
--

INSERT INTO `token_recuperacion` (`id`, `id_usuario`, `token`, `expiracion`) VALUES
(1, 1, '56cb1ed43d12d8c96a6430596139448f042c952ee2c6dc5ab246f2bbe621a586', '2025-07-21 15:49:03'),
(2, 1, '998d2adda7abc94d976009835986c4a09a302ff38e568704cc17b196154302ac', '2025-07-21 15:49:04'),
(3, 1, '625b1a87b687d1a753c17d3c7ae106283d2084cef51729d4ef0abf50567491d1', '2025-07-21 15:49:36'),
(4, 1, 'add3000df230abac25ff3b50db72a95101bfb0320c3b8bb65619d4aeefe361c6', '2025-07-21 15:55:01'),
(5, 1, '3801a0f9a5dc4f3644f9b5f2726dec47c35499a3eadf022cac8932c0270687d1', '2025-07-21 15:56:56'),
(6, 1, '0c7e300076d8d604bef090e46cf18a0eaa8cb712c0ce7126c6d694964607b66a', '2025-07-21 15:56:57'),
(7, 1, '8e339bcccb1634f764e2c58893c74465a19d9ef78d970d8b625466673910f998', '2025-07-21 15:56:58'),
(8, 1, '63d7dbf673c0bfba06ccc2ed3480a610e2ea4fb7c9dc48a094de8b472da1a1be', '2025-07-21 15:56:58'),
(9, 1, '5c1d5b46a20c88409068f89024257b9e94e611180c4e627b1a621b6fe3edb03f', '2025-07-21 15:56:58'),
(10, 1, 'd3af014d92d19d6ba0b04526ec222dbe2cce27a76a962c3cc15facea29a46de5', '2025-07-21 15:56:59'),
(11, 1, '9fa6042a9c7e554903d7295e4c8d0604a0bc117eb7e7ad538d64bdae01198d16', '2025-07-21 15:57:01'),
(12, 1, 'db2cbef0b1c04a3d0f1750c4a2c68cbd9c87d1838c72ceb1539365f4d9efcf9d', '2025-07-21 15:57:02'),
(13, 1, '5dfdf97e8a7d0d09fa363ba200b110cd04bcaa95f9bb021d145e1393011814c4', '2025-07-21 15:57:02'),
(14, 1, 'd0786c82d9fbd1059f9405e076d7a2cc5a0c95fd7caea7187748c49e44a29f94', '2025-07-21 15:57:02'),
(15, 1, '38d8a7c1de5dd4cea8727edb2c4e73dee3e7e2b9880a7e7661b90d18d1f9b832', '2025-07-21 15:57:03'),
(16, 1, '08bd43cac00220b735b6209ec2508395af7591f13bcb0e81e217a5c6d10b936a', '2025-07-21 15:57:03'),
(17, 1, 'ad0a1e01d32a3fa902ecc657e0c06f9ef3da8d8d24576d4659d53732f39da5f1', '2025-07-21 15:57:05'),
(18, 1, '1a0358d8bd0c0945d7281d0391aedc5195b94067561f3ef3ea5df5dc0f0d03c4', '2025-07-21 15:57:06'),
(19, 1, '328d0072714ab8f984641985a15fcd454be7346c62e266a91611814ff2bb49d3', '2025-07-21 16:10:46'),
(20, 1, '96dea653042de8fa3d570921ee2da43dc27a059b68137fe5ef1f33c9b90d320a', '2025-07-21 16:11:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turno`
--

CREATE TABLE `turno` (
  `id_turno` int(11) NOT NULL,
  `id_agenda` int(11) NOT NULL,
  `id_paciente` int(10) UNSIGNED DEFAULT NULL,
  `fecha_hora` datetime DEFAULT NULL,
  `id_obra_social` smallint(5) UNSIGNED DEFAULT NULL,
  `id_estado` int(11) DEFAULT NULL,
  `id_motivo` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `turno`
--

INSERT INTO `turno` (`id_turno`, `id_agenda`, `id_paciente`, `fecha_hora`, `id_obra_social`, `id_estado`, `id_motivo`) VALUES
(110, 48, 1, '2025-07-31 11:00:00', NULL, 2, 12),
(111, 47, 1, '2025-07-30 11:00:00', NULL, 2, 12),
(112, 52, 24, '2025-08-01 11:00:00', NULL, 2, 12),
(113, 50, 10, '2025-07-31 18:00:00', NULL, 2, 12),
(115, 48, 57, '2025-07-31 11:30:00', NULL, 2, 12),
(117, 49, 1, '2025-07-30 18:45:00', NULL, 2, 11),
(119, 49, 1, '2025-07-30 19:30:00', NULL, 2, 12),
(120, 49, 1, '2025-07-30 20:15:00', NULL, 2, 12),
(121, 49, 39, '2025-07-30 21:00:00', NULL, 2, 12),
(122, 49, 57, '2025-07-30 18:00:00', NULL, 2, 12),
(123, 50, 111, '2025-11-27 20:15:00', 4, 1, 12),
(124, 46, 1, '2025-11-24 12:00:00', 3, 2, 12),
(125, 48, 24, '2025-11-27 11:00:00', 7, 1, 12),
(127, 48, 3, '2025-11-27 11:30:00', 3, 1, 12),
(128, 48, 105, '2025-11-27 16:30:00', 5, 1, 12),
(129, 48, 1, '2025-11-27 15:30:00', 4, 1, 12);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `username`, `email`, `password`, `estado`) VALUES
(1, 'admin', 'roma.ricchiardi@gmail.com', '$2b$10$pflqPaq9wNzklsngHOhxSOmVbsba3dGPyxj7sg4so5UkMuoNn/PQy', 1),
(3, 'drcarlos', 'drcarlos@testmail.com', '$2b$10$eEjB7RUQmVECGToMyN99FOd5KQONHUtPUm6xEJG93wJmEf8zvYxGu', 1),
(4, 'recepcion1', 'recepcion1@testmail.com', '$2b$10$zbtqzBzyzYXeRfOAmH69V.nosw0PRHt1hprU7kZW7VvONvHFLXKmy', 1),
(5, 'enfermera1', 'enfermera1@testmail.com', '$2b$10$xOK0M25ehv6hPTpEYiIYIOuA2R0HqciXeQsA4WzvFTqafDB35AAY6', 1),
(12, 'clinica1', 'clinica1@testmail.com', '$2b$12$0XhZnBpxC8mkgHWHSuidcOy5yKECPb9T0TEUtqgoHDfFntZPQgd7G', 1),
(13, 'cardio1', 'cardio1@testmail.com', '$2b$12$KELc024SMNhGA7mmehqmf.IVH2On5oQlxnTH0iQ6f6BRwHralLsCq', 1),
(14, 'pedia1', 'pedia1@testmail.com', '$2b$12$jHCzaXvF5SIQ.bCHoa9LpuxYgEJMuQS36PIBA4TWF0UMooqmeMS/O', 1),
(15, 'gine1', 'gine1@testmail.com', '$2b$12$1Nl5UINw1Q4GeNI4XXO0JeoloeHhWXL1KwM2fM3MJjASUcJalO1N6', 1),
(16, 'derma1', 'derma1@testmail.com', '$2b$12$jVhZk06s0Tv66/73XcOheeVJWJkJlsFyWygOnRIzi/MpPGYBB6mAG', 1),
(17, 'neuro1', 'neuro1@testmail.com', '$2b$12$Za9/dX7dVRI8VVErUl99AulScI4soJ3nf2lAKgxMzBWkAnRndTVZ6', 1),
(18, 'psiqui1', 'psiqui1@testmail.com', '$2b$12$Tj0OukxZp/wxtlPu8DwIAef.C57X6h4hTM2hnPrS8PtJfJNE0tcfy', 1),
(19, 'trauma1', 'trauma1@testmail.com', '$2b$12$/.AaK/94aLWLup66TfeQvu7IzVGtaN0BIN3/VCIXFQIdSwjRY9pWu', 1),
(20, 'infecto1', 'infecto1@testmail.com', '$2b$12$H.f8NxgXVFmAw3uV37XHdONqplCzpz6651zL/eQrik3078mrNoryu', 1),
(22, 'pedros', 'pedros@testmail.com', '$2b$10$Qg9NlCioUcNNXEq82.66WOG4u74x/cwrWgflD.RD1esXAWcwHJlqS', 1),
(23, 'RamonC', 'RamonC@testmail.com', '$2b$10$gq4Zr17MuJffttfnqtrl6OvzN/jKh1yJRw7NI6MQ1uxELX/o7gdLa', 1),
(24, 'VivianaC', 'VivianaC@testmail.com', '$2b$10$0T43FY3IMFROxklrS1rJmupYnUj2QE5Wq.jGVaTOianlrLw6thnXe', 1),
(25, 'GDiaz', 'GDiaz@testmail.com', '$2b$10$hvcTO0Mm7p6Gy6uYSd0Dx.ck6f6QsornRjqs4kRJq7lhSD5FvgX7K', 1),
(26, 'juan.perez', 'juan.perez@mail.com', '$2b$10$Hv2L8NVleex77e5bU1QZAOlImVTsxyxKFVyb56dYv/QCI9XAH21gS', 1);

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
  ADD KEY `admision_ibfk_204` (`id_motivo`),
  ADD KEY `id_usuario` (`id_usuario`) USING BTREE;

--
-- Indices de la tabla `agenda`
--
ALTER TABLE `agenda`
  ADD PRIMARY KEY (`id_agenda`),
  ADD KEY `agenda_ibfk_1` (`id_dia`),
  ADD KEY `agenda_ibfk_2` (`id_personal_salud`);

--
-- Indices de la tabla `cama`
--
ALTER TABLE `cama`
  ADD PRIMARY KEY (`id_cama`),
  ADD UNIQUE KEY `cama_nombre_unico_por_habitacion` (`nombre`,`id_habitacion`),
  ADD KEY `id_habitacion` (`id_habitacion`);

--
-- Indices de la tabla `dia_semana`
--
ALTER TABLE `dia_semana`
  ADD PRIMARY KEY (`id_dia`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `especialidad`
--
ALTER TABLE `especialidad`
  ADD PRIMARY KEY (`id_especialidad`);

--
-- Indices de la tabla `estado_turno`
--
ALTER TABLE `estado_turno`
  ADD PRIMARY KEY (`id_estado`);

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
  ADD UNIQUE KEY `num` (`num`,`id_sector`),
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
  ADD UNIQUE KEY `dni_paciente` (`dni_paciente`,`telefono`,`email`),
  ADD KEY `paciente_ibfk_93` (`id_genero`),
  ADD KEY `paciente_ibfk_94` (`id_localidad`);

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
  ADD KEY `id_admision` (`id_admision`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_tipo` (`id_tipo`);

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
-- Indices de la tabla `token_recuperacion`
--
ALTER TABLE `token_recuperacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `turno`
--
ALTER TABLE `turno`
  ADD PRIMARY KEY (`id_turno`),
  ADD UNIQUE KEY `uniq_turno_por_fecha` (`id_agenda`,`fecha_hora`),
  ADD KEY `id_estado` (`id_estado`),
  ADD KEY `id_paciente` (`id_paciente`),
  ADD KEY `id_motivo` (`id_motivo`),
  ADD KEY `fk_turno_obra_social` (`id_obra_social`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `admision`
--
ALTER TABLE `admision`
  MODIFY `id_admision` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=310;

--
-- AUTO_INCREMENT de la tabla `agenda`
--
ALTER TABLE `agenda`
  MODIFY `id_agenda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT de la tabla `cama`
--
ALTER TABLE `cama`
  MODIFY `id_cama` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT de la tabla `especialidad`
--
ALTER TABLE `especialidad`
  MODIFY `id_especialidad` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `familiar`
--
ALTER TABLE `familiar`
  MODIFY `id_familiar` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `genero`
--
ALTER TABLE `genero`
  MODIFY `id_genero` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `habitacion`
--
ALTER TABLE `habitacion`
  MODIFY `id_habitacion` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=278;

--
-- AUTO_INCREMENT de la tabla `localidad`
--
ALTER TABLE `localidad`
  MODIFY `id_localidad` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=128;

--
-- AUTO_INCREMENT de la tabla `motivo_ingreso`
--
ALTER TABLE `motivo_ingreso`
  MODIFY `id_motivo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `movimiento`
--
ALTER TABLE `movimiento`
  MODIFY `id_mov` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `movimiento_habitacion`
--
ALTER TABLE `movimiento_habitacion`
  MODIFY `id_movimiento` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=386;

--
-- AUTO_INCREMENT de la tabla `obra_social`
--
ALTER TABLE `obra_social`
  MODIFY `id_obra_social` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `paciente`
--
ALTER TABLE `paciente`
  MODIFY `id_paciente` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=120;

--
-- AUTO_INCREMENT de la tabla `parentesco`
--
ALTER TABLE `parentesco`
  MODIFY `id_parentesco` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `personal_administrativo`
--
ALTER TABLE `personal_administrativo`
  MODIFY `id_personal_admin` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `personal_salud`
--
ALTER TABLE `personal_salud`
  MODIFY `id_personal_salud` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `registro_historia_clinica`
--
ALTER TABLE `registro_historia_clinica`
  MODIFY `id_registro` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=217;

--
-- AUTO_INCREMENT de la tabla `rol_usuario`
--
ALTER TABLE `rol_usuario`
  MODIFY `id_rol_usuario` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `sector`
--
ALTER TABLE `sector`
  MODIFY `id_sector` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `tipo_registro`
--
ALTER TABLE `tipo_registro`
  MODIFY `id_tipo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `token_recuperacion`
--
ALTER TABLE `token_recuperacion`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `turno`
--
ALTER TABLE `turno`
  MODIFY `id_turno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

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
  ADD CONSTRAINT `admision_ibfk_205` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `agenda`
--
ALTER TABLE `agenda`
  ADD CONSTRAINT `agenda_ibfk_1` FOREIGN KEY (`id_dia`) REFERENCES `dia_semana` (`id_dia`),
  ADD CONSTRAINT `agenda_ibfk_2` FOREIGN KEY (`id_personal_salud`) REFERENCES `personal_salud` (`id_personal_salud`);

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
  ADD CONSTRAINT `registro_historia_clinica_ibfk_113` FOREIGN KEY (`id_tipo`) REFERENCES `tipo_registro` (`id_tipo`);

--
-- Filtros para la tabla `token_recuperacion`
--
ALTER TABLE `token_recuperacion`
  ADD CONSTRAINT `token_recuperacion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `turno`
--
ALTER TABLE `turno`
  ADD CONSTRAINT `fk_turno_obra_social` FOREIGN KEY (`id_obra_social`) REFERENCES `obra_social` (`id_obra_social`),
  ADD CONSTRAINT `turno_ibfk_1` FOREIGN KEY (`id_agenda`) REFERENCES `agenda` (`id_agenda`) ON UPDATE CASCADE,
  ADD CONSTRAINT `turno_ibfk_2` FOREIGN KEY (`id_estado`) REFERENCES `estado_turno` (`id_estado`),
  ADD CONSTRAINT `turno_ibfk_3` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  ADD CONSTRAINT `turno_ibfk_4` FOREIGN KEY (`id_motivo`) REFERENCES `motivo_ingreso` (`id_motivo`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
