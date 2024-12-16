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
  const [stockData, setStockData] = useState([]); // 입출고 정보 상태
  const [in_outData, setin_outData] = useState([]); // 입출고 정보 상태
  const [displayedInOutData, setDisplayedInOutData] = useState([]); // 현재 페이지에 표시될 입출고 데이터
  const [selectedRows, setSelectedRows] = useState([]); // 삭제를 위한 선택된 행
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false); // 추가 팝업 상태
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
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
      .then((data) => {
        setStockData(data);
        setTotalPages(Math.ceil(data.length / 15)); // 입출고 정보의 총 페이지 수 계산
        setDisplayedInOutData(data.slice(0, 15));
      }) // 처음 15개 입출고 정보만 표시})
      .catch((error) => console.error(error));

    // 입출고 정보 가져오기
    fetch("http://localhost:84/api/stock-history")
      .then((response) => {
        if (!response.ok) {
          throw new Error("입출고 정보를 가져오는 데 실패했습니다.");
        }
        return response.json();
      })
      .then((data) => setin_outData(data))
      .catch((error) => console.error(error));
  }, []);

  const handleSort = (option) => {
    let sortedProducts = [...productList];
    if (option === "default") {
      sortedProducts.sort((a, b) => a.PRODUCTCODE.localeCompare(b.PRODUCTCODE)); // 기본: 제품 코드 내림차순
    } else if (option === "priceAsc") {
      sortedProducts.sort((a, b) => a.PRICE - b.PRICE); // 가격 오름차순
    } else if (option === "priceDesc") {
      sortedProducts.sort((a, b) => b.PRICE - a.PRICE); // 가격 내림차순
    } else if (option === "quantityAsc") {
      sortedProducts.sort((a, b) => a.QUANTITY - b.QUANTITY); // 수량 오름차순
    } else if (option === "quantityDesc") {
      sortedProducts.sort((a, b) => b.QUANTITY - a.QUANTITY); // 수량 내림차순
    }
    setProductList(sortedProducts);
    setTotalPages(Math.ceil(sortedProducts.length / 15)); // 정렬 후 총 페이지 수 재계산
    setCurrentPage(1); // 정렬 후 첫 페이지로 리셋
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * 15;
    setDisplayedProducts(productList.slice(startIndex, startIndex + 15)); // 페이지에 맞는 제품 15개 표시
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyFieldChange = (e) => {
    setKeyField(e.target.value);
  };

  const openPopup = (product) => {
    setPopupData(product);
    setQuantity(1); // 팝업 열릴 때 초기 수량 설정
  };

  const closePopup = () => {
    setPopupData(null);
  };
  const handleQuantityChange = (e) => {
    const newQuantity = Math.min(e.target.value, popupData?.QUANTITY); // 입력값이 최대 수량을 넘지 않도록 제한
    setQuantity(Number(newQuantity));
  };

  const handlePayment = () => {
    // 결제 처리 로직 추가
    alert(
      `${popupData.PRODUCTNAME}을(를) ${quantity}개 구매하였습니다. 총 금액: ${(
        quantity * popupData.PRICE
      ).toLocaleString()} 원`
    );
    closePopup(); // 결제 후 팝업 닫기
  };

  const filteredProducts = productList.filter((item) =>
    item[keyField].toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 검색 버튼 클릭 시 호출될 함수
  const handleSearchSubmit = () => {
    // 검색어를 기반으로 필터링 처리
    const filtered = productList.filter((item) =>
      item[keyField].toLowerCase().includes(searchQuery.toLowerCase())
    );
    setDisplayedProducts(filtered.slice(0, 15)); // 검색 결과의 처음 15개 표시
    setTotalPages(Math.ceil(filtered.length / 15)); // 검색 결과에 맞는 총 페이지 수 계산
    setCurrentPage(1); // 검색 후 첫 페이지로 이동
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
  const handleEditProduct = () => {
    // 선택된 제품이 하나만 있어야 수정 가능
    if (selectedRows.length === 1) {
      const productToEdit = stockData.find(
        (row) => row.PRODUCTCODE === selectedRows[0]
      );
      if (productToEdit) {
        setPopupData(productToEdit); // 데이터가 존재하면 팝업 데이터 설정
        setIsEditPopupOpen(true); // 수정 팝업 열기
      } else {
        console.error("선택된 제품을 찾을 수 없습니다.");
      }
    } else {
      console.error("수정하려면 하나의 제품을 선택해야 합니다.");
    }
  };

  const closeEditPopup = () => {
    setIsEditPopupOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedProduct = Object.fromEntries(formData.entries());

    // 수정된 데이터 반영
    setStockData((prevStockData) =>
      prevStockData.map((product) =>
        product.PRODUCTCODE === updatedProduct.PRODUCTCODE
          ? updatedProduct
          : product
      )
    );
    closeEditPopup(); // 수정 후 팝업 닫기
  };
  const getStringDate = (date) => {
    return date.toISOString().slice(0, 10);
  };
  const [date, setDate] = useState(getStringDate(new Date())); // (5) 초기값 설정

  return (
    <div className="inventory-page">
      <Header />
      <h1>재고 관리</h1>

      {/* 탭 버튼 */}
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
        <button
          className={activeTab === "in-out" ? "active" : ""}
          onClick={() => setActiveTab("in-out")}
        >
          입출고 정보
        </button>
      </div>

      {/* 탭 내용 */}
      {activeTab === "productList" && (
        <div>
          {/* 제품 리스트 */}
          <div>
            <table>
              <thead>
                <tr>
                  <th>제품 코드</th>
                  <th>제품명</th>
                  <th>카테고리</th>
                  <th>가격</th>
                  <th>수량</th>
                  <th>등록일</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7">제품이 없습니다.</td>
                  </tr>
                ) : (
                  filteredProducts
                    .slice((currentPage - 1) * 15, currentPage * 15)
                    .map((item) => (
                      <tr
                        key={item.PRODUCTCODE}
                        onClick={() => openPopup(item)}
                      >
                        <td>{item.PRODUCTCODE}</td>
                        <td>{item.PRODUCTNAME}</td>
                        <td>{item.CATEGORY}</td>
                        <td>{item.PRICE.toLocaleString()} 원</td>{" "}
                        {/* 가격 포맷 적용 */}
                        <td>{item.QUANTITY}</td>
                        <td>
                          {new Date(item.REGDATE).toLocaleDateString()}
                        </td>{" "}
                        {/* 등록일 포맷 적용 */}
                        <td>{item.DESCRIPTION}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
            {/* 정렬 영역 */}
            <div className="sort-area">
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
            {/* 검색 영역 */}
            <div className="search-bar">
              <select value={keyField} onChange={handleKeyFieldChange}>
                <option value="PRODUCTNAME">제품명</option>
                <option value="PRODUCTCODE">제품 코드</option>
                <option value="CATEGORY">카테고리</option>
              </select>
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button onClick={handleSearchSubmit}>검색</button>
            </div>
          </div>

          {/* 페이징 */}
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={currentPage === index + 1 ? "active" : ""}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* 재고 리스트 */}
      {activeTab === "stock" && (
        <div>
          <div className="stock-buttons">
            <button onClick={handleAddProduct}>추가</button>
            <button
              onClick={handleEditProduct}
              disabled={selectedRows.length !== 1}
            >
              수정
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>
                  <button onClick={handleDeleteSelectedRows}>삭제</button>
                </th>
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
              {stockData.length === 0 ? (
                <tr>
                  <td colSpan="8">재고 정보가 없습니다.</td>
                </tr>
              ) : (
                stockData.map((row) => (
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
                    <td>{Math.floor(row.COST).toLocaleString()}</td>
                    <td>{row.TOTALQUANTITY}</td>
                    <td>{row.GOODQUANTITY}</td>
                    <td>{row.BADQUANTITY}</td>
                    <td>{new Date(row.LASTUPDATED).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {isAddPopupOpen && (
        <div className="popup-overlay">
          <div className="add-stock-popup">
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
                수량:
                <input name="TOTAL_QUANTITY" type="number" required />
              </label>
              <label>
                마지막 재고날짜:
                <input
                  name="LAST_STOCK_DATE"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </label>
              <button type="submit">추가</button>
              <button type="button" onClick={closeAddPopup}>
                취소
              </button>
            </form>
          </div>
        </div>
      )}

      {isEditPopupOpen && popupData && (
        <div className="popup-overlay">
          <div className="edit-stock-popup">
            <h2>재고 수정</h2>
            <form onSubmit={handleEditSubmit}>
              <label>
                제품 코드:
                <input
                  name="PRODUCTCODE"
                  defaultValue={popupData.PRODUCTCODE}
                  required
                  disabled
                />
              </label>
              <label>
                제품명:
                <input
                  name="PRODUCTNAME"
                  defaultValue={popupData.PRODUCTNAME}
                  required
                />
              </label>
              <label>
                원가:
                <input
                  name="COST"
                  type="number"
                  defaultValue={popupData.COST}
                  required
                />
              </label>
              <label>
                총수량:
                <input
                  name="TOTAL_QUANTITY"
                  type="number"
                  defaultValue={popupData.TOTAL_QUANTITY}
                  required
                />
              </label>
              <label>
                양품수량:
                <input
                  name="GOOD_QUANTITY"
                  type="number"
                  defaultValue={popupData.GOOD_QUANTITY}
                  required
                />
              </label>
              <label>
                불량수량:
                <input
                  name="BAD_QUANTITY"
                  type="number"
                  defaultValue={popupData.BAD_QUANTITY}
                  required
                />
              </label>
              <label>
                마지막 재고날짜:
                <input
                  name="LAST_STOCK_DATE"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  defaultValue={popupData.LAST_STOCK_DATE}
                  required
                />
              </label>
              <button type="submit">수정</button>
              <button type="button" onClick={closeEditPopup}>
                취소
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "in-out" && (
        <div>
          {/* 입출고 정보 표시 */}
          <table>
            <thead>
              <tr>
                <th>번호</th>
                <th>제품 코드</th>
                <th>입고/출고</th>
                <th>수량</th>
                <th>날짜</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {in_outData.length === 0 ? (
                <tr>
                  <td colSpan="6">입출고 정보가 없습니다.</td>
                </tr>
              ) : (
                in_outData.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.PRODUCTID}</td>
                    <td>{entry.PRODUCTCODE}</td>
                    <td>{entry.TRANSACTIONTYPE}</td>
                    <td>{entry.QUANTITY}</td>

                    <td>
                      {new Date(entry.TRANSACTIONDATE).toLocaleDateString()}
                    </td>
                    <td>{entry.NOTE}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 결제 팝업 */}
      {popupData && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>{popupData.PRODUCTNAME}</h2>
            <div>
              <p>제품 코드: {popupData.PRODUCTCODE}</p>
              <p>가격: {popupData.PRICE} 원</p>
              <p>
                수량:
                <input
                  type="number"
                  value={quantity}
                  min="1"
                  max={popupData.QUANTITY}
                  onChange={handleQuantityChange}
                />
                <b>&nbsp; 개 </b>(<b className="qSize">{popupData.QUANTITY}</b>
                <b className="qMessage">개까지 입력가능</b>)
              </p>
              <p>총 금액: {(quantity * popupData.PRICE).toLocaleString()} 원</p>
            </div>
            <div className="popup-buttons">
              <button className="pay-button" onClick={handlePayment}>
                결제
              </button>
              <button className="cancel-button" onClick={closePopup}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryPage;
