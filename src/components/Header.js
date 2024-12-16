import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Header.css";

function Header() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inventory"); // 기본 탭을 "products"로 설정

  // 로그아웃 처리
  const handleLogout = () => {
    document.cookie = "username=; path=/; max-age=0"; // username 쿠키 삭제
    alert("로그아웃되었습니다.");
    navigate("/"); // 로그아웃 후 메인 페이지로 이동
  };

  return (
    <header className="header">
      <nav className="header-nav">
        <button
          className={activeTab === "inventory" ? "active" : ""}
          onClick={() => navigate("/inventory")}
        >
          재고관리
        </button>
        <button
          className={activeTab === "sales" ? "active" : ""}
          onClick={() => navigate("/sales")}
        >
          매출관리
        </button>
        <button
          className={activeTab === "hr" ? "active" : ""}
          onClick={() => navigate("/hr")}
        >
          인사관리
        </button>
        <button className="logout" onClick={handleLogout}>
          로그아웃
        </button>
      </nav>
    </header>
  );
}

export default Header;
