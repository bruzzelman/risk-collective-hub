
import { RiskAssessment } from "@/types/risk";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import RiskAssessmentForm from "./RiskAssessmentForm";
import { useAuth } from "@/components/AuthProvider";

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
  const { user } = useAuth();
  
  if (!assessment) return null;

  return (
    <Dialog open={!!assessment} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Risk Assessment</DialogTitle>
          <DialogDescription>
            Make changes to the risk assessment below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <RiskAssessmentForm
            onSubmit={onSubmit}
            initialValues={{
              serviceId: assessment.serviceId,
              riskCategory: assessment.riskCategory,
              riskDescription: assessment.riskDescription,
              riskOwner: user?.email || assessment.riskOwner, // Use current user's email or fall back to the original
              dataInterface: assessment.dataInterface,
              dataLocation: assessment.dataLocation, // Keep this to satisfy the type
              likelihoodPerYear: assessment.likelihoodPerYear,
              riskLevel: assessment.riskLevel,
              mitigation: assessment.mitigation,
              dataClassification: assessment.dataClassification,
              revenueImpact: assessment.revenueImpact,
              hasGlobalRevenueImpact: assessment.hasGlobalRevenueImpact,
              globalRevenueImpactHours: assessment.globalRevenueImpactHours,
              hasLocalRevenueImpact: assessment.hasLocalRevenueImpact,
              localRevenueImpactHours: assessment.localRevenueImpactHours,
              piDataAtRisk: assessment.piDataAtRisk,
              piDataAmount: assessment.piDataAmount,
              hoursToRemediate: assessment.hoursToRemediate,
              postMortemHours: assessment.postMortemHours,
              additionalLossEventCosts: assessment.additionalLossEventCosts,
              mitigativeControlsImplemented: assessment.mitigativeControlsImplemented || "",
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskAssessmentEditDialog;
