import { Calendar, Shield, Users, BarChart3, Clock, Zap } from "lucide-react"

const features = [
  {
    icon: Calendar,
    title: "Gestion des réservations",
    description: "Validez et gérez toutes les demandes en temps réel avec notifications instantanées",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "Accès sécurisé",
    description: "Système de permissions par commission avec authentification renforcée",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "Administration utilisateurs",
    description: "Gérez les membres CEE, leurs rôles et affectations aux commissions",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Analytics & Rapports",
    description: "Tableaux de bord interactifs avec statistiques et analyses détaillées",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Clock,
    title: "Historique complet",
    description: "Suivi de toutes les actions avec traçabilité et logs d'audit complets",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Zap,
    title: "Notifications",
    description: "Alertes automatiques par email pour chaque nouvelle demande",
    color: "from-yellow-500 to-orange-500",
  },
]

export function LandingFeatures() {
  return (
    <section className=" py-20 md:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0  -z-10" />

      <div className=" px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm">
            Fonctionnalités
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Gestion complète des réservations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Validez, suivez et analysez toutes les réservations depuis une interface centralisée
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border bg-muted hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                {/* Gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative space-y-4">
                  {/* Icon with gradient */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
