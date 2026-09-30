"use client";

import React, {useState} from "react";
import {Control, FieldPath, FieldValues, Controller} from "react-hook-form";
import {LucideIcon, Eye, EyeOff} from "lucide-react";
import {Field, FieldError} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";

export interface CustomInputProps<T extends FieldValues = FieldValues>
    extends Omit<React.ComponentProps<typeof Input>, "name" | "defaultValue"> {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
    icon?: LucideIcon;
    isRequired?: boolean;
}

const CustomInput = <T extends FieldValues = FieldValues>(
    {
        control,
        name,
        label,
        icon: Icon,
        type = "text",
        placeholder,
        className,
        isRequired = true,
        ...inputProps
    }: CustomInputProps<T>) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <Controller
            name={name}
            control={control}
            render={({field, fieldState}) => {
                const hasValue =
                    field.value !== undefined && field.value !== null && field.value !== "";
                const isFloating = isFocused || hasValue;

                return (
                    <Field data-invalid={fieldState.invalid} className="relative pt-2">
                        <div className="relative flex items-center">
                            {Icon && (
                                <Icon
                                    className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground shrink-0 z-10 pointer-events-none"/>
                            )}

                            <label
                                htmlFor={field.name}
                                className={cn(
                                    "absolute transition-all duration-200 ease-out pointer-events-none z-20 px-1.5 font-medium select-none",
                                    isFloating
                                        ? "-top-2.5 left-3 text-xs text-primary font-semibold bg-muted"
                                        : cn(
                                            "top-1/2 -translate-y-1/2 text-sm text-muted-foreground bg-transparent",
                                            Icon ? "left-9" : "left-3.5"
                                        )
                                )}
                            >
                                {label}
                                {isRequired && (<span className="ml-1 text-destructive">*</span>)}
                            </label>

                            <Input
                                {...inputProps}
                                {...field}
                                id={field.name}
                                type={inputType}
                                placeholder={isFloating ? placeholder : ""}
                                value={field.value ?? ""}
                                aria-invalid={fieldState.invalid}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => {
                                    field.onBlur();
                                    setIsFocused(false);
                                }}
                                onChange={(e) => {
                                    if (type === "number") {
                                        const raw = e.target.value;
                                        field.onChange(raw === "" ? null : Number(raw));
                                    } else {
                                        field.onChange(e.target.value);
                                    }
                                }}
                                className={cn(
                                    Icon ? "pl-9" : "",
                                    isPassword ? "pr-10" : "",
                                    "h-11 bg-background border-input text-foreground focus:ring-2 focus:ring-ring/20 transition-all rounded-xl w-full",
                                    className
                                )}
                            />

                            {isPassword && (
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer z-10 p-0.5 rounded transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 shrink-0" />
                                    ) : (
                                        <Eye className="h-4 w-4 shrink-0" />
                                    )}
                                </button>
                            )}
                        </div>

                        {fieldState.invalid && (
                            <FieldError
                                errors={[fieldState.error]}
                                className="text-xs text-destructive font-semibold"
                            />
                        )}
                    </Field>
                );
            }}
        />
    );
};

export default CustomInput;
