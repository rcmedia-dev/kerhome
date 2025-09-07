/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import React from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface FormProps {
    control: any;
    name: string;
    label: string;
    children?: React.ReactNode;
    placeholder: string;
    data?: any;
}

export function CustomSelectField({
    control,
    name,
    label,
    children,
    placeholder,
    data,
}: FormProps) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                return (
                    <FormItem className='w-full'>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder={placeholder} />
                                </SelectTrigger>
                                <SelectContent>
                                    {data ? (
                                        <>
                                            {(data ?? []).map(
                                                (dt: {
                                                    id: string;
                                                    name: string;
                                                }) => (
                                                    <SelectItem
                                                        key={dt.id}
                                                        value={dt.id}
                                                    >
                                                        {dt.name}
                                                    </SelectItem>
                                                )
                                            )}
                                        </>
                                    ) : (
                                        <>{children}</>
                                    )}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}
