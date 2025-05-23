
import { RiskAssessment } from "@/types/risk";
import { TableCell, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";

interface RiskAssessmentTableRowProps {
  assessment: RiskAssessment;
  serviceName: string;
  divisionName: string;
  teamName: string;
  onEdit: (assessment: RiskAssessment) => void;
}

const RiskAssessmentTableRow = ({
  assessment,
  serviceName,
  divisionName,
  teamName,
  onEdit,
}: RiskAssessmentTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{serviceName}</TableCell>
      <TableCell>{divisionName}</TableCell>
      <TableCell>{teamName}</TableCell>
      <TableCell>{assessment.riskDescription}</TableCell>
      <TableCell>{assessment.riskCategory}</TableCell>
      <TableCell>{assessment.dataInterface}</TableCell>
      <TableCell>{assessment.dataLocation}</TableCell>
      <TableCell>{assessment.likelihoodPerYear}%</TableCell>
      <TableCell>{assessment.riskOwner}</TableCell>
      <TableCell>{assessment.createdAt.toLocaleDateString()}</TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(assessment)}
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default RiskAssessmentTableRow;
