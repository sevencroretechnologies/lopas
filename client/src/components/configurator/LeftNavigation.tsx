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
import { ColorPicker } from './ColorPicker';
import { useConfiguratorStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { 
  buildingTemplates, 
  frameTypes, 
  roofTypes, 
  roofOrientations, 
  slopeOptions,
  buildingSectors,
  buildingApplications,
  openingTypes,
  accessoryTypes,
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
} from 'lucide-react';

const panels = [
  { id: 'building', label: 'BUILDING', icon: Building2 },
  { id: 'bays', label: 'BAYS', icon: Layers },
  { id: 'sheeting', label: 'SHEETING', icon: PanelTop },
  { id: 'openings', label: 'OPENINGS', icon: DoorOpen },
  { id: 'accessory', label: 'ACCESSORY', icon: Wrench },
  { id: 'structure', label: 'STRUCTURE', icon: Palette },
  { id: 'quote', label: 'QUOTE', icon: FileText },
];

export function LeftNavigation() {
  const { 
    buildingConfig, 
    activePanel, 
    setActivePanel,
    updateDimensions,
    updateRoof,
    updateColors,
    updateFrameType,
    updateCrane,
    removeOpening,
    addAccessory,
    removeAccessory,
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Configuration
        </h2>
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
                  <Label htmlFor="bays" className="text-sm">Bays on Length</Label>
                  <Input
                    id="bays"
                    type="text"
                    placeholder="4*6"
                    value={buildingConfig.dimensions.baysPattern}
                    onChange={(e) => updateDimensions({ baysPattern: e.target.value })}
                    className="h-10 font-mono"
                    data-testid="input-bays"
                  />
                  <p className="text-xs text-muted-foreground">Format: N*M (e.g., 4*6 = 4 bays of 6m)</p>
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
                <p className="text-sm text-muted-foreground">
                  Structural bay configuration showing steel frames, purlins, and girts.
                </p>
                <div className="bg-muted/50 rounded-md p-4 text-center">
                  <Layers className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Bay structure preview visible in 3D viewport
                  </p>
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Number of Bays:</span>
                    <span className="font-mono">{buildingConfig.dimensions.baysPattern.split('*')[0] || '4'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bay Spacing:</span>
                    <span className="font-mono">{buildingConfig.dimensions.baysPattern.split('*')[1] || '6'}m</span>
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
                <ColorPicker
                  label="Wall Panel Color"
                  value={buildingConfig.colors.wallPanels}
                  onChange={(color) => updateColors({ wallPanels: color })}
                />

                <div className="border-t pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                    Roof Panels
                  </h4>
                  <ColorPicker
                    label="Roof Panel Color"
                    value={buildingConfig.colors.roofPanels}
                    onChange={(color) => updateColors({ roofPanels: color })}
                  />
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
                  Opening Colors
                </h4>
                
                <ColorPicker
                  label="Window Color"
                  value="Arctic White"
                  onChange={() => {}}
                />
                
                <ColorPicker
                  label="Door Fill Color"
                  value="Arctic White"
                  onChange={() => {}}
                />
                
                <ColorPicker
                  label="Roll Door Color"
                  value="RAL 9006"
                  onChange={() => {}}
                />

                <div className="border-t pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
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
                    Crane
                  </h4>
                  <div className="space-y-1">
                    <Label htmlFor="crane" className="text-sm">Crane Capacity (t)</Label>
                    <Input
                      id="crane"
                      type="number"
                      min={0}
                      step={0.5}
                      value={buildingConfig.crane?.capacity || 0}
                      onChange={(e) => updateCrane(parseFloat(e.target.value) || 0)}
                      className="h-10 text-right font-mono"
                      data-testid="input-crane-capacity"
                    />
                    <p className="text-xs text-muted-foreground">Set to 0 for no crane</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Add Accessories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {accessoryTypes.map((type) => (
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
                  Color Setup
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
                  Send Inquiry
                </h4>

                <div className="space-y-1">
                  <Label className="text-sm">Building Sector</Label>
                  <Select value={quoteData.sector} onValueChange={(v) => setQuoteData(d => ({ ...d, sector: v }))}>
                    <SelectTrigger className="h-10" data-testid="select-sector">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {buildingSectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm">Building Application</Label>
                  <Select value={quoteData.application} onValueChange={(v) => setQuoteData(d => ({ ...d, application: v }))}>
                    <SelectTrigger className="h-10" data-testid="select-application">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {buildingApplications.map((app) => (
                        <SelectItem key={app} value={app}>{app}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm">Realization Year</Label>
                  <Select value={quoteData.year} onValueChange={(v) => setQuoteData(d => ({ ...d, year: v }))}>
                    <SelectTrigger className="h-10" data-testid="select-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2025, 2026, 2027, 2028].map((year) => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm">How did you find us?</Label>
                  <Select value={quoteData.referral} onValueChange={(v) => setQuoteData(d => ({ ...d, referral: v }))}>
                    <SelectTrigger className="h-10" data-testid="select-referral">
                      <SelectValue placeholder="Choose option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="search">Search Engine</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="exhibition">Exhibition</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm">Additional Notes</Label>
                  <Textarea 
                    placeholder="Enter any additional requirements..."
                    className="resize-none min-h-[80px]"
                    value={quoteData.notes}
                    onChange={(e) => setQuoteData(d => ({ ...d, notes: e.target.value }))}
                    data-testid="textarea-notes"
                  />
                </div>

                <Button 
                  className="w-full gap-2 bg-[#F7941D] hover:bg-[#e8850f]" 
                  onClick={handleSubmitQuote}
                  disabled={isSubmitting}
                  data-testid="button-send-inquiry"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </aside>
  );
}
