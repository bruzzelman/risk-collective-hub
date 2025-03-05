
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface FinancialLossData {
  name: string;
  amount: number;
  color: string;
}

interface FinancialLossWidgetProps {
  financialLossByType: FinancialLossData[];
}

export const FinancialLossWidget = ({ financialLossByType }: FinancialLossWidgetProps) => {
  // Format number with Euro symbol
  const formatEuro = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Financial Loss by Cost Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={financialLossByType}
              margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
            >
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => `€${value / 1000}k`} 
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value) => [formatEuro(value as number), "Amount"]}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="amount" name="Amount (€)">
                {financialLossByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            <span className="font-medium">Total potential financial loss:</span> {formatEuro(financialLossByType.reduce((sum, item) => sum + item.amount, 0))}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
