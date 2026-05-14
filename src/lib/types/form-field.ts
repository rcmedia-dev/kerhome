import { PropertyFormData } from "@/lib/types/property";

export interface FormField {
  name: keyof PropertyFormData;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string;
  multiple?: boolean;
  validation?: any;
  question?: string;
  isStepComplete?: boolean;
}
