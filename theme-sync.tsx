
'use client';

import { useEffect, useMemo } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * Ce composant synchronise les variables CSS du thème avec les valeurs stockées en Firestore.
 * Cela permet de changer l'apparence du site instantanément sans redéploiement.
 */
export function ThemeSync() {
  const db = useFirestore();
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const { data: siteConfig } = useDoc(configRef);

  useEffect(() => {
    if (!siteConfig) return;

    const root = document.documentElement;

    // Mise à jour des couleurs dynamiques
    if (siteConfig.primaryColor) {
      root.style.setProperty('--primary', siteConfig.primaryColor);
    }
    if (siteConfig.secondaryColor) {
      root.style.setProperty('--secondary', siteConfig.secondaryColor);
    }
    if (siteConfig.accentColor) {
      root.style.setProperty('--accent', siteConfig.accentColor);
    }
    if (siteConfig.borderRadius) {
      root.style.setProperty('--radius', `${siteConfig.borderRadius}rem`);
    }

    // On peut aussi gérer le logo ici si nécessaire, mais il est géré dans la Navbar
  }, [siteConfig]);

  return null;
}
