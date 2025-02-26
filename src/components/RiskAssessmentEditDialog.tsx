
import { RiskAssessment } from "@/types/risk";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RiskAssessmentForm from "./RiskAssessmentForm";

interface RiskAssessmentEditDialogProps {
  assessment: RiskAssessment | null;
  onClose: () => void;
  onSubmit: (data: Omit<RiskAssessment, "id" | "createdAt">) => void;
}

const RiskAssessmentEditDialog = ({
  assessment,
  onClose,
  onSubmit,
}: RiskAssessmentEditDialogProps) => {
  if (!assessment) return null;

  return (
    <Dialog open={!!assessment} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Risk Assessment</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <RiskAssessmentForm
            onSubmit={onSubmit}
            initialValues={{
              serviceId: assessment.serviceId,
              riskCategory: assessment.riskCategory,
              riskDescription: assessment.riskDescription,
              dataInterface: assessment.dataInterface,
              dataLocation: assessment.dataLocation,
              likelihoodPerYear: assessment.likelihoodPerYear,
              riskLevel: assessment.riskLevel,
              mitigation: assessment.mitigation,
              dataClassification: assessment.dataClassification,
              riskOwner: assessment.riskOwner,
              revenueImpact: assessment.revenueImpact,
              hasGlobalRevenueImpact: assessment.hasGlobalRevenueImpact,
              globalRevenueImpactHours: assessment.globalRevenueImpactHours,
              hasLocalRevenueImpact: assessment.hasLocalRevenueImpact,
              localRevenueImpactHours: assessment.localRevenueImpactHours,
              piDataAtRisk: assessment.piDataAtRisk,
              piDataAmount: assessment.piDataAmount,
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskAssessmentEditDialog;

