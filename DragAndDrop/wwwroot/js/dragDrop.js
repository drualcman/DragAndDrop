window.blazorDragDrop = {
    dotNetHelper: null,
    setDotNetHelper: function (helper) {
        this.dotNetHelper = helper;
    },
    // Almacena el ID del elemento que se está arrastrando
    draggedItemId: null
};

// Función para determinar la posición del drop
function getDropPosition(e, element) {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Umbrales (ej. 25% de los bordes)
    const thresholdX = rect.width * 0.25;
    const thresholdY = rect.height * 0.25;

    if (y < thresholdY) return "Top";
    if (y > rect.height - thresholdY) return "Bottom";
    if (x < thresholdX) return "Left";
    if (x > rect.width - thresholdX) return "Right";

    return "Center";
}

// Hace que un elemento sea arrastrable
window.makeDraggable = (element, dragData) => {
    if (!element) return;
    element.setAttribute('draggable', 'true');

    element.addEventListener('dragstart', (e) => {
        e.stopPropagation(); // Evita que el evento se propague a los padres
        e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'move';
        // Guardamos el id del elemento que se arrastra si es un item existente
        if (dragData.ItemId) {
            window.blazorDragDrop.draggedItemId = dragData.ItemId;
        }
    });

    element.addEventListener('dragend', (e) => {
        // Limpiamos el id al finalizar el arrastre
        window.blazorDragDrop.draggedItemId = null;
    });
};

// Convierte un elemento en una zona para soltar
window.makeDropZone = (element) => {
    if (!element) return;

    element.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // No aplicar lógica si nos arrastramos sobre nosotros mismos o nuestros hijos
        if (element.id === window.blazorDragDrop.draggedItemId || element.closest(`[id='${window.blazorDragDrop.draggedItemId}']`)) {
            element.classList.remove('drag-over', 'drop-zone-top', 'drop-zone-bottom', 'drop-zone-left', 'drop-zone-right');
            return;
        }

        const position = getDropPosition(e, element);

        // Limpia clases anteriores y añade la nueva para feedback visual
        element.classList.add('drag-over');
        element.classList.remove('drop-zone-top', 'drop-zone-bottom', 'drop-zone-left', 'drop-zone-right');

        if (position !== "Center") {
            element.classList.add(`drop-zone-${position.toLowerCase()}`);
        }
    });

    element.addEventListener('dragleave', (e) => {
        e.preventDefault();
        element.classList.remove('drag-over', 'drop-zone-top', 'drop-zone-bottom', 'drop-zone-left', 'drop-zone-right');
    });

    element.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        element.classList.remove('drag-over', 'drop-zone-top', 'drop-zone-bottom', 'drop-zone-left', 'drop-zone-right');

        // No permitir soltar sobre sí mismo
        const droppedData = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (droppedData.ItemId && droppedData.ItemId === element.id) {
            return;
        }

        const targetId = element.id;
        const position = getDropPosition(e, element);

        if (window.blazorDragDrop.dotNetHelper) {
            window.blazorDragDrop.dotNetHelper.invokeMethodAsync('HandleDrop', droppedData, targetId, position);
        } else {
            console.error("DotNet helper not set up.");
        }
    });
};