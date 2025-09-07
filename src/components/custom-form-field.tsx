/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import React from "react";

interface FormProps {
    control: any;
    name: string;
    label: string;
    children: React.ReactElement;
    value?: any;
    onChange?: (value: any) => void;
}

export function CustomFormField({
    control,
    name,
    label,
    children,
    value,
    onChange,
}: FormProps) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const mergedProps = {
                    ...field,
                    value: value !== undefined ? value : field.value,
                    onChange: onChange ?? field.onChange,
                };

                return (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                            {React.cloneElement(children, mergedProps)}
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}