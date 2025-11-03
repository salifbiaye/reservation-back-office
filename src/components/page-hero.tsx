import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface PageHeroSectionProps {
    icon: LucideIcon
    title: string
    description: string
    primaryAction?: {
        label: string
        icon: LucideIcon
        href?: string
        onClick?: () => void
    }
    secondaryAction?: {
        label: string
        icon: LucideIcon
        href?: string
        onClick?: () => void
    }
    tertiaryAction?: {
        label: string
        icon: LucideIcon
        href?: string
        onClick?: () => void
    }
    badge?: ReactNode
    visualIcon?: LucideIcon
}

export function PageHeroSection({
                                    icon: Icon,
                                    title,
                                    description,
                                    primaryAction,
                                    secondaryAction,
                                    tertiaryAction,
                                    badge,
                                    visualIcon: VisualIcon
                                }: PageHeroSectionProps) {
    return (
        <div className="bg-slate-100 dark:bg-muted border-2 border-border rounded-3xl p-6 sm:p-8 lg:p-12 mb-6 dark:shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                <div className="flex-1 space-y-6">
                    {/* En-tête avec icône pill */}
                    <div className="space-y-5">
                        <div
                            className="inline-flex items-center gap-2 bg-muted border border-border rounded-full px-4 py-2">
                            <Icon className="h-4 w-4 text-primary"/>
                            <span
                                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Section</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                                    {title}
                                </h1>
                                {badge}
                            </div>

                            <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    {(primaryAction || secondaryAction || tertiaryAction) && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                            {primaryAction && (
                                primaryAction.onClick ? (
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto font-semibold"
                                        onClick={primaryAction.onClick}
                                    >
                                        <primaryAction.icon className="mr-2 h-4 w-4"/>
                                        {primaryAction.label}
                                    </Button>
                                ) : primaryAction.href ? (
                                    <Link href={primaryAction.href} className="w-full sm:w-auto">
                                        <Button
                                            size="lg"
                                            className="w-full sm:w-auto font-semibold"
                                        >
                                            <primaryAction.icon className="mr-2 h-4 w-4"/>
                                            {primaryAction.label}
                                        </Button>
                                    </Link>
                                ) : null
                            )}
                            {secondaryAction && (
                                secondaryAction.onClick ? (
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full sm:w-auto font-medium"
                                        onClick={secondaryAction.onClick}
                                    >
                                        <secondaryAction.icon className="mr-2 h-4 w-4"/>
                                        {secondaryAction.label}
                                    </Button>
                                ) : secondaryAction.href ? (
                                    <Link href={secondaryAction.href} className="w-full sm:w-auto">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="w-full sm:w-auto font-medium"
                                        >
                                            <secondaryAction.icon className="mr-2 h-4 w-4"/>
                                            {secondaryAction.label}
                                        </Button>
                                    </Link>
                                ) : null
                            )}
                            {tertiaryAction && (
                                tertiaryAction.onClick ? (
                                    <Button
                                        size="lg"
                                        variant="ghost"
                                        className="w-full sm:w-auto font-medium"
                                        onClick={tertiaryAction.onClick}
                                    >
                                        <tertiaryAction.icon className="mr-2 h-4 w-4"/>
                                        {tertiaryAction.label}
                                    </Button>
                                ) : tertiaryAction.href ? (
                                    <Link href={tertiaryAction.href} className="w-full sm:w-auto">
                                        <Button
                                            size="lg"
                                            variant="ghost"
                                            className="w-full sm:w-auto font-medium"
                                        >
                                            <tertiaryAction.icon className="mr-2 h-4 w-4"/>
                                            {tertiaryAction.label}
                                        </Button>
                                    </Link>
                                ) : null
                            )}
                        </div>
                    )}
                </div>

                {/* Icône visuelle côté droit */}
                {VisualIcon && (
                    <div className="hidden lg:flex items-center justify-center">
                        <div className="relative">
                            <div
                                className="w-26 h-26 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                                <VisualIcon className="h-14 w-14 text-primary" strokeWidth={1.5}/>
                            </div>
                            <div
                                className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center shadow-lg">
                                <div className="w-3 h-3 rounded-full bg-white"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}