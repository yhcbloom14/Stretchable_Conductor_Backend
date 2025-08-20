"use client"

import React from "react"
import { useForm, SubmitHandler, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"

// Define field types
export type FieldType = 
  | "text" 
  | "email" 
  | "password" 
  | "number" 
  | "textarea" 
  | "select" 
  | "checkbox"
  | "date"
  | "url"

export interface FormFieldConfig {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  description?: string
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: z.ZodSchema<any>
  defaultValue?: any
  disabled?: boolean
  className?: string
}

export interface UnifiedFormProps<T extends Record<string, any>> {
  title?: string
  description?: string
  fields: FormFieldConfig[]
  schema: z.ZodSchema<T>
  onSubmit: SubmitHandler<T>
  defaultValues?: Partial<T>
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  loading?: boolean
  className?: string
  cardClassName?: string
  showCard?: boolean
  submitVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

function renderField(
  field: FormFieldConfig,
  form: UseFormReturn<any>
) {
  const { type, options, placeholder, disabled, className } = field

  switch (type) {
    case "text":
    case "email":
    case "password":
    case "url":
      return (
        <FormControl>
          <Input
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            {...form.register(field.name)}
          />
        </FormControl>
      )

    case "number":
      return (
        <FormControl>
          <Input
            type="number"
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            {...form.register(field.name, { valueAsNumber: true })}
          />
        </FormControl>
      )

    case "date":
      return (
        <FormControl>
          <Input
            type="date"
            disabled={disabled}
            className={className}
            {...form.register(field.name)}
          />
        </FormControl>
      )

    case "textarea":
      return (
        <FormControl>
          <Textarea
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            {...form.register(field.name)}
          />
        </FormControl>
      )

    case "select":
      return (
        <Select
          disabled={disabled}
          onValueChange={(value) => form.setValue(field.name, value)}
          defaultValue={form.getValues(field.name)}
        >
          <FormControl>
            <SelectTrigger className={className}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case "checkbox":
      return (
        <FormControl>
          <div className="flex items-center space-x-2">
            <Checkbox
              disabled={disabled}
              checked={form.watch(field.name)}
              onCheckedChange={(checked) => form.setValue(field.name, checked)}
            />
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {field.label}
            </label>
          </div>
        </FormControl>
      )

    default:
      return (
        <FormControl>
          <Input
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            {...form.register(field.name)}
          />
        </FormControl>
      )
  }
}

export function UnifiedForm<T extends Record<string, any>>({
  title,
  description,
  fields,
  schema,
  onSubmit,
  defaultValues,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onCancel,
  loading = false,
  className = "",
  cardClassName = "",
  showCard = true,
  submitVariant = "default"
}: UnifiedFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any
  })

  const handleSubmit = form.handleSubmit(onSubmit)

  const formContent = (
    <Form {...form}>
      <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
        {(title || description) && (
          <div className="space-y-2">
            {title && <h2 className="text-2xl font-bold">{title}</h2>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
        )}

        <div className="grid gap-4">
          {fields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name as any}
              render={({ field: formField }) => (
                <FormItem>
                  {field.type !== "checkbox" && (
                    <FormLabel>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                  )}
                  {renderField(field, form)}
                  {field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="submit"
            variant={submitVariant}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  )

  if (!showCard) {
    return formContent
  }

  return (
    <Card className={cardClassName}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  )
}

// Convenience hooks for common form patterns
export function useUnifiedForm<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  defaultValues?: Partial<T>
) {
  return useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any
  })
}

// Pre-configured form field configs for common use cases
export const commonFields = {
  email: {
    name: "email",
    label: "Email",
    type: "email" as FieldType,
    placeholder: "Enter your email",
    required: true
  },
  password: {
    name: "password",
    label: "Password",
    type: "password" as FieldType,
    placeholder: "Enter your password",
    required: true
  },
  name: {
    name: "name",
    label: "Name",
    type: "text" as FieldType,
    placeholder: "Enter your name",
    required: true
  },
  title: {
    name: "title",
    label: "Title",
    type: "text" as FieldType,
    placeholder: "Enter title",
    required: true
  },
  description: {
    name: "description",
    label: "Description",
    type: "textarea" as FieldType,
    placeholder: "Enter description"
  },
  url: {
    name: "url",
    label: "URL",
    type: "url" as FieldType,
    placeholder: "https://example.com"
  },
  doi: {
    name: "doi",
    label: "DOI",
    type: "text" as FieldType,
    placeholder: "10.1000/example",
    description: "Digital Object Identifier"
  }
}