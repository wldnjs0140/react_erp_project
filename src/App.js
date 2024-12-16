import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import MainPage from "./components/MainPage";
import LoginModal from "./components/LoginModal";
import InventoryPage from "./components/InventoryPage";

function App() {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={<MainPage setLoginModalOpen={setLoginModalOpen} />}
        />
        <Route path="/inventory" element={<InventoryPage />} />
      </Routes>

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setLoginModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
