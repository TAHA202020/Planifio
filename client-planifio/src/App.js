import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Authentication from './components/Authentication';
function App() {
  return (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to={"/authentication"}/>} />
      <Route path="/authentication" element={<Authentication/>} />
    </Routes>
  </BrowserRouter>
  );
}

export default App;
