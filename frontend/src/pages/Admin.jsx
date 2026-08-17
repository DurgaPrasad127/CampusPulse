import { useEffect,useState } from 'react';
import api from '../services/api.js';

export default function Admin(){
 const [issues,setIssues]=useState([]); const [events,setEvents]=useState([]); const [users,setUsers]=useState([]);
 const [form,setForm]=useState({title:'Hackathon 2026',description:'Build something useful for campus.',location:'Innovation Lab',event_date:''});
 const [editing,setEditing]=useState(null);
 const load=()=>Promise.all([api.get('/issues'),api.get('/events'),api.get('/auth/users')]).then(([i,e,u])=>{setIssues(i.data);setEvents(e.data);setUsers(u.data);});
 useEffect(()=>{load();},[]);
 async function update(id,data){await api.put(`/issues/${id}`,data);load();}
 async function removeIssue(id){if(window.confirm('Delete this issue?')){await api.delete(`/issues/${id}`);load();}}
 async function createEvent(e){e.preventDefault();if(editing){await api.put(`/events/${editing}`,form);}else{await api.post('/events',form);}setEditing(null);setForm({title:'',description:'',location:'',event_date:''});load();}
 function editEvent(event){setEditing(event.id);setForm({title:event.title,description:event.description,location:event.location,event_date:new Date(event.event_date).toISOString().slice(0,16)});}
 async function removeEvent(id){if(window.confirm('Delete this event?')){await api.delete(`/events/${id}`);load();}}
 return <div><p className="eyebrow">ADMIN CONTROL ROOM</p><h1>Administration</h1>
 <section className="card"><h2>Issue Management</h2>{issues.map(i=><div className="admin-row" key={i.id}>
   <div><b>{i.title}</b><small>{i.location} · {i.vote_count} votes</small></div>
   <select value={i.status} onChange={e=>update(i.id,{status:e.target.value})}><option>OPEN</option><option>IN_PROGRESS</option><option>RESOLVED</option></select>
   <select value={i.priority} onChange={e=>update(i.id,{priority:e.target.value})}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select>
   <select value={i.assigned_to || ''} onChange={e=>update(i.id,{assigned_to:e.target.value || null})}><option value="">Unassigned</option>{users.map(u=><option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}</select>
   <button className="danger" onClick={()=>removeIssue(i.id)}>Delete</button>
 </div>)}</section>
 <section className="card form-card"><h2>{editing?'Edit Event':'Create Event'}</h2><form onSubmit={createEvent}>
   <label>Title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
   <label>Description<textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
   <div className="form-grid"><label>Location<input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label>
   <label>Date/time<input type="datetime-local" required value={form.event_date} onChange={e=>setForm({...form,event_date:e.target.value})}/></label></div>
   <div><button className="primary">{editing?'Save Changes':'Create Event'}</button>{editing&&<button type="button" className="filter" onClick={()=>{setEditing(null);setForm({title:'',description:'',location:'',event_date:''});}}>Cancel</button>}</div>
 </form></section>
 <section className="card"><h2>Upcoming Events</h2>{events.map(e=><div className="list-row" key={e.id}><div><b>{e.title}</b><small>{e.location}</small></div><div><button className="filter" onClick={()=>editEvent(e)}>Edit</button> <button className="danger" onClick={()=>removeEvent(e.id)}>Delete</button></div></div>)}</section>
 </div>
}
