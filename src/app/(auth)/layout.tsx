import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentification - ESP Réservation",
  description: "Connectez-vous à votre espace étudiant ESP",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-[100dvw] overflow-hidden">
      {/* Left: Auth form */}
      <section className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {children}
        </div>
      </section>

      {/* Right: Hero image */}
      <section className="hidden md:block flex-1 relative p-4">
        <div
          className="absolute inset-4 rounded-3xl bg-cover bg-center"
          style={{
            backgroundImage: "url(/background-admin.png)",
            backgroundPosition: "center"
          }}
        >
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-3xl" />

          {/* ESP Logo & Info */}
          <div className="absolute bottom-8 left-8 right-8 text-white space-y-4">
            <h2 className="text-4xl font-bold">ESP Réservation</h2>
            <p className="text-lg text-white/90">
              Réservez facilement les espaces et ressources de l'École Supérieure Polytechnique
            </p>

          </div>
        </div>
      </section>
    </div>
  )
}
