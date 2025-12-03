import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import AdminDashboard from './components/Admin/AdminDashboard';
import QuestionnaireEditor from './components/Admin/QuestionnaireEditor';
import QuestionnaireForm from './components/Participant/QuestionnaireForm';
import Dashboard from './components/Admin/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/create" element={<QuestionnaireEditor />} />
        <Route path="/form/:questionnaireId" element={<QuestionnaireForm />} />
        <Route path="/dashboard/:questionnaireId" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

