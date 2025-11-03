"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Modal } from "@/components/modal"
import { ConfirmModal } from "@/components/confirm-modal"
import { FormModal } from "@/components/form-modal"
import { Button } from "@/components/ui/button"
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
import { acceptReservation, rejectReservation, createReservation, deleteReservation } from "@/actions/reservations"
import { getLocationsForSelect } from "@/actions/locations"
import { createReservationSchema, type CreateReservationInput } from "@/schemas/reservation"
import { Loader2, XCircle, CalendarPlus } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const rejectReservationSchema = z.object({
  reason: z.string().min(10, "La raison doit contenir au moins 10 caractères"),
})

type RejectReservationInput = z.infer<typeof rejectReservationSchema>

interface AcceptReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  reservation: {
    id: string
    title: string
    start: Date
    end: Date
    user: {
      name: string
      email: string
    }
    location: {
      name: string
    }
  }
  validatorId: string
}

export function AcceptReservationModal({
  isOpen,
  onClose,
  onSuccess,
  reservation,
  validatorId
}: AcceptReservationModalProps) {
  const handleConfirm = async () => {
    const result = await acceptReservation(reservation.id, validatorId)

    if (result.success) {
      toast.success("Réservation acceptée")
      onSuccess()
      onClose()
    } else {
      toast.error(result.error || "Erreur lors de l'acceptation")
    }
  }

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Accepter la réservation ?"
      message={`Confirmer l'acceptation de "${reservation.title}" ?`}
      details={`Demandée par ${reservation.user.name} (${reservation.user.email}) pour ${reservation.location.name} du ${format(new Date(reservation.start), "PPP 'à' HH:mm", { locale: fr })} au ${format(new Date(reservation.end), "PPP 'à' HH:mm", { locale: fr })}.`}
      type="success"
      onConfirm={handleConfirm}
      confirmText="Accepter"
    />
  )
}

interface RejectReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  reservation: {
    id: string
    title: string
    user: {
      name: string
    }
  }
  validatorId: string
}

export function RejectReservationModal({
  isOpen,
  onClose,
  onSuccess,
  reservation,
  validatorId
}: RejectReservationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RejectReservationInput>({
    resolver: zodResolver(rejectReservationSchema),
    defaultValues: {
      reason: "",
    },
  })

  const handleSubmit = async (data: RejectReservationInput) => {
    setIsLoading(true)
    try {
      const result = await rejectReservation(reservation.id, validatorId, data.reason)

      if (result.success) {
        toast.success("Réservation refusée")
        form.reset()
        onSuccess()
        onClose()
      } else {
        toast.error(result.error || "Erreur lors du refus")
      }
    } catch (error) {
      toast.error("Erreur lors du refus")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Refuser la réservation"
      description="Indiquez la raison du refus"
      size="md"
      preventClose={isLoading}
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Info section */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-1">
          <p className="text-sm font-medium">Réservation :</p>
          <p className="text-sm text-muted-foreground">{reservation.title}</p>
          <p className="text-xs text-muted-foreground">
            Demandée par {reservation.user.name}
          </p>
        </div>

        <Form {...form}>
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raison du refus</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Expliquez pourquoi cette réservation est refusée..."
                    className="resize-none"
                    rows={5}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Cette raison sera communiquée à l'étudiant par email
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>

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
            className="min-w-[120px] bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Refus en cours...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Refuser
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

interface CreateReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateReservationModal({
  isOpen,
  onClose,
  onSuccess
}: CreateReservationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [locations, setLocations] = useState<Array<{
    id: string
    name: string
    commission: { name: string; color: string }
  }>>([])

  const form = useForm<CreateReservationInput>({
    resolver: zodResolver(createReservationSchema),
    defaultValues: {
      title: "",
      description: "",
      locationId: "",
      start: new Date(),
      end: new Date(),
    },
  })

  // Load locations
  useEffect(() => {
    if (isOpen) {
      getLocationsForSelect().then((result) => {
        if (!("error" in result)) {
          setLocations(result)
        }
      })
    }
  }, [isOpen])

  const handleSubmit = async (data: CreateReservationInput) => {
    setIsLoading(true)
    try {
      const result = await createReservation(data)

      if (result.success) {
        toast.success("Réservation créée avec succès")
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
      title="Créer une réservation"
      description="Créez une réservation directement avec statut accepté"
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre</FormLabel>
                <FormControl>
                  <Input placeholder="Réunion d'équipe..." {...field} />
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
                <FormLabel>Description (optionnel)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Détails de la réservation..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lieu</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un lieu" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: location.commission.color }}
                          />
                          {location.name}
                          <span className="text-xs text-muted-foreground">
                            ({location.commission.name})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date/Heure début</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={field.value instanceof Date ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date/Heure fin</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={field.value instanceof Date ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormDescription>
            Cette réservation sera automatiquement acceptée
          </FormDescription>
        </div>
      </Form>
    </FormModal>
  )
}

interface DeleteReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  reservation: {
    id: string
    title: string
    start: Date
    end: Date
    location: {
      name: string
    }
  }
}

export function DeleteReservationModal({
  isOpen,
  onClose,
  onSuccess,
  reservation
}: DeleteReservationModalProps) {
  const handleConfirm = async () => {
    const result = await deleteReservation(reservation.id)

    if (result.success) {
      toast.success("Réservation supprimée")
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
      title="Supprimer la réservation ?"
      message={`Voulez-vous vraiment supprimer "${reservation.title}" ?`}
      details={`Lieu: ${reservation.location.name} - Du ${format(new Date(reservation.start), "PPP 'à' HH:mm", { locale: fr })} au ${format(new Date(reservation.end), "PPP 'à' HH:mm", { locale: fr })}`}
      type="danger"
      onConfirm={handleConfirm}
      confirmText="Supprimer"
    />
  )
}
