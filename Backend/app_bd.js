require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('./db');

const app = express();
// Este código atrapará CUALQUIER petición que llegue al servidor
app.use((req, res, next) => {
    console.log(`📢 Petición recibida: ${req.method} ${req.url}`);
    next();
});
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

// Middleware de verificación de token - Leo.
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1]; // Formato: "Bearer <token>"
    if (!token) {
        return res.status(403).json({ message: 'Token inválido' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (err) {
        return res.status(403).json({ message: 'Token inválido' });
    }
};

// -- REGISTRO DE DOCTORES --
app.post('/api/registrar-doctor', async (req, res) => {
    const { usuario, contrasena, nombre_doctor, id_especialidad, cedula_profesional, telefono, consultorio, correo } = req.body;

    if (!usuario || !contrasena || !nombre_doctor) {
        return res.status(400).json({ message: "Usuario, contraseña y nombre del doctor son requeridos" });
    }

    try {
        const hashedPassword = await bcrypt.hash(contrasena, SALT_ROUNDS);

        const query = `
            INSERT INTO doctores (usuario, contrasena, nombre_doctor, id_especialidad, cedula_profesional, telefono, consultorio, correo)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id_doctor, usuario, nombre_doctor
        `;
        const values = [usuario, hashedPassword, nombre_doctor, id_especialidad, cedula_profesional, telefono, consultorio, correo];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: "Doctor registrado exitosamente",
            user: result.rows[0]
        });

    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ message: "El nombre de usuario ya existe" });
        }
        res.status(500).json({ error: err.message });
    }
});

// Obtener el historial de consultas de un doctor específico - VERSIÓN BLINDADA 🛡️
app.get('/api/consultas/doctor/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const idNum = parseInt(id); // Convertimos el parámetro a número

    // 🛡️ BLINDAJE: Validar que el ID sea un número positivo
    if (isNaN(idNum) || idNum <= 0) {
        console.log(`⚠️ [BACKEND] Intento de acceso con ID de doctor inválido: ${id}`);
        return res.status(400).json({ 
            message: "El ID del doctor debe ser un número positivo válido." 
        });
    }

    console.log(`🔍 [BACKEND] Buscando historial persistente para el doctor ID: ${idNum}`);

    try {
        // Consultamos la tabla 'consultas' ordenando por la fecha más reciente
        // Nota: Asegúrate de que la columna se llame 'fecha_hora' en tu tabla 'consultas'
        const query = `
            SELECT * FROM consultas 
            WHERE id_doctor = $1 
            ORDER BY fecha_hora DESC
        `;
        const result = await pool.query(query, [idNum]);
        
        console.log(`✅ [BACKEND] Se encontraron ${result.rows.length} registros para el doctor ${idNum}.`);
        
        // Enviamos el historial (si está vacío, enviará [], lo cual es correcto para React)
        res.json(result.rows);

    } catch (err) {
        console.error("💥 [BACKEND] Error crítico al recuperar historial:", err.message);
        res.status(500).json({ 
            error: "Error interno: No se pudo recuperar el historial de la base de datos." 
        });
    }
});

