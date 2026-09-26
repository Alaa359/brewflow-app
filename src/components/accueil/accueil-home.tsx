/* eslint-disable @next/next/no-img-element -- sceaux SVG locaux dimensionnés par le design */

import Link from 'next/link';
import { PillarTilt } from '@/components/accueil/pillar-tilt';
import { SmoothScrollLink } from '@/components/ui/smooth-scroll-link';

export function AccueilHome() {
  return (
    <div className="flex w-full flex-col">
      {/* Immersive Cinematic Hero */}
      <section className="relative flex min-h-[85vh] w-full flex-col justify-between overflow-hidden rounded-3xl pt-24 pb-28 shadow-xl">
        {/* Ambient Photographic Canvas with Scrim */}
        <div
          className="absolute inset-0 z-0 scale-105 bg-cover bg-center transition-transform duration-1000"
          style={{ backgroundImage: 'url("/accueil-atelier.jpg")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f1610] via-[#241912]/80 to-[#19100a]/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#1a120c]/40 to-[#120a06]/90" />
        {/* Glowing Amber Accent Auras */}
        <div className="bg-primary-container/20 pointer-events-none absolute top-1/4 left-1/2 h-[320px] w-[620px] -translate-x-1/2 rounded-full blur-[140px]" />
        <div className="bg-tertiary-container/15 pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full blur-[120px]" />

        {/* Hero Top Bar / Heritage Stamp */}
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4">
          <div className="bg-surface-container-lowest/10 text-surface inline-flex items-center gap-2 rounded-full px-4 py-1.5 shadow-sm backdrop-blur-md">
            <span className="bg-tertiary-fixed h-2 w-2 rounded-full shadow-[0_0_12px_rgba(178,241,193,0.8)]" />
            <span className="font-label-caps text-label-caps font-bold tracking-widest text-[#ffdcc2] uppercase">
              Sanctuaire &amp; Gouvernance
            </span>
            <span className="text-white/40">•</span>
            <span className="font-body-sm text-body-sm text-[#f6ded4]">
              Maison Fondée sur la Précision &amp; le Terroir
            </span>
          </div>
          <div className="bg-surface-container-lowest/5 flex items-center gap-2 rounded-full px-4 py-1 backdrop-blur-md">
            <img
              alt="Sceau BrewFlow"
              className="h-7 w-7 object-contain opacity-95 drop-shadow-[0_2px_8px_rgba(200,130,66,0.5)]"
              src="/logo-brewflow.svg"
            />
            <span className="font-label-caps text-label-caps font-bold tracking-widest text-[#ffdcc2]">
              SÉLECTION MAÎTRE-TORRÉFACTEUR
            </span>
          </div>
        </div>

        {/* Central Hero Headline & Poetic Manifesto */}
        <div className="relative z-10 mx-auto my-auto w-full max-w-5xl px-4 pt-9 text-center">
          <div className="mb-2 inline-block">
            <span className="font-label-caps text-label-caps bg-primary-container/30 rounded-full px-4 py-1 font-bold tracking-[0.3em] text-[#ffdcc2] uppercase backdrop-blur-sm">
              Direction Générale • La Marsa
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl leading-tight font-bold tracking-tight text-balance text-[#fff8f1] drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            L&apos;Art de Gouverner l&apos;Excellence
          </h1>
          <p className="font-body mx-auto mt-4 max-w-3xl text-base leading-relaxed font-light text-balance text-[#f3dbd1] drop-shadow-md">
            Là où la patience des sols volcaniques rencontre la rigueur du geste
            artisanal. Bienvenue au cœur de la maison BrewFlow, où chaque
            extraction est pensée comme un hommage intemporel au savoir-faire de
            nos équipes et à la mémoire vivante de chaque terroir.
          </p>
          {/* CTA Control Center with Golden Aura */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group from-primary-container to-primary font-headline-sm text-headline-sm text-on-primary relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r via-[#d88f4e] px-9 py-4 font-semibold shadow-[0_8px_32px_rgba(200,130,66,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_44px_rgba(200,130,66,0.65)]"
            >
              <span className="material-symbols-outlined text-base transition-transform duration-300 group-hover:rotate-45">
                explore
              </span>
              <span>Ouvrir la Tour de Contrôle</span>
              <span className="material-symbols-outlined text-base transition-transform duration-300 group-hover:translate-x-1">
                arrow_forward
              </span>
              <span className="to-primary pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-[#ffdcc2] opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-40" />
            </Link>
            <SmoothScrollLink
              href="#piliers"
              className="bg-surface-container-lowest/10 font-label-md text-label-md hover:bg-surface-container-lowest/20 inline-flex items-center gap-2 rounded-xl px-6 py-4 font-medium text-[#fff8f1] backdrop-blur-md transition-all duration-300"
            >
              <span className="material-symbols-outlined text-sm text-[#ffdcc2]">
                menu_book
              </span>
              <span>Explorer le Manifeste</span>
            </SmoothScrollLink>
          </div>
        </div>

        {/* Hero Sub-Bar: Sensory Anchors */}
        <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-4 pt-6 md:grid-cols-3">
          <div className="bg-surface-container-lowest/10 text-surface flex items-center gap-2 rounded-xl px-4 py-2 backdrop-blur-md">
            <span className="material-symbols-outlined text-primary-fixed text-headline-sm">
              water_drop
            </span>
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps font-bold text-[#ffdcc2]">
                PURETÉ HYDROLOGIQUE
              </span>
              <span className="font-body-sm text-body-sm text-[#f6ded4]">
                Minéralisation sur mesure pour profilage aromatique
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest/10 text-surface flex items-center gap-2 rounded-xl px-4 py-2 backdrop-blur-md">
            <span className="material-symbols-outlined text-primary-fixed text-headline-sm">
              heat
            </span>
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps font-bold text-[#ffdcc2]">
                TORRÉFACTION CONSCIENCIEUSE
              </span>
              <span className="font-body-sm text-body-sm text-[#f6ded4]">
                Développement lent au feu doux et respect du grain
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest/10 text-surface flex items-center gap-2 rounded-xl px-4 py-2 backdrop-blur-md">
            <span className="material-symbols-outlined text-primary-fixed text-headline-sm">
              volunteer_activism
            </span>
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps font-bold text-[#ffdcc2]">
                COMMUNAUTÉ DU COEUR
              </span>
              <span className="font-body-sm text-body-sm text-[#f6ded4]">
                Alliances éthiques avec les coopératives d&apos;altitude
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Spatial Perspective Section: Les Piliers Fondateurs */}
      <section className="mx-auto w-full scroll-mt-20 px-4 py-9" id="piliers">
        <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="font-label-caps text-label-caps text-primary mb-1 inline-flex items-center gap-1 font-bold tracking-widest uppercase">
              <span className="bg-primary h-1.5 w-1.5 rounded-full" />
              Fondations &amp; Philosophie de Marque
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">
              Les Quatre Piliers du Temple BrewFlow
            </h2>
          </div>
          <p className="font-body text-on-surface-variant max-w-md text-sm">
            Chaque maison BrewFlow est guidée par une quadruple exigence
            d&apos;artisanat, d&apos;élégance hospitalière et de responsabilité
            humaine.
          </p>
        </div>
        {/* Spatial 3D Card Grid with dynamic depth & tilt */}
        <PillarTilt>
          <div
            className="grid grid-cols-1 gap-6 [perspective:1200px] md:grid-cols-2 lg:grid-cols-4"
            id="pillar-grid"
          >
            {/* Pillar 1 */}
            <div className="group bg-surface-container relative flex h-full flex-col justify-between rounded-2xl p-6 shadow-sm transition-all duration-500 ease-out [transform-style:preserve-3d] hover:[transform:rotateX(4deg)_rotateY(-4deg)_translateZ(18px)] hover:shadow-xl">
              <div>
                <div className="bg-surface-container-lowest text-primary group-hover:bg-primary group-hover:text-on-primary mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-colors duration-300">
                  <span className="material-symbols-outlined text-headline-sm">
                    visibility
                  </span>
                </div>
                <span className="font-label-caps text-label-caps text-primary font-bold tracking-widest uppercase">
                  Pilier Originel
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1 mb-2 font-semibold">
                  Vision &amp; Authenticité
                </h3>
                <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                  Veiller avec humilité sur la provenance de chaque récolte.
                  Nous honorons le caféier comme un arbre noble et les mains qui
                  le cueillent comme des maîtres d&apos;art.
                </p>
              </div>
              <div className="font-label-md text-label-md text-primary mt-4 flex items-center gap-1 pt-4 font-medium">
                <span>Éthique du Sourcing</span>
                <span className="material-symbols-outlined text-body-sm transition-transform duration-300 group-hover:translate-x-1">
                  north_east
                </span>
              </div>
            </div>
            {/* Pillar 2 */}
            <div className="group bg-surface-container-high relative flex h-full flex-col justify-between rounded-2xl p-6 shadow-sm transition-all duration-500 ease-out [transform-style:preserve-3d] hover:[transform:rotateX(4deg)_rotateY(-2deg)_translateZ(18px)] hover:shadow-xl">
              <div>
                <div className="bg-surface-container-lowest text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-colors duration-300">
                  <span className="material-symbols-outlined text-headline-sm">
                    groups
                  </span>
                </div>
                <span className="font-label-caps text-label-caps text-tertiary font-bold tracking-widest uppercase">
                  L&apos;Esprit Collectif
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1 mb-2 font-semibold">
                  Harmonie des Équipes
                </h3>
                <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                  La chorégraphie fluide et sereine unissant baristas,
                  torréfacteurs et cuisiniers. La perfection naît de
                  l&apos;entente tacite et du respect mutuel derrière le
                  comptoir.
                </p>
              </div>
              <div className="font-label-md text-label-md text-tertiary mt-4 flex items-center gap-1 pt-4 font-medium">
                <span>L&apos;Élégance du Geste</span>
                <span className="material-symbols-outlined text-body-sm transition-transform duration-300 group-hover:translate-x-1">
                  north_east
                </span>
              </div>
            </div>
            {/* Pillar 3 */}
            <div className="group bg-surface-container relative flex h-full flex-col justify-between rounded-2xl p-6 shadow-sm transition-all duration-500 ease-out [transform-style:preserve-3d] hover:[transform:rotateX(4deg)_rotateY(2deg)_translateZ(18px)] hover:shadow-xl">
              <div>
                <div className="bg-surface-container-lowest text-caramel-dark group-hover:bg-caramel-dark group-hover:text-surface mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-colors duration-300">
                  <span className="material-symbols-outlined text-headline-sm">
                    magic_button
                  </span>
                </div>
                <span className="font-label-caps text-label-caps text-primary font-bold tracking-widest uppercase">
                  Identité Sensorielle
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1 mb-2 font-semibold">
                  La Signature BrewFlow
                </h3>
                <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                  De la température des tasses en céramique tournée à la nuance
                  boisée des salons, chaque détail tisse une empreinte mémorable
                  et chaleureuse chez nos hôtes.
                </p>
              </div>
              <div className="font-label-md text-label-md text-primary mt-4 flex items-center gap-1 pt-4 font-medium">
                <span>Artisanat Sans Concession</span>
                <span className="material-symbols-outlined text-body-sm transition-transform duration-300 group-hover:translate-x-1">
                  north_east
                </span>
              </div>
            </div>
            {/* Pillar 4 */}
            <div className="group bg-surface-container-low relative flex h-full flex-col justify-between rounded-2xl p-6 shadow-sm transition-all duration-500 ease-out [transform-style:preserve-3d] hover:[transform:rotateX(4deg)_rotateY(4deg)_translateZ(18px)] hover:shadow-xl">
              <div>
                <div className="bg-surface-container-lowest text-on-surface-variant group-hover:bg-on-surface-variant group-hover:text-surface mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-colors duration-300">
                  <span className="material-symbols-outlined text-headline-sm">
                    hub
                  </span>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant font-bold tracking-widest uppercase">
                  Écosystème Vivant
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1 mb-2 font-semibold">
                  Réseau &amp; Rayonnement
                </h3>
                <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                  Les passerelles vivantes entre notre torréfaction de La Marsa,
                  nos maisons annexes et les collines de Sidi Bou Saïd, formant
                  une constellation de culture du goût.
                </p>
              </div>
              <div className="font-label-md text-label-md text-on-surface-variant mt-4 flex items-center gap-1 pt-4 font-medium">
                <span>Constellation des Maisons</span>
                <span className="material-symbols-outlined text-body-sm transition-transform duration-300 group-hover:translate-x-1">
                  north_east
                </span>
              </div>
            </div>
          </div>
        </PillarTilt>
      </section>

      {/* Interactive Atmosphere Showcase: Spatial Flip / Depth Cards */}
      <section className="mx-auto w-full px-4 py-9">
        <div className="bg-surface-container-low mb-6 rounded-3xl p-6 shadow-sm md:p-9">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <span className="font-label-caps text-label-caps text-primary font-bold tracking-widest uppercase">
                Atmosphères des Lieux
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface mt-1 font-semibold">
                Espaces de Vie &amp; Sanctuaires de Dégustation
              </h2>
            </div>
            <div className="bg-surface-container font-label-caps text-label-caps text-on-surface-variant inline-flex items-center gap-1 rounded-full px-4 py-1.5 font-bold">
              <span className="material-symbols-outlined text-tertiary text-sm">
                spa
              </span>
              <span>Ambiance Acoustique &amp; Visuelle Préservée</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Space 1: Atelier Cupping & Torréfaction */}
            <div className="group relative h-96 overflow-hidden rounded-2xl shadow-md [perspective:1000px]">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: 'url("/accueil-atelier.jpg")' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b120c] via-[#231710]/60 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-between p-6 text-[#fff8f1]">
                <div className="flex items-start justify-between">
                  <span className="bg-surface-container-lowest/20 font-label-caps text-label-caps rounded-full px-2 py-1 font-bold tracking-wider text-[#ffdcc2] backdrop-blur-md">
                    L&apos;ATELIER MAÎTRE
                  </span>
                  <span className="material-symbols-outlined text-primary-fixed text-headline-sm">
                    thermostat
                  </span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm mb-1 font-semibold text-[#fff8f1]">
                    Le Laboratoire de Torréfaction
                  </h4>
                  <p className="font-body-sm text-body-sm line-clamp-3 leading-relaxed text-[#f6ded4]">
                    Un havre de bois de noyer et de cuivres brossés où le temps
                    s&apos;arrête. C&apos;est ici que sont révélés les arômes
                    les plus subtils de jasmin, de figue sèche et de cacao
                    sauvage.
                  </p>
                </div>
              </div>
            </div>
            {/* Space 2: Le Grand Comptoir d'Extraction */}
            <div className="group relative flex h-96 flex-col justify-between overflow-hidden rounded-2xl bg-[#2b1e18] p-6 text-[#fff8f1] shadow-md">
              <div className="bg-primary-container/20 pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full blur-[80px]" />
              <div className="relative z-10 flex items-start justify-between">
                <span className="bg-surface-container-lowest/10 font-label-caps text-label-caps rounded-full px-2 py-1 font-bold tracking-wider text-[#ffdcc2] backdrop-blur-md">
                  L&apos;AVANT-SCÈNE
                </span>
                <span className="material-symbols-outlined text-headline-sm text-[#ffdcc2]">
                  coffee_maker
                </span>
              </div>
              <div className="relative z-10 my-auto py-2 text-center">
                <div className="text-primary-fixed mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#3c2a21] shadow-inner">
                  <span className="material-symbols-outlined text-headline-md">
                    local_cafe
                  </span>
                </div>
                <h4 className="font-headline-sm text-headline-sm font-semibold text-[#fff8f1]">
                  Le Bar d&apos;Origines
                </h4>
                <p className="font-body-sm text-body-sm mx-auto mt-1 max-w-xs text-[#f3dbd1]">
                  L&apos;alchimie immédiate entre nos baristas et nos convives.
                  Extractions manuelles V60, Chemex et expressos soyeux sous une
                  lumière dorée.
                </p>
              </div>
              <div className="font-label-caps text-label-caps relative z-10 flex items-center justify-between pt-2 font-bold text-[#ffdcc2]">
                <span>RYTHME APAISÉ</span>
                <span className="material-symbols-outlined text-sm">
                  graphic_eq
                </span>
              </div>
            </div>
            {/* Space 3: Les Salons du Patio & Verrière */}
            <div className="group bg-surface-container-high relative flex h-96 flex-col justify-between overflow-hidden rounded-2xl p-6 shadow-md">
              <div className="flex items-start justify-between">
                <span className="bg-surface-container-lowest font-label-caps text-label-caps text-on-surface-variant rounded-full px-2 py-1 font-bold tracking-wider">
                  SÉRÉNITÉ HOSPITALIÈRE
                </span>
                <span className="material-symbols-outlined text-headline-sm text-on-surface-variant">
                  deck
                </span>
              </div>
              <div className="my-auto">
                <div className="bg-surface-container-lowest text-primary mb-2 inline-block rounded-xl p-2 shadow-sm">
                  <span className="material-symbols-outlined text-headline-md">
                    yard
                  </span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Le Jardin Intérieur &amp; Verrière
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                  Conçu pour prolonger la dégustation au son doux de la fontaine
                  et sous l&apos;ombre d&apos;orangers séculaires. Le calme
                  absolu au cœur de la ville vibrante.
                </p>
              </div>
              <div className="font-label-caps text-label-caps text-primary flex items-center gap-1 font-bold">
                <span>EXPÉRIENCE IMMERSIVE DE SÉJOUR</span>
                <span className="material-symbols-outlined text-body-sm">
                  sentiment_satisfied
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Direction Manifesto & Luxury Brand Vignette */}
      <section className="mx-auto w-full max-w-5xl px-4 py-9">
        <div className="bg-surface-container relative overflow-hidden rounded-3xl p-6 text-center shadow-sm md:p-9">
          {/* Watermark Badge Emblème */}
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 opacity-15">
            <img
              alt=""
              className="h-full w-full object-contain blur-[0.5px] filter"
              src="/logo-brewflow.svg"
            />
          </div>
          <div className="relative z-10 mx-auto max-w-2xl">
            <div className="bg-surface-container-lowest mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl p-2 shadow-md">
              <img
                alt="Sceau Officiel BrewFlow"
                className="h-full w-full object-contain"
                src="/logo-brewflow.svg"
              />
            </div>
            <span className="font-label-caps text-label-caps text-primary font-bold tracking-[0.25em] uppercase">
              Manifeste de la Direction
            </span>
            <blockquote className="font-headline-md text-headline-md text-on-surface mt-4 leading-relaxed font-normal italic">
              &ldquo;Gouverner BrewFlow, ce n&apos;est pas administrer des
              volumes, c&apos;est préserver une flamme. C&apos;est faire en
              sorte que chaque invité, dès le seuil franchi, ressente la
              bienveillance d&apos;un accueil sincère et la noblesse d&apos;un
              produit façonné sans compromis.&rdquo;
            </blockquote>
            <div className="mt-6 flex flex-col items-center">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Conseil des Maîtres &amp; Présidence
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Maison Mère de La Marsa • Tunisie
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Fast-Access Navigation Deck (Purely Qualitative) */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-9">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Quick Portal 1 */}
          <Link
            href="/caisse/pos"
            className="group bg-surface-container hover:bg-surface-container-high flex items-center gap-4 rounded-xl p-4 shadow-sm transition-all hover:-translate-y-1"
          >
            <div className="bg-surface-container-lowest text-primary group-hover:bg-primary group-hover:text-on-primary flex h-10 w-10 items-center justify-center rounded-lg shadow-xs transition-colors">
              <span className="material-symbols-outlined text-base">
                point_of_sale
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Caisse &amp; Accueil
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                L&apos;énergie du comptoir
              </span>
            </div>
          </Link>
          {/* Quick Portal 2 */}
          <Link
            href="/cuisine/kds"
            className="group bg-surface-container hover:bg-surface-container-high flex items-center gap-4 rounded-xl p-4 shadow-sm transition-all hover:-translate-y-1"
          >
            <div className="bg-surface-container-lowest text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary flex h-10 w-10 items-center justify-center rounded-lg shadow-xs transition-colors">
              <span className="material-symbols-outlined text-base">
                restaurant
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Cuisine &amp; KDS
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                La précision culinaire
              </span>
            </div>
          </Link>
          {/* Quick Portal 3 */}
          <Link
            href="/plats"
            className="group bg-surface-container hover:bg-surface-container-high flex items-center gap-4 rounded-xl p-4 shadow-sm transition-all hover:-translate-y-1"
          >
            <div className="bg-surface-container-lowest text-caramel-dark group-hover:bg-caramel-dark group-hover:text-surface flex h-10 w-10 items-center justify-center rounded-lg shadow-xs transition-colors">
              <span className="material-symbols-outlined text-base">
                menu_book
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Carte &amp; Recettes
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Créations saisonnières
              </span>
            </div>
          </Link>
          {/* Quick Portal 4 */}
          <Link
            href="/etablissements"
            className="group bg-surface-container hover:bg-surface-container-high flex items-center gap-4 rounded-xl p-4 shadow-sm transition-all hover:-translate-y-1"
          >
            <div className="bg-surface-container-lowest text-on-surface-variant group-hover:bg-on-surface-variant group-hover:text-surface flex h-10 w-10 items-center justify-center rounded-lg shadow-xs transition-colors">
              <span className="material-symbols-outlined text-base">hub</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Établissements &amp; Sites
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Notre présence territoriale
              </span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
