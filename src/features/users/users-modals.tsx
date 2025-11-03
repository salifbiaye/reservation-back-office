"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { FormModal } from "@/components/form-modal"
import { ConfirmModal } from "@/components/confirm-modal"
import { InfoModal } from "@/components/info-modal"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  createUserSchema,
  updateUserCommissionSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserCommissionInput,
  type UpdateUserInput
} from "@/schemas/user"
import { createUser, updateUser, updateUserCommission, deleteUser, getCommissionsForSelect } from "@/actions/users"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [commissions, setCommissions] = useState<Array<{ id: string; name: string; color: string }>>([])
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [createdEmail, setCreatedEmail] = useState("")

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "CEE",
      commissionId: "",
    },
  })

  const selectedRole = form.watch("role")

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

  const handleSubmit = async (data: CreateUserInput) => {
    setIsLoading(true)
    try {
      const result = await createUser(data)

      if (result.success && result.user && result.defaultPassword) {
        setGeneratedPassword(result.defaultPassword)
        setCreatedEmail(result.user.email)
        setShowPasswordModal(true)
        form.reset()
        onSuccess()
        toast.success("Utilisateur créé avec succès")
      } else {
        toast.error(result.error || "Erreur lors de la création")
      }
    } catch (error) {
      toast.error("Erreur lors de la création")
    } finally {
      setIsLoading(false)
    }
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword)
    toast.success("Mot de passe copié")
  }

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false)
    setGeneratedPassword("")
    setCreatedEmail("")
    onClose()
  }

  return (
    <>
      <FormModal
        isOpen={isOpen}
        onClose={onClose}
        title="Créer un utilisateur"
        description="Créez un nouveau compte utilisateur CEE ou ADMIN"
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
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Jean Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jean.dupont@esp.sn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CEE">CEE (Membre de commission)</SelectItem>
                      <SelectItem value="ADMIN">ADMIN (Administrateur)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedRole === "CEE" && (
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </Form>
      </FormModal>

      {/* Password display modal */}
      <InfoModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        title="Utilisateur créé"
        type="success"
        size="md"
      >
        <div className="space-y-4">
          <p>
            Le compte <strong>{createdEmail}</strong> a été créé avec succès.
          </p>

          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Mot de passe temporaire :</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-background px-3 py-2 rounded border text-sm font-mono">
                {generatedPassword}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copyPassword}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Communiquez ce mot de passe à l'utilisateur. Il pourra le modifier lors de sa première connexion.
          </p>
        </div>
      </InfoModal>
    </>
  )
}

interface EditUserCommissionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: {
    id: string
    name: string
    commission?: {
      id: string
      name: string
    } | null
  }
}

export function EditUserCommissionModal({
  isOpen,
  onClose,
  onSuccess,
  user
}: EditUserCommissionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [commissions, setCommissions] = useState<Array<{ id: string; name: string; color: string }>>([])

  const form = useForm<UpdateUserCommissionInput>({
    resolver: zodResolver(updateUserCommissionSchema),
    defaultValues: {
      commissionId: user.commission?.id || "",
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

  // Reset form when user changes
  useEffect(() => {
    form.reset({
      commissionId: user.commission?.id || "",
    })
  }, [user, form])

  const handleSubmit = async (data: UpdateUserCommissionInput) => {
    setIsLoading(true)
    try {
      const result = await updateUserCommission(user.id, data)

      if (result.success) {
        toast.success("Commission mise à jour")
        form.reset()
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
      description={`Changez la commission de ${user.name}`}
      mode="update"
      form={form}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      size="md"
    >
      <Form {...form}>
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
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
    </FormModal>
  )
}

interface UpdateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export function UpdateUserModal({
  isOpen,
  onClose,
  onSuccess,
  user
}: UpdateUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  })

  // Reset form when user changes
  useEffect(() => {
    form.reset({
      name: user.name,
      email: user.email,
    })
  }, [user, form])

  const handleSubmit = async (data: UpdateUserInput) => {
    setIsLoading(true)
    try {
      const result = await updateUser(user.id, data)

      if (result.success) {
        toast.success("Utilisateur mis à jour")
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
      title="Modifier l'utilisateur"
      description={`Modifier les informations de ${user.name}`}
      mode="update"
      form={form}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      size="md"
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet</FormLabel>
                <FormControl>
                  <Input placeholder="Jean Dupont" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jean.dupont@esp.sn" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Rôle en lecture seule */}
          <div className="space-y-2">
            <FormLabel>Rôle</FormLabel>
            <Input
              value={user.role === "ADMIN" ? "ADMIN (Administrateur)" : "CEE (Membre de commission)"}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Le rôle ne peut pas être modifié après la création
            </p>
          </div>
        </div>
      </Form>
    </FormModal>
  )
}

interface DeleteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: {
    id: string
    name: string
    email: string
  }
}

export function DeleteUserModal({
  isOpen,
  onClose,
  onSuccess,
  user
}: DeleteUserModalProps) {
  const handleConfirm = async () => {
    const result = await deleteUser(user.id)

    if (result.success) {
      toast.success("Utilisateur supprimé")
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
      title="Supprimer l'utilisateur ?"
      message={`Voulez-vous vraiment supprimer ${user.name} (${user.email}) ?`}
      details="Cette action est irréversible. L'utilisateur ne pourra plus se connecter."
      type="danger"
      onConfirm={handleConfirm}
      confirmText="Supprimer"
    />
  )
}