// Login (Autenticación) 
app.post('/api/login', async (req, res) => {
    const { usuario, contrasena } = req.body;

    try {
        const result = await pool.query('SELECT * FROM doctores WHERE usuario = $1', [usuario]);
        const doctor = result.rows[0];

        if (!doctor || contrasena !== doctor.contrasena) {
            console.log("❌ Credenciales inválidas para:", usuario);
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        console.log("✅ LOGIN EXITOSO para:", doctor.nombre_doctor);

        const token = jwt.sign(
            { id_doctor: doctor.id_doctor, usuario: doctor.usuario },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // MANDAMOS TODO ESTO PARA QUE EL FRONTEND NO TRONE
        res.json({ 
            token, 
            doctor: { 
                id_doctor: doctor.id_doctor,
                nombre: doctor.nombre_doctor,
                usuario: doctor.usuario,
                id_consultorio: doctor.id_consultorio, // <-- ESTO ES LO QUE TE FALTABA
                especialidad: doctor.especialidad || 'Médico General'
            } 
        });

    } catch (err) {
        console.error("Error en el login:", err);
        res.status(500).json({ error: err.message });
    }
});

// Obtener datos del doctor
app.get('/api/doctor/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT 
                d.id_doctor,
                d.nombre_doctor,
                d.usuario,
                d.cedula_profesional,
                d.telefono,
                d.correo,
                d.estado,
                e.nombre AS especialidad,
                c.id_consultorio,
                c.nombre_consultorio,
                c.piso,
                c.edificio,
                c.disponible
            FROM doctores d
            LEFT JOIN especialidades e ON d.id_especialidad = e.id_especialidad
            LEFT JOIN consultorios c ON d.consultorio = c.id_consultorio
            WHERE d.id_doctor = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Doctor no encontrado" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener citas del doctor
app.get('/api/doctor/:id/citas', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT 
                c.id_cita,
                c.fecha,
                c.hora,
                c.tipo_cita,
                c.estado,
                p.id_paciente,
                p.nombre_paciente,
                p.num_expediente,
                p.sexo,
                p.edad,
                con.id_consultorio,
                con.nombre_consultorio,
                con.piso,
                con.edificio
            FROM citas c
            LEFT JOIN pacientes p ON c.id_paciente = p.id_paciente
            LEFT JOIN consultorios con ON c.id_consultorio = con.id_consultorio
            WHERE c.id_doctor = $1
            ORDER BY c.fecha ASC, c.hora ASC
        `;

        const result = await pool.query(query, [id]);

        res.json(result.rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener consultorio asignado al doctor
app.get('/api/doctor/:id/consultorio', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT 
                c.id_consultorio,
                c.nombre_consultorio,
                c.piso,
                c.edificio,
                c.disponible,
                c.id_area,
                h.nombre_area
            FROM doctores d
            LEFT JOIN consultorios c ON d.consultorio = c.id_consultorio
            LEFT JOIN hospital h ON c.id_area = h.id_area
            WHERE d.id_doctor = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Consultorio no encontrado o no asignado" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Registrar una consulta médica - VERSIÓN BLINDADA 🛡️
app.post('/api/consultas', verifyToken, async (req, res) => {
    console.log("📥 [BACKEND] Recibiendo petición de consulta...");
    
    const {
        id_paciente,
        id_doctor,
        id_consultorio,
        motivo_consulta,
        diagnostico,
        tratamiento,
        observaciones,
        duracion
    } = req.body;

    // 1. Convertimos los IDs a números para validarlos correctamente
    const pId = parseInt(id_paciente);
    const dId = parseInt(id_doctor);
    const cId = parseInt(id_consultorio);
    const dur = parseInt(duracion);

    // 🛡️ BLINDAJE: Validación de seguridad y tipos de datos
    if (isNaN(pId) || pId <= 0 || isNaN(dId) || dId <= 0 || isNaN(cId) || cId <= 0) {
        console.log(`⚠️ [BACKEND] Intento de registro rechazado: IDs inválidos (P:${id_paciente}, D:${id_doctor}, C:${id_consultorio})`);
        return res.status(400).json({ 
            message: "Los IDs de paciente, doctor y consultorio deben ser números positivos válidos." 
        });
    }

    try {
        const query = `
            INSERT INTO consultas (
                id_paciente, id_doctor, id_consultorio, 
                motivo_consulta, diagnostico, tratamiento, 
                observaciones, duracion, fecha_hora
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
            RETURNING *
        `;

        const values = [
            pId,
            dId,
            cId,
            motivo_consulta || null,
            diagnostico || null,
            tratamiento || null,
            observaciones || null,
            isNaN(dur) || dur <= 0 ? 30 : dur // Si la duración es inválida, ponemos 30 por defecto
        ];

        const result = await pool.query(query, values);
        
        console.log(`✅ [BACKEND] Consulta guardada exitosamente para Paciente ID: ${pId}`);
        console.log(`📌 ID de Consulta generada: ${result.rows[0].id_consulta}`);

        res.status(201).json({
            message: "Consulta registrada exitosamente",
            consulta: result.rows[0]
        });

    } catch (err) {
        console.error("💥 [BACKEND] ERROR AL INSERTAR EN DB:", err.message);
        
        // Manejo específico para errores de Llave Foránea (Paciente o Doctor no existen)
        if (err.code === '23503') {
            return res.status(404).json({ 
                message: "Error de integridad: El paciente, doctor o consultorio no existe en el sistema." 
            });
        }

        res.status(500).json({ message: "Error interno de la base de datos", error: err.message });
    }
});

// Obtener expediente clínico del paciente - VERSIÓN BLINDADA
app.get('/api/pacientes/:id/expediente', verifyToken, async (req, res) => {
    const { id } = req.params;
    const idNum = parseInt(id); // Convertimos a número para validar

    // 🛡️ BLINDAJE: Validar que el ID sea un número positivo
    if (isNaN(idNum) || idNum <= 0) {
        console.log(`⚠️ Intento de búsqueda con ID inválido: ${id}`);
        return res.status(400).json({ message: "El ID del paciente debe ser un número positivo." });
    }

    try {
        // 1. Datos personales del paciente
        const pacienteQuery = `
            SELECT 
                id_paciente,
                nombre_paciente,
                num_expediente,
                sexo,
                edad,
                numero_telefono,
                correo
            FROM pacientes
            WHERE id_paciente = $1
        `;
        const pacienteResult = await pool.query(pacienteQuery, [idNum]);

        if (pacienteResult.rows.length === 0) {
            console.log(`❌ Paciente con ID ${idNum} no encontrado.`);
            return res.status(404).json({ message: "Paciente no encontrado en la base de datos." });
        }

        const paciente = pacienteResult.rows[0];

        // 2. Historial de consultas (Usando tu vista_historial)
        const consultasQuery = `
            SELECT *
            FROM vista_historial
            WHERE id_paciente = $1
            ORDER BY fecha_hora DESC
        `;
        const consultasResult = await pool.query(consultasQuery, [idNum]);

        // 3. Historial de intervenciones (Usando tu vista_intervenciones)
        const intervencionesQuery = `
            SELECT *
            FROM vista_historial_intervenciones
            WHERE id_paciente = $1
            ORDER BY fecha_intervencion DESC
        `;
        const intervencionesResult = await pool.query(intervencionesQuery, [idNum]);

        // 4. Citas del paciente
        const citasQuery = `
            SELECT *
            FROM citas
            WHERE id_paciente = $1
            ORDER BY fecha DESC, hora DESC
        `;
        const citasResult = await pool.query(citasQuery, [idNum]);

        // 🚀 RESPUESTA FINAL: Ajustamos los nombres para que coincidan con el Frontend
        console.log(`✅ Expediente de ${paciente.nombre_paciente} enviado con éxito.`);
        res.json({
            paciente,
            consultas: consultasResult.rows,       // Antes era historial_consultas
            intervenciones: intervencionesResult.rows, // Antes era historial_intervenciones
            citas: citasResult.rows
        });

    } catch (err) {
        console.error("💥 Error en el servidor al buscar expediente:", err.message);
        res.status(500).json({ error: "Error interno al procesar el expediente clínico." });
    }
});

// Obtener intervenciones del doctor
app.get('/api/doctor/:id/intervenciones', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT 
                i.id_intervencion,
                i.fecha_intervencion,
                i.observaciones,
                i.estado,
                i.id_cita,
                i.tipo_cita,
                p.id_paciente,
                p.nombre_paciente,
                proc.nombre_procedimiento,
                h.nombre_area,
                i.id_auxiliar,
                i.tipo_auxiliar
            FROM intervencion i
            LEFT JOIN pacientes p ON i.id_paciente = p.id_paciente
            LEFT JOIN procedimientos proc ON i.id_procedimiento = proc.id_procedimiento
            LEFT JOIN hospital h ON i.id_area = h.id_area
            WHERE i.id_doctor = $1
            ORDER BY i.fecha_intervencion DESC
        `;

        const result = await pool.query(query, [id]);

        res.json(result.rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar observaciones o estado de una intervención
app.put('/api/intervenciones/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { observaciones, estado } = req.body;

    if (!observaciones && !estado) {
        return res.status(400).json({ message: "Debe enviar al menos un campo para actualizar" });
    }

    try {
        const fields = [];
        const values = [];
        let index = 1;

        if (observaciones !== undefined) {
            fields.push(`observaciones = $${index++}`);
            values.push(observaciones);
        }

        if (estado !== undefined) {
            fields.push(`estado = $${index++}`);
            values.push(estado);
        }

        values.push(id);

        const query = `
            UPDATE intervencion
            SET ${fields.join(', ')}
            WHERE id_intervencion = $${index}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Intervención no encontrada" });
        }

        res.json({
            message: "Intervención actualizada correctamente",
            intervencion: result.rows[0]
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear una nueva cita
app.post('/api/citas', verifyToken, async (req, res) => {
    const {
        id_paciente,
        fecha,
        hora,
        id_consultorio,
        id_doctor,
        tipo_cita
    } = req.body;

    if (!id_paciente || !fecha || !hora || !id_consultorio || !id_doctor || !tipo_cita) {
        return res.status(400).json({ message: "Faltan datos obligatorios para crear la cita" });
    }

    try {
        const query = `
            INSERT INTO citas (
                id_paciente,
                fecha,
                hora,
                id_consultorio,
                id_doctor,
                tipo_cita
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            id_paciente,
            fecha,
            hora,
            id_consultorio,
            id_doctor,
            tipo_cita
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: "Cita creada exitosamente",
            cita: result.rows[0]
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cambiar disponibilidad del consultorio
app.put('/api/consultorios/:id/disponible', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { disponible } = req.body;

    if (disponible === undefined) {
        return res.status(400).json({ message: "Debe enviar el valor de disponibilidad (true o false)" });
    }

    try {
        const query = `
            UPDATE consultorios
            SET disponible = $1
            WHERE id_consultorio = $2
            RETURNING *
        `;

        const result = await pool.query(query, [disponible, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Consultorio no encontrado" });
        }

        res.json({
            message: "Disponibilidad actualizada correctamente",
            consultorio: result.rows[0]
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Consulta genérica (Autorizada)
app.get('/api/query/:table', verifyToken, async (req, res) => {
    const { table } = req.params;

    try {
        const result = await pool.query(`SELECT * FROM ${table} LIMIT 100`);
        res.json({
            keys: result.fields.map(f => f.name),
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Update genérico (Autorizado)
app.put('/api/update/:table/:id', verifyToken, async (req, res) => {
    const { table, id } = req.params;
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    if (fields.length === 0) {
        return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    values.push(id);

    try {
        const query = `UPDATE ${table} SET ${setClause} WHERE id = $${values.length} RETURNING *`;
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Backend de hospital5b escuchando en el puerto ${PORT}`));
