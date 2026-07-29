import { cn } from "../lib/cn"
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react"

export interface FieldProps {
  label?: ReactNode
  children: ReactNode
}

export const Field = ({ label, children }: FieldProps) => {
  return (
    <div>
      {label ? <label className="dx-field__lbl">{label}</label> : null}
      {children}
    </div>
  )
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
}

export const Input = ({ label, className, ...props }: InputProps) => {
  const input = (
    <input
      {...props}
      className={cn("dx-input", className)}
    />
  )
  return label ? <Field label={label}>{input}</Field> : input
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode
}

export const Textarea = ({ label, className, ...props }: TextareaProps) => {
  const field = (
    <textarea
      {...props}
      className={cn("dx-textarea", className)}
    />
  )
  return label ? <Field label={label}>{field}</Field> : field
}
