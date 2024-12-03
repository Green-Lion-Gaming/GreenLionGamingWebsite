document.addEventListener("DOMContentLoaded", async function () {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    document.getElementById('product-count').textContent = `${products.length}`;

    let promoCard = `<li
                class="list-group-item d-flex justify-content-between bg-body-tertiary"
              >
                <div class="text-white" id="promo">
                  <h6 class="my-0">Promo code</h6>
                  <small>EXAMPLE</small>
                </div>
                <span class="text-success">−$</span>
              </li>`

    const response = await fetch('/customer/get-cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(products),
    });

    let userCart = await response.json();

    if (userCart) {
        let subtotal = 0;
        let cartList = document.getElementById("product-list")

        userCart.products.forEach(product => {
            let cartItem = document.createElement("div")
            cartItem.className = "list-group-item d-flex justify-content-between lh-sm"
            cartItem.innerHTML = `
            <li>
                <div>
                  <h6 class="my-0">${product.name}</h6>
                  <small class="text-body-secondary">Digital Copy</small>
                </div>
                <span class="text-body-secondary">${"$" + product.price}</span>
              </li>
              `

              subtotal += product.price
              cartList.insertBefore(cartItem, document.getElementById("product-list").firstChild)
        });

        document.getElementById("total-price").textContent = `$${subtotal}`
    }

    document.addEventListener('click', function (event) {
        if (event.target.id === 'paypal') {

            document.getElementById("paypal-button").style.display = ''
            document.getElementById("credit-form").style.display = 'none'
        } else if (event.target.id === 'debit') {
            document.getElementById("paypal-button").style.display = 'none'
            document.getElementById("credit-form").style.display = ''
        }
    });
});