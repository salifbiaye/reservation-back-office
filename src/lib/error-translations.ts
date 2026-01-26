/**
 * Traduction des messages d'erreur Better Auth en français
 */
export function translateAuthError(errorMessage: string | undefined): string {
  if (!errorMessage) return "Une erreur est survenue"

  const translations: Record<string, string> = {
    // Erreurs de connexion
    "Invalid email or password": "Email ou mot de passe incorrect",
    "Invalid credentials": "Identifiants incorrects",
    "User not found": "Utilisateur introuvable",
    "Invalid password": "Mot de passe incorrect",

    // Erreurs d'email
    "Email already exists": "Cet email est déjà utilisé",
    "Invalid email": "Email invalide",
    "Email not verified": "Email non vérifié",

    // Erreurs de mot de passe
    "Password too short": "Mot de passe trop court (minimum 8 caractères)",
    "Password too long": "Mot de passe trop long",
    "Passwords do not match": "Les mots de passe ne correspondent pas",

    // Erreurs OTP
    "Invalid OTP": "Code de vérification invalide",
    "OTP expired": "Code de vérification expiré",
    "Too many attempts": "Trop de tentatives",

    // Erreurs OAuth
    "OAuth error": "Erreur d'authentification OAuth",
    "Account linking failed": "Échec de la liaison du compte",

    // Erreurs génériques
    "Unauthorized": "Non autorisé",
    "Session expired": "Session expirée",
    "Something went wrong": "Une erreur est survenue"
  }

  // Recherche exacte
  if (translations[errorMessage]) {
    return translations[errorMessage]
  }

  // Recherche partielle (pour les messages contenant des clés)
  for (const [key, value] of Object.entries(translations)) {
    if (errorMessage.includes(key)) {
      return value
    }
  }

  // Si aucune traduction trouvée, retourner un message générique
  return "Une erreur est survenue"
}
