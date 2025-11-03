import { Nunito, Ubuntu} from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
// import { DOMTranslatorWrapper } from "@/i18n/dom-translator-wrapper"; // DÉSACTIVÉ : cause hydration errors + lent

import "./globals.css";


const ubuntu = Ubuntu({
    subsets: ["latin"],
    variable: "--font-ubuntu",
    weight: ["300", "400", "500", "700"],
    style: ["normal", "italic"],
});

// Police spéciale pour les paragraphes
const nunito = Nunito({
    subsets: ["latin"],
    variable: "--font-nunito",
    weight: ["300", "400", "600"],
});

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`dark scheme-only-dark ${ubuntu.variable} ${nunito.variable}`}
            suppressHydrationWarning
        >
        <body className="font-sans antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange={false}
        >
            {children}
            <Toaster
                position="top-right"
                expand={true}
                richColors={true}
                closeButton={true}
                toastOptions={{
                    duration: 5000,
                    className: "toast-custom",
                }}
            />
        </ThemeProvider>
        </body>
        </html>
    );
}
