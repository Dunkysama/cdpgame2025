"use client";

import Link from "next/link";

/**
 * Composant Button réutilisable avec les styles de l'application
 * @param {string} variant - Variant du bouton: "primary" (défaut) ou "secondary"
 * @param {string} size - Taille du bouton: "sm" (petit) ou "md" (défaut, moyen)
 * @param {string} href - URL si le bouton doit être un lien (optionnel)
 * @param {function} onClick - Fonction à appeler au clic (optionnel)
 * @param {boolean} disabled - Si le bouton est désactivé (optionnel)
 * @param {string} type - Type du bouton: "button", "submit", "reset" (défaut: "button")
 * @param {React.ReactNode} children - Contenu du bouton
 * @param {string} className - Classes CSS supplémentaires (optionnel)
 */
export default function Button({
  variant = "primary",
  size = "md",
  href,
  onClick,
  disabled = false,
  type = "button",
  children,
  className = "",
  ...props
}) {
  const baseClasses = "rounded-lg font-pixel font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
    secondary: "bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300",
  };

  const sizeClasses = {
    sm: "px-4 py-3 text-xs",
    md: "px-6 py-4 text-sm",
  };

  const disabledClasses = disabled ? "cursor-not-allowed opacity-50" : "";

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`.trim();

  // Si href est fourni, rendre un Link Next.js
  if (href) {
    return (
      <Link
        href={href}
        className={`${combinedClasses} text-center inline-block`}
        {...props}
      >
        {children}
      </Link>
    );
  }

  // Sinon, rendre un bouton HTML
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  );
}

