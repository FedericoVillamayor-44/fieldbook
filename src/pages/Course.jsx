import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const bg = "#0b1512", card = "#111c18", border = "#1e3329", green = "#10b981", greenDim = "#064e3b"

export default function Course() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const [toast, setToast] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const load = async () => {
    const { data: c } = await supabase.from('courses').select('*').eq('id', id).single()
    const { data: s } = await supabase.from('students').select('*').eq('course_id', id).order('apellido')
    setCourse(c); setStudents(s || [])
  }

  useEffect(() => { load() }, [id])

  const addStudent = async () => {
    if (!form.nombre?.trim() || !form.apellido?.trim()) return
    await supabase.from('students').insert({ course_id: id, nombre: form.nombre, apellido: form.apellido, virtud: form.virtud || '', desventaja: form.desventaja || '', nota: form.nota || '' })
    setModal(false); setForm({})
    showToast('Alumno agregado ✓'); load()
  }

  const deleteCourse = async () => {
    if (!confirm(`¿Eliminar el curso "${course.name}"?`)) return
    await supabase.from('courses').delete().eq('id', id)
    navigate('/')
  }

  if (!course) return <div style={{ color: '#2d4a3e', padding: 40, textAlign: 'center' }}>Cargando...</div>

  return (
    <>
      <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: green, cursor: 'pointer', fontSize: 22, padding: '0 0 16px 0' }}>←</button>

      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: '#ecfdf5' }}>{course.name}</div>
        <div style={{ fontSize: 12, color: '#4ade80', marginTop: 2, marginBottom: 14 }}>{course.level} · {course.shift} · {students.length} alumnos</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate(`/course/${id}/attendance`)} style={{ flex: 1, background: green, border: 'none', borderRadius: 10, padding: '10px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>📅 Asistencia</button>
          <button onClick={() => { setModal(true); setForm({}) }} style={{ flex: 1, background: greenDim, border: `1px solid ${green}`, borderRadius: 10, padding: '10px', color: green, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>+ Alumno</button>
          <button onClick={deleteCourse} style={{ background: 'transparent', border: '1px solid #7f1d1d', borderRadius: 10, padding: '10px 14px', color: '#f87171', cursor: 'pointer', fontSize: 13 }}>🗑</button>
        </div>
      </div>

      {students.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#2d4a3e' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>👤</div>
          <div>Agregá alumnos al curso</div>
        </div>
      )}

      {students.map(s => (
        <div key={s.id} onClick={() => navigate(`/course/${id}/student/${s.id}`)}
          style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
          onMouseEnter={e => e.currentTarget.style.borderColor = green}
          onMouseLeave={e => e.currentTarget.style.borderColor = border}>
          <div style={{ width: 42, height: 42, borderRadius: 99, background: greenDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: green, flexShrink: 0 }}>
            {s.apellido.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#ecfdf5' }}>{s.apellido}, {s.nombre}</div>
            {s.virtud && <div style={{ fontSize: 11, color: '#10b981', marginTop: 2 }}>✅ {s.virtud}</div>}
          </div>
          <div style={{ fontSize: 18, color: '#334155' }}>›</div>
        </div>
      ))}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: '#000b', display: 'flex', alignItems: 'flex-end', zIndex: 100 }} onClick={() => setModal(false)}>
          <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', background: '#0d1f1a', borderTopLeftRadius: 20, borderTopRightRadius: 20, border: `1px solid ${border}`, padding: 24, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#ecfdf5', marginBottom: 16 }}>Agregar Alumno</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Apellido *" value={form.apellido || ''} onChange={e => setForm(p => ({ ...p, apellido: e.target.value }))}
                  style={{ flex: 1, background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '11px 12px', color: '#ecfdf5', fontSize: 14, outline: 'none' }} />
                <input placeholder="Nombre *" value={form.nombre || ''} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  style={{ flex: 1, background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '11px 12px', color: '#ecfdf5', fontSize: 14, outline: 'none' }} />
              </div>
              <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, letterSpacing: 1 }}>✅ VIRTUD</div>
              <input placeholder="¿Qué hace bien?" value={form.virtud || ''} onChange={e => setForm(p => ({ ...p, virtud: e.target.value }))}
                style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '11px 12px', color: '#ecfdf5', fontSize: 14, outline: 'none' }} />
              <div style={{ fontSize: 11, color: '#f43f5e', fontWeight: 700, letterSpacing: 1 }}>⚠️ DESVENTAJA</div>
              <input placeholder="¿Qué necesita trabajar?" value={form.desventaja || ''} onChange={e => setForm(p => ({ ...p, desventaja: e.target.value }))}
                style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '11px 12px', color: '#ecfdf5', fontSize: 14, outline: 'none' }} />
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: 1 }}>📝 NOTA</div>
              <textarea placeholder="Observaciones..." value={form.nota || ''} onChange={e => setForm(p => ({ ...p, nota: e.target.value }))} rows={3}
                style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '11px 12px', color: '#ecfdf5', fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'Inter, sans-serif' }} />
              <button onClick={addStudent} style={{ background: green, border: 'none', borderRadius: 11, padding: '13px', color: '#000', fontWeight: 800, cursor: 'pointer', fontSize: 15, marginTop: 4 }}>Agregar Alumno</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: greenDim, border: `1px solid ${green}`, borderRadius: 12, padding: '12px 24px', color: green, fontWeight: 700, fontSize: 14, zIndex: 200 }}>{toast}</div>
      )}
    </>
  )
}