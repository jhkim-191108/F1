
async function getProducts() {
    try{
        const response = await fetch(`/api/products`);

        if(!response.ok) throw new Error(response.status);
    
    const data = await response.json();
    console.log(data);

    } catch (error) {
        console.error("실패", error.message);
    }
}

getProducts();