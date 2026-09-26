/* eslint-disable @next/next/no-img-element -- photo d'ambiance du design */

import Link from 'next/link';

export function SalleHome() {
  return (
    <div className="flex w-full flex-col pb-9">
      {/* En-tête immersive pleine largeur avec débordement élégant */}
      <section className="bg-surface-container-high relative -mx-4 mb-9 overflow-hidden rounded-b-[2.5rem] shadow-xl">
        <div className="relative flex h-[540px] w-full items-end md:h-[600px]">
          {/* Image d'ambiance cinématique */}
          <img
            alt="Élégante terrasse de café à l'heure dorée, pergolas végétales et art de la table raffiné"
            className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.92] contrast-[1.05] filter"
            src="/salle-terrasse.jpg"
          />
          {/* Gradient Scrim artisanal & atmosphérique */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f1b13] via-[#1f1b13]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1f1b13]/70 via-transparent to-[#1f1b13]/30" />
          {/* Contenu textuel et émotionnel */}
          <div className="relative z-10 w-full max-w-5xl px-4 pt-24 pb-9 md:px-9">
            <div className="bg-surface/20 text-surface mb-4 inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 shadow-sm backdrop-blur-md">
              <span
                className="material-symbols-outlined text-primary-fixed text-sm"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                spa
              </span>
              <span className="font-label-caps text-label-caps text-[#fff8f1] tracking-widest uppercase">
                Rituel &amp; Bienveillance • Équipe de Salle
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-[#fff8f1] mb-2 font-bold tracking-tight">
              L&apos;Âme de l&apos;Hospitalité
            </h1>
            <p className="font-headline-sm text-headline-sm text-surface-container-low/95 mb-6 max-w-2xl font-light leading-relaxed italic">
              «&nbsp;Chaque table est une rencontre, chaque service une
              invitation au voyage.&nbsp;»
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/caisse/pos"
                className="group bg-primary hover:bg-caramel-dark text-on-primary font-headline-sm text-headline-sm relative inline-flex items-center gap-2 rounded-xl px-6 py-3.5 shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="bg-primary-fixed-dim/30 animate-ping absolute inset-0 rounded-xl opacity-25" />
                <span
                  className="material-symbols-outlined text-headline-sm group-hover:rotate-12 transition-transform duration-300"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  local_cafe
                </span>
                <span>Commencer le Service en Salle</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
              <div className="bg-white/15 text-[#fff8f1] flex items-center gap-2 rounded-xl px-4 py-3 backdrop-blur-md">
                <span className="material-symbols-outlined text-tertiary-fixed text-headline-sm">
                  wb_sunny
                </span>
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-[#eae1d3] uppercase tracking-wider">
                    Atmosphère du Matin
                  </span>
                  <span className="font-body text-surface-container-high/90 text-sm font-medium">
                    Brise douce &amp; Lumière dorée sur la terrasse
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pensée du Jour & Manifeste Humain */}
      <section className="mx-auto mb-9 w-full max-w-6xl px-2">
        <div className="bg-surface-container relative overflow-hidden rounded-2xl p-6 shadow-md md:p-9">
          <div className="bg-primary-container/10 pointer-events-none absolute -top-12 -right-12 h-64 w-64 rounded-full blur-3xl" />
          <div className="bg-tertiary/10 pointer-events-none absolute -bottom-12 -left-12 h-64 w-64 rounded-full blur-3xl" />
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl space-y-1">
              <div className="text-primary font-label-caps text-label-caps flex items-center gap-1 uppercase tracking-wider">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  loyalty
                </span>
                <span>Esprit d&apos;Équipe &amp; Connexion</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Votre présence est la véritable signature de la maison
              </h2>
              <p className="font-body text-on-surface-variant text-base leading-relaxed">
                Plus qu&apos;une commande apportée, vous offrez une parenthèse
                de sérénité. Un geste attentif, un mot réconfortant et une
                attention délicate transforment chaque instant en un souvenir
                impérissable pour nos hôtes.
              </p>
            </div>
            <div className="bg-surface-container-lowest flex min-w-[260px] flex-col justify-center gap-1 self-stretch rounded-xl p-4 shadow-sm md:self-auto">
              <div className="text-tertiary flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-headline-sm"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  groups
                </span>
                <span className="font-headline-sm text-headline-sm font-semibold">
                  Solidarité Complice
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Un coup d&apos;œil suffit : salle, comptoir et cuisine avancent
                en parfaite harmonie. Respirez, souriez, nous sommes ensemble.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Défilement 3D Flottant & Piliers du Service */}
      <section
        className="mx-auto mb-9 w-full max-w-6xl px-2"
        style={{ perspective: '1200px' }}
      >
        <div className="mx-auto mb-6 max-w-xl text-center">
          <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
            Sensibilité &amp; Élégance
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1 font-semibold">
            Les Trois Gestes Fondateurs
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Carte 1 : L'Art d'Accueillir */}
          <div className="group bg-surface-container-lowest relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 shadow-md transition-all duration-500 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl">
            <div className="bg-primary-fixed/30 absolute top-0 right-0 z-0 h-32 w-32 rounded-bl-[4rem] transition-transform duration-500 group-hover:scale-125" />
            <div className="relative z-10">
              <div className="bg-primary-fixed text-on-primary-fixed mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm">
                <span
                  className="material-symbols-outlined text-headline-sm"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  sentiment_satisfied
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">
                L&apos;Art d&apos;Accueillir
              </h3>
              <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                Le regard sincère, la bienveillance spontanée et ce sentiment
                unique offert à chaque convive dès qu&apos;il franchit le seuil.
                Reconnaître les habitués, embrasser les nouveaux visages.
              </p>
            </div>
            <div className="text-primary font-label-caps text-label-caps relative z-10 mt-4 flex items-center gap-1 border-t-0 pt-4 uppercase">
              <span className="material-symbols-outlined text-sm">favorite</span>
              <span>Hospitalité Radieuse</span>
            </div>
          </div>
          {/* Carte 2 : Le Lien Vivant */}
          <div className="group bg-surface-container-lowest relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 shadow-md transition-all duration-500 hover:-translate-y-2 hover:-rotate-1 hover:shadow-2xl">
            <div className="bg-tertiary-fixed/30 absolute top-0 right-0 z-0 h-32 w-32 rounded-bl-[4rem] transition-transform duration-500 group-hover:scale-125" />
            <div className="relative z-10">
              <div className="bg-tertiary-fixed text-on-tertiary-fixed mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm">
                <span
                  className="material-symbols-outlined text-headline-sm"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  hub
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">
                Le Lien Vivant
              </h3>
              <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                Être le pont harmonieux entre la passion du barista, la
                précision de la pâtisserie et l&apos;émotion du client. Raconter
                l&apos;histoire de chaque tasse avec fierté et délicatesse.
              </p>
            </div>
            <div className="text-tertiary font-label-caps text-label-caps relative z-10 mt-4 flex items-center gap-1 border-t-0 pt-4 uppercase">
              <span className="material-symbols-outlined text-sm">
                auto_awesome
              </span>
              <span>Transmission Passionnée</span>
            </div>
          </div>
          {/* Carte 3 : La Symphonie de la Terrasse */}
          <div className="group bg-surface-container-lowest relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 shadow-md transition-all duration-500 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl">
            <div className="bg-secondary-fixed/40 absolute top-0 right-0 z-0 h-32 w-32 rounded-bl-[4rem] transition-transform duration-500 group-hover:scale-125" />
            <div className="relative z-10">
              <div className="bg-secondary-fixed text-[#251913] mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm">
                <span
                  className="material-symbols-outlined text-headline-sm"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  air
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">
                La Symphonie de la Terrasse
              </h3>
              <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                Épouser le rythme de la lumière méditerranéenne, la fraîcheur
                des pergolas et le doux murmure des discussions. Une fluidité
                calme qui apaise et régénère.
              </p>
            </div>
            <div className="text-on-surface-variant font-label-caps text-label-caps relative z-10 mt-4 flex items-center gap-1 border-t-0 pt-4 uppercase">
              <span className="material-symbols-outlined text-sm">
                nature_people
              </span>
              <span>Rythme &amp; Équilibre</span>
            </div>
          </div>
        </div>
      </section>

      {/* Guide Sensoriel des Créations du Moment */}
      <section className="mx-auto mb-9 w-full max-w-6xl px-2">
        <div className="mb-4 flex flex-col justify-between gap-1 md:flex-row md:items-end">
          <div>
            <div className="text-primary font-label-caps text-label-caps flex items-center gap-1 uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">palette</span>
              <span>Inspirations à Raconter aux Tables</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">
              La Poésie Sensorielle du Moment
            </h2>
          </div>
          <p className="font-body text-on-surface-variant max-w-md text-sm">
            Les mots justes pour éveiller la curiosité des convives et sublimer
            leur dégustation.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Création 1 : Café de Spécialité */}
          <div className="bg-surface-container-low flex flex-col justify-between rounded-2xl p-4 shadow-sm transition-shadow hover:shadow-md">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps rounded-full px-1 py-1 uppercase">
                  Origine Rare
                </span>
                <span className="material-symbols-outlined text-primary text-base">
                  coffee
                </span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">
                Geisha Sauvage d&apos;Éthiopie
              </h4>
              <span className="font-label-caps text-label-caps text-caramel-dark mb-1 block">
                Extraction douce V60 &amp; Chemex
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Notes envoûtantes de jasmin blanc, bergamote fraîche et nectar
                de pêche mûre. Une tasse soyeuse, lumineuse et aérienne qui se
                déguste comme un grand cru.
              </p>
            </div>
            <div className="bg-surface-container mt-4 rounded-lg p-2.5 pt-1">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-1 block uppercase">
                Conseil de Présentation
              </span>
              <p className="font-body-sm text-body-sm text-on-surface italic">
                «&nbsp;Invitez les convives à humer les arômes avant la
                première gorgée.&nbsp;»
              </p>
            </div>
          </div>
          {/* Création 2 : Fraîcheur Signature */}
          <div className="bg-surface-container-low flex flex-col justify-between rounded-2xl p-4 shadow-sm transition-shadow hover:shadow-md">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-caps text-label-caps rounded-full px-1 py-1 uppercase">
                  Signature Fraîcheur
                </span>
                <span className="material-symbols-outlined text-tertiary text-base">
                  local_bar
                </span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">
                Cold Brew Tonic aux Agrumes
              </h4>
              <span className="font-label-caps text-label-caps text-tertiary mb-1 block">
                Macération lente &amp; Écorces confites
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Infusion à froid pendant vingt-quatre heures, pétillement
                tonique délicat, pointe de romarin froissé et zeste de
                pamplemousse rose de notre verger.
              </p>
            </div>
            <div className="bg-surface-container mt-4 rounded-lg p-2.5 pt-1">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-1 block uppercase">
                Conseil de Présentation
              </span>
              <p className="font-body-sm text-body-sm text-on-surface italic">
                «&nbsp;Parfait pour accompagner l&apos;ensoleillement de midi
                sur la pergola.&nbsp;»
              </p>
            </div>
          </div>
          {/* Création 3 : Pâtisserie Fine */}
          <div className="bg-surface-container-low flex flex-col justify-between rounded-2xl p-4 shadow-sm transition-shadow hover:shadow-md">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="bg-secondary-fixed text-[#251913] font-label-caps text-label-caps rounded-full px-1 py-1 uppercase">
                  Fournil Artisanal
                </span>
                <span className="material-symbols-outlined text-on-surface-variant text-base">
                  bakery_dining
                </span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">
                Croissant Feuilleté à la Pistache
              </h4>
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-1 block">
                Pur beurre fermier &amp; Praliné maison
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Feuilletage croustillant doré à souhait, cœur fondant de
                pistaches de Sicile torréfiées et légère fleur d&apos;oranger
                pour une gourmandise absolue.
              </p>
            </div>
            <div className="bg-surface-container mt-4 rounded-lg p-2.5 pt-1">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-1 block uppercase">
                Conseil de Présentation
              </span>
              <p className="font-body-sm text-body-sm text-on-surface italic">
                «&nbsp;À recommander tiède avec un cappuccino mousse
                veloutée.&nbsp;»
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bannière d'Énergie Matinale et Rituel de Prise de Poste */}
      <section className="mx-auto w-full max-w-6xl px-2">
        <div className="from-primary via-[#8b5013] to-[#5b3209] text-on-primary relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl bg-gradient-to-r p-6 shadow-xl md:flex-row md:p-9">
          <div className="z-10 max-w-xl space-y-1 text-center md:text-left">
            <span className="font-label-caps text-label-caps text-primary-fixed uppercase tracking-wider">
              Un Service Rayonnant
            </span>
            <h3 className="font-headline-lg text-headline-lg font-bold">
              Prenez une grande inspiration. La maison est prête à vivre.
            </h3>
            <p className="font-body text-surface-container-high/90 text-sm">
              Chaque sourire partagé est contagieux. Merci pour votre
              enthousiasme, votre écoute et votre dévouement exceptionnel pour
              ce service.
            </p>
          </div>
          <div className="z-10 flex items-center gap-2">
            <Link
              href="/caisse/pos"
              className="bg-white text-on-surface font-headline-sm text-headline-sm hover:bg-surface flex items-center gap-2 rounded-xl px-6 py-3 shadow-md transition-all active:scale-95"
            >
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                check_circle
              </span>
              <span>Je rejoins mon rang</span>
            </Link>
          </div>
          {/* Motifs d'arrière-plan décoratifs */}
          <div className="text-[#fff8f1] pointer-events-none absolute -right-8 -bottom-8 opacity-10">
            <span className="material-symbols-outlined text-[200px]">
              coffee_maker
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
