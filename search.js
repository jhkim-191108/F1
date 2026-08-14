    /*들어가야 할 목록
    1. 일단 API 연결
    2. DOM 연결 및 조작
    3. */

const API_URL = "https://carrot.techfree.kr/api";

async function getProducts() {
    try{
        const response = await fetch(`${API_URL}/api/products`);

        if(!response.ok) throw new Error(response.status);
    
    const data = await response.json();
    console.log(data);

    } catch (error) {
        console.error("실패", error.message);
    }
}

getProducts();