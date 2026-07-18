import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Clock, Calendar as CalIcon, CheckSquare, BarChart2, Download } from 'lucide-react';
import './App.css';

function ReceptionApp({ onLogout }) {
  const [activeTab, setActiveTab] = useState('appointments'); // Set to appointments so you can see it
  const [appointments, setAppointments] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchAppointments();
    await fetchCalendar();
    await fetchTodos();
    setTimeout(() => setIsRefreshing(false), 600);
  };


  const fetchAppointments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "appointments"));
      const apps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      apps.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAppointments(apps);
    } catch (error) { console.error(error); }
  };

  const fetchCalendar = async () => {
    const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    try {
      const docSnap = await getDoc(doc(db, "calendar_sync", yearMonth));
      if (docSnap.exists()) setCalendarData(docSnap.data().days || {});
      else setCalendarData({});
    } catch (error) { console.error(error); }
  };

  const fetchTodos = async () => {
    try {
      const docSnap = await getDoc(doc(db, "todos_sync", "clinic_tasks"));
      if (docSnap.exists()) {
        setTodos(docSnap.data().tasks || []);
      } else {
        setTodos([]);
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchAppointments();
    fetchCalendar();
    fetchTodos();
  }, [currentDate]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      await addDoc(collection(db, "todo_inbox"), {
        task: newTodo,
        created_at: new Date().toISOString()
      });
      setNewTodo('');
      alert("Task sent to the Clinic Software! It will appear on the list shortly.");
    } catch (error) {
      console.error(error);
      alert("Error sending task.");
    }
  };


  const currentMonthLabel = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div style={{ padding: '15px', backgroundColor: '#f0fdfa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', flex: 1 }}>

        {/* Navbar */}
        <div className="navbar" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', width: '100%' }}>
            <img src="/clinic-logo.png" alt="Logo" style={{ width: '35px' }} />
            <h1 className="navbar-title" style={{ margin: 0, color: '#0f766e', fontSize: '24px' }}>Dr Ameer Faizal's Dental Care</h1>
          </div>
          <div className="navbar-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <motion.button animate={{ rotate: isRefreshing ? 360 : 0 }} transition={{ repeat: isRefreshing ? Infinity : 0, duration: 0.6 }} onClick={refreshData} style={{ padding: '10px', borderRadius: '50%', border: 'none', background: 'white', color: '#0d9488', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <RefreshCw size={20} />
            </motion.button>
            <div style={{ background: 'white', padding: '5px', borderRadius: '15px', display: 'flex', gap: '5px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
              <button onClick={() => setActiveTab('appointments')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'appointments' ? '#0d9488' : 'transparent', color: activeTab === 'appointments' ? 'white' : '#64748b', fontWeight: '700' }}><Clock size={16} /> Requests</button>
              <button onClick={() => setActiveTab('calendar')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'calendar' ? '#0d9488' : 'transparent', color: activeTab === 'calendar' ? 'white' : '#64748b', fontWeight: '700' }}><CalIcon size={16} /> Calendar</button>
              <button onClick={() => setActiveTab('todo')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'todo' ? '#0d9488' : 'transparent', color: activeTab === 'todo' ? 'white' : '#64748b', fontWeight: '700' }}><CheckSquare size={16} /> To-Do</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <a href="/register.html" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 15px', borderRadius: '12px', border: 'none', background: '#ccfbf1', color: '#0f766e', fontWeight: '700', fontSize: '14px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                📅 Register Patient
              </a>
              <button onClick={() => onLogout()} style={{ padding: '8px 15px', borderRadius: '12px', border: '1px solid #fee2e2', color: '#ef4444', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Logout</button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', minHeight: '60vh' }}>

            {/* APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div>
                <h2 style={{ color: '#0f766e', marginTop: 0 }}>Pending Requests</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {appointments.length === 0 ? <p style={{ color: '#94a3b8' }}>No pending requests.</p> : appointments.map((app) => (
                    <div key={app.id} style={{ padding: '20px', background: '#f9fafb', borderRadius: '25px', border: '1px solid #f1f5f9' }}>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: '0', color: '#1f2937' }}>{app.name}</h3>
                          <p style={{ margin: '5px 0', fontSize: '14px', color: '#64748b' }}>{app.phone}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                          {app.date && (
                            <div style={{ background: '#ccfbf1', color: '#0f766e', padding: '5px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CalIcon size={12} /> {app.date}
                            </div>
                          )}
                          {app.time && (
                            <div style={{ background: '#fef9c3', color: '#ca8a04', padding: '5px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> {app.time}
                            </div>
                          )}
                        </div>
                      </div>

                      <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#0d9488', fontWeight: '600' }}>
                        Doctor: {app.doctor || 'Any'}
                      </p>

                      <div style={{ margin: '15px 0 0 0', padding: '12px', background: 'white', borderRadius: '15px', fontSize: '13px', color: '#475569', border: '1px solid #edf2f7' }}>
                        <strong>Reason:</strong> {app.reason}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CALENDAR TAB */}
            {activeTab === 'calendar' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} style={{ padding: '8px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 'bold' }}>← Prev</button>
                  <h2 style={{ color: '#0f766e', margin: 0, fontSize: '1.4rem' }}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} style={{ padding: '8px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Next →</button>
                </div>

                <div style={{ width: '100%', overflowX: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d} style={{ fontWeight: 'bold', color: '#64748b', fontSize: '10px', paddingBottom: '5px' }}>{d}</div>)}
                    {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                      const dayIndex = i + 1;
                      const dayKey = String(dayIndex).padStart(2, '0');
                      const data = calendarData[dayKey];
                      return (
                        <div key={dayIndex} onClick={() => data && setSelectedDayData({ day: dayIndex, ...data })} style={{ cursor: data ? 'pointer' : 'default', background: data ? '#f0fdfa' : '#f8fafc', border: data ? '1px solid #ccfbf1' : '1px solid transparent', borderRadius: '8px', padding: '4px', minHeight: '60px', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}>
                          <span style={{ fontWeight: '700', fontSize: '13px', color: data ? '#0d9488' : '#94a3b8' }}>{dayIndex}</span>
                          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {data?.visits?.length > 0 && (<div style={{ background: '#dcfce7', color: '#15803d', fontSize: '10px', fontWeight: '800', padding: '2px', borderRadius: '4px' }}>{data.visits.length} V</div>)}
                            {data?.scheduled?.length > 0 && (<div style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '10px', fontWeight: '800', padding: '2px', borderRadius: '4px' }}>{data.scheduled.length} S</div>)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TO-DO LIST TAB */}
            {activeTab === 'todo' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ color: '#0f766e', marginTop: 0, marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}><CheckSquare /> Clinic Tasks</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Synced live with the Desktop App.</p>
                  </div>
                </div>

                <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                  <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="Add a new task for the clinic..." style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', fontSize: '16px' }} />
                  <button type="submit" style={{ padding: '14px 24px', background: '#0d9488', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>Send Task</button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {todos.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No tasks pending. You're all caught up!</p> :
                    todos.map(todo => (
                      <div key={todo.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: todo.is_completed ? '#f8fafc' : 'white', border: '1px solid #e2e8f0', borderRadius: '15px', opacity: todo.is_completed ? 0.6 : 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <input type="checkbox" checked={todo.is_completed ? true : false} readOnly style={{ width: '20px', height: '20px', accentColor: '#0d9488', cursor: 'default' }} />
                          <span style={{ fontSize: '16px', fontWeight: '500', color: '#1e293b', textDecoration: todo.is_completed ? 'line-through' : 'none' }}>{todo.task}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* REPORTS TAB REMOVED FOR RECEPTION */}

          </motion.div>
        </AnimatePresence>

        <div style={{ textAlign: 'center', marginTop: '30px', paddingBottom: '20px', color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>
          Developed by <span style={{ color: '#0d9488', fontWeight: '800' }}>AyraSoft</span>
        </div>
      </div>

      {/* CALENDAR DETAIL MODAL */}
      <AnimatePresence>
        {selectedDayData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={{ background: 'white', padding: '30px', borderRadius: '30px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
              <h2 style={{ color: '#0d9488', marginBottom: '20px', fontWeight: '800' }}>Day Summary: {selectedDayData.day}</h2>
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>Visits ({selectedDayData.visits?.length || 0})</h4>
                {selectedDayData.visits?.map((v, i) => (
                  <div key={i} style={{ padding: '15px', background: '#f0fdf4', borderRadius: '15px', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold' }}>{v.name}</div>
                    <div style={{ fontSize: '12px', color: '#374151' }}>{v.detail}</div>
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: '800', marginTop: '5px' }}>Dr. {v.doctor}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>📅 Scheduled ({selectedDayData.scheduled?.length || 0})</h4>
                {selectedDayData.scheduled?.map((s, i) => (
                  <div key={i} style={{ padding: '15px', background: '#eff6ff', borderRadius: '15px', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold' }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: '#374151' }}>{s.detail}</div>
                    <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: '800', marginTop: '5px' }}>Dr. {s.doctor}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelectedDayData(null)} style={{ width: '100%', padding: '15px', background: '#0d9488', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>Done</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default ReceptionApp;