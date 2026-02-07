"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Toast as ToastPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function ToastProvider({
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Provider>) {
  return <ToastPrimitive.Provider data-slot="toast-provider" {...props} />
}

function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:top-auto sm:right-0 sm:flex-col md:max-w-[420px]",
        className
      )}
      {...props}
    />
  )
}

function Toast({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Root>) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "bg-background text-foreground data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=move]:transition-none group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all sm:data-[state=open]:slide-in-from-bottom-full",
        className
      )}
      {...props}
    />
  )
}

function ToastAction({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Action>) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      className={cn(
        "hover:bg-secondary focus:ring-ring group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors outline-hidden focus:ring-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function ToastClose({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      className={cn(
        "text-foreground/50 hover:text-foreground focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity outline-hidden focus:opacity-100 focus:ring-2 group-hover:opacity-100",
        className
      )}
      toast-close=""
      {...props}
    >
      <X className="size-4" />
    </ToastPrimitive.Close>
  )
}

function ToastTitle({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Title>) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  )
}

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
