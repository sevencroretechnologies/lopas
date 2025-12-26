import { useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { LeftNavigation } from '@/components/configurator/LeftNavigation';
import { RightSidebar } from '@/components/configurator/RightSidebar';
import { TopControlBar } from '@/components/configurator/TopControlBar';
import { Viewport3D } from '@/components/configurator/Viewport3D';
import { useConfiguratorStore } from '@/lib/store';
import { TemplateType, buildingTemplates } from '@shared/schema';
import { Building2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ConfiguratorPage() {
  const params = useParams<{ templateType: string }>();
  const [, setLocation] = useLocation();
  const { buildingConfig, addBuilding, initializeProject, project, selectedTemplate } = useConfiguratorStore();

  const templateType = params.templateType as TemplateType;
  const template = buildingTemplates.find(t => t.type === templateType);

  useEffect(() => {
    if (templateType && !buildingConfig) {
      if (['single_slope', 'rigid_frame', 'leans_to'].includes(templateType)) {
        if (!project) {
          initializeProject("New Project");
        }
        addBuilding(templateType);
      } else {
        setLocation('/');
      }
    }
  }, [templateType, buildingConfig, addBuilding, initializeProject, project, setLocation]);

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Invalid building template</p>
          <Link href="/">
            <Button variant="outline" data-testid="button-back-home">
              Return to Templates
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="h-14 bg-card border-b flex items-center justify-between px-4 gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">{template.name}</h1>
              <p className="text-xs text-muted-foreground">PEB Configurator</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {buildingConfig && (
            <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                {buildingConfig.dimensions.width}m x {buildingConfig.dimensions.length}m x {buildingConfig.dimensions.eaveHeight}m
              </span>
              <span className="capitalize">{buildingConfig.roof.type.replace('_', ' ')}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation */}
        <LeftNavigation />

        {/* Center - 3D Viewport */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopControlBar />
          <Viewport3D />
        </div>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}
