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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { locationSchema, type LocationInput } from "@/schemas/location"
import { createLocation, updateLocation, deleteLocation } from "@/actions/locations"
import { getCommissionsForSelect } from "@/actions/users"

interface CreateLocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateLocationModal({ isOpen, onClose, onSuccess }: CreateLocationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [commissions, setCommissions] = useState<Array<{ id: string; name: string; color: string }>>([])

  const form = useForm<LocationInput>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      description: "",
      maxDurationHours: undefined,
      commissionId: "",
    },
  })

  // Load commissions
  useEffect(() => {
    if (isOpen) {
      getCommissionsForSelect().then((result) => {
        if (!("error" in result)) {
          setCommissions(result)
        }
      })
    }
  }, [isOpen])

  const handleSubmit = async (data: LocationInput) => {
    setIsLoading(true)
    try {
      const result = await createLocation(data)

      if (result.success) {
        toast.success("Lieu créé avec succès")
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
      title="Créer un lieu"
      description="Ajoutez un nouveau lieu de réservation"
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
                <FormLabel>Nom du lieu</FormLabel>
                <FormControl>
                  <Input placeholder="Salle A101" {...field} />
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
                    placeholder="Description du lieu..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Informations supplémentaires sur le lieu
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxDurationHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limite de durée (heures)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="5"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === "" ? undefined : parseInt(value, 10))
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Durée maximale de réservation en heures (ex: 5 = max 5h)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commissionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commission</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une commission" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {commissions.map((commission) => (
                      <SelectItem key={commission.id} value={commission.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: commission.color }}
                          />
                          {commission.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Commission responsable de ce lieu
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

interface EditLocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  location: {
    id: string
    name: string
    description: string | null
    maxDurationHours: number | null
    commission: {
      id: string
      name: string
    }
  }
}

export function EditLocationModal({
  isOpen,
  onClose,
  onSuccess,
  location
}: EditLocationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [commissions, setCommissions] = useState<Array<{ id: string; name: string; color: string }>>([])

  const form = useForm<LocationInput>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: location.name,
      description: location.description || "",
      maxDurationHours: location.maxDurationHours || undefined,
      commissionId: location.commission.id,
    },
  })

  // Load commissions
  useEffect(() => {
    if (isOpen) {
      getCommissionsForSelect().then((result) => {
        if (!("error" in result)) {
          setCommissions(result)
        }
      })
    }
  }, [isOpen])

  // Reset form when location changes
  useEffect(() => {
    form.reset({
      name: location.name,
      description: location.description || "",
      maxDurationHours: location.maxDurationHours || undefined,
      commissionId: location.commission.id,
    })
  }, [location, form])

  const handleSubmit = async (data: LocationInput) => {
    setIsLoading(true)
    try {
      const result = await updateLocation(location.id, data)

      if (result.success) {
        toast.success("Lieu mis à jour")
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
      title="Modifier le lieu"
      description={`Modifiez les informations de ${location.name}`}
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
                <FormLabel>Nom du lieu</FormLabel>
                <FormControl>
                  <Input placeholder="Salle A101" {...field} />
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
                    placeholder="Description du lieu..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Informations supplémentaires sur le lieu
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxDurationHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limite de durée (heures)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="5"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === "" ? undefined : parseInt(value, 10))
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Durée maximale de réservation en heures (ex: 5 = max 5h)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commissionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commission</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une commission" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {commissions.map((commission) => (
                      <SelectItem key={commission.id} value={commission.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: commission.color }}
                          />
                          {commission.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Commission responsable de ce lieu
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

interface DeleteLocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  location: {
    id: string
    name: string
  }
}

export function DeleteLocationModal({
  isOpen,
  onClose,
  onSuccess,
  location
}: DeleteLocationModalProps) {
  const handleConfirm = async () => {
    const result = await deleteLocation(location.id)

    if (result.success) {
      toast.success("Lieu supprimé")
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
      title="Supprimer le lieu ?"
      message={`Voulez-vous vraiment supprimer "${location.name}" ?`}
      details="Cette action est irréversible. Le lieu ne pourra plus être réservé."
      type="danger"
      onConfirm={handleConfirm}
      confirmText="Supprimer"
    />
  )
}
