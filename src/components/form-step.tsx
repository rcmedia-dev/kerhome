import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PropertyFormData } from "@/lib/types/property";
import { Textarea } from "./ui/textarea";

interface FormField {
  name: keyof PropertyFormData;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string;
  multiple?: boolean;
  validation?: any;
}

interface FormStepProps {
  title: string;
  description: string;
  fields: FormField[];
}

const FormStep = ({ title, description, fields }: FormStepProps) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<PropertyFormData>();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof PropertyFormData,
    multiple: boolean = false
  ) => {
    const files = e.target.files;
    if (!files) return;

    if (multiple) {
      setValue(fieldName, Array.from(files) as any);
    } else {
      setValue(fieldName, files[0] as any);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>

      <div className="space-y-4">
        {fields.map((field) => {
          const error = errors[field.name]?.message as string;
          const value = watch(field.name);

          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {field.type === "textarea" ? (
                <div>
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    rows={4}
                    {...register(field.name, field.validation)}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>
              ) : field.type === "select" ? (
                <div>
                  <select
                    id={field.name}
                    {...register(field.name, field.validation)}
                    className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 ${
                      error ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Selecione...</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>
              ) : field.type === "file" ? (
                <div>
                  <Input
                    id={field.name}
                    type="file"
                    accept={field.accept}
                    multiple={field.multiple}
                    onChange={(e) => handleFileChange(e, field.name, field.multiple)}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                  {value && (
                    <p className="text-sm text-gray-500 mt-1">
                      {field.multiple 
                        ? `${(value as File[]).length} arquivo(s) selecionado(s)`
                        : `Arquivo selecionado: ${(value as File).name}`}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    step={field.type === "number" ? "any" : undefined}
                    {...register(field.name, {
                      valueAsNumber: field.type === "number",
                      ...field.validation,
                    })}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormStep;