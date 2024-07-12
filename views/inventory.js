({
    init: function (entity) {
        const inventoryComponent = entity.getComponent('InventoryComponent');
        const inventoryList = document.getElementById('inventoryList');
        inventoryList.innerHTML = '';
        inventoryComponent.inventoryData.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('inventory-item');
            itemDiv.innerHTML = `
        <h4>${item.name}</h4>
        <p>${item.description}</p>
      `;
            inventoryList.appendChild(itemDiv);
        });
    },

    render: function (entity) {
        
    }
})