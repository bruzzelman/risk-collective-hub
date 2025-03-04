
import { useProducts } from "@/hooks/useServices";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon, Trash2Icon, PencilIcon } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/forms/TextField";
import { SelectField } from "@/components/forms/SelectField";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Service } from "@/types/risk";
import { useQuery } from "@tanstack/react-query";

type ProductFormData = Pick<Service, "name" | "description"> & {
  divisionId?: string;
  teamId?: string;
};

const DEFAULT_RISK_ASSESSMENTS = [
  {
    risk_category: "Error",
    risk_description: "Administrator unintentionally deletes core infrastructure",
    risk_level: "high",
    data_classification: "Internal",
    risk_owner: "Service Owner",
    mitigation: "Infrastructure as Code, Backup and Recovery procedures",
    data_interface: "Infrastructure",
    data_location: "Cloud",
    likelihood_per_year: 1,
    revenue_impact: "unclear",
  },
  {
    risk_category: "Error",
    risk_description: "Administrator unintentionally exposes PI data",
    risk_level: "high",
    data_classification: "Confidential",
    risk_owner: "Service Owner",
    mitigation: "Access Controls, Data Classification, Encryption",
    data_interface: "Data Storage",
    data_location: "Cloud",
    likelihood_per_year: 1,
    revenue_impact: "unclear",
  },
  {
    risk_category: "Error",
    risk_description: "Administrator unintentionally introduces significant bug into production software",
    risk_level: "high",
    data_classification: "Internal",
    risk_owner: "Service Owner",
    mitigation: "Code Review, Testing, CI/CD Pipeline",
    data_interface: "Application code",
    data_location: "Code repository",
    likelihood_per_year: 1,
    revenue_impact: "unclear",
  },
  {
    risk_category: "Error",
    risk_description: "Vulnerable component gets deployed to production environment",
    risk_level: "high",
    data_classification: "Internal",
    risk_owner: "Service Owner",
    mitigation: "Dependency Scanning, Security Updates",
    data_interface: "Application code",
    data_location: "Code repository",
    likelihood_per_year: 1,
    revenue_impact: "unclear",
  },
  {
    risk_category: "Error",
    risk_description: "Unauthorized internal access to confidential information",
    risk_level: "high",
    data_classification: "Confidential",
    risk_owner: "Service Owner",
    mitigation: "Access Controls, Auditing",
    data_interface: "Data Storage",
    data_location: "Cloud",
    likelihood_per_year: 1,
    revenue_impact: "unclear",
  },
  {
    risk_category: "Error",
    risk_description: "Unauthorized external or partner access to confidential information",
    risk_level: "high",
    data_classification: "Confidential",
    risk_owner: "Service Owner",
    mitigation: "Access Controls, Network Security",
    data_interface: "API",
    data_location: "Cloud",
    likelihood_per_year: 1,
    revenue_impact: "unclear",
  },
  {
    risk_category: "Failure",
    risk_description: "Third party dependency disrupts core component",
    risk_level: "high",
    data_classification: "Internal",
    risk_owner: "Service Owner",
    mitigation: "Vendor Management, Redundancy",
    data_interface: "API",
    data_location: "Not applicable",
    likelihood_per_year: 1,
    revenue_impact: "unclear",
  },
  {
    risk_category: "Failure",
    risk_description: "Unable to provide data to other internal products",
    risk_level: "medium",
    data_classification: "Internal",
    risk_owner: "Service Owner",
    mitigation: "Monitoring, SLAs",
    data_interface: "API",
    data_location: "Not applicable",
    likelihood_per_year: 1,
    revenue_impact: "unclear",
  },
  {
    risk_category: "Failure",
    risk_description: "Unable to get data from other internal products",
    risk_level: "medium",
    data_classification: "Internal",
    risk_owner: "Service Owner",
    mitigation: "Retry Logic, Circuit Breakers",
    data_interface: "API",
    data_location: "Not applicable",
    likelihood_per_year: 1,
    revenue_impact: "unclear",
  },
  {
    risk_category: "Failure",
    risk_description: "Insufficient Monitoring and Alerting",
    risk_level: "medium",
    data_classification: "Internal",
    risk_owner: "Service Owner",
    mitigation: "Monitoring Strategy, Alert Configuration",
    data_interface: "Not applicable",
    data_location: "Not applicable",
    likelihood_per_year: 1,
    revenue_impact: "unclear",
  },
  {
    risk_category: "Failure",
    risk_description: "Resource exhaustion (CPU, memory, storage)",
    risk_level: "high",
    data_classification: "Internal",
    risk_owner: "Service Owner",
    mitigation: "Resource Monitoring, Auto-scaling",
    data_interface: "Infrastructure",
    data_location: "Cloud",
    likelihood_per_year: 1,
    revenue_impact: "unclear",
  },
  {
    risk_category: "Failure",
    risk_description: "Malfunction causes violation of compliance frameworks like GDPR, NIS2, PCI-DSS",
    risk_level: "critical",
    data_classification: "Confidential",
    risk_owner: "Service Owner",
    mitigation: "Compliance Monitoring, Regular Audits",
    data_interface: "Not applicable",
    data_location: "Not applicable",
    likelihood_per_year: 1,
    revenue_impact: "unclear",
  },
  {
    risk_category: "Malicious",
    risk_description: "An attacker exposes PI data",
    risk_level: "critical",
    data_classification: "Confidential",
    risk_owner: "Service Owner",
    mitigation: "Security Controls, Encryption",
    data_interface: "Data Storage",
    data_location: "Cloud",
    likelihood_per_year: 1,
    revenue_impact: "unclear",
  },
  {
    risk_category: "Malicious",
    risk_description: "Data is intentionally compromised by insider",
    risk_level: "critical",
    data_classification: "Confidential",
    risk_owner: "Service Owner",
    mitigation: "Access Controls, Auditing, Least Privilege",
    data_interface: "Data Storage",
    data_location: "Cloud",
    likelihood_per_year: 1,
    revenue_impact: "unclear",
  }
];

