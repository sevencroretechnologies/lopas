import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConfiguratorStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Box, 
  Square, 
  Layers, 
  Home, 
  X,
  ArrowLeftRight,
  ArrowUpDown,
  Grid3X3,
  Container,
  Warehouse,
  Package,
  Truck,
  Users,
  TreePine,
  Car,
  Fence,
  LayoutGrid,
  Palette,
  Sun,
  Fan,
  Anchor,
  Minus,
  Plus,
} from 'lucide-react';

interface InsertItem {
  id: string;
  label: string;
  icon: typeof Building2;
  description: string;
  action: () => void;
}

interface InsertCategory {
  id: string;
  label: string;
  items: InsertItem[];
}

interface InsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenExtensions?: () => void;
}

export function InsertDialog({ open, onOpenChange, onOpenExtensions }: InsertDialogProps) {
  const { 
    addLeanTo, 
    addMezzanine, 
    addCanopy, 
    addSkylight, 
    addVentilator,
    updateCrane,
    buildingConfig,
  } = useConfiguratorStore();
  const { toast } = useToast();

  const handleAddLeanToLeft = () => {
    addLeanTo('left');
    toast({ title: 'Lean-To Added', description: 'Left side lean-to extension added to your building.' });
    onOpenChange(false);
  };

  const handleAddLeanToRight = () => {
    addLeanTo('right');
    toast({ title: 'Lean-To Added', description: 'Right side lean-to extension added to your building.' });
    onOpenChange(false);
  };

  const handleAddMezzanine = () => {
    addMezzanine();
    toast({ title: 'Mezzanine Added', description: 'Interior mezzanine floor added to your building.' });
    onOpenChange(false);
  };

  const handleAddCanopyFront = () => {
    addCanopy('front');
    toast({ title: 'Canopy Added', description: 'Front wall canopy added to your building.' });
    onOpenChange(false);
  };

  const handleAddCanopyBack = () => {
    addCanopy('back');
    toast({ title: 'Canopy Added', description: 'Back wall canopy added to your building.' });
    onOpenChange(false);
  };

  const handleAddSkylight = () => {
    addSkylight();
    toast({ title: 'Skylight Added', description: 'Roof skylight added to your building.' });
    onOpenChange(false);
  };

  const handleAddVentilator = (type: 'ridge_vent' | 'turbine_vent') => {
    addVentilator(type);
    toast({ title: 'Ventilator Added', description: `${type === 'ridge_vent' ? 'Ridge' : 'Turbine'} vent added to your building.` });
    onOpenChange(false);
  };

  const handleAddCrane = () => {
    updateCrane({ type: 'overhead_bridge', capacity: 10 });
    toast({ title: 'Crane Added', description: 'Overhead bridge crane system added to your building.' });
    onOpenChange(false);
  };

  const handleOpenExtensions = () => {
    onOpenChange(false);
    onOpenExtensions?.();
  };

  const categories: InsertCategory[] = [
    {
      id: 'general',
      label: 'General Objects',
      items: [
        { id: 'leanto-left', label: 'Lean-To Left', icon: Box, description: 'Left side extension', action: handleAddLeanToLeft },
        { id: 'leanto-right', label: 'Lean-To Right', icon: Box, description: 'Right side extension', action: handleAddLeanToRight },
        { id: 'mezzanine', label: 'Mezzanine Floor', icon: Layers, description: 'Interior platform', action: handleAddMezzanine },
        { id: 'canopy-front', label: 'Front Canopy', icon: Home, description: 'Front wall overhang', action: handleAddCanopyFront },
        { id: 'canopy-back', label: 'Back Canopy', icon: Home, description: 'Back wall overhang', action: handleAddCanopyBack },
        { id: 'extensions', label: 'Building Extensions', icon: Building2, description: 'View all extensions', action: handleOpenExtensions },
      ],
    },
    {
      id: 'lighting',
      label: 'Lighting & Ventilation',
      items: [
        { id: 'skylight', label: 'Skylight', icon: Sun, description: 'Roof natural lighting', action: handleAddSkylight },
        { id: 'ridge-vent', label: 'Ridge Vent', icon: ArrowUpDown, description: 'Roof ridge ventilation', action: () => handleAddVentilator('ridge_vent') },
        { id: 'turbine-vent', label: 'Turbine Vent', icon: Fan, description: 'Spinning ventilator', action: () => handleAddVentilator('turbine_vent') },
      ],
    },
    {
      id: 'equipment',
      label: 'Equipment',
      items: [
        { id: 'crane', label: 'Overhead Crane', icon: Anchor, description: 'Bridge crane system', action: handleAddCrane },
      ],
    },
    {
      id: 'storage',
      label: 'Storage Objects',
      items: [
        { id: 'container', label: 'Container', icon: Container, description: 'Shipping container', action: () => toast({ title: 'Coming Soon', description: 'Storage objects will be available in a future update.' }) },
        { id: 'racking', label: 'Racking System', icon: Grid3X3, description: 'Warehouse racking', action: () => toast({ title: 'Coming Soon', description: 'Storage objects will be available in a future update.' }) },
        { id: 'pallets', label: 'Pallet Stack', icon: Package, description: 'Stacked pallets', action: () => toast({ title: 'Coming Soon', description: 'Storage objects will be available in a future update.' }) },
      ],
    },
    {
      id: 'decorations',
      label: 'Decorations',
      items: [
        { id: 'trees', label: 'Trees', icon: TreePine, description: 'Landscaping trees', action: () => toast({ title: 'Coming Soon', description: 'Decoration objects will be available in a future update.' }) },
        { id: 'vehicles', label: 'Vehicles', icon: Car, description: 'Cars and trucks', action: () => toast({ title: 'Coming Soon', description: 'Decoration objects will be available in a future update.' }) },
        { id: 'people', label: 'People', icon: Users, description: 'Human figures', action: () => toast({ title: 'Coming Soon', description: 'Decoration objects will be available in a future update.' }) },
        { id: 'truck', label: 'Truck', icon: Truck, description: 'Delivery truck', action: () => toast({ title: 'Coming Soon', description: 'Decoration objects will be available in a future update.' }) },
      ],
    },
    {
      id: 'structural',
      label: 'Structural Components',
      items: [
        { id: 'floor-marking', label: 'Floor Marking', icon: LayoutGrid, description: 'Line markings', action: () => toast({ title: 'Coming Soon', description: 'Structural components will be available in a future update.' }) },
        { id: 'barrier', label: 'Barrier', icon: Fence, description: 'Safety barriers', action: () => toast({ title: 'Coming Soon', description: 'Structural components will be available in a future update.' }) },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]" data-testid="dialog-insert">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#F7941D]" />
            Insert Object
          </DialogTitle>
          <DialogDescription>
            Select an object to add to your building configuration.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.id} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Minus className="h-3 w-3" />
                  {category.label}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        className="group flex flex-col items-center justify-center p-4 rounded-lg bg-[#0088cc] text-white hover:bg-[#0077b3] transition-all aspect-square relative"
                        data-testid={`insert-item-${item.id}`}
                      >
                        <Icon className="h-8 w-8 mb-2" />
                        <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
