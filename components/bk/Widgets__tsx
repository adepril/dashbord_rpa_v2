import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WidgetsProps {
  data: any
}

export default function Widgets({ data }: WidgetsProps) {
  if (!data) return null;

  const widgets = [
    {
      title: "NB Unités Mois N-1",
      value: data['NB UNITES MOIS N-1'] || '0',
      color: "bg-purple-800 hover:bg-red-600"
    },
    {
      title: "NB Unités Mois N-2",
      value: data['NB UNITES MOIS N-2'] || '0',
      color: "bg-purple-600 hover:bg-red-400"
    },
    {
      title: "NB Unités Mois N-3",
      value: data['NB UNITES MOIS N-3'] || '0',
      color: "bg-purple-400 hover:bg-red-200"
    }
  ];

  return (
    <div className="flex flex-col gap-3" style={{marginTop: 55}}>
      {widgets.map((widget, index) => (
        <div
          key={index}
          className={`${widget.color} rounded-lg py-2 px-4 text-white shadow-md h-16`}
        >
          <div className="flex flex-col">
            <h3 className="text-sm font-medium">{widget.title}</h3>
            <p className="text-2xl font-bold text-right">{widget.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
