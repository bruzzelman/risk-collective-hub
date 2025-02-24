
import { useServices } from "@/hooks/useServices";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/forms/TextField";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Service } from "@/types/risk";

type ServiceFormData = Pick<Service, "name" | "description">;

const ServicesManagement = () => {
  const { data: services = [], refetch } = useServices();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<ServiceFormData>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: ServiceFormData) => {
    try {
      const { error } = await supabase
        .from("services")
        .insert([{
          name: data.name,
          description: data.description,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service created successfully",
      });
      
      form.reset();
      setOpen(false);
      refetch();
    } catch (error) {
      console.error("Error creating service:", error);
      toast({
        title: "Error",
        description: "Failed to create service",
        variant: "destructive",
      });
    }
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
        description: "Service deleted successfully",
      });
      
      refetch();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Services Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <TextField
                  form={form}
                  name="name"
                  label="Service Name"
                  required
                />
                <TextField
                  form={form}
                  name="description"
                  label="Description"
                  type="textarea"
                />
                <Button type="submit">Create Service</Button>
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
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell>{service.name}</TableCell>
              <TableCell>{service.description}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(service.id)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ServicesManagement;
