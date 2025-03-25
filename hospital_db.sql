-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-03-2025 a las 00:15:38
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

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
  `id_admision` int(11) NOT NULL,
  `id_paciente` int(11) NOT NULL,
  `fecha_hora_ingreso` datetime NOT NULL,
  `motivo_ing` varchar(255) DEFAULT NULL,
  `fecha_hora_egreso` datetime DEFAULT NULL,
  `motivo_egr` varchar(255) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `familiar`
--

CREATE TABLE `familiar` (
  `id_familiar` int(11) NOT NULL,
  `id_paciente` int(11) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `parentesco` varchar(50) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `habitacion`
--

CREATE TABLE `habitacion` (
  `id_habitacion` int(11) NOT NULL,
  `sector` varchar(50) DEFAULT NULL,
  `num` int(11) DEFAULT NULL,
  `cama` char(1) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimiento_habitacion`
--

CREATE TABLE `movimiento_habitacion` (
  `id_movimiento` int(11) NOT NULL,
  `id_admision` int(11) NOT NULL,
  `id_habitacion` int(11) NOT NULL,
  `fecha_hora_ingreso` datetime NOT NULL,
  `fecha_hora_egreso` datetime DEFAULT NULL,
  `tipo_mov` varchar(100) NOT NULL,
  `desinfeccion` varchar(20) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente`
--

CREATE TABLE `paciente` (
  `id_paciente` int(11) NOT NULL,
  `dni_paciente` int(11) NOT NULL,
  `apellido_p` varchar(100) NOT NULL,
  `nombre_p` varchar(100) NOT NULL,
  `fecha_nac` date DEFAULT NULL,
  `genero` char(2) NOT NULL DEFAULT 'M',
  `cobertura` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `nacionalidad` varchar(50) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registro_historia_clinica`
--

CREATE TABLE `registro_historia_clinica` (
  `id_registro` int(11) NOT NULL,
  `id_paciente` int(11) NOT NULL,
  `id_admision` int(11) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `fecha_hora_reg` datetime NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `detalle` varchar(500) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `rol` varchar(50) NOT NULL DEFAULT 'administracion',
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `admision`
--
ALTER TABLE `admision`
  ADD PRIMARY KEY (`id_admision`),
  ADD KEY `fk_admision_paciente` (`id_paciente`),
  ADD KEY `fk_admision_usuario` (`id_usuario`);

--
-- Indices de la tabla `familiar`
--
ALTER TABLE `familiar`
  ADD PRIMARY KEY (`id_familiar`),
  ADD KEY `fk_familiar_paciente` (`id_paciente`);

--
-- Indices de la tabla `habitacion`
--
ALTER TABLE `habitacion`
  ADD PRIMARY KEY (`id_habitacion`);

--
-- Indices de la tabla `movimiento_habitacion`
--
ALTER TABLE `movimiento_habitacion`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `fk_mov_admision` (`id_admision`),
  ADD KEY `fk_mov_habitacion` (`id_habitacion`);

--
-- Indices de la tabla `paciente`
--
ALTER TABLE `paciente`
  ADD PRIMARY KEY (`id_paciente`);

--
-- Indices de la tabla `registro_historia_clinica`
--
ALTER TABLE `registro_historia_clinica`
  ADD PRIMARY KEY (`id_registro`),
  ADD KEY `fk_registro_paciente` (`id_paciente`),
  ADD KEY `fk_registro_admision` (`id_admision`),
  ADD KEY `fk_registro_usuario` (`id_usuario`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `admision`
--
ALTER TABLE `admision`
  MODIFY `id_admision` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `familiar`
--
ALTER TABLE `familiar`
  MODIFY `id_familiar` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `habitacion`
--
ALTER TABLE `habitacion`
  MODIFY `id_habitacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimiento_habitacion`
--
ALTER TABLE `movimiento_habitacion`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `paciente`
--
ALTER TABLE `paciente`
  MODIFY `id_paciente` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `registro_historia_clinica`
--
ALTER TABLE `registro_historia_clinica`
  MODIFY `id_registro` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `admision`
--
ALTER TABLE `admision`
  ADD CONSTRAINT `fk_admision_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  ADD CONSTRAINT `fk_admision_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `familiar`
--
ALTER TABLE `familiar`
  ADD CONSTRAINT `fk_familiar_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`);

--
-- Filtros para la tabla `movimiento_habitacion`
--
ALTER TABLE `movimiento_habitacion`
  ADD CONSTRAINT `fk_mov_admision` FOREIGN KEY (`id_admision`) REFERENCES `admision` (`id_admision`),
  ADD CONSTRAINT `fk_mov_habitacion` FOREIGN KEY (`id_habitacion`) REFERENCES `habitacion` (`id_habitacion`);

--
-- Filtros para la tabla `registro_historia_clinica`
--
ALTER TABLE `registro_historia_clinica`
  ADD CONSTRAINT `fk_registro_admision` FOREIGN KEY (`id_admision`) REFERENCES `admision` (`id_admision`),
  ADD CONSTRAINT `fk_registro_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  ADD CONSTRAINT `fk_registro_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
