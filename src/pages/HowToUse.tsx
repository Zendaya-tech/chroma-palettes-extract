
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HowToUse = () => {
  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Comment utiliser Chroma Palettes
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Un guide rapide pour maîtriser la création de palettes de couleurs.
        </p>
      </header>

      <main className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Fonctionnalités Principales</CardTitle>
            <CardDescription>
              Découvrez les outils à votre disposition.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>🎨 Roulette Chromatique</AccordionTrigger>
                <AccordionContent>
                  La roulette chromatique est l'outil central pour explorer les
                  couleurs. Cliquez et déplacez votre souris sur le cercle pour
                  choisir une teinte et une saturation. Utilisez le curseur en
                  dessous pour ajuster la luminosité. Les couleurs harmoniques
                  correspondantes s'affichent automatiquement.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>🖼️ Extracteur de Couleurs</AccordionTrigger>
                <AccordionContent>
                  Téléchargez une image pour en extraire automatiquement une
                  palette de couleurs. C'est idéal pour créer une palette
                  inspirée par une photo ou une illustration.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>📋 Ma Palette Actuelle</AccordionTrigger>
                <AccordionContent>
                  Toutes les couleurs que vous sélectionnez sont ajoutées à
                  votre palette actuelle. Vous pouvez y copier le code
                  hexadécimal d'une couleur ou la supprimer de la palette.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Les Harmonies de Couleurs</CardTitle>
            <CardDescription>
              Comprendre les harmonies vous aide à créer des palettes
              équilibrées et esthétiques.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg">Complémentaire</h4>
              <p className="text-muted-foreground mt-1">
                Deux couleurs directement opposées sur le cercle chromatique.
                Cette combinaison crée un contraste élevé et percutant, idéal
                pour attirer l'attention.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg">Analogue</h4>
              <p className="text-muted-foreground mt-1">
                Trois couleurs situées côte à côte sur le cercle. Cette harmonie
                est souvent retrouvée dans la nature et est agréable à l'œil,
                créant un design serein et confortable.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg">Triadique</h4>
              <p className="text-muted-foreground mt-1">
                Trois couleurs espacées de manière égale sur le cercle, formant
                un triangle. Les harmonies triadiques sont vibrantes et pleines
                d'énergie.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg">Complémentaire Adjacente</h4>
              <p className="text-muted-foreground mt-1">
                Une variante de l'harmonie complémentaire. Elle utilise une
                couleur et les deux couleurs adjacentes à sa complémentaire.
                Elle offre un fort contraste, mais avec moins de tension que la
                combinaison complémentaire directe.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HowToUse;
