import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const bg = "#0b1512", card = "#111c18", border = "#1e3329", green = "#10b981", greenDim = "#064e3b"

const GRUPOS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
const VINCULOS = ["Madre", "Padre", "Tutor/a", "Abuelo/a", "Tío/a", "Hermano/a", "Otro"]

const inputStyle = {
  width: '100%', background: bg, border: `1px solid ${border}`,
  borderRadius: 8, padding: '10px', color: '#ecfdf5', fontSize: 14,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
}
const labelStyle = { fontSize: 11, color: green, fontWeight: 700, letterSpacing: 1, marginBottom: 6, display: 'block' }
const fieldWrap = { marginBottom: 14 }

export default function Student() {
  const { id, sid } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [toast, setToast] = useState(null)
  const [tab, setTab] = useState('perfil') // 'perfil' | 'ficha'
  const [savingFicha, setSavingFicha] = useState(false)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const load = async () => {
    const { data } = await supabase.from('students').select('*').eq('id', sid).single()
    setStudent(data); setForm(data)
  }

  useEffect(() => { load() }, [sid])

  // ── Guardar perfil original ──
  const save = async () => {
    await supabase.from('students').update({
      nombre: form.nombre, apellido: form.apellido,
      virtud: form.virtud, desventaja: form.desventaja, nota: form.nota
    }).eq('id', sid)
    setEditing(false); showToast('Guardado ✓'); load()
  }

  // ── Guardar ficha médica ──
  const saveFicha = async () => {
    setSavingFicha(true)
    const { error } = await supabase.from('students').update({
      dni: form.dni,
      fecha_nacimiento: form.fecha_nacimiento || null,
      direccion: form.direccion,
      localidad: form.localidad,
      contacto_emergencia_nombre: form.contacto_emergencia_nombre,
      contacto_emergencia_vinculo: form.contacto_emergencia_vinculo,
      contacto_emergencia_telefono: form.contacto_emergencia_telefono,
      contacto_emergencia_telefono2: form.contacto_emergencia_telefono2,
      obra_social: form.obra_social,
      nro_afiliado: form.nro_afiliado,
      plan: form.plan,
      grupo_sanguineo: form.grupo_sanguineo,
      es_alergico: form.es_alergico || false,
      alergias: form.alergias,
      medicacion_habitual: form.medicacion_habitual || false,
      medicacion_detalle: form.medicacion_detalle,
      tiene_condicion_medica: form.tiene_condicion_medica || false,
      condicion_medica_detalle: form.condicion_medica_detalle,
      restriccion_fisica: form.restriccion_fisica || false,
      restriccion_fisica_detalle: form.restriccion_fisica_detalle,
      observaciones_medicas: form.observaciones_medicas,
    }).eq('id', sid)
    setSavingFicha(false)
    if (!error) { showToast('Ficha guardada ✓'); load() }
    else showToast('Error al guardar')
  }

  const deleteStudent = async () => {
    if (!confirm(`¿Eliminar a ${student.nombre} ${student.apellido}?`)) return
    await supabase.from('students').delete().eq('id', sid)
    navigate(`/course/${id}`)
  }

  const fc = (name, value) => setForm(p => ({ ...p, [name]: value }))
  const fi = (e) => { const { name, value, type, checked } = e.target; fc(name, type === 'checkbox' ? checked : value) }

  if (!student) return <div style={{ color: '#2d4a3e', padding: 40, textAlign: 'center' }}>Cargando...</div>

  return (
    <>
      <button onClick={() => navigate(`/course/${id}`)} style={{ background: 'transparent', border: 'none', color: green, cursor: 'pointer', fontSize: 22, padding: '0 0 16px 0' }}>←</button>

      {/* Header alumno */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {editing ? (
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <input value={form.apellido || ''} onChange={e => fc('apellido', e.target.value)} placeholder="Apellido"
                  style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '8px 10px', color: '#ecfdf5', fontSize: 16, fontWeight: 800, outline: 'none', width: 120 }} />
                <input value={form.nombre || ''} onChange={e => fc('nombre', e.target.value)} placeholder="Nombre"
                  style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '8px 10px', color: '#4ade80', fontSize: 14, outline: 'none', width: 120 }} />
              </div>
            ) : (
              <>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#ecfdf5' }}>{student.apellido}</div>
                <div style={{ fontSize: 16, color: '#4ade80' }}>{student.nombre}</div>
                {student.dni && <div style={{ fontSize: 12, color: '#2d4a3e', marginTop: 2 }}>DNI: {student.dni}</div>}
              </>
            )}
          </div>
          {tab === 'perfil' && (
            <button onClick={() => editing ? save() : setEditing(true)}
              style={{ background: editing ? green : greenDim, border: `1px solid ${green}`, borderRadius: 10, padding: '8px 14px', color: editing ? '#000' : green, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              {editing ? 'Guardar' : 'Editar'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[{ id: 'perfil', label: '📋 Perfil' }, { id: 'ficha', label: '❤️‍🩹 Ficha Médica' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? greenDim : 'transparent',
            border: `1px solid ${tab === t.id ? green : border}`,
            borderRadius: 10, padding: '8px 16px',
            color: tab === t.id ? green : '#2d4a3e',
            fontWeight: 700, cursor: 'pointer', fontSize: 13, transition: 'all .2s'
          }}>{t.label}</button>
        ))}
      </div>

      {/* ═══════════════ TAB PERFIL ═══════════════ */}
      {tab === 'perfil' && (
        <>
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>✅ VIRTUD</div>
            {editing ? (
              <input value={form.virtud || ''} onChange={e => fc('virtud', e.target.value)} placeholder="¿Qué hace bien?" style={{ ...inputStyle }} />
            ) : (
              <div style={{ fontSize: 14, color: student.virtud ? '#ecfdf5' : '#2d4a3e' }}>{student.virtud || 'Sin registrar'}</div>
            )}
          </div>

          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: '#f43f5e', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>⚠️ DESVENTAJA</div>
            {editing ? (
              <input value={form.desventaja || ''} onChange={e => fc('desventaja', e.target.value)} placeholder="¿Qué necesita trabajar?" style={{ ...inputStyle }} />
            ) : (
              <div style={{ fontSize: 14, color: student.desventaja ? '#ecfdf5' : '#2d4a3e' }}>{student.desventaja || 'Sin registrar'}</div>
            )}
          </div>

          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>📝 NOTA</div>
            {editing ? (
              <textarea value={form.nota || ''} onChange={e => fc('nota', e.target.value)} placeholder="Observaciones..." rows={3}
                style={{ ...inputStyle, resize: 'none' }} />
            ) : (
              <div style={{ fontSize: 14, color: student.nota ? '#ecfdf5' : '#2d4a3e', lineHeight: 1.6 }}>{student.nota || 'Sin notas'}</div>
            )}
          </div>

          <button onClick={deleteStudent} style={{ width: '100%', background: 'transparent', border: '1px solid #7f1d1d', borderRadius: 10, padding: '12px', color: '#f87171', cursor: 'pointer', fontSize: 13 }}>
            Eliminar alumno
          </button>
        </>
      )}

      {/* ═══════════════ TAB FICHA MÉDICA ═══════════════ */}
      {tab === 'ficha' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Datos personales */}
          <Section title="👤 Datos Personales">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>DNI</label>
                <input name="dni" value={form.dni || ''} onChange={fi} placeholder="12345678" maxLength={8} style={inputStyle} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Fecha de Nacimiento</label>
                <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento || ''} onChange={fi} style={inputStyle} />
              </div>
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Dirección</label>
              <input name="direccion" value={form.direccion || ''} onChange={fi} placeholder="Calle 123, piso 2B" style={inputStyle} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Localidad / Barrio</label>
              <input name="localidad" value={form.localidad || ''} onChange={fi} placeholder="Villa del Parque, CABA" style={inputStyle} />
            </div>
          </Section>

          {/* Contacto emergencia */}
          <Section title="🚨 Contacto de Emergencia">
            <div style={{ background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 12, color: '#f87171' }}>
              ⚠️ Este contacto será el primero en ser notificado ante cualquier emergencia.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Nombre completo</label>
                <input name="contacto_emergencia_nombre" value={form.contacto_emergencia_nombre || ''} onChange={fi} placeholder="Ana García" style={inputStyle} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Vínculo</label>
                <select name="contacto_emergencia_vinculo" value={form.contacto_emergencia_vinculo || ''} onChange={fi}
                  style={{ ...inputStyle, appearance: 'none' }}>
                  <option value="">Seleccionar...</option>
                  {VINCULOS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Teléfono principal</label>
                <input name="contacto_emergencia_telefono" type="tel" value={form.contacto_emergencia_telefono || ''} onChange={fi} placeholder="+54 11 1234-5678" style={inputStyle} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Teléfono alternativo</label>
                <input name="contacto_emergencia_telefono2" type="tel" value={form.contacto_emergencia_telefono2 || ''} onChange={fi} placeholder="+54 11 8765-4321" style={inputStyle} />
              </div>
            </div>
          </Section>

          {/* Cobertura médica */}
          <Section title="🏥 Cobertura Médica">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ ...fieldWrap, gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Obra Social / Prepaga</label>
                <input name="obra_social" value={form.obra_social || ''} onChange={fi} placeholder="OSDE, Swiss Medical, IOMA..." style={inputStyle} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>N° de Afiliado</label>
                <input name="nro_afiliado" value={form.nro_afiliado || ''} onChange={fi} placeholder="1234567890" style={inputStyle} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Plan</label>
                <input name="plan" value={form.plan || ''} onChange={fi} placeholder="210, Básico, etc." style={inputStyle} />
              </div>
            </div>
          </Section>

          {/* Ficha médica */}
          <Section title="❤️‍🩹 Ficha Médica">

            {/* Grupo sanguíneo */}
            <div style={fieldWrap}>
              <label style={labelStyle}>Grupo Sanguíneo</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {GRUPOS.map(g => (
                  <button key={g} onClick={() => fc('grupo_sanguineo', form.grupo_sanguineo === g ? '' : g)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
                      background: form.grupo_sanguineo === g ? '#be123c' : bg,
                      border: `1px solid ${form.grupo_sanguineo === g ? '#f43f5e' : border}`,
                      color: form.grupo_sanguineo === g ? '#fff' : '#2d4a3e'
                    }}>{g}</button>
                ))}
              </div>
            </div>

            {/* Alergias */}
            <Toggle label="¿Tiene alergias?" name="es_alergico" value={form.es_alergico} onChange={fc}>
              {form.es_alergico && (
                <textarea name="alergias" value={form.alergias || ''} onChange={fi} rows={2}
                  placeholder="Ej: Alérgico a la penicilina. Intolerante al gluten."
                  style={{ ...inputStyle, resize: 'none', marginTop: 8 }} />
              )}
            </Toggle>

            {/* Medicación */}
            <Toggle label="¿Toma medicación habitual?" name="medicacion_habitual" value={form.medicacion_habitual} onChange={fc}>
              {form.medicacion_habitual && (
                <textarea name="medicacion_detalle" value={form.medicacion_detalle || ''} onChange={fi} rows={2}
                  placeholder="Ej: Ritalin 10mg, una vez por día antes del desayuno."
                  style={{ ...inputStyle, resize: 'none', marginTop: 8 }} />
              )}
            </Toggle>

            {/* Condición médica */}
            <Toggle label="¿Tiene condición médica diagnosticada?" name="tiene_condicion_medica" value={form.tiene_condicion_medica} onChange={fc}>
              {form.tiene_condicion_medica && (
                <textarea name="condicion_medica_detalle" value={form.condicion_medica_detalle || ''} onChange={fi} rows={2}
                  placeholder="Ej: Asma leve. Ante crisis usar inhalador (en mochila)."
                  style={{ ...inputStyle, resize: 'none', marginTop: 8 }} />
              )}
            </Toggle>

            {/* Restricción física */}
            <Toggle label="¿Tiene restricciones para actividad física?" name="restriccion_fisica" value={form.restriccion_fisica} onChange={fc}>
              {form.restriccion_fisica && (
                <textarea name="restriccion_fisica_detalle" value={form.restriccion_fisica_detalle || ''} onChange={fi} rows={2}
                  placeholder="Ej: No puede realizar actividades de alto impacto. Dispensa hasta 06/2025."
                  style={{ ...inputStyle, resize: 'none', marginTop: 8 }} />
              )}
            </Toggle>

            {/* Observaciones */}
            <div style={fieldWrap}>
              <label style={labelStyle}>📝 OBSERVACIONES PARA EL DOCENTE</label>
              <textarea name="observaciones_medicas" value={form.observaciones_medicas || ''} onChange={fi} rows={3}
                placeholder="Cualquier información relevante que debas conocer..."
                style={{ ...inputStyle, resize: 'none' }} />
            </div>
          </Section>

          {/* Botón guardar ficha */}
          <button onClick={saveFicha} disabled={savingFicha}
            style={{ width: '100%', background: savingFicha ? greenDim : green, border: 'none', borderRadius: 10, padding: '14px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 14, opacity: savingFicha ? .7 : 1 }}>
            {savingFicha ? 'Guardando...' : 'Guardar ficha médica'}
          </button>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: greenDim, border: `1px solid ${green}`, borderRadius: 12, padding: '12px 24px', color: green, fontWeight: 700, fontSize: 14, zIndex: 200 }}>{toast}</div>
      )}
    </>
  )
}

// ── Subcomponentes ──

function Section({ title, children }) {
  const card = "#111c18", border = "#1e3329"
  return (
    <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16 }}>
      <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  )
}

function Toggle({ label, name, value, onChange, children }) {
  const green = "#10b981", border = "#1e3329", bg = "#0b1512"
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => onChange(name, !value)}>
        <div style={{
          width: 44, height: 24, borderRadius: 12, position: 'relative', transition: 'background .2s',
          background: value ? green : '#1e3329', border: `1px solid ${value ? green : border}`
        }}>
          <div style={{
            position: 'absolute', top: 2, left: value ? 22 : 2, width: 18, height: 18,
            borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.4)'
          }} />
        </div>
        <span style={{ fontSize: 13, color: value ? '#ecfdf5' : '#2d4a3e', fontWeight: value ? 600 : 400 }}>{label}</span>
      </div>
      {children}
    </div>
  )
}