import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useConfiguratorStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
} from 'lucide-react';

interface BuildingExtensionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExtensionOption {
  id: string;
  label: string;
  description: string;
  icon: typeof Building2;
  type: 'left' | 'right' | 'both';
}

const extensionOptions: ExtensionOption[] = [
  {
    id: 'lean-to-left',
    label: 'Left Lean-To',
    description: 'Single lean-to attached to left wall',
    icon: ArrowLeft,
    type: 'left',
  },
  {
    id: 'lean-to-right',
    label: 'Right Lean-To',
    description: 'Single lean-to attached to right wall',
    icon: ArrowRight,
    type: 'right',
  },
  {
    id: 'lean-to-both',
    label: 'Dual Lean-To',
    description: 'Lean-tos on both left and right walls',
    icon: ArrowLeftRight,
    type: 'both',
  },
];

export function BuildingExtensionsDialog({ open, onOpenChange }: BuildingExtensionsDialogProps) {
  const { addLeanTo, buildingConfig } = useConfiguratorStore();
  const { toast } = useToast();

  const handleSelectExtension = (option: ExtensionOption) => {
    if (option.type === 'left') {
      addLeanTo('left');
      toast({
        title: 'Lean-To Added',
        description: 'Left side lean-to extension added to your building.',
      });
    } else if (option.type === 'right') {
      addLeanTo('right');
      toast({
        title: 'Lean-To Added',
        description: 'Right side lean-to extension added to your building.',
      });
    } else if (option.type === 'both') {
      addLeanTo('left');
      addLeanTo('right');
      toast({
        title: 'Dual Lean-To Added',
        description: 'Lean-to extensions added to both sides of your building.',
      });
    }
    onOpenChange(false);
  };

  const existingLeanTos = buildingConfig?.leanTos || [];
  const hasLeftLeanTo = existingLeanTos.some(lt => lt.attachedTo === 'left');
  const hasRightLeanTo = existingLeanTos.some(lt => lt.attachedTo === 'right');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="dialog-building-extensions">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#F7941D]" />
            Building Extensions
          </DialogTitle>
          <DialogDescription>
            Select a building extension type to add to your structure.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          {extensionOptions.map((option) => {
            const Icon = option.icon;
            const isDisabled = 
              (option.type === 'left' && hasLeftLeanTo) ||
              (option.type === 'right' && hasRightLeanTo) ||
              (option.type === 'both' && (hasLeftLeanTo || hasRightLeanTo));
            
            return (
              <button
                key={option.id}
                onClick={() => !isDisabled && handleSelectExtension(option)}
                disabled={isDisabled}
                className={`group flex flex-col items-center justify-center p-4 rounded-lg transition-all aspect-square border-2 ${
                  isDisabled
                    ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed'
                    : 'bg-[#0088cc] text-white border-[#0088cc] hover:bg-[#0077b3] hover:border-[#0077b3]'
                }`}
                data-testid={`extension-option-${option.id}`}
              >
                <div className="relative mb-2">
                  <div className="w-16 h-12 bg-white/20 rounded flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/30 rounded" />
                    <Icon className="absolute h-6 w-6" />
                  </div>
                </div>
                <span className="text-xs font-medium text-center leading-tight">{option.label}</span>
              </button>
            );
          })}
        </div>

        {(hasLeftLeanTo || hasRightLeanTo) && (
          <div className="text-xs text-muted-foreground text-center pb-2">
            Some options are disabled because lean-tos already exist on those sides.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
