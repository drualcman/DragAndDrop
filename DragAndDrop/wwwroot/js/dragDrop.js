// Almacena una referencia al objeto .NET para poder invocar sus métodos
window.blazorDragDrop = {
    dotNetHelper: null,
    setDotNetHelper: function (helper) {
        this.dotNetHelper = helper;
    }
};

// Hace que un elemento sea arrastrable
window.makeDraggable = (element, dragData) => {
    if (!element) return;
    element.setAttribute('draggable', 'true');

    element.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'move';
    });
};

// Convierte un elemento en una zona para soltar
window.makeDropZone = (element) => {
    if (!element) return;

    element.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necesario para permitir el drop
        element.classList.add('drag-over');
    });

    element.addEventListener('dragleave', (e) => {
        e.preventDefault();
        element.classList.remove('drag-over');
    });

    element.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Evita que el evento se propague a elementos padres
        element.classList.remove('drag-over');

        const droppedData = JSON.parse(e.dataTransfer.getData('text/plain'));
        const targetId = element.id;

        // Llama al método de Blazor
        if (window.blazorDragDrop.dotNetHelper) {
            window.blazorDragDrop.dotNetHelper.invokeMethodAsync('HandleDrop', droppedData, targetId);
        } else {
            console.error("DotNet helper not set up.");
        }
    });
};
