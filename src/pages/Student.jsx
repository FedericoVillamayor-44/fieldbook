import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const bg = "#0b1512", card = "#111c18", border = "#1e3329", green = "#10b981", greenDim = "#064e3b"

export default function Student() {
  const { id, sid } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [toast, setToast] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const load = async () => {
    const { data } = await supabase.from('students').select('*').eq('id', sid).single()
    setStudent(data); setForm(data)
  }

  useEffect(() => { load() }, [sid])

  const save = async () => {
    await supabase.from('students').update({ nombre: form.nombre, apellido: form.apellido, virtud: form.virtud, desventaja: form.desventaja, nota: form.nota }).eq('id', sid)
    setEditing(false); showToast('Guardado ✓'); load()
  }

  const deleteStudent = async () => {
    if (!confirm(`¿Eliminar a ${student.nombre} ${student.apellido}?`)) return
    await supabase.from('students').delete().eq('id', sid)
    navigate(`/course/${id}`)
  }

  if (!student) return <div style={{ color: '#2d4a3e', padding: 40, textAlign: 'center' }}>Cargando...</div>

  return (
    <>
      <button onClick={() => navigate(`/course/${id}`)} style={{ background: 'transparent', border: 'none', color: green, cursor: 'pointer', fontSize: 22, padding: '0 0 16px 0' }}>←</button>

      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {editing ? (
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <input value={form.apellido || ''} onChange={e => setForm(p => ({ ...p, apellido: e.target.value }))} placeholder="Apellido"
                  style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '8px 10px', color: '#ecfdf5', fontSize: 16, fontWeight: 800, outline: 'none', width: 120 }} />
                <input value={form.nombre || ''} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre"
                  style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '8px 10px', color: '#4ade80', fontSize: 14, outline: 'none', width: 120 }} />
              </div>
            ) : (
              <>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#ecfdf5' }}>{student.apellido}</div>
                <div style={{ fontSize: 16, color: '#4ade80' }}>{student.nombre}</div>
              </>
            )}
          </div>
          <button onClick={() => editing ? save() : setEditing(true)}
            style={{ background: editing ? green : greenDim, border: `1px solid ${green}`, borderRadius: 10, padding: '8px 14px', color: editing ? '#000' : green, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            {editing ? 'Guardar' : 'Editar'}
          </button>
        </div>
      </div>

      {/* Virtud */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>✅ VIRTUD</div>
        {editing ? (
          <input value={form.virtud || ''} onChange={e => setForm(p => ({ ...p, virtud: e.target.value }))} placeholder="¿Qué hace bien?"
            style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px', color: '#ecfdf5', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        ) : (
          <div style={{ fontSize: 14, color: student.virtud ? '#ecfdf5' : '#2d4a3e' }}>{student.virtud || 'Sin registrar'}</div>
        )}
      </div>

      {/* Desventaja */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: '#f43f5e', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>⚠️ DESVENTAJA</div>
        {editing ? (
          <input value={form.desventaja || ''} onChange={e => setForm(p => ({ ...p, desventaja: e.target.value }))} placeholder="¿Qué necesita trabajar?"
            style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px', color: '#ecfdf5', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        ) : (
          <div style={{ fontSize: 14, color: student.desventaja ? '#ecfdf5' : '#2d4a3e' }}>{student.desventaja || 'Sin registrar'}</div>
        )}
      </div>

      {/* Nota */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>📝 NOTA</div>
        {editing ? (
          <textarea value={form.nota || ''} onChange={e => setForm(p => ({ ...p, nota: e.target.value }))} placeholder="Observaciones..." rows={3}
            style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px', color: '#ecfdf5', fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }} />
        ) : (
          <div style={{ fontSize: 14, color: student.nota ? '#ecfdf5' : '#2d4a3e', lineHeight: 1.6 }}>{student.nota || 'Sin notas'}</div>
        )}
      </div>

      <button onClick={deleteStudent} style={{ width: '100%', background: 'transparent', border: '1px solid #7f1d1d', borderRadius: 10, padding: '12px', color: '#f87171', cursor: 'pointer', fontSize: 13 }}>Eliminar alumno</button>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: greenDim, border: `1px solid ${green}`, borderRadius: 12, padding: '12px 24px', color: green, fontWeight: 700, fontSize: 14, zIndex: 200 }}>{toast}</div>
      )}
    </>
  )
}