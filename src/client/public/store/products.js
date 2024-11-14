document.addEventListener("DOMContentLoaded", async function() {
    var productGrid = document.getElementById("store-grid")

    const populateProductGrid = (data) => {

        data.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'col mb-5';

            productCard.innerHTML = `
                <div class="card h-100">
                    <!-- Product image-->
                    <img class="card-img-top" src="${product.image}" alt="${product.name}" />
                    <!-- Product details-->
                    <div class="card-body p-4">
                        <div class="text-center">
                            <!-- Product name-->
                            <h5 class="fw-bolder">${product.name}</h5>
                            <!-- Product price-->
                            ${"$"}${product.price}
                        </div>
                    </div>
                    <!-- Product actions-->
                    <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                        <div class="text-center"><a class="btn btn-success btn-outline mt-auto" href="${product.url}">Buy Product</a></div>
                    </div>
                </div>
            `;

            productGrid.appendChild(productCard);
        });
    };

    fetch('/marketplace/products')
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