import { Link } from 'react-router-dom'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold tracking-tight mb-3">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <nav className="text-sm text-muted-foreground mb-8">
        <Link to="/" className="text-primary hover:underline">Accueil</Link>
        {' / '}
        <span>En savoir plus</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight mb-2">
        <span style={{ color: '#0055A4' }}>Swi</span>
        <span style={{ color: '#EF4135' }}>chers</span>
      </h1>
      <p className="text-muted-foreground mb-10">
        Plateforme communautaire pour les championnats amateurs de basketball FFBB.
      </p>

      <Section title="C'est quoi Swichers ?">
        <p>
          Swichers est une plateforme dédiée aux championnats amateurs de basketball organisés
          par la Fédération Française de Basketball (FFBB). Elle permet aux clubs, joueurs et
          supporters de consulter facilement les statistiques officielles de leurs matchs.
        </p>
        <p>
          Les membres peuvent importer les feuilles de match officielles émises par la FFBB
          au format PDF. La plateforme extrait automatiquement toutes les données et les rend
          accessibles sous forme de pages consultables.
        </p>
      </Section>

      <Section title="Comment ça marche ?">
        <p>
          <strong className="text-foreground font-semibold">1. Import</strong> — Un membre du club importe
          le PDF officiel de la feuille de match via la page d'upload.
        </p>
        <p>
          <strong className="text-foreground font-semibold">2. Extraction</strong> — La plateforme analyse
          automatiquement le document et en extrait toutes les statistiques : joueurs, points,
          passes, rebonds, fautes, temps de jeu et bien plus.
        </p>
        <p>
          <strong className="text-foreground font-semibold">3. Consultation</strong> — Les données sont
          immédiatement disponibles et consultables par tous les visiteurs du site.
        </p>
      </Section>

      <Section title="Ce que vous trouverez">
        <p>
          <strong className="text-foreground font-semibold">Pages équipe</strong> — Statistiques moyennes
          et totales par joueur sur l'ensemble de la saison, avec l'historique des matchs joués.
        </p>
        <p>
          <strong className="text-foreground font-semibold">Pages match</strong> — Feuille de match
          complète avec les statistiques individuelles des deux équipes, les totaux par mi-temps
          et les informations sur le match (date, salle, arbitres).
        </p>
      </Section>

      <Section title="Pour qui ?">
        <p>
          Swichers s'adresse aux joueurs qui veulent suivre leurs statistiques personnelles,
          aux coaches qui analysent les performances de leur équipe, et aux supporters qui
          suivent leur club de cœur.
        </p>
        <p>
          La plateforme couvre les championnats régionaux et départementaux FFBB : Pré-Nationale,
          Régionale, Départementale et toutes les catégories de jeunes.
        </p>
      </Section>

      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Les données proviennent des feuilles de match officielles de la{' '}
          <a
            href="https://competitions.ffbb.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Fédération Française de Basketball
          </a>
          .
        </p>
      </div>
    </div>
  )
}
