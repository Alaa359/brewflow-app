/* eslint-disable @next/next/no-img-element -- images statiques du design */

import Link from 'next/link';
import { SmoothScrollLink } from '@/components/ui/smooth-scroll-link';

export function CuisineHome() {
  return (
    <div className="flex w-full flex-col">
      {/* Hero Section */}
      <section
        className="relative flex min-h-[580px] w-full items-center justify-center overflow-hidden rounded-3xl bg-cover bg-center px-4 pt-24 pb-20 shadow-xl lg:px-9"
        style={{ backgroundImage: 'url("/cuisine-fournil.jpg")' }}
      >
        <div className="from-inverse-surface via-inverse-surface/65 to-inverse-surface/30 absolute inset-0 bg-gradient-to-t mix-blend-multiply" />
        <div className="from-primary-container/20 via-transparent to-tertiary/20 absolute inset-0 bg-gradient-to-r" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="bg-surface-container-lowest/20 mb-4 inline-flex items-center gap-1 rounded-full px-4 py-1 shadow-sm backdrop-blur-md">
            <span
              className="material-symbols-outlined text-primary-fixed text-headline-sm"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              restaurant_menu
            </span>
            <span className="font-label-caps text-label-caps text-surface tracking-widest uppercase">
              Maison BrewFlow • Cœur Artisanal
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-[#fff8f1] mb-2 font-bold tracking-tight drop-shadow-md">
            L’Alchimie du Fournil &amp; du Goût
          </h1>
          <p className="font-headline-md text-headline-md text-primary-fixed mb-4 font-normal tracking-wide">
            Bienvenue en Cuisine, Chef
          </p>
          <p className="font-body text-surface-container-low mb-6 max-w-2xl text-base font-light italic leading-relaxed">
            « Façonner chaque matin avec passion, du levain naturel aux arômes
            subtils, pour offrir l’éveil des sens au premier regard. »
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/cuisine/kds"
              className="group bg-primary hover:bg-caramel-dark text-on-primary font-headline-sm text-headline-sm relative inline-flex items-center gap-2 rounded-xl px-6 py-2 font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-primary/50"
            >
              <span className="material-symbols-outlined text-base transition-transform duration-300 group-hover:rotate-12">
                skillet
              </span>
              <span>Rejoindre le Passe &amp; les Fourneaux</span>
              <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
            <SmoothScrollLink
              href="#philosophie"
              className="bg-surface-container-lowest/15 hover:bg-surface-container-lowest/30 font-headline-sm text-headline-sm inline-flex items-center gap-1 rounded-xl px-4 py-2 text-surface shadow-sm backdrop-blur-md transition-all duration-300"
            >
              <span className="material-symbols-outlined text-sm text-primary-fixed">
                menu_book
              </span>
              <span>Le Carnet Culinaire</span>
            </SmoothScrollLink>
          </div>
        </div>
      </section>

      {/* 3D Spatial Manifesto Section */}
      <section
        className="relative my-6 scroll-mt-20 px-4 py-9 lg:px-6 [perspective:1400px]"
        id="philosophie"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-9 flex flex-col items-center text-center">
            <span className="font-label-caps text-label-caps text-primary mb-1 tracking-widest uppercase">
              Les Trois Souffles de l&apos;Atelier
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              L&apos;Excellence du Geste Brut
            </h2>
            <div className="bg-primary mt-2 h-1 w-16 rounded-full" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Volet 1: Le Sacre du Levain */}
            <div className="group bg-surface-container relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 shadow-md transition-all duration-500 ease-out hover:shadow-2xl lg:[transform:rotateY(7deg)_translateZ(10px)] hover:[transform:rotateY(0deg)_translateZ(30px)_scale(1.02)]">
              <div className="bg-primary-container/15 pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full blur-2xl" />
              <div>
                <div className="bg-surface-container-lowest text-primary group-hover:bg-primary group-hover:text-on-primary mb-4 flex h-14 w-14 items-center justify-center rounded-xl shadow-sm transition-colors">
                  <span
                    className="material-symbols-outlined text-headline-md"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    bakery_dining
                  </span>
                </div>
                <span className="font-label-caps text-label-caps text-primary mb-1 block tracking-widest uppercase">
                  Origine &amp; Patience
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold">
                  Le Sacre du Levain
                </h3>
                <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                  Le respect absolu du temps lent de fermentation. Une farine
                  biologique sélectionnée avec ferveur, écrasée sur meule de
                  pierre, et une eau pure pour révéler une mie alvéolée,
                  parfumée et réconfortante.
                </p>
              </div>
              <div className="text-primary font-headline-sm text-headline-sm mt-6 flex items-center gap-1 pt-4">
                <span className="material-symbols-outlined text-sm">
                  hourglass_empty
                </span>
                <span className="font-medium italic">
                  Maturation douce &amp; éveil matinal
                </span>
              </div>
            </div>
            {/* Volet 2: La Fraîcheur des Récoltes */}
            <div className="group bg-surface-container-high relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 shadow-xl transition-all duration-500 ease-out hover:shadow-2xl lg:[transform:translateZ(35px)] hover:[transform:translateZ(50px)_scale(1.02)]">
              <div className="bg-tertiary/15 pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full blur-2xl" />
              <div>
                <div className="bg-surface-container-lowest text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary mb-4 flex h-14 w-14 items-center justify-center rounded-xl shadow-sm transition-colors">
                  <span
                    className="material-symbols-outlined text-headline-md"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    local_florist
                  </span>
                </div>
                <span className="font-label-caps text-label-caps text-tertiary mb-1 block tracking-widest uppercase">
                  Sourcing Pur
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold">
                  La Fraîcheur des Récoltes
                </h3>
                <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                  Pistaches croquantes de Sicile torréfiées sur place, figues
                  mûres cueillies aux aurores, beurre de tourage AOP fondant et
                  œufs de plein air. Rien n&apos;est masqué, chaque saveur
                  résonne dans sa vérité pure.
                </p>
              </div>
              <div className="text-tertiary font-headline-sm text-headline-sm mt-6 flex items-center gap-1 pt-4">
                <span className="material-symbols-outlined text-sm">spa</span>
                <span className="font-medium italic">
                  Terroirs sincères &amp; arômes bruts
                </span>
              </div>
            </div>
            {/* Volet 3: L'Art du Dressage */}
            <div className="group bg-surface-container relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 shadow-md transition-all duration-500 ease-out hover:shadow-2xl lg:[transform:rotateY(-7deg)_translateZ(10px)] hover:[transform:rotateY(0deg)_translateZ(30px)_scale(1.02)]">
              <div className="bg-primary/15 pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full blur-2xl" />
              <div>
                <div className="bg-surface-container-lowest text-primary group-hover:bg-primary group-hover:text-on-primary mb-4 flex h-14 w-14 items-center justify-center rounded-xl shadow-sm transition-colors">
                  <span
                    className="material-symbols-outlined text-headline-md"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    palette
                  </span>
                </div>
                <span className="font-label-caps text-label-caps text-primary mb-1 block tracking-widest uppercase">
                  Émotion Visuelle
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold">
                  L&apos;Art du Dressage
                </h3>
                <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                  L&apos;assiette est une toile immaculée prête à accueillir
                  l&apos;invité. Pincées d&apos;herbes folles, goutte
                  d&apos;huile d&apos;olive ambrée, dorure caramélisée au sortir
                  du four. La poésie se déguste d&apos;abord avec le regard.
                </p>
              </div>
              <div className="text-primary font-headline-sm text-headline-sm mt-6 flex items-center gap-1 pt-4">
                <span className="material-symbols-outlined text-sm">brush</span>
                <span className="font-medium italic">
                  Harmonie, couleurs &amp; équilibre
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carrousel d'Inspiration Culinaire des Textures */}
      <section className="bg-surface-container-low my-4 rounded-3xl px-4 py-6 shadow-inner lg:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col justify-between gap-2 md:flex-row md:items-end">
            <div>
              <span className="font-label-caps text-label-caps text-primary mb-1 block tracking-widest uppercase">
                Cahier d’Inspirations Sensorielles
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Matières, Croûtes &amp; Parfums
              </h2>
            </div>
            <p className="font-body text-on-surface-variant max-w-md text-sm italic">
              Chaque création est façonnée pour révéler une émotion tactile
              incomparable à la découpe.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Texture 1: Brioche Feuilletée Dorée */}
            <div className="group bg-surface-container-lowest relative flex h-full flex-col overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-64 overflow-hidden">
                <img
                  alt="Brioche tressée au levain dorée et croustillante"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="/cuisine-brioche.jpg"
                />
                <div className="from-inverse-surface/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="font-label-caps text-label-caps text-primary-fixed block tracking-wider uppercase">
                    Boulangerie Fine
                  </span>
                  <span className="font-headline-sm text-headline-sm text-surface font-bold">
                    Brioche Tressée au Levain
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between p-4">
                <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                  Croustillant de caramel au beurre noisette à
                  l&apos;extérieur, cœur filant et aéré imprégné de vanille
                  bourbon.
                </p>
                <div className="text-primary font-label-caps text-label-caps mt-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    local_fire_department
                  </span>
                  <span>Cuisson douce sur sole réfractaire</span>
                </div>
              </div>
            </div>
            {/* Texture 2: Shakshuka & Herbes Ciselées */}
            <div className="group bg-surface-container-lowest relative flex h-full flex-col overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-64 overflow-hidden">
                <img
                  alt="Shakshuka fumante en poêlon en fonte aux épices"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="/cuisine-shakshuka.jpg"
                />
                <div className="from-inverse-surface/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="font-label-caps text-label-caps text-tertiary-fixed block tracking-wider uppercase">
                    Le Chaud &amp; l&apos;Épicé
                  </span>
                  <span className="font-headline-sm text-headline-sm text-surface font-bold">
                    Shakshuka aux Épices Douces
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between p-4">
                <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                  Tomates gorgées de soleil, poivrons rôtis, jaunes crémeux et
                  une pluie d&apos;herbes aromatiques fraîchement ciselées.
                </p>
                <div className="text-tertiary font-label-caps text-label-caps mt-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    outdoor_grill
                  </span>
                  <span>Mijoté minute en poêlon traditionnel</span>
                </div>
              </div>
            </div>
            {/* Texture 3: Tarte Rustique Figues & Pistache */}
            <div className="group bg-surface-container-lowest relative flex h-full flex-col overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-64 overflow-hidden">
                <img
                  alt="Tarte rustique aux figues et crème de pistache"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="/cuisine-tarte.jpg"
                />
                <div className="from-inverse-surface/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="font-label-caps text-label-caps text-primary-fixed block tracking-wider uppercase">
                    Pâtisserie du Jour
                  </span>
                  <span className="font-headline-sm text-headline-sm text-surface font-bold">
                    Tarte Rustique aux Figues
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between p-4">
                <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                  Pâte sablée craquante aux éclats d&apos;amandes, crème
                  onctueuse de pistache émeraude et figues noires compotées.
                </p>
                <div className="text-primary font-label-caps text-label-caps mt-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">eco</span>
                  <span>Inspiration végétale de saison</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Le Mot du Chef & Rituel de Début de Service */}
      <section className="scroll-mt-20 px-4 py-9 lg:px-6" id="rituel">
        <div className="bg-surface-container-lowest relative mx-auto max-w-5xl overflow-hidden rounded-3xl p-6 shadow-lg lg:p-9">
          <div className="from-primary-container/10 via-transparent to-transparent pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full bg-gradient-to-bl" />
          <div className="relative z-10 grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
            {/* Message gauche */}
            <div className="flex flex-col space-y-4 lg:col-span-7">
              <div className="text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-headline-sm">
                  emoji_objects
                </span>
                <span className="font-label-caps text-label-caps font-bold tracking-widest uppercase">
                  Rituel du Matin &amp; Esprit de Brigade
                </span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                La Symphonie des Gestes Partagés
              </h3>
              <div className="font-body text-on-surface-variant space-y-2 text-base leading-relaxed font-normal">
                <p>
                  Avant que le premier expresso ne percole en salle et que les
                  tables ne s&apos;animent, la cuisine est le sanctuaire du
                  calme et de l&apos;anticipation. Ici, chaque tour de main
                  compte : peser le silence, écouter le crépitement de la
                  croûte, humer l&apos;effluve des épices fraîchement
                  torréfiées.
                </p>
                <p className="text-on-surface italic">
                  « Travailler en étroite harmonie avec les baristas et les
                  serveurs, c&apos;est transmettre à travers chaque assiette la
                  même exigence que le café de spécialité dans la tasse : la
                  pureté de l&apos;artisanat. »
                </p>
              </div>
              {/* Rituels clés */}
              <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
                <div className="bg-surface-container flex items-start gap-1 rounded-xl p-2">
                  <span className="material-symbols-outlined text-primary text-headline-sm mt-0.5">
                    clean_hands
                  </span>
                  <div>
                    <span className="font-headline-sm text-headline-sm text-on-surface block font-semibold">
                      Le Plan Immaculé
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Lames affûtées, marbre frais, herbes en bouquet.
                    </span>
                  </div>
                </div>
                <div className="bg-surface-container flex items-start gap-1 rounded-xl p-2">
                  <span className="material-symbols-outlined text-tertiary text-headline-sm mt-0.5">
                    favorite
                  </span>
                  <div>
                    <span className="font-headline-sm text-headline-sm text-on-surface block font-semibold">
                      L&apos;Accord du Service
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Dialogue bienveillant entre le passe et la salle.
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Carte Chef Droite */}
            <div className="flex flex-col items-center lg:col-span-5">
              <div className="bg-surface-container relative flex w-full max-w-sm flex-col items-center rounded-2xl p-6 text-center shadow-inner">
                <div className="relative mb-4">
                  <img
                    alt="Portrait du Chef Yassine"
                    className="h-28 w-28 rounded-full object-cover shadow-md"
                    src="/cuisine-chef.jpg"
                  />
                  <div className="bg-primary text-on-primary absolute right-0 bottom-0 rounded-full p-1.5 shadow-sm">
                    <span
                      className="material-symbols-outlined text-sm block"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      workspace_premium
                    </span>
                  </div>
                </div>
                <span className="font-headline-md text-headline-md text-on-surface font-bold">
                  Chef Yassine
                </span>
                <span className="font-label-caps text-label-caps text-primary mt-1 mb-2 tracking-widest uppercase">
                  Responsable Fournil &amp; Création
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 italic">
                  « Que chaque bouchée servie aujourd&apos;hui raconte
                  l&apos;histoire de la terre et de notre passion pour le vrai
                  goût. Bon service à toute la brigade. »
                </p>
                <Link
                  href="/cuisine/kds"
                  className="hover:bg-primary hover:text-on-primary bg-surface-container-highest font-headline-sm text-headline-sm text-on-surface flex w-full items-center justify-center gap-1 rounded-xl px-4 py-2 font-semibold shadow-sm transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-base">
                    soup_kitchen
                  </span>
                  <span>Ouvrir l&apos;Espace Atelier</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bannière Poétique Finale */}
      <section className="px-4 pb-9">
        <div className="mx-auto max-w-4xl py-6 text-center">
          <div className="bg-surface-container text-primary mb-2 inline-flex items-center justify-center rounded-full p-3">
            <span className="material-symbols-outlined text-headline-md">
              wb_sunny
            </span>
          </div>
          <h4 className="font-headline-md text-headline-md text-on-surface mb-1 font-bold">
            Le Fournil s&apos;éveille avec le soleil
          </h4>
          <p className="font-body text-on-surface-variant mx-auto max-w-xl text-sm">
            La noblesse de notre métier réside dans la constance du geste et le
            dévouement au plaisir de nos hôtes.
          </p>
        </div>
      </section>
    </div>
  );
}
