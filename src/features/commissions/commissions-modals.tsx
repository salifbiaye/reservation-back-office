"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { FormModal } from "@/components/form-modal"
import { ConfirmModal } from "@/components/confirm-modal"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { commissionSchema, type CommissionInput } from "@/schemas/commission"
import { createCommission, updateCommission, deleteCommission } from "@/actions/commissions"

interface CreateCommissionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateCommissionModal({ isOpen, onClose, onSuccess }: CreateCommissionModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CommissionInput>({
    resolver: zodResolver(commissionSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3b82f6",
    },
  })

  const handleSubmit = async (data: CommissionInput) => {
    setIsLoading(true)
    try {
      const result = await createCommission(data)

      if (result.success) {
        toast.success("Commission créée avec succès")
        form.reset()
        onSuccess()
        onClose()
      } else {
        toast.error(result.error || "Erreur lors de la création")
      }
    } catch (error) {
      toast.error("Erreur lors de la création")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Créer une commission"
      description="Ajoutez une nouvelle commission"
      mode="create"
      form={form}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de la commission</FormLabel>
                <FormControl>
                  <Input placeholder="Commission Sport" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description de la commission..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Informations supplémentaires sur la commission
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                  <FormItem>
                    <FormLabel>Couleur</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="grid grid-cols-8 gap-2">
                          {[
                            { hex: '#ef4444', class: 'bg-red-500' },
                            { hex: '#f97316', class: 'bg-orange-500' },
                            { hex: '#f59e0b', class: 'bg-amber-500' },
                            { hex: '#eab308', class: 'bg-yellow-500' },
                            { hex: '#84cc16', class: 'bg-lime-500' },
                            { hex: '#22c55e', class: 'bg-green-500' },
                            { hex: '#10b981', class: 'bg-emerald-500' },
                            { hex: '#14b8a6', class: 'bg-teal-500' },
                            { hex: '#06b6d4', class: 'bg-cyan-500' },
                            { hex: '#0ea5e9', class: 'bg-sky-500' },
                            { hex: '#3b82f6', class: 'bg-blue-500' },
                            { hex: '#6366f1', class: 'bg-indigo-500' },
                            { hex: '#8b5cf6', class: 'bg-violet-500' },
                            { hex: '#a855f7', class: 'bg-purple-500' },
                            { hex: '#d946ef', class: 'bg-fuchsia-500' },
                            { hex: '#ec4899', class: 'bg-pink-500' },
                          ].map((color) => (
                              <button
                                  key={color.hex}
                                  type="button"
                                  onClick={() => field.onChange(color.hex)}
                                  className={`w-10 h-10 rounded-lg ${color.class} transition-all hover:scale-110 ${
                                      field.value === color.hex
                                          ? 'ring-2 ring-offset-2 ring-primary'
                                          : 'hover:ring-2 hover:ring-offset-2 hover:ring-gray-300'
                                  }`}
                                  title={color.hex}
                              />
                          ))}
                        </div>
                        <Input
                            type="text"
                            placeholder="#3b82f6"
                            className="font-mono"
                            value={field.value}
                            onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Couleur d&apos;identification de la commission
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
              )}
          />
        </div>
      </Form>
    </FormModal>
  )
}

interface EditCommissionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  commission: {
    id: string
    name: string
    description: string | null
    color: string
  }
}

export function EditCommissionModal({
  isOpen,
  onClose,
  onSuccess,
  commission
}: EditCommissionModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CommissionInput>({
    resolver: zodResolver(commissionSchema),
    defaultValues: {
      name: commission.name,
      description: commission.description || "",
      color: commission.color,
    },
  })

  // Reset form when commission changes
  useEffect(() => {
    form.reset({
      name: commission.name,
      description: commission.description || "",
      color: commission.color,
    })
  }, [commission, form])

  const handleSubmit = async (data: CommissionInput) => {
    setIsLoading(true)
    try {
      const result = await updateCommission(commission.id, data)

      if (result.success) {
        toast.success("Commission mise à jour")
        onSuccess()
        onClose()
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier la commission"
      description={`Modifiez les informations de ${commission.name}`}
      mode="update"
      form={form}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de la commission</FormLabel>
                <FormControl>
                  <Input placeholder="Commission Sport" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description de la commission..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Informations supplémentaires sur la commission
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                  <FormItem>
                    <FormLabel>Couleur</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="grid grid-cols-8 gap-2">
                          {[
                            { hex: '#ef4444', class: 'bg-red-500' },
                            { hex: '#f97316', class: 'bg-orange-500' },
                            { hex: '#f59e0b', class: 'bg-amber-500' },
                            { hex: '#eab308', class: 'bg-yellow-500' },
                            { hex: '#84cc16', class: 'bg-lime-500' },
                            { hex: '#22c55e', class: 'bg-green-500' },
                            { hex: '#10b981', class: 'bg-emerald-500' },
                            { hex: '#14b8a6', class: 'bg-teal-500' },
                            { hex: '#06b6d4', class: 'bg-cyan-500' },
                            { hex: '#0ea5e9', class: 'bg-sky-500' },
                            { hex: '#3b82f6', class: 'bg-blue-500' },
                            { hex: '#6366f1', class: 'bg-indigo-500' },
                            { hex: '#8b5cf6', class: 'bg-violet-500' },
                            { hex: '#a855f7', class: 'bg-purple-500' },
                            { hex: '#d946ef', class: 'bg-fuchsia-500' },
                            { hex: '#ec4899', class: 'bg-pink-500' },
                          ].map((color) => (
                              <button
                                  key={color.hex}
                                  type="button"
                                  onClick={() => field.onChange(color.hex)}
                                  className={`w-10 h-10 rounded-lg ${color.class} transition-all hover:scale-110 ${
                                      field.value === color.hex
                                          ? 'ring-2 ring-offset-2 ring-primary'
                                          : 'hover:ring-2 hover:ring-offset-2 hover:ring-gray-300'
                                  }`}
                                  title={color.hex}
                              />
                          ))}
                        </div>
                        <Input
                            type="text"
                            placeholder="#3b82f6"
                            className="font-mono"
                            value={field.value}
                            onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Couleur d&apos;identification de la commission
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
              )}
          />
        </div>
      </Form>
    </FormModal>
  )
}

interface DeleteCommissionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  commission: {
    id: string
    name: string
  }
}

export function DeleteCommissionModal({
  isOpen,
  onClose,
  onSuccess,
  commission
}: DeleteCommissionModalProps) {
  const handleConfirm = async () => {
    const result = await deleteCommission(commission.id)

    if (result.success) {
      toast.success("Commission supprimée")
      onSuccess()
      onClose()
    } else {
      toast.error(result.error || "Erreur lors de la suppression")
    }
  }

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Supprimer la commission ?"
      message={`Voulez-vous vraiment supprimer "${commission.name}" ?`}
      details="Cette action est irréversible. Assurez-vous qu'aucun membre ou lieu n'est associé à cette commission."
      type="danger"
      onConfirm={handleConfirm}
      confirmText="Supprimer"
    />
  )
}
