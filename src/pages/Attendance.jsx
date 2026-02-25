import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const bg = "#0b1512", card = "#111c18", border = "#1e3329", green = "#10b981", greenDim = "#064e3b"
const ATT = {
  P: { label: "P", full: "Presente", color: "#10b981", bg: "#052e16" },
  A: { label: "A", full: "Ausente", color: "#f43f5e", bg: "#2d0a14" },
  T: { label: "T", full: "Tardanza", color: "#f59e0b", bg: "#2d1c02" },
}
const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie"]

const getMonday = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}
const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d }
const toISO = (d) => d.toISOString().slice(0, 10)
const fmtDay = (d) => new Date(d).getUTCDate()
const fmtMonth = (d) => new Date(d).toLocaleString("es-AR", { month: "long", year: "numeric" })

export default function Attendance() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [attMap, setAttMap] = useState({})
  const [weekStart, setWeekStart] = useState(() => toISO(getMonday(new Date())))

  const weekDays = [0,1,2,3,4].map(i => toISO(addDays(new Date(weekStart), i)))

  const load = async () => {
    const { data: c } = await supabase.from('courses').select('*').eq('id', id).single()
    const { data: s } = await supabase.from('students').select('*').eq('course_id', id).order('apellido')
    setCourse(c); setStudents(s || [])

    // Load attendance for this week
    const { data: att } = await supabase.from('attendance')
      .select('*')
      .eq('course_id', id)
      .gte('date', weekDays[0])
      .lte('date', weekDays[4])

    const map = {}
    ;(att || []).forEach(a => { map[`${a.student_id}_${a.date}`] = a.status })
    setAttMap(map)
  }

  useEffect(() => { load() }, [id, weekStart])

  const toggleAtt = async (sid, date) => {
    const key = `${sid}_${date}`
    const current = attMap[key] || ''
    const cycle = ['', 'P', 'A', 'T']
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length]

    setAttMap(prev => ({ ...prev, [key]: next }))

    if (next === '') {
      await supabase.from('attendance').delete().eq('student_id', sid).eq('date', date)
    } else {
      await supabase.from('attendance').upsert({ student_id: sid, course_id: id, date, status: next }, { onConflict: 'student_id,date' })
    }
  }

  const prevWeek = () => setWeekStart(toISO(addDays(new Date(weekStart), -7)))
  const nextWeek = () => setWeekStart(toISO(addDays(new Date(weekStart), 7)))

  if (!course) return <div style={{ color: '#2d4a3e', padding: 40, textAlign: 'center' }}>Cargando...</div>

  return (
    <>
      <button onClick={() => navigate(`/course/${id}`)} style={{ background: 'transparent', border: 'none', color: green, cursor: 'pointer', fontSize: 22, padding: '0 0 16px 0' }}>←</button>

      {/* Week nav */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={prevWeek} style={{ background: greenDim, border: 'none', borderRadius: 8, width: 34, height: 34, color: green, cursor: 'pointer', fontSize: 18 }}>‹</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ecfdf5', textTransform: 'capitalize' }}>{fmtMonth(weekStart)}</div>
          <div style={{ fontSize: 11, color: '#4ade80', opacity: 0.7 }}>
            {fmtDay(weekDays[0])} al {fmtDay(weekDays[4])}
          </div>
        </div>
        <button onClick={nextWeek} style={{ background: greenDim, border: 'none', borderRadius: 8, width: 34, height: 34, color: green, cursor: 'pointer', fontSize: 18 }}>›</button>
      </div>

      {/* Grid */}
      {students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#2d4a3e' }}>No hay alumnos en este curso</div>
      ) : (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(5, 44px)', borderBottom: `1px solid ${border}` }}>
            <div style={{ padding: '10px 12px', fontSize: 11, color: '#4ade80', fontWeight: 700 }}>ALUMNO</div>
            {weekDays.map((d, i) => {
              const isToday = d === toISO(new Date())
              return (
                <div key={d} style={{ padding: '8px 0', textAlign: 'center', background: isToday ? '#0d2a1e' : 'transparent', borderLeft: `1px solid ${border}` }}>
                  <div style={{ fontSize: 10, color: isToday ? green : '#4ade80', fontWeight: 700 }}>{DAYS[i]}</div>
                  <div style={{ fontSize: 12, color: isToday ? green : '#475569', fontWeight: isToday ? 700 : 400 }}>{fmtDay(d)}</div>
                </div>
              )
            })}
          </div>

          {/* Rows */}
          {students.map((s, idx) => (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(5, 44px)', borderBottom: idx < students.length - 1 ? `1px solid ${border}` : 'none', background: idx % 2 === 0 ? 'transparent' : '#0d1a15' }}>
              <div style={{ padding: '10px 12px', fontSize: 13, color: '#ecfdf5', fontWeight: 500, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.apellido}, {s.nombre.split(' ')[0]}</span>
              </div>
              {weekDays.map((d, i) => {
                const val = attMap[`${s.id}_${d}`] || ''
                const isToday = d === toISO(new Date())
                const a = ATT[val]
                return (
                  <div key={d} style={{ borderLeft: `1px solid ${border}`, background: isToday ? '#0d2a1e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 0' }}>
                    <button onClick={() => toggleAtt(s.id, d)}
                      style={{ width: 32, height: 32, borderRadius: 8, background: val ? a.bg : 'transparent', border: `1px solid ${val ? a.color : border}`, color: val ? a.color : '#334155', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all 0.15s' }}>
                      {val || '·'}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 14 }}>
        {Object.entries(ATT).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: v.bg, border: `1px solid ${v.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: v.color, fontWeight: 700 }}>{k}</div>
            <span style={{ fontSize: 11, color: '#475569' }}>{v.full}</span>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, color: '#334155', marginTop: 8 }}>Tocá una celda para ciclar: · → P → A → T</div>
    </>
  )
}