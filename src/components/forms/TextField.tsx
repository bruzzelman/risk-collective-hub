
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface TextFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  type?: "text" | "number" | "textarea";
  min?: number;
  max?: number;
  required?: boolean;
}

export const TextField = ({
  form,
  name,
  label,
  type = "text",
  min,
  max,
  required,
}: TextFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}{required && <span className="text-destructive ml-1">*</span>}</FormLabel>
          <FormControl>
            {type === "textarea" ? (
              <Textarea {...field} />
            ) : (
              <Input type={type} min={min} max={max} {...field} required={required} />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
