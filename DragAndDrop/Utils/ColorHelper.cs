namespace DragAndDrop.Utils;

public static class ColorHelper
{
    // Genera un color consistente basado en el hash del string del tipo de visualización.
    public static string GetColorForVisualization(Models.VisualizationType vizType, double opacity = 1.0)
    {
        if(vizType == Models.VisualizationType.Empty)
        {
            // Devuelve el color verde por defecto para las filas.
            return $"rgba(40, 167, 69, {opacity})";
        }
        var hash = vizType.ToString().GetHashCode();
        var r = (hash & 0xFF0000) >> 16;
        var g = (hash & 0x00FF00) >> 8;
        var b = hash & 0x0000FF;
        return $"rgba({r}, {g}, {b}, {opacity})";
    }
}
