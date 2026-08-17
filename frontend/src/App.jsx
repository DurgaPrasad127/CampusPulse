import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ReportIssue from './pages/ReportIssue.jsx';
import Issues from './pages/Issues.jsx';
import IssueDetails from './pages/IssueDetails.jsx';
import Events from './pages/Events.jsx';
import Admin from './pages/Admin.jsx';

export default function App(){return <BrowserRouter><Routes>
<Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
<Route element={<ProtectedRoute/>}><Route element={<Layout/>}><Route path="/dashboard" element={<Dashboard/>}/><Route path="/report" element={<ReportIssue/>}/><Route path="/issues" element={<Issues/>}/><Route path="/issues/:id" element={<IssueDetails/>}/><Route path="/events" element={<Events/>}/><Route element={<ProtectedRoute adminOnly/>}><Route path="/admin" element={<Admin/>}/></Route></Route></Route>
<Route path="*" element={<Navigate to="/dashboard" replace/>}/>
</Routes></BrowserRouter>}