const ProductsManagement = () => {
  const { data: services = [], refetch } = useProducts();
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Service | null>(null);
  const { toast } = useToast();

  // Fetch divisions for the dropdown
  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('divisions')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  // Fetch teams for the dropdown
  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      description: "",
      divisionId: undefined,
      teamId: undefined,
    },
  });

  const createDefaultRiskAssessments = async (productId: string, divisionId: string | undefined, userId: string) => {
    try {
      const riskAssessments = DEFAULT_RISK_ASSESSMENTS.map(assessment => ({
        ...assessment,
        service_id: productId,
        division_id: divisionId,
        created_by: userId,
      }));

      const { error } = await supabase
        .from("risk_assessments")
        .insert(riskAssessments);

      if (error) throw error;
    } catch (error) {
      console.error("Error creating default risk assessments:", error);
      throw error;
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from("services")
          .update({
            name: data.name,
            description: data.description,
            division_id: data.divisionId,
            team_id: data.teamId,
          })
          .eq("id", editingProduct.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Create new product
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (!userId) throw new Error("User not authenticated");

        const { data: newProduct, error } = await supabase
          .from("services")
          .insert([{
            name: data.name,
            description: data.description,
            division_id: data.divisionId,
            team_id: data.teamId,
            created_by: userId,
          }])
          .select()
          .single();

        if (error) throw error;

        // Create default risk assessments for the new product
        await createDefaultRiskAssessments(newProduct.id, data.divisionId, userId);

        toast({
          title: "Success",
          description: "Product and default risk assessments created successfully",
        });
      }
      
      form.reset();
      setOpen(false);
      setEditingProduct(null);
      refetch();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Service) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      divisionId: product.divisionId,
      teamId: product.teamId,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      refetch();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingProduct(null);
      form.reset({
        name: "",
        description: "",
        divisionId: undefined,
        teamId: undefined,
      });
    }
    setOpen(open);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Dialog open={open} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <TextField
                  form={form}
                  name="name"
                  label="Product Name"
                  required
                />
                <TextField
                  form={form}
                  name="description"
                  label="Description"
                  type="textarea"
                />
                <SelectField
                  form={form}
                  name="divisionId"
                  label="Division"
                  placeholder="Select a division"
                  options={divisions.map(div => ({
                    value: div.id,
                    label: div.name,
                  }))}
                />
                <SelectField
                  form={form}
                  name="teamId"
                  label="Team"
                  placeholder="Select a team"
                  options={teams.map(team => ({
                    value: team.id,
                    label: team.name,
                  }))}
                />
                <Button type="submit">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((product) => {
            const division = divisions.find(d => d.id === product.divisionId);
            const team = teams.find(t => t.id === product.teamId);
            return (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{division?.name || 'Not assigned'}</TableCell>
                <TableCell>{team?.name || 'Not assigned'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsManagement;
