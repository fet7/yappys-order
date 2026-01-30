import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Order from './routes/Order';
import Admin from './routes/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Order />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
