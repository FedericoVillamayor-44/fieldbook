import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Course from './Course'
import Student from './Student'
import Attendance from './Attendance'

const bg = "#0b1512", card = "#111c18", border = "#1e3329", green = "#10b981", greenDim = "#064e3b"
const LEVELS = ["Primaria", "Secundaria", "Universidad", "Profesorado", "Club"]
const SHIFTS = ["Mañana", "Tarde", "Noche"]
const uid = () => Math.random().toString(36).slice(2, 9)

export default function Dashboard() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ level: LEVELS[0], shift: SHIFTS[0] })
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const loadCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
    setCourses(data || [])
    setLoading(false)
  }

  useEffect(() => { loadCourses() }, [])

  const addCourse = async () => {
    if (!form.name?.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('courses').insert({ name: form.name, level: form.level, shift: form.shift, user_id: user.id })
    setModal(false); setForm({ level: LEVELS[0], shift: SHIFTS[0] })
    showToast('Curso creado ✓'); loadCourses()
  }

  const logout = async () => { await supabase.auth.signOut() }

  return (
    <div style={{ minHeight: '100vh', background: bg, color: '#d1fae5', fontFamily: 'Inter, sans-serif', maxWidth: 520, margin: '0 auto', paddingBottom: 60 }}>
      <div style={{ background: '#0d1f1a', borderBottom: `1px solid ${border}`, padding: '14px 16px', position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: green }}>FIELDBOOK</div>
          <div style={{ fontSize: 9, color: '#4ade80', letterSpacing: 2, opacity: 0.6 }}>EDUCACIÓN FÍSICA</div>
        </div>
        <button onClick={() => { setModal(true); setForm({ level: LEVELS[0], shift: SHIFTS[0] }) }} style={{ background: green, border: 'none', borderRadius: 10, padding: '8px 14px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13, marginRight: 8 }}>+ Curso</button>
        <button onClick={logout} style={{ background: 'transparent', border: `1px solid ${border}`, borderRadius: 10, padding: '8px 12px', color: '#475569', cursor: 'pointer', fontSize: 13 }}>Salir</button>
      </div>

      <div style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={
            <>
              <div style={{ fontSize: 12, color: '#4ade80', marginBottom: 12, opacity: 0.6 }}>{courses.length} curso{courses.length !== 1 ? 's' : ''}</div>
              {loading && <div style={{ color: '#2d4a3e', textAlign: 'center', padding: 40 }}>Cargando...</div>}
              {!loading && courses.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#2d4a3e' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>Sin cursos todavía</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>Creá tu primer curso arriba</div>
                </div>
              )}
              {courses.map(c => (
                <div key={c.id} onClick={() => navigate(`/course/${c.id}`)}
                  style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16, marginBottom: 12, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = green}
                  onMouseLeave={e => e.currentTarget.style.borderColor = border}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#ecfdf5' }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: '#4ade80', marginTop: 2 }}>{c.level} · {c.shift}</div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          } />
          <Route path="/course/:id" element={<Course />} />
          <Route path="/course/:id/student/:sid" element={<Student />} />
          <Route path="/course/:id/attendance" element={<Attendance />} />
        </Routes>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: '#000b', display: 'flex', alignItems: 'flex-end', zIndex: 100 }} onClick={() => setModal(false)}>
          <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', background: '#0d1f1a', borderTopLeftRadius: 20, borderTopRightRadius: 20, border: `1px solid ${border}`, padding: 24 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#ecfdf5', marginBottom: 16 }}>Nuevo Curso</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input placeholder="Nombre del curso (ej: 3°A)" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '11px 12px', color: '#ecfdf5', fontSize: 14, outline: 'none' }} />
              <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
                style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '11px 12px', color: '#ecfdf5', fontSize: 14, outline: 'none' }}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
              <select value={form.shift} onChange={e => setForm(p => ({ ...p, shift: e.target.value }))}
                style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '11px 12px', color: '#ecfdf5', fontSize: 14, outline: 'none' }}>
                {SHIFTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <button onClick={addCourse} style={{ background: green, border: 'none', borderRadius: 11, padding: '13px', color: '#000', fontWeight: 800, cursor: 'pointer', fontSize: 15, marginTop: 4 }}>Crear Curso</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: greenDim, border: `1px solid ${green}`, borderRadius: 12, padding: '12px 24px', color: green, fontWeight: 700, fontSize: 14, zIndex: 200 }}>{toast}</div>
      )}
    </div>
  )
}