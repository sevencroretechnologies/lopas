import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight } from 'lucide-react';
import { buildingTemplates, TemplateType } from '@shared/schema';
import { useConfiguratorStore } from '@/lib/store';

import singleSlopeImg from '@assets/generated_images/single_slope_steel_building.png';
import rigidFrameImg from '@assets/generated_images/rigid_frame_gabled_building.png';
import leanToImg from '@assets/generated_images/building_with_lean-to_additions.png';

const templateImages: Record<TemplateType, string> = {
  single_slope: singleSlopeImg,
  rigid_frame: rigidFrameImg,
  leans_to: leanToImg,
};

export default function TemplatesPage() {
  const { setSelectedTemplate, initializeBuilding } = useConfiguratorStore();

  const handleSelectTemplate = (templateType: TemplateType) => {
    setSelectedTemplate(templateType);
    initializeBuilding(templateType);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">PEB Configurator</h1>
              <p className="text-xs text-muted-foreground">Pre-Engineered Building Design</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" data-testid="button-help">Help</Button>
            <Button variant="outline" size="sm" data-testid="button-language">EN</Button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight mb-3">Select a Building Template</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose a building type to start configuring your pre-engineered steel structure. 
            Each template is optimized for specific industrial and commercial applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {buildingTemplates.map((template) => {
            const imageUrl = templateImages[template.type];
            return (
              <Card 
                key={template.id} 
                className="group relative overflow-visible transition-all duration-200 hover-elevate"
                data-testid={`card-template-${template.id}`}
              >
                <CardHeader className="pb-4">
                  <div className="w-full aspect-video bg-muted rounded-md mb-4 overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      data-testid={`img-template-${template.id}`}
                    />
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span>Width: {template.minWidth}m - {template.maxWidth}m</span>
                    <span className="capitalize">{template.defaultRoofType.replace('_', ' ')}</span>
                  </div>
                  <Link href={`/configurator/${template.type}`}>
                    <Button 
                      className="w-full gap-2"
                      onClick={() => handleSelectTemplate(template.type)}
                      data-testid={`button-select-${template.id}`}
                    >
                      Configure
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <section className="bg-card border rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">Why Choose Pre-Engineered Buildings?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Fast Construction</h4>
              <p className="text-sm text-muted-foreground">
                Pre-engineered components reduce construction time by up to 50% compared to traditional methods.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Cost Effective</h4>
              <p className="text-sm text-muted-foreground">
                Optimized designs minimize material waste and labor costs, providing excellent value.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Fully Customizable</h4>
              <p className="text-sm text-muted-foreground">
                Configure every aspect of your building from dimensions to colors and accessories.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-muted-foreground">
          <p>PEB Configurator - Professional Building Design Tool</p>
        </div>
      </footer>
    </div>
  );
}
