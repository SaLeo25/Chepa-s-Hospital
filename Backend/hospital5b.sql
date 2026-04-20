--
-- PostgreSQL database dump
--

\restrict Jy3WnzmRSrGFnkQ4sqUwFqUbWQUec6lqbTZDPM9AONQlSFWyPx7o3IRLhoXVaUU

-- Dumped from database version 17.9 (Ubuntu 17.9-0ubuntu0.25.10.1)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: consultorio_disponible(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.consultorio_disponible(id_consul integer) RETURNS text
    LANGUAGE plpgsql
    AS $$
	DECLARE
	t_disponible BOOLEAN;
	t_resultado TEXT;
	BEGIN
		SELECT consultorios.disponible INTO t_disponible
		FROM consultorios
		WHERE consultorios.id_consultorio = id_consul;
		IF t_disponible = true THEN
			t_resultado := 'Disponible';
		ELSE
			t_resultado := 'Ocupado';
		END IF;
		RETURN t_resultado;
	END;
$$;


ALTER FUNCTION public.consultorio_disponible(id_consul integer) OWNER TO postgres;

--
-- Name: descuento(numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.descuento(precio numeric) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
BEGIN
	IF precio > 1000 THEN
		RETURN precio - precio * 0.20;
	ELSE 
		RETURN precio;
	END IF;
END;
$$;


ALTER FUNCTION public.descuento(precio numeric) OWNER TO postgres;

--
-- Name: doctor_esp(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.doctor_esp(nom_doc character varying) RETURNS TABLE(nombre_doctor character varying, id_especialidad integer, nombre character varying)
    LANGUAGE plpgsql
    AS $$
	BEGIN
		RETURN QUERY
		SELECT (doctores.nombre_doctor, doctores.id_especialidad, especialidades.nombre) FROM
		doctores JOIN especialidades ON (doctores.id_especialidad=especialidades.id_especialidad)
		WHERE doctores.nombre_doctor = nom_doc;
	END;
$$;


ALTER FUNCTION public.doctor_esp(nom_doc character varying) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: consultas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consultas (
    id_consulta integer NOT NULL,
    id_paciente integer NOT NULL,
    id_doctor integer NOT NULL,
    id_consultorio integer NOT NULL,
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    motivo_consulta text,
    diagnostico text,
    tratamiento text,
    estado character varying(20) DEFAULT 'Registrada'::character varying,
    duracion integer
);


ALTER TABLE public.consultas OWNER TO postgres;

--
-- Name: TABLE consultas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consultas IS 'Leonardo Salazar';


--
-- Name: pacientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pacientes (
    id_paciente integer NOT NULL,
    nombre_paciente character varying(55) NOT NULL,
    num_expediente integer,
    sexo character varying(20),
    numero_telefono character varying(12) NOT NULL,
    correo character varying(50),
    edad integer,
    status integer DEFAULT 3,
    curp character varying(18) NOT NULL,
    contrasena character varying(256) NOT NULL
);


ALTER TABLE public.pacientes OWNER TO postgres;

--
-- Name: TABLE pacientes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.pacientes IS 'Sopita(Sofia)';


--
-- Name: vista_historial; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_historial AS
 SELECT pacientes.id_paciente,
    pacientes.nombre_paciente,
    pacientes.num_expediente,
    pacientes.sexo,
    pacientes.numero_telefono,
    pacientes.correo,
    pacientes.edad,
    pacientes.status,
    consultas.id_consulta,
    consultas.fecha_hora,
    consultas.motivo_consulta,
    consultas.diagnostico,
    consultas.tratamiento,
    consultas.id_doctor,
    consultas.id_consultorio
   FROM (public.pacientes
     LEFT JOIN public.consultas ON ((pacientes.id_paciente = consultas.id_paciente)))
  ORDER BY pacientes.id_paciente, consultas.fecha_hora DESC;


ALTER VIEW public.vista_historial OWNER TO postgres;

--
-- Name: VIEW vista_historial; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.vista_historial IS 'Jonathan ';


--
-- Name: historial(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.historial(nombre character varying) RETURNS SETOF public.vista_historial
    LANGUAGE plpgsql
    AS $$
	BEGIN
		RETURN QUERY
		SELECT * FROM vista_historial WHERE vista_historial.nombre_paciente=nombre;
	END;
$$;


ALTER FUNCTION public.historial(nombre character varying) OWNER TO postgres;

--
-- Name: iva(numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.iva(precio numeric) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
BEGIN
	RETURN precio * 0.16;
END;
$$;


ALTER FUNCTION public.iva(precio numeric) OWNER TO postgres;

--
-- Name: administrativos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administrativos (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    puesto character varying(100) NOT NULL,
    nombre_apartamentos character varying(100) NOT NULL
);


ALTER TABLE public.administrativos OWNER TO postgres;

--
-- Name: TABLE administrativos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.administrativos IS 'Miguel Ansoni';


--
-- Name: administrativos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.administrativos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.administrativos_id_seq OWNER TO postgres;

--
-- Name: administrativos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.administrativos_id_seq OWNED BY public.administrativos.id;


--
-- Name: auxiliares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auxiliares (
    id_auxiliar integer NOT NULL,
    nombre character varying(60) NOT NULL,
    apellido character varying(60) NOT NULL,
    tipo_auxiliar character varying(20) NOT NULL,
    turno character varying(20) NOT NULL
)
PARTITION BY LIST (tipo_auxiliar);


ALTER TABLE public.auxiliares OWNER TO postgres;

--
-- Name: TABLE auxiliares; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.auxiliares IS 'Marianis';


--
-- Name: auxiliares_id_auxiliar_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auxiliares_id_auxiliar_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auxiliares_id_auxiliar_seq OWNER TO postgres;

--
-- Name: auxiliares_id_auxiliar_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auxiliares_id_auxiliar_seq OWNED BY public.auxiliares.id_auxiliar;


--
-- Name: citas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.citas (
    id_cita integer NOT NULL,
    id_paciente integer,
    fecha date,
    id_consultorio integer,
    id_doctor integer,
    tipo_cita character varying(20) NOT NULL,
    hora time without time zone,
    estado character varying(20) DEFAULT 'Pendiente'::character varying
)
PARTITION BY LIST (tipo_cita);


ALTER TABLE public.citas OWNER TO postgres;

--
-- Name: TABLE citas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.citas IS 'Luis';


--
-- Name: citas_id_cita_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.citas_id_cita_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.citas_id_cita_seq OWNER TO postgres;

--
-- Name: citas_id_cita_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.citas_id_cita_seq OWNED BY public.citas.id_cita;


--
-- Name: doctores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctores (
    id_doctor integer NOT NULL,
    nombre_doctor character varying(100) NOT NULL,
    cedula_profesional character varying(50) NOT NULL,
    telefono character varying(20) NOT NULL,
    id_especialidad integer,
    consultorio integer,
    usuario character varying(100),
    contrasena character varying(256),
    correo character varying(100),
    estado character varying(20) DEFAULT 'Activo'::character varying
);


ALTER TABLE public.doctores OWNER TO postgres;

--
-- Name: TABLE doctores; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.doctores IS 'Jasmine';


--
-- Name: citas_por_doctor; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.citas_por_doctor AS
 SELECT doctores.nombre_doctor,
    citas.fecha,
    pacientes.nombre_paciente
   FROM ((public.citas
     JOIN public.doctores ON ((citas.id_doctor = doctores.id_doctor)))
     JOIN public.pacientes ON ((citas.id_paciente = pacientes.id_paciente)))
  ORDER BY doctores.nombre_doctor, citas.fecha;


ALTER VIEW public.citas_por_doctor OWNER TO postgres;

--
-- Name: VIEW citas_por_doctor; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.citas_por_doctor IS 'Jasmine Acosta Merino';


--
-- Name: citas_programadas; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.citas_programadas AS
 SELECT pacientes.id_paciente,
    pacientes.nombre_paciente,
    citas.fecha,
    citas.tipo_cita,
    doctores.nombre_doctor
   FROM ((public.citas
     JOIN public.pacientes ON ((citas.id_paciente = pacientes.id_paciente)))
     JOIN public.doctores ON ((citas.id_doctor = doctores.id_doctor)))
  ORDER BY pacientes.id_paciente, citas.fecha;


ALTER VIEW public.citas_programadas OWNER TO postgres;

--
-- Name: VIEW citas_programadas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.citas_programadas IS 'Mariana Medina';


--
-- Name: citas_urgencia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.citas_urgencia (
    id_cita integer DEFAULT nextval('public.citas_id_cita_seq'::regclass) NOT NULL,
    id_paciente integer,
    fecha date,
    id_consultorio integer,
    id_doctor integer,
    tipo_cita character varying(20) NOT NULL,
    hora time without time zone,
    estado character varying(20) DEFAULT 'Pendiente'::character varying
);


ALTER TABLE public.citas_urgencia OWNER TO postgres;

--
-- Name: consultas_id_consulta_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consultas_id_consulta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consultas_id_consulta_seq OWNER TO postgres;

--
-- Name: consultas_id_consulta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consultas_id_consulta_seq OWNED BY public.consultas.id_consulta;


--
-- Name: consultorios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consultorios (
    id_consultorio integer NOT NULL,
    nombre_consultorio character varying(100) NOT NULL,
    piso integer NOT NULL,
    edificio character varying(50) NOT NULL,
    disponible boolean DEFAULT true,
    id_area integer,
    CONSTRAINT consultorios_piso_check CHECK ((piso >= 0))
);


ALTER TABLE public.consultorios OWNER TO postgres;

--
-- Name: TABLE consultorios; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consultorios IS 'Kevin';


--
-- Name: consultorios_disponibles; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.consultorios_disponibles AS
 SELECT id_consultorio,
    nombre_consultorio,
    piso,
    edificio,
    disponible
   FROM public.consultorios
  WHERE (disponible = true);


ALTER VIEW public.consultorios_disponibles OWNER TO postgres;

--
-- Name: VIEW consultorios_disponibles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.consultorios_disponibles IS 'Luis';


--
-- Name: consultorios_id_consultorio_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consultorios_id_consultorio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consultorios_id_consultorio_seq OWNER TO postgres;

--
-- Name: consultorios_id_consultorio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consultorios_id_consultorio_seq OWNED BY public.consultorios.id_consultorio;


--
-- Name: hospital; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hospital (
    id_area integer NOT NULL,
    nombre_area character varying(100) NOT NULL,
    tipo_cuarto character varying(25) NOT NULL,
    num_cuarto character varying(10) NOT NULL,
    num_camillas integer NOT NULL,
    piso integer NOT NULL,
    edificio character varying(100) NOT NULL,
    disponible boolean DEFAULT true,
    CONSTRAINT hospital_piso_check CHECK ((piso >= 0))
);


ALTER TABLE public.hospital OWNER TO postgres;

--
-- Name: TABLE hospital; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.hospital IS 'Hecho por: Steven';


--
-- Name: cuartos_disponibles; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.cuartos_disponibles AS
 SELECT h.id_area,
    h.nombre_area,
    h.tipo_cuarto,
    h.num_cuarto,
    h.num_camillas,
    h.piso,
    h.edificio,
    h.disponible,
    c.nombre_consultorio
   FROM (public.hospital h
     LEFT JOIN public.consultorios c ON ((h.id_area = c.id_area)))
  WHERE (h.disponible = true);


ALTER VIEW public.cuartos_disponibles OWNER TO postgres;

--
-- Name: doctores_id_doctor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctores_id_doctor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctores_id_doctor_seq OWNER TO postgres;

--
-- Name: doctores_id_doctor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctores_id_doctor_seq OWNED BY public.doctores.id_doctor;


--
-- Name: enfermeria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enfermeria (
    id_auxiliar integer DEFAULT nextval('public.auxiliares_id_auxiliar_seq'::regclass) NOT NULL,
    nombre character varying(60) NOT NULL,
    apellido character varying(60) NOT NULL,
    tipo_auxiliar character varying(20) NOT NULL,
    turno character varying(20) NOT NULL
);


ALTER TABLE public.enfermeria OWNER TO postgres;

--
-- Name: TABLE enfermeria; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.enfermeria IS 'Pablo Madrigal (Dios me vea)';


--
-- Name: especialidades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.especialidades (
    id_especialidad integer NOT NULL,
    nombre character varying(50) NOT NULL,
    responsable character varying(50)
);


ALTER TABLE public.especialidades OWNER TO postgres;

--
-- Name: TABLE especialidades; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.especialidades IS 'Camilo';


--
-- Name: especialidades_id_especialidad_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.especialidades_id_especialidad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.especialidades_id_especialidad_seq OWNER TO postgres;

--
-- Name: especialidades_id_especialidad_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.especialidades_id_especialidad_seq OWNED BY public.especialidades.id_especialidad;


--
-- Name: hospital_id_area_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hospital_id_area_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hospital_id_area_seq OWNER TO postgres;

--
-- Name: hospital_id_area_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hospital_id_area_seq OWNED BY public.hospital.id_area;


--
-- Name: visitas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visitas (
    id_visita integer NOT NULL,
    id_paciente integer NOT NULL,
    id_consultorio integer NOT NULL,
    id_doctor integer NOT NULL,
    fecha date NOT NULL,
    motivo text
);


ALTER TABLE public.visitas OWNER TO postgres;

--
-- Name: TABLE visitas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.visitas IS 'ferchis';


--
-- Name: info_doctores; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.info_doctores AS
 SELECT DISTINCT visitas.id_doctor,
    doctores.nombre_doctor,
    visitas.id_consultorio,
    consultorios.nombre_consultorio,
    consultorios.piso,
    consultorios.edificio
   FROM ((public.visitas
     JOIN public.doctores USING (id_doctor))
     JOIN public.consultorios USING (id_consultorio));


ALTER VIEW public.info_doctores OWNER TO postgres;

--
-- Name: VIEW info_doctores; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.info_doctores IS 'ferchis';


--
-- Name: intervencion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.intervencion (
    id_intervencion integer NOT NULL,
    id_paciente integer NOT NULL,
    id_doctor integer NOT NULL,
    id_procedimiento integer NOT NULL,
    id_area integer NOT NULL,
    fecha_intervencion timestamp without time zone NOT NULL,
    observaciones text,
    id_auxiliar integer NOT NULL,
    tipo_auxiliar character varying(20) NOT NULL,
    id_cita integer NOT NULL,
    tipo_cita character varying(20) NOT NULL,
    estado character varying(20) DEFAULT 'Programada'::character varying
);


ALTER TABLE public.intervencion OWNER TO postgres;

--
-- Name: TABLE intervencion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.intervencion IS 'Carlos';


--
-- Name: intervencion_id_intervencion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.intervencion_id_intervencion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.intervencion_id_intervencion_seq OWNER TO postgres;

--
-- Name: intervencion_id_intervencion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.intervencion_id_intervencion_seq OWNED BY public.intervencion.id_intervencion;


--
-- Name: pacientes_id_paciente_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pacientes_id_paciente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pacientes_id_paciente_seq OWNER TO postgres;

--
-- Name: pacientes_id_paciente_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pacientes_id_paciente_seq OWNED BY public.pacientes.id_paciente;


--
-- Name: para_consulta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.para_consulta (
    id_cita integer DEFAULT nextval('public.citas_id_cita_seq'::regclass) NOT NULL,
    id_paciente integer,
    fecha date,
    id_consultorio integer,
    id_doctor integer,
    tipo_cita character varying(20) NOT NULL,
    hora time without time zone,
    estado character varying(20) DEFAULT 'Pendiente'::character varying
);


ALTER TABLE public.para_consulta OWNER TO postgres;

--
-- Name: para_intervencion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.para_intervencion (
    id_cita integer DEFAULT nextval('public.citas_id_cita_seq'::regclass) NOT NULL,
    id_paciente integer,
    fecha date,
    id_consultorio integer,
    id_doctor integer,
    tipo_cita character varying(20) NOT NULL,
    hora time without time zone,
    estado character varying(20) DEFAULT 'Pendiente'::character varying
);


ALTER TABLE public.para_intervencion OWNER TO postgres;

--
-- Name: paramedicos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paramedicos (
    id_auxiliar integer DEFAULT nextval('public.auxiliares_id_auxiliar_seq'::regclass) NOT NULL,
    nombre character varying(60) NOT NULL,
    apellido character varying(60) NOT NULL,
    tipo_auxiliar character varying(20) NOT NULL,
    turno character varying(20) NOT NULL
);


ALTER TABLE public.paramedicos OWNER TO postgres;

--
-- Name: TABLE paramedicos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.paramedicos IS 'El chepa bb (Abraham)';


--
-- Name: procedimientos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.procedimientos (
    id_procedimiento integer NOT NULL,
    codigo_procedimiento character varying(50) NOT NULL,
    nombre_procedimiento character varying(255) NOT NULL,
    tipo_intervencion character varying(100) NOT NULL,
    especialidad_medica character varying(100) NOT NULL,
    requiere_hospitalizacion boolean NOT NULL
);


ALTER TABLE public.procedimientos OWNER TO postgres;

--
-- Name: TABLE procedimientos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.procedimientos IS 'Jonathan';


--
-- Name: procedimientos_id_procedimiento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.procedimientos_id_procedimiento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.procedimientos_id_procedimiento_seq OWNER TO postgres;

--
-- Name: procedimientos_id_procedimiento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.procedimientos_id_procedimiento_seq OWNED BY public.procedimientos.id_procedimiento;


--
-- Name: quirofanos_ocupados; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.quirofanos_ocupados AS
 SELECT id_area,
    nombre_area,
    tipo_cuarto,
    num_cuarto,
    num_camillas,
    piso,
    edificio,
    disponible
   FROM public.hospital
  WHERE (((tipo_cuarto)::text = 'Quirofano'::text) AND (disponible = false));


ALTER VIEW public.quirofanos_ocupados OWNER TO postgres;

--
-- Name: VIEW quirofanos_ocupados; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.quirofanos_ocupados IS 'Sofi';


--
-- Name: status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.status (
    id_status integer NOT NULL,
    status character varying(20)
);


ALTER TABLE public.status OWNER TO postgres;

--
-- Name: TABLE status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.status IS 'Kevin';


--
-- Name: status_id_status_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.status_id_status_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.status_id_status_seq OWNER TO postgres;

--
-- Name: status_id_status_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.status_id_status_seq OWNED BY public.status.id_status;


--
-- Name: status_pacientes; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.status_pacientes AS
 SELECT pacientes.id_paciente,
    pacientes.nombre_paciente,
    status.status AS status_paciente
   FROM (public.pacientes
     JOIN public.status ON ((status.id_status = pacientes.status)))
  ORDER BY pacientes.nombre_paciente;


ALTER VIEW public.status_pacientes OWNER TO postgres;

--
-- Name: vigilancia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vigilancia (
    id_auxiliar integer DEFAULT nextval('public.auxiliares_id_auxiliar_seq'::regclass) NOT NULL,
    nombre character varying(60) NOT NULL,
    apellido character varying(60) NOT NULL,
    tipo_auxiliar character varying(20) NOT NULL,
    turno character varying(20) NOT NULL
);


ALTER TABLE public.vigilancia OWNER TO postgres;

--
-- Name: TABLE vigilancia; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.vigilancia IS 'Saul (con panoch)';


--
-- Name: visitas_id_visita_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.visitas_id_visita_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.visitas_id_visita_seq OWNER TO postgres;

--
-- Name: visitas_id_visita_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.visitas_id_visita_seq OWNED BY public.visitas.id_visita;


--
-- Name: vista_consultorios_ocupados; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_consultorios_ocupados AS
 SELECT id_consultorio,
    nombre_consultorio,
    piso,
    edificio,
    id_area
   FROM public.consultorios
  WHERE (disponible = false);


ALTER VIEW public.vista_consultorios_ocupados OWNER TO postgres;

--
-- Name: VIEW vista_consultorios_ocupados; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.vista_consultorios_ocupados IS 'Carlos Emiliano Solis Diaz';


--
-- Name: vista_cuartos_ocupados; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_cuartos_ocupados AS
 SELECT hospital.id_area,
    hospital.nombre_area,
    hospital.tipo_cuarto,
    hospital.num_cuarto,
    hospital.num_camillas,
    hospital.piso,
    hospital.edificio,
    pacientes.id_paciente,
    pacientes.nombre_paciente,
    intervencion.fecha_intervencion
   FROM ((public.hospital
     JOIN public.intervencion ON ((hospital.id_area = intervencion.id_area)))
     JOIN public.pacientes ON ((pacientes.id_paciente = intervencion.id_paciente)))
  WHERE (hospital.disponible = false);


ALTER VIEW public.vista_cuartos_ocupados OWNER TO postgres;

--
-- Name: VIEW vista_cuartos_ocupados; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.vista_cuartos_ocupados IS 'Camilo';


--
-- Name: vista_historial_intervenciones; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_historial_intervenciones AS
 SELECT p.id_paciente,
    p.nombre_paciente,
    i.id_intervencion,
    i.fecha_intervencion,
    i.observaciones
   FROM (public.pacientes p
     JOIN public.intervencion i ON ((p.id_paciente = i.id_paciente)));


ALTER VIEW public.vista_historial_intervenciones OWNER TO postgres;

--
-- Name: VIEW vista_historial_intervenciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.vista_historial_intervenciones IS 'Pablo Negrete Madrigal';


--
-- Name: vista_historial_pacientes; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_historial_pacientes AS
 SELECT p.id_paciente,
    p.nombre_paciente,
    'Consulta'::character varying AS tipo_evento,
    c.fecha_hora AS fecha_evento,
    c.motivo_consulta AS detalle_evento
   FROM (public.pacientes p
     JOIN public.consultas c ON ((p.id_paciente = c.id_paciente)))
UNION ALL
 SELECT p.id_paciente,
    p.nombre_paciente,
    'Intervenci¢n'::character varying AS tipo_evento,
    i.fecha_intervencion AS fecha_evento,
    proc.nombre_procedimiento AS detalle_evento
   FROM ((public.pacientes p
     JOIN public.intervencion i ON ((p.id_paciente = i.id_paciente)))
     LEFT JOIN public.procedimientos proc ON ((i.id_procedimiento = proc.id_procedimiento)))
  ORDER BY 1, 4 DESC;


ALTER VIEW public.vista_historial_pacientes OWNER TO postgres;

--
-- Name: VIEW vista_historial_pacientes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.vista_historial_pacientes IS 'Leonardo Salazar';


--
-- Name: vista_quirofanos; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_quirofanos AS
 SELECT id_area,
    nombre_area,
    tipo_cuarto,
    num_cuarto,
    num_camillas,
    piso,
    edificio,
    disponible
   FROM public.hospital
  WHERE ((tipo_cuarto)::text = 'Quirofano'::text);


ALTER VIEW public.vista_quirofanos OWNER TO postgres;

--
-- Name: VIEW vista_quirofanos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.vista_quirofanos IS 'Miguel Ansoni Gonzalez Sosa';


--
-- Name: citas_urgencia; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citas ATTACH PARTITION public.citas_urgencia FOR VALUES IN ('Urgencia');


--
-- Name: enfermeria; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auxiliares ATTACH PARTITION public.enfermeria FOR VALUES IN ('enfermeria');


--
-- Name: para_consulta; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citas ATTACH PARTITION public.para_consulta FOR VALUES IN ('Consulta');


--
-- Name: para_intervencion; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citas ATTACH PARTITION public.para_intervencion FOR VALUES IN ('Intervencion');


--
-- Name: paramedicos; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auxiliares ATTACH PARTITION public.paramedicos FOR VALUES IN ('Paramedico');


--
-- Name: vigilancia; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auxiliares ATTACH PARTITION public.vigilancia FOR VALUES IN ('vigilancia');


--
-- Name: administrativos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrativos ALTER COLUMN id SET DEFAULT nextval('public.administrativos_id_seq'::regclass);


--
-- Name: auxiliares id_auxiliar; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auxiliares ALTER COLUMN id_auxiliar SET DEFAULT nextval('public.auxiliares_id_auxiliar_seq'::regclass);


--
-- Name: citas id_cita; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citas ALTER COLUMN id_cita SET DEFAULT nextval('public.citas_id_cita_seq'::regclass);


--
-- Name: consultas id_consulta; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultas ALTER COLUMN id_consulta SET DEFAULT nextval('public.consultas_id_consulta_seq'::regclass);


--
-- Name: consultorios id_consultorio; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultorios ALTER COLUMN id_consultorio SET DEFAULT nextval('public.consultorios_id_consultorio_seq'::regclass);


--
-- Name: doctores id_doctor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctores ALTER COLUMN id_doctor SET DEFAULT nextval('public.doctores_id_doctor_seq'::regclass);


--
-- Name: especialidades id_especialidad; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.especialidades ALTER COLUMN id_especialidad SET DEFAULT nextval('public.especialidades_id_especialidad_seq'::regclass);


--
-- Name: hospital id_area; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospital ALTER COLUMN id_area SET DEFAULT nextval('public.hospital_id_area_seq'::regclass);


--
-- Name: intervencion id_intervencion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intervencion ALTER COLUMN id_intervencion SET DEFAULT nextval('public.intervencion_id_intervencion_seq'::regclass);


--
-- Name: pacientes id_paciente; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pacientes ALTER COLUMN id_paciente SET DEFAULT nextval('public.pacientes_id_paciente_seq'::regclass);


--
-- Name: procedimientos id_procedimiento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedimientos ALTER COLUMN id_procedimiento SET DEFAULT nextval('public.procedimientos_id_procedimiento_seq'::regclass);


--
-- Name: status id_status; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.status ALTER COLUMN id_status SET DEFAULT nextval('public.status_id_status_seq'::regclass);


--
-- Name: visitas id_visita; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitas ALTER COLUMN id_visita SET DEFAULT nextval('public.visitas_id_visita_seq'::regclass);


--
-- Data for Name: administrativos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administrativos (id, nombre, puesto, nombre_apartamentos) FROM stdin;
1	Juan Antonio	Director Logistica	Logistica
2	Americo Vespucio	Contador	Finanzas
3	Ernesto de la Cruz	Auxiliar Contable	Finanzas
4	Maria Angelina	Direccion Medica	Direccion y Gerencia
5	Abraham Jacinto Gallo	Sistemas e Informacion	Soporte Operativo
6	Ricardo Riquelme	Gestion de Calidad	Calidad y Apoyo
\.


--
-- Data for Name: citas_urgencia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.citas_urgencia (id_cita, id_paciente, fecha, id_consultorio, id_doctor, tipo_cita, hora, estado) FROM stdin;
1	1	2024-05-20	\N	1	Urgencia	09:00:00	Pendiente
11	8	2026-04-08	\N	5	Urgencia	10:10:00	Confirmada
17	9	2026-03-27	\N	6	Urgencia	17:00:00	Confirmada
\.


--
-- Data for Name: consultas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consultas (id_consulta, id_paciente, id_doctor, id_consultorio, fecha_hora, motivo_consulta, diagnostico, tratamiento, estado, duracion) FROM stdin;
\.


--
-- Data for Name: consultorios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consultorios (id_consultorio, nombre_consultorio, piso, edificio, disponible, id_area) FROM stdin;
1	Consultorio General 1	1	Edificio A	t	\N
2	Consultorio General 2	1	Edificio A	t	\N
3	Consultorio General 3	1	Edificio B	t	\N
4	Consultorio Cardiolog¡a	3	Edificio A	f	\N
5	Consultorio Ginecolog¡a	2	Edificio B	t	\N
6	Consultorio Pediatr¡a	2	Edificio A	f	\N
7	Consultorio Oftalmolog¡a	2	Edificio B	t	\N
8	Consultorio Gastroenterolog¡a	3	Edificio A	t	\N
9	Consultorio Dermatolog¡a	2	Edificio B	t	\N
10	Consultorio Odontolog¡a	1	Edificio A	f	\N
\.


--
-- Data for Name: doctores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctores (id_doctor, nombre_doctor, cedula_profesional, telefono, id_especialidad, consultorio, usuario, contrasena, correo, estado) FROM stdin;
4	Fernanda	7654321	4624056938	4	\N	\N	\N	\N	Activo
5	Octavio	7568902015	4621057445	5	\N	\N	\N	\N	Activo
6	Martin	5689021	4291027458	6	\N	\N	\N	\N	Activo
7	Angel	6025847563	4291046304	7	\N	\N	\N	\N	Activo
1	Carlos	1234567	4624568899	1	5	Carlos	827ccb0eea8a706c4c34a16891f84e7b	\N	Activo
9	Ansonyo	10010	12345678	1	5	camisvv	$2a$06$pD1nT2llhE33oV4aYTkGxOll2CKfGrflgvjy5cu8/HdzsgF1Y3oGG	\N	Activo
2	Saul	1023458	4621234569	2	6	Saul	$2a$06$fmcZiB6Dq7Cpwbi8w8C/tuPwqAgwDdn0wFdg14f3hYiHIuxVOxvWC	\N	Activo
3	Mariana	2034567	4621056878	3	4	\N	\N	\N	Activo
\.


--
-- Data for Name: enfermeria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enfermeria (id_auxiliar, nombre, apellido, tipo_auxiliar, turno) FROM stdin;
31	Luisito	Hernandez	enfermeria	Matutino
32	Ansoni	Sosa	enfermeria	Matutino
36	Pablito	Martines	enfermeria	Matutino
37	Fernanda	Gutierrez	enfermeria	Tarde
\.


--
-- Data for Name: especialidades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.especialidades (id_especialidad, nombre, responsable) FROM stdin;
1	Ginecología	Sofia
2	Pediatría	jasmine
3	Cardiología	Fernanda
4	Oftalmologia	Luis
5	Gastroenterología	Mariana
6	Dermatología	Kevin
7	Odontología	Steven
\.


--
-- Data for Name: hospital; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hospital (id_area, nombre_area, tipo_cuarto, num_cuarto, num_camillas, piso, edificio, disponible) FROM stdin;
1	Urgencias	Consulta	U-101	1	1	Edificio Principal	t
2	Cirugia	Quirofano	Q-205	2	2	Pabellon Quirurgico	t
3	Hospitalizacion	Habitacion Individual	H-304	1	3	Torre de Hospitalizacion	t
4	Pediatria	Habitacion Compartida	P-112	4	1	Edificio Infantil	t
5	Cuidados Intensivos	UCI	I-401	1	4	Torre de Hospitalizacion	t
6	Maternidad	Habitacion Postparto	M-215	2	2	Pabellon Materno-Infantil	t
7	Radiologia	Sala de Espera	R-001	10	1	Edificio de Diagnostico	t
\.


--
-- Data for Name: intervencion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.intervencion (id_intervencion, id_paciente, id_doctor, id_procedimiento, id_area, fecha_intervencion, observaciones, id_auxiliar, tipo_auxiliar, id_cita, tipo_cita, estado) FROM stdin;
5	1	1	1	1	2024-05-20 14:30:00	por fin funciono	2	Paramedico	1	Urgencia	Programada
\.


--
-- Data for Name: pacientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pacientes (id_paciente, nombre_paciente, num_expediente, sexo, numero_telefono, correo, edad, status, curp, contrasena) FROM stdin;
1	Sofia	1	Femenino	4291735796	sopita@gmail.com	19	3	CURP_GENERICA	HASH_TEMPORAL
2	Fernando	2	Masculino	4692562639	fer@gmail.com	32	3	CURP_GENERICA	HASH_TEMPORAL
3	Sandra	3	Femenino	4429696325	sandy@gmail.com	28	3	CURP_GENERICA	HASH_TEMPORAL
4	Hugo	4	Masculino	4628554098	hugojugo@gmail.com	15	3	CURP_GENERICA	HASH_TEMPORAL
5	Maria	5	Femenino	4294153695	mary@gmail.com	42	3	CURP_GENERICA	HASH_TEMPORAL
6	Alison	6	Femenino	5543662550	ali@gmail.com	20	3	CURP_GENERICA	HASH_TEMPORAL
7	Kevin Gutierrez	7	Masculino	524291300408	kevin@gmail.com	19	3	GURK060823HGTTDVA8	$2a$06$tZVDbl7oW4X56WqxvIjwXuvZNbPubXp.7rqLzjUQ2vz4mWxcmiN/q
8	Mariana Medina	8	Femenino	524731115102	mariana@gmail.com	19	3	MECM060817MGTDVRA0	$2a$06$y1hvfnfyGBJMs/JX4VFdreHOtl0WgKPyKOAWidDaiBLLW8Z8GF2ZG
9	Luis Vargas	9	Masculino	524621757486	luis@gmail.com	19	3	VAAL060729HGTRLSA4	$2a$06$w9kSDt4dXTLqqkHgFPgx9OFcFyTkbrx0q70oPS/.jfEMA/RIVcGxO
10	Ansoni Sosa	10	Masculino	524291286322	ansoni@gmail.com	19	3	GOSM060524HGTNSGA7	$2a$06$raEQeg/Ryv0DF5/4cGjrlOd2hKhYeX4fcHgHfUv7jb0yeLmxG9LNy
\.


--
-- Data for Name: para_consulta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.para_consulta (id_cita, id_paciente, fecha, id_consultorio, id_doctor, tipo_cita, hora, estado) FROM stdin;
3	1	2026-05-21	3	2	Consulta	09:00:00	Pendiente
6	7	2026-04-15	\N	7	Consulta	10:00:00	Confirmada
7	8	2026-03-22	\N	\N	Consulta	09:00:00	Pendiente
9	8	2026-03-21	\N	\N	Consulta	21:30:00	Pendiente
10	8	2026-03-25	\N	9	Consulta	17:50:00	Cancelada
13	8	2026-03-24	\N	9	Consulta	15:00:00	Confirmada
14	8	2026-03-25	\N	9	Consulta	16:06:00	Pendiente
16	7	2026-03-27	\N	3	Consulta	09:30:00	Cancelada
\.


--
-- Data for Name: para_intervencion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.para_intervencion (id_cita, id_paciente, fecha, id_consultorio, id_doctor, tipo_cita, hora, estado) FROM stdin;
4	3	2026-05-22	1	2	Intervencion	09:00:00	Pendiente
5	5	2026-05-23	2	2	Intervencion	09:00:00	Pendiente
8	8	2026-03-30	\N	\N	Intervencion	08:15:00	Pendiente
12	8	2026-03-23	\N	3	Intervencion	15:52:00	Pendiente
15	8	2026-03-31	6	2	Intervencion	15:11:00	Confirmada
18	9	2026-03-31	6	2	Intervencion	17:30:00	Confirmada
\.


--
-- Data for Name: paramedicos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paramedicos (id_auxiliar, nombre, apellido, tipo_auxiliar, turno) FROM stdin;
2	Peter	Parker	Paramedico	Nocturno
14	Roman	Riquelme	Paramedico	Matutino
15	Gustavo	Cerati	Paramedico	Matutino
16	Alberto	Spinetta	Paramedico	Matutino
17	Gael	García	Paramedico	Nocturno
18	John	Wick	Paramedico	Nocturno
\.


--
-- Data for Name: procedimientos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.procedimientos (id_procedimiento, codigo_procedimiento, nombre_procedimiento, tipo_intervencion, especialidad_medica, requiere_hospitalizacion) FROM stdin;
1	proc-001	cirugia general	especializada	general	f
3	proc-003	lavado gastrico	emergencia	Gastroenterología	t
2	proc-002	legrado uterino	quirurgico leve	Ginecologia	f
4	proc-004	marcapasos	emergencia	Cardiología	t
5	proc-005	pterigion	emergencia	Oftalmologia	t
6	proc-006	biopsia de piel	muestra	Dermatología	f
\.


--
-- Data for Name: status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.status (id_status, status) FROM stdin;
1	HOSPITALIZADO
2	EN TRATAMIENTO
3	ALTA
4	DEFUNCION
\.


--
-- Data for Name: vigilancia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vigilancia (id_auxiliar, nombre, apellido, tipo_auxiliar, turno) FROM stdin;
5	Miguel	Saldañavv	vigilancia	Noche
6	Camislo	Gallego	vigilancia	Día
7	Mariana	Yaqui	vigilancia	Noche
8	Steven	Fcking	vigilancia	Día
9	Kevin	CasaLlena	vigilancia	Noche
10	Chayan	Cuevas	vigilancia	Día
11	Carlos	Mcum	vigilancia	Noche
33	Martin	Carrillo	vigilancia	Vespertino
34	Maria	Reyes	vigilancia	Matutino
35	Stif	Sosa	vigilancia	Vespertino
\.


--
-- Data for Name: visitas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitas (id_visita, id_paciente, id_consultorio, id_doctor, fecha, motivo) FROM stdin;
\.


--
-- Name: administrativos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.administrativos_id_seq', 1, false);


--
-- Name: auxiliares_id_auxiliar_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auxiliares_id_auxiliar_seq', 37, true);


--
-- Name: citas_id_cita_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.citas_id_cita_seq', 18, true);


--
-- Name: consultas_id_consulta_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consultas_id_consulta_seq', 1, false);


--
-- Name: consultorios_id_consultorio_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consultorios_id_consultorio_seq', 10, true);


--
-- Name: doctores_id_doctor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctores_id_doctor_seq', 9, true);


--
-- Name: especialidades_id_especialidad_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.especialidades_id_especialidad_seq', 7, true);


--
-- Name: hospital_id_area_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hospital_id_area_seq', 7, true);


--
-- Name: intervencion_id_intervencion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.intervencion_id_intervencion_seq', 5, true);


--
-- Name: pacientes_id_paciente_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pacientes_id_paciente_seq', 10, true);


--
-- Name: procedimientos_id_procedimiento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.procedimientos_id_procedimiento_seq', 1, true);


--
-- Name: status_id_status_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.status_id_status_seq', 4, true);


--
-- Name: visitas_id_visita_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.visitas_id_visita_seq', 1, false);


--
-- Name: administrativos administrativos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrativos
    ADD CONSTRAINT administrativos_pkey PRIMARY KEY (id);


--
-- Name: auxiliares auxiliares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auxiliares
    ADD CONSTRAINT auxiliares_pkey PRIMARY KEY (id_auxiliar, tipo_auxiliar);


--
-- Name: citas citas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT citas_pkey PRIMARY KEY (id_cita, tipo_cita);


--
-- Name: citas_urgencia citas_urgencia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citas_urgencia
    ADD CONSTRAINT citas_urgencia_pkey PRIMARY KEY (id_cita, tipo_cita);


--
-- Name: consultas consultas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultas
    ADD CONSTRAINT consultas_pkey PRIMARY KEY (id_consulta);


--
-- Name: consultorios consultorios_nombre_consultorio_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultorios
    ADD CONSTRAINT consultorios_nombre_consultorio_key UNIQUE (nombre_consultorio);


--
-- Name: consultorios consultorios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultorios
    ADD CONSTRAINT consultorios_pkey PRIMARY KEY (id_consultorio);


--
-- Name: doctores doctores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctores
    ADD CONSTRAINT doctores_pkey PRIMARY KEY (id_doctor);


--
-- Name: enfermeria enfermeria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enfermeria
    ADD CONSTRAINT enfermeria_pkey PRIMARY KEY (id_auxiliar, tipo_auxiliar);


--
-- Name: especialidades especialidades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.especialidades
    ADD CONSTRAINT especialidades_pkey PRIMARY KEY (id_especialidad);


--
-- Name: hospital hospital_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospital
    ADD CONSTRAINT hospital_pkey PRIMARY KEY (id_area);


--
-- Name: intervencion intervencion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intervencion
    ADD CONSTRAINT intervencion_pkey PRIMARY KEY (id_intervencion);


--
-- Name: pacientes pacientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_pkey PRIMARY KEY (id_paciente);


--
-- Name: para_consulta para_consulta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.para_consulta
    ADD CONSTRAINT para_consulta_pkey PRIMARY KEY (id_cita, tipo_cita);


--
-- Name: para_intervencion para_intervencion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.para_intervencion
    ADD CONSTRAINT para_intervencion_pkey PRIMARY KEY (id_cita, tipo_cita);


--
-- Name: paramedicos paramedicos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paramedicos
    ADD CONSTRAINT paramedicos_pkey PRIMARY KEY (id_auxiliar, tipo_auxiliar);


--
-- Name: procedimientos procedimientos_codigo_procedimiento_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedimientos
    ADD CONSTRAINT procedimientos_codigo_procedimiento_key UNIQUE (codigo_procedimiento);


--
-- Name: procedimientos procedimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedimientos
    ADD CONSTRAINT procedimientos_pkey PRIMARY KEY (id_procedimiento);


--
-- Name: status status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.status
    ADD CONSTRAINT status_pkey PRIMARY KEY (id_status);


--
-- Name: doctores unique_usuario; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctores
    ADD CONSTRAINT unique_usuario UNIQUE (usuario);


--
-- Name: vigilancia vigilancia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vigilancia
    ADD CONSTRAINT vigilancia_pkey PRIMARY KEY (id_auxiliar, tipo_auxiliar);


--
-- Name: visitas visitas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitas
    ADD CONSTRAINT visitas_pkey PRIMARY KEY (id_visita);


--
-- Name: citas_urgencia_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.citas_pkey ATTACH PARTITION public.citas_urgencia_pkey;


--
-- Name: enfermeria_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.auxiliares_pkey ATTACH PARTITION public.enfermeria_pkey;


--
-- Name: para_consulta_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.citas_pkey ATTACH PARTITION public.para_consulta_pkey;


--
-- Name: para_intervencion_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.citas_pkey ATTACH PARTITION public.para_intervencion_pkey;


--
-- Name: paramedicos_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.auxiliares_pkey ATTACH PARTITION public.paramedicos_pkey;


--
-- Name: vigilancia_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.auxiliares_pkey ATTACH PARTITION public.vigilancia_pkey;


--
-- Name: citas citas_id_consultorio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.citas
    ADD CONSTRAINT citas_id_consultorio_fkey FOREIGN KEY (id_consultorio) REFERENCES public.consultorios(id_consultorio);


--
-- Name: citas citas_id_doctor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.citas
    ADD CONSTRAINT citas_id_doctor_fkey FOREIGN KEY (id_doctor) REFERENCES public.doctores(id_doctor);


--
-- Name: citas citas_id_paciente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.citas
    ADD CONSTRAINT citas_id_paciente_fkey FOREIGN KEY (id_paciente) REFERENCES public.pacientes(id_paciente);


--
-- Name: doctores consultorio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctores
    ADD CONSTRAINT consultorio FOREIGN KEY (consultorio) REFERENCES public.consultorios(id_consultorio);


--
-- Name: doctores doctores_id_especialidad_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctores
    ADD CONSTRAINT doctores_id_especialidad_fkey FOREIGN KEY (id_especialidad) REFERENCES public.especialidades(id_especialidad);


--
-- Name: consultas fk_consultas_consultorio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultas
    ADD CONSTRAINT fk_consultas_consultorio FOREIGN KEY (id_consultorio) REFERENCES public.consultorios(id_consultorio) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: consultas fk_consultas_doctor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultas
    ADD CONSTRAINT fk_consultas_doctor FOREIGN KEY (id_doctor) REFERENCES public.doctores(id_doctor) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: consultas fk_consultas_paciente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultas
    ADD CONSTRAINT fk_consultas_paciente FOREIGN KEY (id_paciente) REFERENCES public.pacientes(id_paciente) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: consultorios fk_consultorio_hospital; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultorios
    ADD CONSTRAINT fk_consultorio_hospital FOREIGN KEY (id_area) REFERENCES public.hospital(id_area) ON DELETE CASCADE;


--
-- Name: doctores fk_doctor_consultorio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctores
    ADD CONSTRAINT fk_doctor_consultorio FOREIGN KEY (consultorio) REFERENCES public.consultorios(id_consultorio);


--
-- Name: intervencion fk_intervencion_auxiliar; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intervencion
    ADD CONSTRAINT fk_intervencion_auxiliar FOREIGN KEY (id_auxiliar, tipo_auxiliar) REFERENCES public.auxiliares(id_auxiliar, tipo_auxiliar);


--
-- Name: intervencion fk_intervencion_cita; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intervencion
    ADD CONSTRAINT fk_intervencion_cita FOREIGN KEY (id_cita, tipo_cita) REFERENCES public.citas(id_cita, tipo_cita);


--
-- Name: intervencion fk_intervencion_doctor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intervencion
    ADD CONSTRAINT fk_intervencion_doctor FOREIGN KEY (id_doctor) REFERENCES public.doctores(id_doctor);


--
-- Name: intervencion fk_intervencion_hospital; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intervencion
    ADD CONSTRAINT fk_intervencion_hospital FOREIGN KEY (id_area) REFERENCES public.hospital(id_area);


--
-- Name: intervencion fk_intervencion_paciente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intervencion
    ADD CONSTRAINT fk_intervencion_paciente FOREIGN KEY (id_paciente) REFERENCES public.pacientes(id_paciente);


--
-- Name: intervencion fk_intervencion_procedimiento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intervencion
    ADD CONSTRAINT fk_intervencion_procedimiento FOREIGN KEY (id_procedimiento) REFERENCES public.procedimientos(id_procedimiento);


--
-- Name: visitas fk_visitas_consultorio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitas
    ADD CONSTRAINT fk_visitas_consultorio FOREIGN KEY (id_consultorio) REFERENCES public.consultorios(id_consultorio);


--
-- Name: visitas fk_visitas_doctor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitas
    ADD CONSTRAINT fk_visitas_doctor FOREIGN KEY (id_doctor) REFERENCES public.doctores(id_doctor);


--
-- Name: visitas fk_visitas_paciente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitas
    ADD CONSTRAINT fk_visitas_paciente FOREIGN KEY (id_paciente) REFERENCES public.pacientes(id_paciente);


--
-- Name: pacientes status; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT status FOREIGN KEY (status) REFERENCES public.status(id_status);


--
-- PostgreSQL database dump complete
--

\unrestrict Jy3WnzmRSrGFnkQ4sqUwFqUbWQUec6lqbTZDPM9AONQlSFWyPx7o3IRLhoXVaUU

