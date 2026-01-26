import { getProfile } from "@/actions/profile"
import { ProfileForm } from "./profile-form"
import { PasswordForm } from "./password-form"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export async function ProfileLoader() {
  const result = await getProfile()

  if ("error" in result) {
    return <p className="text-destructive">Erreur: {result.error}</p>
  }

  const { user } = result

  const roleLabels = {
    ADMIN: "Administrateur",
    CEE: "Membre CEE",
    STUDENT: "Étudiant",
  }

  return (
    <>
      {/* Informations du compte */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
          <CardDescription>
            Détails de votre compte et de votre rôle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rôle</p>
              <Badge variant="outline" className="mt-1">
                {roleLabels[user.role as keyof typeof roleLabels] || user.role}
              </Badge>
            </div>

            {user.commission && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commission</p>
                <Badge
                  variant="outline"
                  className="mt-1"
                  style={{ borderColor: user.commission.color }}
                >
                  <div
                    className="h-2 w-2 rounded-full mr-1.5"
                    style={{ backgroundColor: user.commission.color }}
                  />
                  {user.commission.name}
                </Badge>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground">Email vérifié</p>
              <Badge variant={user.emailVerified ? "default" : "secondary"} className="mt-1">
                {user.emailVerified ? "Oui" : "Non"}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Membre depuis</p>
              <p className="mt-1 text-sm">
                {format(new Date(user.createdAt), "d MMMM yyyy", { locale: fr })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de profil */}
      <ProfileForm
        initialData={{
          name: user.name,
          email: user.email,
        }}
      />

      {/* Formulaire de changement de mot de passe */}
      <PasswordForm />
    </>
  )
}
