
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ServerCrash } from "lucide-react";

interface EOLSystemData {
  name: string;
  count: number;
  color: string;
}

interface EOLSystemsWidgetProps {
  eolSystems: EOLSystemData[];
}

export const EOLSystemsWidget = ({ eolSystems }: EOLSystemsWidgetProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <ServerCrash className="h-5 w-5 text-orange-500 mr-2" />
          End-of-Life Systems by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={eolSystems}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Number of Systems">
                {eolSystems.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium">Total EOL systems:</span> {eolSystems.reduce((sum, item) => sum + item.count, 0)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
