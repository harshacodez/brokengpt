import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import ChatEnv from "./pages/ChatEnv";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Footer from "./components/Footer";
import Wallet from "./pages/Wallet";
import ChatSelection from "./pages/ChatSelection";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
        <Route path="/chat" element={<ChatSelection />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/chat/:activeSession" element={<ChatEnv />} />
        <Route path="/wallet" element={<Wallet />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
