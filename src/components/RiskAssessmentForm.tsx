import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RiskAssessment, RISK_CATEGORIES, DATA_INTERFACES, DATA_LOCATIONS, DATA_CLASSIFICATIONS } from "@/types/risk";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";

interface RiskAssessmentFormProps {
  onSubmit: (data: Omit<RiskAssessment, "id" | "createdAt">) => void;
}

const RiskAssessmentForm = ({ onSubmit }: RiskAssessmentFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const form = useForm<Omit<RiskAssessment, "id" | "createdAt">>();

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (values: Omit<RiskAssessment, "id" | "createdAt">) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a risk assessment",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('risk_assessments')
        .insert({
          service_id: values.serviceId,
          risk_category: values.riskCategory,
          risk_description: values.riskDescription,
          data_interface: values.dataInterface,
          data_location: values.dataLocation,
          likelihood_per_year: values.likelihoodPerYear,
          risk_level: values.riskLevel,
          impact: values.impact,
          mitigation: values.mitigation,
          data_classification: values.dataClassification,
          risk_owner: values.riskOwner,
          created_by: user.id
        });

      if (error) throw error;

      onSubmit(values);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save risk assessment",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="riskCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Risk Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a risk category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {RISK_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="riskDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Risk Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataInterface"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Interface</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data interface" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DATA_INTERFACES.map((interface_) => (
                    <SelectItem key={interface_} value={interface_}>
                      {interface_}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DATA_LOCATIONS.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="likelihoodPerYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Likelihood (%/year)</FormLabel>
              <FormControl>
                <Input type="number" min="0" max="100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="riskLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Risk Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["low", "medium", "high", "critical"].map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="impact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Impact</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mitigation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mitigation</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataClassification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Classification</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data classification" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DATA_CLASSIFICATIONS.map((classification) => (
                    <SelectItem key={classification} value={classification}>
                      {classification}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="riskOwner"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Risk Owner</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default RiskAssessmentForm;
