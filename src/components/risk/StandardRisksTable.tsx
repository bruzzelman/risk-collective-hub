
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Risk {
  name: string;
  category: string;
  description: string;
  lossEventCategory: string;
}

interface StandardRisksTableProps {
  risks: Risk[];
}

const StandardRisksTable = ({ risks }: StandardRisksTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Standard Risks</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Risk Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Loss Event Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risks.map((risk, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{risk.name}</TableCell>
                <TableCell>{risk.category}</TableCell>
                <TableCell>{risk.description}</TableCell>
                <TableCell>{risk.lossEventCategory}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StandardRisksTable;
