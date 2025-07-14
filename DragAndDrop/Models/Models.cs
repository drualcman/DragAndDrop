using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Text.Json.Serialization;

namespace DragAndDrop.Models;

// TemplateExecutionModel.cs
// He añadido la propiedad 'Parent' para facilitar la navegación y manipulación del árbol.
// También he agregado un constructor para inicializar las colecciones.
public class TemplateExecutionModel : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;
    public Guid UniqueId { get; set; } = Guid.NewGuid();

    // Propiedad para referenciar al padre, útil para reestructurar el árbol.
    [JsonIgnore] // Evita referencias circulares si se serializa
    public TemplateExecutionModel? Parent { get; set; }

    private VisualizationType visualization = VisualizationType.Empty;
    public VisualizationType Visualization
    {
        get => visualization;
        set { visualization = value; NotifyPropertyChanged(); }
    }

    private ReportItemDataPosition position = new(1, 1);
    public ReportItemDataPosition Position
    {
        get => position;
        set { position = value; NotifyPropertyChanged(); }
    }

    public string Name { get; set; } = "";
    public string Option { get; set; } = "";
    // public ReportRequestParameter View { get; set; } // Comentado para el ejemplo

    private ObservableCollection<TemplateExecutionModel> _items = [];
    public ObservableCollection<TemplateExecutionModel> Items
    {
        get => _items;
        set
        {
            _items = value;
            // Asignar el padre a cada hijo cuando se establece la colección
            foreach(var item in _items)
            {
                item.Parent = this;
            }
            NotifyPropertyChanged();
        }
    }

    public TemplateExecutionModel()
    {
        Items.CollectionChanged += (s, e) =>
        {
            // Cuando se añade un nuevo item, establecer su padre.
            if(e.NewItems != null)
            {
                foreach(TemplateExecutionModel item in e.NewItems)
                {
                    item.Parent = this;
                }
            }
            NotifyPropertyChanged(nameof(HasChilds));
        };
    }


    public bool HasChilds => Items is not null && Items.Any();
    protected void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}

public class ReportItemDataPosition : IEquatable<ReportItemDataPosition>
{
    public ReportItemDataPosition(int rowNumber, int columnNumber, string wrapperClass = "")
    {
        RowNumber = rowNumber;
        ColumnNumber = columnNumber;
        WrapperClass = wrapperClass;
    }

    public int RowNumber { get; set; }
    public int ColumnNumber { get; set; }
    public string WrapperClass { get; set; } = "";

    public bool Equals(ReportItemDataPosition? other)
    {
        return other is not null &&
               RowNumber == other.RowNumber &&
               ColumnNumber == other.ColumnNumber;
    }
    public override bool Equals(object? obj) => Equals(obj as ReportItemDataPosition);
    public override int GetHashCode() => HashCode.Combine(RowNumber, ColumnNumber);
    public static bool operator ==(ReportItemDataPosition? left, ReportItemDataPosition? right) => EqualityComparer<ReportItemDataPosition>.Default.Equals(left, right);
    public static bool operator !=(ReportItemDataPosition? left, ReportItemDataPosition? right) => !(left == right);
}


public enum VisualizationType
{
    Table = 0,
    LineChart,
    ColumnChart,
    BarChart,
    PieChart,
    AreaChart,
    Text,
    Empty, // Usaremos 'Empty' para representar una fila contenedora
    Literal,
    PercentageLines,
    LineTotalChart,
    RateStars,
    RateStarsWithPercentage,
    TotalsEnumeration,
    ColumnLines,
    RingUpDown
}

