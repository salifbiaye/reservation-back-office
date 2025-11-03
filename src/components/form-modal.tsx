"use client"

import { ReactNode } from "react"
import { UseFormReturn } from "react-hook-form"
import { Modal } from "@/components/modal"
import { Button } from "@/components/ui/button"
import { Loader2, Save, Plus } from "lucide-react"

interface FormModalProps<T = any> {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  mode: "create" | "update"
  form: UseFormReturn<T>
  onSubmit: (data: T) => Promise<void> | void
  children: ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  submitText?: string
  isLoading?: boolean
}

export function FormModal<T = any>({
  isOpen,
  onClose,
  title,
  description,
  mode,
  form,
  onSubmit,
  children,
  size = "lg",
  submitText,
  isLoading = false
}: FormModalProps<T>) {
  const defaultSubmitText = mode === "create" ? "Créer" : "Mettre à jour"

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data)
      onClose()
      form.reset()
    } catch (error) {
      console.error("Form submission error:", error)
    }
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      preventClose={isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Content */}
        <div className="space-y-4">
          {children}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mode === "create" ? "Création..." : "Mise à jour..."}
              </>
            ) : (
              <>
                {mode === "create" ? (
                  <Plus className="h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {submitText || defaultSubmitText}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
