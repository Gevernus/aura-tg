({
    init: function (entity) {
        const shopComponent = entity.getComponent('ShopComponent');
        const shopList = document.getElementById('shopList');
        shopList.innerHTML = '';
        if (!shopComponent.shopItems) {
            return;
        }
        shopComponent.shopItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('shop-item');
            itemDiv.innerHTML = `
        <h4>${item.name}</h4>
        <p>Price: ${item.price}</p>
        <button class="buyButton" data-id="${item.id}">Buy</button>
      `;
            shopList.appendChild(itemDiv);
        });

        document.querySelectorAll('.buyButton').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.target.getAttribute('data-id');
                console.log(`Buing item with ID: ${itemId}`);
            });
        });
    },

    render: function (entity) {

    }
})