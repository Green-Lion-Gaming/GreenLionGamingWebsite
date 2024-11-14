document.addEventListener("DOMContentLoaded", async function () {
    var featuredList = document.getElementById("featured-list")

    const populateProductGrid = (data) => {

        data.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = "card h-100"

            productCard.innerHTML = `<div class="col"><div class="card h-100">
          <img src="${product.image}" class="card-img-top" alt="Game 1">
          <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">Description of the featured game with key highlights.</p>
            <a href="/checkout" class="btn btn-primary">Buy Now</a>
          </div>
        </div></div>`

        featuredList.appendChild(productCard);
        });
    };

    fetch('/marketplace/products?size=3')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                populateProductGrid(data);
            } else {
                console.error('Unexpected response format:', data);
                productGrid.innerHTML = `
                <div class="alert alert-danger text-center" role="alert">
                    Error: Invalid response format.
                </div>
            `;
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            productGrid.innerHTML = `
            <div class="alert alert-danger text-center" role="alert">
                Error loading products. Please try again later.
            </div>
        `;
        });
});