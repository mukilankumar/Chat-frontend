import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import Chat from './pages/chat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
