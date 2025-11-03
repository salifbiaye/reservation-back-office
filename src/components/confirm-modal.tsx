"use client"

import { useState } from "react"
import { Modal } from "@/components/modal"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  type LucideIcon
} from "lucide-react"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: "danger" | "warning" | "success" | "info"
  onConfirm: () => Promise<void> | void
  confirmText?: string
  cancelText?: string
  details?: string
  disabled?: boolean
}

const typeConfig = {
  danger: {
    icon: Trash2,
    iconClass: "text-red-600 dark:text-red-400",
    iconBgClass: "bg-red-100 dark:bg-red-900/50",
    confirmClass: "bg-red-600 hover:bg-red-700 text-white",
    defaultConfirmText: "Supprimer"
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-orange-600 dark:text-orange-400",
    iconBgClass: "bg-orange-100 dark:bg-orange-900/50",
    confirmClass: "bg-orange-600 hover:bg-orange-700 text-white",
    defaultConfirmText: "Continuer"
  },
  success: {
    icon: CheckCircle,
    iconClass: "text-emerald-600 dark:text-emerald-400",
    iconBgClass: "bg-emerald-100 dark:bg-emerald-900/50",
    confirmClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    defaultConfirmText: "Confirmer"
  },
  info: {
    icon: Info,
    iconClass: "text-blue-600 dark:text-blue-400",
    iconBgClass: "bg-blue-100 dark:bg-blue-900/50",
    confirmClass: "bg-blue-600 hover:bg-blue-700 text-white",
    defaultConfirmText: "Confirmer"
  }
}

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  type = "danger",
  onConfirm,
  confirmText,
  cancelText = "Annuler",
  details,
  disabled = false
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const config = typeConfig[type]
  const IconComponent = config.icon

  const handleConfirm = async () => {
    if (disabled || isLoading) return

    try {
      setIsLoading(true)
      await onConfirm()
      onClose()
    } catch (error) {
      console.error("Confirmation error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      preventClose={isLoading}
      showCloseButton={false}
    >
      <div className="text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${config.iconBgClass}`}>
            <IconComponent className={`h-6 w-6 ${config.iconClass}`} />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {message}
          </p>
          {details && (
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              {details}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-[80px]"
          >
            {cancelText}
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={disabled || isLoading}
            className={`min-w-[100px] ${config.confirmClass}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              confirmText || config.defaultConfirmText
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
