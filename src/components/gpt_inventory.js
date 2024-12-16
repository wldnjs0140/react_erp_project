import React, { useEffect, useState } from "react";
import Header from "./Header";
import "../css/InventoryPage.css";

function InventoryPage() {
  const [activeTab, setActiveTab] = useState("productList"); // 기본 탭을 "productList"로 설정
  const [productList, setProductList] = useState([]); // 전체 제품 리스트 상태
  const [displayedProducts, setDisplayedProducts] = useState([]); // 현재 페이지에 표시될 제품 리스트
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 총 페이지 수
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태
  const [popupData, setPopupData] = useState(null); // 팝업창 데이터 상태
  const [quantity, setQuantity] = useState(1); // 선택된 수량
  const [keyField, setKeyField] = useState("PRODUCTNAME"); // 검색할 필드
  const [stockData, setStockData] = useState([]); // 재고리스트 정보 상태
  const [selectedRows, setSelectedRows] = useState([]); // 삭제를 위한 선택된 행
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false); // 추가 팝업 상태

  useEffect(() => {
    // 제품 리스트 가져오기
    fetch("http://localhost:84/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("제품 리스트를 가져오는 데 실패했습니다.");
        }
        return response.json();
      })
      .then((data) => {
        setProductList(data);
        setTotalPages(Math.ceil(data.length / 15)); // 총 페이지 수 계산 (15개씩 나누기)
        setDisplayedProducts(data.slice(0, 15)); // 처음 15개 제품만 표시
      })
      .catch((error) => console.error(error));

    // 재고 리스트 정보 가져오기
    fetch("http://localhost:84/api/product-stock")
      .then((response) => {
        if (!response.ok) {
          throw new Error("재고리스트 정보를 가져오는 데 실패했습니다.");
        }
        return response.json();
      })
      .then((data) => setStockData(data))
      .catch((error) => console.error(error));
  }, []);

  const handleSort = (option) => {
    let sortedProducts = [...productList];
    if (option === "default") {
      sortedProducts.sort((a, b) => a.PRODUCTCODE.localeCompare(b.PRODUCTCODE));
    } else if (option === "priceAsc") {
      sortedProducts.sort((a, b) => a.PRICE - b.PRICE);
    } else if (option === "priceDesc") {
      sortedProducts.sort((a, b) => b.PRICE - a.PRICE);
    } else if (option === "quantityAsc") {
      sortedProducts.sort((a, b) => a.QUANTITY - b.QUANTITY);
    } else if (option === "quantityDesc") {
      sortedProducts.sort((a, b) => b.QUANTITY - a.QUANTITY);
    }
    setProductList(sortedProducts);
    setTotalPages(Math.ceil(sortedProducts.length / 15));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * 15;
    setDisplayedProducts(productList.slice(startIndex, startIndex + 15));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyFieldChange = (e) => {
    setKeyField(e.target.value);
  };

  const openPopup = (product) => {
    setPopupData(product);
    setQuantity(1);
  };

  const closePopup = () => {
    setPopupData(null);
  };

  const handleQuantityChange = (e) => {
    setQuantity(Number(e.target.value));
  };

  const handlePayment = () => {
    alert(
      `${popupData.PRODUCTNAME}을(를) ${quantity}개 구매하였습니다. 총 금액: ${(
        quantity * popupData.PRICE
      ).toLocaleString()} 원`
    );
    closePopup();
  };

  const handleRowSelection = (productCode) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(productCode)) {
        return prevSelectedRows.filter((code) => code !== productCode);
      } else {
        return [...prevSelectedRows, productCode];
      }
    });
  };

  const handleDeleteSelectedRows = () => {
    setStockData((prevStockData) =>
      prevStockData.filter((row) => !selectedRows.includes(row.PRODUCTCODE))
    );
    setSelectedRows([]);
  };

  const handleAddProduct = () => {
    setIsAddPopupOpen(true);
  };

  const closeAddPopup = () => {
    setIsAddPopupOpen(false);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newProduct = Object.fromEntries(formData.entries());

    setStockData((prevStockData) => [...prevStockData, newProduct]);
    closeAddPopup();
  };

  return (
    <div className="inventory-page">
      <Header />
      <h1>재고 관리</h1>

      <div className="tabs">
        <button
          className={activeTab === "productList" ? "active" : ""}
          onClick={() => setActiveTab("productList")}
        >
          제품 리스트
        </button>
        <button
          className={activeTab === "stock" ? "active" : ""}
          onClick={() => setActiveTab("stock")}
        >
          재고리스트
        </button>
      </div>

      {activeTab === "stock" && (
        <div>
          <div className="stock-buttons">
            <button onClick={handleAddProduct}>추가</button>
            <button onClick={handleDeleteSelectedRows}>삭제</button>
          </div>

          <table>
            <thead>
              <tr>
                <th>삭제</th>
                <th>제품 코드</th>
                <th>제품명</th>
                <th>원가(원)</th>
                <th>총수량</th>
                <th>양품수량</th>
                <th>불량수량</th>
                <th>마지막 재고날짜</th>
              </tr>
            </thead>
            <tbody>
              {stockData.map((row) => (
                <tr key={row.PRODUCTCODE}>
                  <td>
                    <input
                      type="checkbox"
                      onChange={() => handleRowSelection(row.PRODUCTCODE)}
                      checked={selectedRows.includes(row.PRODUCTCODE)}
                    />
                  </td>
                  <td>{row.PRODUCTCODE}</td>
                  <td>{row.PRODUCTNAME}</td>
                  <td>{row.COST}</td>
                  <td>{row.TOTAL_QUANTITY}</td>
                  <td>{row.GOOD_QUANTITY}</td>
                  <td>{row.BAD_QUANTITY}</td>
                  <td>{row.LAST_STOCK_DATE}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAddPopupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>재고 추가</h2>
            <form onSubmit={handleAddSubmit}>
              <label>
                제품 코드:
                <input name="PRODUCTCODE" required />
              </label>
              <label>
                제품명:
                <input name="PRODUCTNAME" required />
              </label>
              <label>
                원가:
                <input name="COST" type="number" required />
              </label>
              <label>
                총수량:
                <input name="TOTAL_QUANTITY" type="number" required />
              </label>
              <label>
                양품수량:
                <input name="GOOD_QUANTITY" type="number" required />
              </label>
              <label>
                불량수량:
                <input name="BAD_QUANTITY" type="number" required />
              </label>
              <label>
                마지막 재고날짜:
                <input name="LAST_STOCK_DATE" type="date" required />
              </label>
              <button type="submit">추가</button>
              <button type="button" onClick={closeAddPopup}>
                취소
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "productList" && (
        <div>
          <div className="search-bar">
            <select value={keyField} onChange={handleKeyFieldChange}>
              <option value="PRODUCTNAME">제품명</option>
              <option value="PRODUCTCODE">제품코드</option>
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="검색어를 입력하세요"
            />
          </div>

          <div className="sort-options">
            <button onClick={() => handleSort("default")}>기본 정렬</button>
            <button onClick={() => handleSort("priceAsc")}>
              가격 오름차순
            </button>
            <button onClick={() => handleSort("priceDesc")}>
              가격 내림차순
            </button>
            <button onClick={() => handleSort("quantityAsc")}>
              수량 오름차순
            </button>
            <button onClick={() => handleSort("quantityDesc")}>
              수량 내림차순
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>제품 코드</th>
                <th>제품명</th>
                <th>가격(원)</th>
                <th>수량</th>
                <th>구매</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts
                .filter((product) =>
                  product[keyField]
                    .toString()
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((product) => (
                  <tr key={product.PRODUCTCODE}>
                    <td>{product.PRODUCTCODE}</td>
                    <td>{product.PRODUCTNAME}</td>
                    <td>{product.PRICE.toLocaleString()}</td>
                    <td>{product.QUANTITY}</td>
                    <td>
                      <button onClick={() => openPopup(product)}>구매</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div className="pagination">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={currentPage === index + 1 ? "active" : ""}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {popupData && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>{popupData.PRODUCTNAME}</h2>
            <p>가격: {popupData.PRICE.toLocaleString()} 원</p>
            <p>수량: {popupData.QUANTITY}</p>
            <label>
              구매 수량:
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={popupData.QUANTITY}
              />
            </label>
            <button onClick={handlePayment}>결제</button>
            <button onClick={closePopup}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryPage;
