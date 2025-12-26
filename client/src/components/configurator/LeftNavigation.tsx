import { useState } from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ColorPicker } from './ColorPicker';
import { useConfiguratorStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { 
  buildingTemplates, 
  frameTypes, 
  endWallTypes,
  roofTypes, 
  roofOrientations, 
  slopeOptions,
  buildingSectors,
  buildingApplications,
  openingTypes,
  accessoryTypes,
  insulationTypes,
  insulationRValues,
  panelTypes,
  panelProfiles,
  craneTypes,
  ventilationTypes,
  generateId,
} from '@shared/schema';
import { 
  Building2, 
  Layers, 
  PanelTop, 
  DoorOpen, 
  Wrench, 
  Palette, 
  FileText,
  Send,
  Trash2,
  Plus,
  Loader2,
  Thermometer,
  Warehouse,
  Sun,
  Wind,
  Copy,
  ChevronRight,
  Settings2,
} from 'lucide-react';

const panels = [
  { id: 'building', label: 'BUILDING', icon: Building2 },
  { id: 'bays', label: 'BAYS', icon: Layers },
  { id: 'sheeting', label: 'SHEETING', icon: PanelTop },
  { id: 'insulation', label: 'INSULATION', icon: Thermometer },
  { id: 'openings', label: 'OPENINGS', icon: DoorOpen },
  { id: 'mezzanine', label: 'MEZZANINE', icon: Warehouse },
  { id: 'skylights', label: 'SKYLIGHTS', icon: Sun },
  { id: 'ventilation', label: 'VENTILATION', icon: Wind },
  { id: 'accessory', label: 'ACCESSORY', icon: Wrench },
  { id: 'structure', label: 'STRUCTURE', icon: Palette },
  { id: 'quote', label: 'QUOTE', icon: FileText },
];

export function LeftNavigation() {
  const { 
    project,
    buildingConfig, 
    activePanel, 
    setActivePanel,
    updateDimensions,
    updateRoof,
    updateColors,
    updateFrameType,
    updateEndWallType,
    updateBays,
    addBay,
    removeBay,
    updateBayWidth,
    updateWallPanelConfig,
    updateRoofPanelConfig,
    updateWallInsulation,
    updateRoofInsulation,
    updateCrane,
    removeOpening,
    addAccessory,
    removeAccessory,
    addLeanTo,
    removeLeanTo,
    addMezzanine,
    removeMezzanine,
    addCanopy,
    removeCanopy,
    addSkylight,
    removeSkylight,
    addVentilator,
    removeVentilator,
    addBuilding,
    removeBuilding,
    selectBuilding,
    duplicateBuilding,
  } = useConfiguratorStore();
  
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteData, setQuoteData] = useState({
    sector: 'Industrial',
    application: 'Plants/Factories',
    year: '2025',
    referral: '',
    notes: '',
  });

  const handleSubmitQuote = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Inquiry Submitted",
      description: "Thank you! Our team will contact you within 24-48 hours.",
    });
    setIsSubmitting(false);
    setQuoteData({ sector: 'Industrial', application: 'Plants/Factories', year: '2025', referral: '', notes: '' });
  };

  const handleAddAccessory = (type: typeof accessoryTypes[number]) => {
    addAccessory({
      id: generateId(),
      type,
      position: { x: 0, y: 0, z: 0 },
      color: buildingConfig?.colors.accessories || 'RAL 9010',
    });
    toast({ title: "Accessory Added", description: `${type.replace('_', ' ')} has been added.` });
  };

  if (!buildingConfig) return null;

  const template = buildingTemplates.find(t => t.type === buildingConfig.templateType);

  return (
    <aside className="w-72 bg-sidebar border-r flex flex-col h-full">
      <div className="p-4 border-b bg-sidebar">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Buildings
          </h2>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7"
            onClick={() => addBuilding(buildingConfig.templateType)}
            data-testid="button-add-building"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {project && project.buildings.length > 0 && (
          <div className="space-y-1">
            {project.buildings.map((building, idx) => (
              <div 
                key={building.id}
                className={`flex items-center gap-2 p-2 rounded-md text-sm cursor-pointer ${
                  building.id === buildingConfig.id ? 'bg-accent' : 'hover-elevate'
                }`}
                onClick={() => selectBuilding(building.id)}
                data-testid={`building-item-${building.id}`}
              >
                <Building2 className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 truncate">{building.name || `Building ${idx + 1}`}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => { e.stopPropagation(); duplicateBuilding(building.id); }}
                  data-testid={`button-duplicate-building-${building.id}`}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {project.buildings.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); removeBuilding(building.id); }}
                    data-testid={`button-delete-building-${building.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <Accordion 
          type="single" 
          collapsible 
          value={activePanel}
          onValueChange={setActivePanel}
          className="px-2 py-2"
        >
          {/* BUILDING Panel */}
          <AccordionItem value="building" className="border-b-0">
            <AccordionTrigger 
              className="hover:no-underline px-3 py-3 rounded-md hover-elevate"
              data-testid="panel-building-trigger"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium">BUILDING</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Dimensions
                </h4>
                
                <div className="space-y-1">
                  <Label htmlFor="width" className="text-sm">Width (m)</Label>
                  <Input
                    id="width"
                    type="number"
                    min={template?.minWidth || 6}
                    max={template?.maxWidth || 100}
                    step={0.5}
                    value={buildingConfig.dimensions.width}
                    onChange={(e) => updateDimensions({ width: parseFloat(e.target.value) || 12 })}
                    className="h-10 text-right font-mono"
                    data-testid="input-width"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="frameType" className="text-sm">Frame Type</Label>
                  <Select 
                    value={buildingConfig.frameType} 
                    onValueChange={updateFrameType}
                  >
                    <SelectTrigger id="frameType" className="h-10" data-testid="select-frame-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frameTypes.map((ft) => (
                        <SelectItem key={ft.id} value={ft.id}>{ft.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="endWallType" className="text-sm">End Wall Type</Label>
                  <Select 
                    value={buildingConfig.endWallType || 'bearing_frame'} 
                    onValueChange={updateEndWallType}
                  >
                    <SelectTrigger id="endWallType" className="h-10" data-testid="select-end-wall-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {endWallTypes.map((et) => (
                        <SelectItem key={et.id} value={et.id}>{et.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="eaveHeight" className="text-sm">Eave Height (m)</Label>
                  <Input
                    id="eaveHeight"
                    type="number"
                    min={3}
                    max={15}
                    step={0.5}
                    value={buildingConfig.dimensions.eaveHeight}
                    onChange={(e) => updateDimensions({ eaveHeight: parseFloat(e.target.value) || 6 })}
                    className="h-10 text-right font-mono"
                    data-testid="input-eave-height"
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                    Roof Configuration
                  </h4>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-sm">Roof Type</Label>
                      <Select 
                        value={buildingConfig.roof.type} 
                        onValueChange={(v) => updateRoof({ type: v as typeof roofTypes[number] })}
                      >
                        <SelectTrigger className="h-10" data-testid="select-roof-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roofTypes.map((rt) => (
                            <SelectItem key={rt} value={rt} className="capitalize">
                              {rt.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {buildingConfig.roof.type === 'single_slope' && (
                      <div className="space-y-1">
                        <Label className="text-sm">Roof Orientation</Label>
                        <Select 
                          value={buildingConfig.roof.orientation || 'right'} 
                          onValueChange={(v) => updateRoof({ orientation: v as typeof roofOrientations[number] })}
                        >
                          <SelectTrigger className="h-10" data-testid="select-roof-orientation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roofOrientations.map((ro) => (
                              <SelectItem key={ro} value={ro} className="capitalize">{ro}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-1">
                      <Label className="text-sm">Slope</Label>
                      <Select 
                        value={buildingConfig.roof.slope} 
                        onValueChange={(v) => updateRoof({ slope: v })}
                      >
                        <SelectTrigger className="h-10" data-testid="select-slope">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {slopeOptions.map((so) => (
                            <SelectItem key={so} value={so}>{so}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Lean-To Section */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Lean-To Attachments
                  </h4>
                  <div className="flex gap-2 mb-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addLeanTo('left')}
                      className="flex-1 text-xs"
                      data-testid="button-add-leanto-left"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Left Side
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addLeanTo('right')}
                      className="flex-1 text-xs"
                      data-testid="button-add-leanto-right"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Right Side
                    </Button>
                  </div>
                  
                  {buildingConfig.leanTos && buildingConfig.leanTos.length > 0 && (
                    <div className="space-y-2">
                      {buildingConfig.leanTos.map((leanTo) => (
                        <div key={leanTo.id} className="text-xs bg-muted p-2 rounded flex items-center justify-between gap-2">
                          <span className="capitalize">Lean-To ({leanTo.attachedTo})</span>
                          <span className="text-muted-foreground">{leanTo.width}m</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => removeLeanTo(leanTo.id)}
                            data-testid={`button-delete-leanto-${leanTo.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* BAYS Panel */}
          <AccordionItem value="bays" className="border-b-0">
            <AccordionTrigger 
              className="hover:no-underline px-3 py-3 rounded-md hover-elevate"
              data-testid="panel-bays-trigger"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span className="text-sm font-medium">BAYS</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Bay Configuration
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addBay()}
                    className="h-7 text-xs"
                    data-testid="button-add-bay"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Bay
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {buildingConfig.bays && buildingConfig.bays.map((bay, idx) => (
                    <div key={bay.id} className="flex items-center gap-2 bg-muted/50 p-2 rounded">
                      <span className="text-xs text-muted-foreground w-16">Bay {idx + 1}</span>
                      <Input
                        type="number"
                        min={3}
                        max={12}
                        step={0.5}
                        value={bay.width}
                        onChange={(e) => updateBayWidth(bay.id, parseFloat(e.target.value) || 6)}
                        className="h-8 text-right font-mono flex-1"
                        data-testid={`input-bay-width-${bay.id}`}
                      />
                      <span className="text-xs text-muted-foreground">m</span>
                      {buildingConfig.bays && buildingConfig.bays.length > 1 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => removeBay(bay.id)}
                          data-testid={`button-delete-bay-${bay.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-3 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Number of Bays:</span>
                    <span className="font-mono">{buildingConfig.bays?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Length:</span>
                    <span className="font-mono">{buildingConfig.dimensions.length}m</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SHEETING Panel */}
          <AccordionItem value="sheeting" className="border-b-0">
            <AccordionTrigger 
              className="hover:no-underline px-3 py-3 rounded-md hover-elevate"
              data-testid="panel-sheeting-trigger"
            >
              <div className="flex items-center gap-2">
                <PanelTop className="w-4 h-4" />
                <span className="text-sm font-medium">SHEETING</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Wall Panels
                </h4>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-sm">Panel Type</Label>
                    <Select 
                      value={buildingConfig.wallPanelConfig?.type || 'single_skin'} 
                      onValueChange={(v) => updateWallPanelConfig({ type: v as typeof panelTypes[number] })}
                    >
                      <SelectTrigger className="h-10" data-testid="select-wall-panel-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {panelTypes.map((pt) => (
                          <SelectItem key={pt} value={pt} className="capitalize">
                            {pt.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-sm">Profile</Label>
                    <Select 
                      value={buildingConfig.wallPanelConfig?.profile || 'Kirby Wall'} 
                      onValueChange={(v) => updateWallPanelConfig({ profile: v })}
                    >
                      <SelectTrigger className="h-10" data-testid="select-wall-panel-profile">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {panelProfiles.map((pp) => (
                          <SelectItem key={pp} value={pp}>{pp}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <ColorPicker
                    label="Wall Panel Color"
                    value={buildingConfig.colors.wallPanels}
                    onChange={(color) => updateColors({ wallPanels: color })}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                    Roof Panels
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-sm">Panel Type</Label>
                      <Select 
                        value={buildingConfig.roofPanelConfig?.type || 'single_skin'} 
                        onValueChange={(v) => updateRoofPanelConfig({ type: v as typeof panelTypes[number] })}
                      >
                        <SelectTrigger className="h-10" data-testid="select-roof-panel-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {panelTypes.map((pt) => (
                            <SelectItem key={pt} value={pt} className="capitalize">
                              {pt.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-sm">Profile</Label>
                      <Select 
                        value={buildingConfig.roofPanelConfig?.profile || 'Kirby Rib'} 
                        onValueChange={(v) => updateRoofPanelConfig({ profile: v })}
                      >
                        <SelectTrigger className="h-10" data-testid="select-roof-panel-profile">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {panelProfiles.map((pp) => (
                            <SelectItem key={pp} value={pp}>{pp}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <ColorPicker
                      label="Roof Panel Color"
                      value={buildingConfig.colors.roofPanels}
                      onChange={(color) => updateColors({ roofPanels: color })}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* INSULATION Panel */}
          <AccordionItem value="insulation" className="border-b-0">
            <AccordionTrigger 
              className="hover:no-underline px-3 py-3 rounded-md hover-elevate"
              data-testid="panel-insulation-trigger"
            >
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                <span className="text-sm font-medium">INSULATION</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Wall Insulation
                </h4>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-sm">Type</Label>
                    <Select 
                      value={buildingConfig.wallInsulation?.type || 'none'} 
                      onValueChange={(v) => updateWallInsulation({ type: v as typeof insulationTypes[number] })}
                    >
                      <SelectTrigger className="h-10" data-testid="select-wall-insulation-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {insulationTypes.map((it) => (
                          <SelectItem key={it} value={it} className="capitalize">
                            {it.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {buildingConfig.wallInsulation?.type !== 'none' && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-sm">R-Value</Label>
                        <Select 
                          value={buildingConfig.wallInsulation?.rValue || 'R-13'} 
                          onValueChange={(v) => updateWallInsulation({ rValue: v as typeof insulationRValues[number] })}
                        >
                          <SelectTrigger className="h-10" data-testid="select-wall-insulation-rvalue">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {insulationRValues.map((rv) => (
                              <SelectItem key={rv} value={rv}>{rv}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Liner Panel</Label>
                        <Switch
                          checked={buildingConfig.wallInsulation?.hasLiner || false}
                          onCheckedChange={(checked) => updateWallInsulation({ hasLiner: checked })}
                          data-testid="switch-wall-liner"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                    Roof Insulation
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-sm">Type</Label>
                      <Select 
                        value={buildingConfig.roofInsulation?.type || 'none'} 
                        onValueChange={(v) => updateRoofInsulation({ type: v as typeof insulationTypes[number] })}
                      >
                        <SelectTrigger className="h-10" data-testid="select-roof-insulation-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {insulationTypes.map((it) => (
                            <SelectItem key={it} value={it} className="capitalize">
                              {it.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {buildingConfig.roofInsulation?.type !== 'none' && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-sm">R-Value</Label>
                          <Select 
                            value={buildingConfig.roofInsulation?.rValue || 'R-19'} 
                            onValueChange={(v) => updateRoofInsulation({ rValue: v as typeof insulationRValues[number] })}
                          >
                            <SelectTrigger className="h-10" data-testid="select-roof-insulation-rvalue">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {insulationRValues.map((rv) => (
                                <SelectItem key={rv} value={rv}>{rv}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Liner Panel</Label>
                          <Switch
                            checked={buildingConfig.roofInsulation?.hasLiner || false}
                            onCheckedChange={(checked) => updateRoofInsulation({ hasLiner: checked })}
                            data-testid="switch-roof-liner"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* OPENINGS Panel */}
          <AccordionItem value="openings" className="border-b-0">
            <AccordionTrigger 
              className="hover:no-underline px-3 py-3 rounded-md hover-elevate"
              data-testid="panel-openings-trigger"
            >
              <div className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4" />
                <span className="text-sm font-medium">OPENINGS</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Add Openings by Wall
                </h4>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {(['front', 'back', 'left', 'right'] as const).map((wall) => (
                    <Button
                      key={wall}
                      size="sm"
                      variant="outline"
                      className="capitalize text-xs"
                      onClick={() => {
                        const event = new CustomEvent('openAddOpeningDialog', { detail: { wall } });
                        window.dispatchEvent(event);
                      }}
                      data-testid={`button-add-opening-${wall}-panel`}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {wall} Wall
                    </Button>
                  ))}
                </div>
                
                <p className="text-xs text-muted-foreground mb-3">
                  Or click (+) buttons on walls in the 3D viewport.
                </p>

                {buildingConfig.openings.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h5 className="text-xs font-medium">Current Openings ({buildingConfig.openings.length}):</h5>
                    {buildingConfig.openings.map((opening) => (
                      <div key={opening.id} className="text-xs bg-muted p-2 rounded flex items-center justify-between gap-2" data-testid={`opening-item-${opening.id}`}>
                        <div className="flex-1 min-w-0">
                          <span className="capitalize font-medium">{opening.type.replace('_', ' ')}</span>
                          <span className="text-muted-foreground ml-2">({opening.wall})</span>
                          <div className="text-muted-foreground text-[10px]">
                            {opening.dimensions.width}m x {opening.dimensions.height}m
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => removeOpening(opening.id)}
                          data-testid={`button-delete-opening-${opening.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* MEZZANINE Panel */}
          <AccordionItem value="mezzanine" className="border-b-0">
            <AccordionTrigger 
              className="hover:no-underline px-3 py-3 rounded-md hover-elevate"
              data-testid="panel-mezzanine-trigger"
            >
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4" />
                <span className="text-sm font-medium">MEZZANINE</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Mezzanine Floors
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addMezzanine()}
                    className="h-7 text-xs"
                    data-testid="button-add-mezzanine"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                
                {buildingConfig.mezzanines && buildingConfig.mezzanines.length > 0 ? (
                  <div className="space-y-2">
                    {buildingConfig.mezzanines.map((mezz, idx) => (
                      <div key={mezz.id} className="bg-muted p-3 rounded space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Mezzanine {idx + 1}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => removeMezzanine(mezz.id)}
                            data-testid={`button-delete-mezzanine-${mezz.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>Width: {mezz.dimensions.width}m</div>
                          <div>Length: {mezz.dimensions.length}m</div>
                          <div>Height: {mezz.height}m</div>
                          <div>Load: {mezz.loadCapacity} kg/m2</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No mezzanines added. Click "Add" to add a mezzanine floor.</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SKYLIGHTS Panel */}
          <AccordionItem value="skylights" className="border-b-0">
            <AccordionTrigger 
              className="hover:no-underline px-3 py-3 rounded-md hover-elevate"
              data-testid="panel-skylights-trigger"
            >
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4" />
                <span className="text-sm font-medium">SKYLIGHTS</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Roof Skylights
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addSkylight()}
                    className="h-7 text-xs"
                    data-testid="button-add-skylight"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                
                {buildingConfig.skylights && buildingConfig.skylights.length > 0 ? (
                  <div className="space-y-2">
                    {buildingConfig.skylights.map((sky, idx) => (
                      <div key={sky.id} className="text-xs bg-muted p-2 rounded flex items-center justify-between gap-2">
                        <span>Skylight {idx + 1} ({sky.dimensions.width}m x {sky.dimensions.length}m)</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => removeSkylight(sky.id)}
                          data-testid={`button-delete-skylight-${sky.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No skylights added. Click "Add" to add natural lighting.</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* VENTILATION Panel */}
          <AccordionItem value="ventilation" className="border-b-0">
            <AccordionTrigger 
              className="hover:no-underline px-3 py-3 rounded-md hover-elevate"
              data-testid="panel-ventilation-trigger"
            >
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4" />
                <span className="text-sm font-medium">VENTILATION</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Add Ventilators
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ventilationTypes.map((type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant="outline"
                      onClick={() => addVentilator(type)}
                      className="text-xs capitalize"
                      data-testid={`button-add-ventilator-${type}`}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {type.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
                
                {buildingConfig.ventilators && buildingConfig.ventilators.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h5 className="text-xs font-medium">Current Ventilators:</h5>
                    {buildingConfig.ventilators.map((vent) => (
                      <div key={vent.id} className="text-xs bg-muted p-2 rounded flex items-center justify-between gap-2">
                        <span className="capitalize">{vent.type.replace('_', ' ')}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => removeVentilator(vent.id)}
                          data-testid={`button-delete-ventilator-${vent.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ACCESSORY Panel */}
          <AccordionItem value="accessory" className="border-b-0">
            <AccordionTrigger 
              className="hover:no-underline px-3 py-3 rounded-md hover-elevate"
              data-testid="panel-accessory-trigger"
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span className="text-sm font-medium">ACCESSORY</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4">
              <div className="space-y-4">
                <ColorPicker
                  label="Accessory Color"
                  value={buildingConfig.colors.accessories}
                  onChange={(color) => updateColors({ accessories: color })}
                />

                <div className="border-t pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                    Flashing
                  </h4>
                  <ColorPicker
                    label="Flashing Color"
                    value={buildingConfig.colors.flashing}
                    onChange={(color) => updateColors({ flashing: color })}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                    Canopies
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(['front', 'back', 'left', 'right'] as const).map((wall) => (
                      <Button
                        key={wall}
                        size="sm"
                        variant="outline"
                        onClick={() => addCanopy(wall)}
                        className="text-xs capitalize"
                        data-testid={`button-add-canopy-${wall}`}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {wall}
                      </Button>
                    ))}
                  </div>
                  
                  {buildingConfig.canopies && buildingConfig.canopies.length > 0 && (
                    <div className="space-y-2">
                      {buildingConfig.canopies.map((canopy) => (
                        <div key={canopy.id} className="text-xs bg-muted p-2 rounded flex items-center justify-between gap-2">
                          <span className="capitalize">{canopy.wall} Canopy ({canopy.dimensions.projection}m proj.)</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => removeCanopy(canopy.id)}
                            data-testid={`button-delete-canopy-${canopy.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                    Crane
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-sm">Crane Type</Label>
                      <Select 
                        value={buildingConfig.crane?.type || 'none'} 
                        onValueChange={(v) => updateCrane({ type: v as typeof craneTypes[number] })}
                      >
                        <SelectTrigger className="h-10" data-testid="select-crane-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {craneTypes.map((ct) => (
                            <SelectItem key={ct} value={ct} className="capitalize">
                              {ct.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {buildingConfig.crane?.type && buildingConfig.crane.type !== 'none' && (
                      <>
                        <div className="space-y-1">
                          <Label htmlFor="craneCapacity" className="text-sm">Capacity (tonnes)</Label>
                          <Input
                            id="craneCapacity"
                            type="number"
                            min={1}
                            max={100}
                            step={1}
                            value={buildingConfig.crane?.capacity || 5}
                            onChange={(e) => updateCrane({ capacity: parseFloat(e.target.value) || 5 })}
                            className="h-10 text-right font-mono"
                            data-testid="input-crane-capacity"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="hookHeight" className="text-sm">Hook Height (m)</Label>
                          <Input
                            id="hookHeight"
                            type="number"
                            min={3}
                            max={12}
                            step={0.5}
                            value={buildingConfig.crane?.hookHeight || 4}
                            onChange={(e) => updateCrane({ hookHeight: parseFloat(e.target.value) || 4 })}
                            className="h-10 text-right font-mono"
                            data-testid="input-hook-height"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Other Accessories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {accessoryTypes.slice(0, 5).map((type) => (
                      <Button
                        key={type}
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddAccessory(type)}
                        className="capitalize text-xs"
                        data-testid={`button-add-accessory-${type}`}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {type.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>

                  {buildingConfig.accessories.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h5 className="text-xs font-medium">Current Accessories ({buildingConfig.accessories.length}):</h5>
                      {buildingConfig.accessories.map((acc) => (
                        <div key={acc.id} className="text-xs bg-muted p-2 rounded flex items-center justify-between gap-2" data-testid={`accessory-item-${acc.id}`}>
                          <span className="capitalize">{acc.type.replace('_', ' ')}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => removeAccessory(acc.id)}
                            data-testid={`button-delete-accessory-${acc.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* STRUCTURE Panel */}
          <AccordionItem value="structure" className="border-b-0">
            <AccordionTrigger 
              className="hover:no-underline px-3 py-3 rounded-md hover-elevate"
              data-testid="panel-structure-trigger"
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span className="text-sm font-medium">STRUCTURE</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Structure Colors
                </h4>

                <ColorPicker
                  label="Base Plate"
                  value={buildingConfig.colors.basePlate}
                  onChange={(color) => updateColors({ basePlate: color })}
                />

                <ColorPicker
                  label="Primary Structure"
                  value={buildingConfig.colors.primaryStructure}
                  onChange={(color) => updateColors({ primaryStructure: color })}
                />

                <ColorPicker
                  label="Secondary Structure"
                  value={buildingConfig.colors.secondaryStructure}
                  onChange={(color) => updateColors({ secondaryStructure: color })}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* QUOTE Panel */}
          <AccordionItem value="quote" className="border-b-0">
            <AccordionTrigger 
              className="hover:no-underline px-3 py-3 rounded-md hover-elevate"
              data-testid="panel-quote-trigger"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">QUOTE</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Request Quote
                </h4>
                
                <div className="space-y-1">
                  <Label className="text-sm">Building Sector</Label>
                  <Select value={quoteData.sector} onValueChange={(v) => setQuoteData(d => ({ ...d, sector: v }))}>
                    <SelectTrigger className="h-10" data-testid="select-sector">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {buildingSectors.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm">Application</Label>
                  <Select value={quoteData.application} onValueChange={(v) => setQuoteData(d => ({ ...d, application: v }))}>
                    <SelectTrigger className="h-10" data-testid="select-application">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {buildingApplications.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="year" className="text-sm">Year of Realization</Label>
                  <Input
                    id="year"
                    type="text"
                    value={quoteData.year}
                    onChange={(e) => setQuoteData(d => ({ ...d, year: e.target.value }))}
                    className="h-10"
                    data-testid="input-year"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="notes" className="text-sm">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements..."
                    value={quoteData.notes}
                    onChange={(e) => setQuoteData(d => ({ ...d, notes: e.target.value }))}
                    className="min-h-[80px]"
                    data-testid="textarea-notes"
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleSubmitQuote}
                  disabled={isSubmitting}
                  data-testid="button-send-inquiry"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Inquiry
                    </>
                  )}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </aside>
  );
}
