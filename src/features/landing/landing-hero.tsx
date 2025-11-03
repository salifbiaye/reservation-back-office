"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { CpuAnimation } from "./cpu-animation"

export function LandingHero() {
  return (
    <section className="w-full min-h-screen overflow-hidden">
      <div className=" px-4 md:px-6">
        <div className="md:flex lg:py-40 md:py-24 py-16 h-full justify-start items-center relative overflow-hidden">
          {/* Contenu à gauche */}
          <div className="flex items-center justify-start">
            <div className="xl:max-w-xl md:max-w-lg w-full">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-2 text-sm mb-4">
                Back Office CEE
              </div>

              <h1 className="lg:text-6xl xl:text-7xl sm:text-5xl text-3xl font-bold mb-6 leading-tight">
                Gérez vos{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  réservations
                </span>{" "}
                en toute simplicité
              </h1>

              <p className="text-muted-foreground sm:mb-8 mb-4 leading-relaxed xl:w-full lg:w-[80%] md:w-[60%] w-[90%] md:text-lg">
                Plateforme d'administration complète pour valider et gérer les réservations de salles pour l'ESP.
              </p>

              <div className="flex gap-2 mb-8">
                <Link href="/login">
                  <Button size="lg" className="gap-2">
                    Se connecter
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* CPU Animation à droite avec effet skew */}
          <div className="md:absolute md:top-0 md:mt-0 mt-8 2xl:-right-52 xl:-right-72 sm:-right-80 overflow-hidden -skew-x-12 md:h-[44rem] md:[mask-image:radial-gradient(ellipse_80%_50%_at_100%_50%,#000_70%,transparent_110%)] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]">
            <CpuAnimation text="CEE" />
            <div className="absolute bottom-0 left-0 right-0 -z-10 top-0 dark:bg-[repeating-linear-gradient(135deg,#1e293b_0px_1px,transparent_1px_16px)] bg-[repeating-linear-gradient(135deg,#e2e8f0_0px_1px,transparent_1px_16px)] [mask-image:radial-gradient(ellipse_35%_50%_at_50%_50%,#000_70%,transparent_95%)]" />
          </div>
        </div>
      </div>
    </section>
  )
}
