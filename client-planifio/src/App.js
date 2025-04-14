import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Authentication from './components/Authentication';
function App() {
  return (
  <BrowserRouter>
    <Routes>
      <Route path="/authentication" element={<Authentication/>} />
    </Routes>
  </BrowserRouter>
  );
}

export default App;
