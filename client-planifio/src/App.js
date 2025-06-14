import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Authentication from './components/Authentication';
import Dashboard from './components/Dashboard';
import Lists from './components/Lists';
import Calendar from './components/Calendar';
import Home from './components/Home';
function App() {
  return (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to={"/dashboard"}/>} />
      <Route path="/authentication" element={<Authentication/>} />
      <Route path="/dashboard" element={<Dashboard/>}>
        <Route path="calendar" element={<Calendar/>} />
        <Route path=":boardId" element={<Lists/>} />
      </Route>
    </Routes>
  </BrowserRouter>
  );
}

export default App;
