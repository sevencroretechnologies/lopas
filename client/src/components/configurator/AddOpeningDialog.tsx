import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfiguratorStore } from '@/lib/store';
import { 
  openingTypes, 
  doorSwingDirections,
  WallPosition, 
  OpeningType, 
  DoorSwingDirection,
  RAL_COLORS, 
  generateId 
} from '@shared/schema';
import { DoorOpen, Grid2x2 } from 'lucide-react';

interface AddOpeningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wall: WallPosition;
}

const openingTypeLabels: Record<OpeningType, string> = {
  window: 'Window',
  door: 'Swing Door',
  sliding_door: 'Sliding Door',
  roll_door: 'Roll-Up Door',
  sectional_door: 'Sectional Door',
  personnel_door: 'Personnel Door',
  emergency_exit: 'Emergency Exit',
  louver: 'Louver',
  framed_opening: 'Framed Opening',
};

const openingTypeDefaults: Record<OpeningType, { width: number; height: number }> = {
  window: { width: 1.2, height: 1.0 },
  door: { width: 0.9, height: 2.1 },
  sliding_door: { width: 3.0, height: 2.5 },
  roll_door: { width: 4.0, height: 4.0 },
  sectional_door: { width: 5.0, height: 4.5 },
  personnel_door: { width: 0.9, height: 2.1 },
  emergency_exit: { width: 1.8, height: 2.1 },
  louver: { width: 0.6, height: 0.6 },
  framed_opening: { width: 3.0, height: 3.0 },
};

const swingDirectionLabels: Record<DoorSwingDirection, string> = {
  left_in: 'Left - Inward',
  left_out: 'Left - Outward',
  right_in: 'Right - Inward',
  right_out: 'Right - Outward',
};

export function AddOpeningDialog({ open, onOpenChange, wall }: AddOpeningDialogProps) {
  const { addOpening, buildingConfig } = useConfiguratorStore();
  const [type, setType] = useState<OpeningType>('door');
  const [width, setWidth] = useState(0.9);
  const [height, setHeight] = useState(2.1);
  const [offsetX, setOffsetX] = useState(0);
  const [elevation, setElevation] = useState(0);
  const [color, setColor] = useState('RAL 9010');
  const [swingDirection, setSwingDirection] = useState<DoorSwingDirection>('left_in');
  const [hasFrame, setHasFrame] = useState(true);
  const [frameColor, setFrameColor] = useState('RAL 7016');

  const isDoor = ['door', 'personnel_door', 'emergency_exit'].includes(type);
  const needsSwingDirection = isDoor;

  const handleTypeChange = (newType: OpeningType) => {
    setType(newType);
    const defaults = openingTypeDefaults[newType];
    setWidth(defaults.width);
    setHeight(defaults.height);
    if (newType === 'window' || newType === 'louver') {
      setElevation(1.2);
    } else {
      setElevation(0);
    }
    if (['door', 'personnel_door', 'emergency_exit'].includes(newType)) {
      setHasFrame(true);
    }
  };

  const handleSubmit = () => {
    if (!buildingConfig) return;

    const opening = {
      id: generateId(),
      type,
      wall,
      position: { x: offsetX, y: elevation },
      dimensions: { width, height },
      color,
      ...(needsSwingDirection && { swingDirection }),
      hasFrame,
      ...(hasFrame && { frameColor }),
    };

    addOpening(opening);
    onOpenChange(false);
    
    setType('door');
    setWidth(0.9);
    setHeight(2.1);
    setOffsetX(0);
    setElevation(0);
    setColor('RAL 9010');
    setSwingDirection('left_in');
    setHasFrame(true);
    setFrameColor('RAL 7016');
  };

  const wallLabels: Record<WallPosition, string> = {
    front: 'Front Wall (Endwall)',
    back: 'Back Wall (Endwall)',
    left: 'Left Wall (Sidewall)',
    right: 'Right Wall (Sidewall)',
    roof: 'Roof',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]" data-testid="dialog-add-opening">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5 text-[#F7941D]" />
            Add Opening - {wallLabels[wall]}
          </DialogTitle>
          <DialogDescription>
            Configure the opening type, dimensions, and position.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="opening-type">Opening Type</Label>
            <Select value={type} onValueChange={(v) => handleTypeChange(v as OpeningType)}>
              <SelectTrigger id="opening-type" data-testid="select-opening-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {openingTypes.map((t) => (
                  <SelectItem key={t} value={t} data-testid={`option-opening-${t}`}>
                    {openingTypeLabels[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="opening-width">Width (m)</Label>
              <Input
                id="opening-width"
                type="number"
                step="0.1"
                min="0.5"
                max="15"
                value={width}
                onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                data-testid="input-opening-width"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="opening-height">Height (m)</Label>
              <Input
                id="opening-height"
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                data-testid="input-opening-height"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="opening-offset">Offset from Center (m)</Label>
              <Input
                id="opening-offset"
                type="number"
                step="0.5"
                value={offsetX}
                onChange={(e) => setOffsetX(parseFloat(e.target.value) || 0)}
                data-testid="input-opening-offset"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="opening-elevation">Elevation (m)</Label>
              <Input
                id="opening-elevation"
                type="number"
                step="0.1"
                min="0"
                value={elevation}
                onChange={(e) => setElevation(parseFloat(e.target.value) || 0)}
                data-testid="input-opening-elevation"
              />
            </div>
          </div>

          {needsSwingDirection && (
            <div className="grid gap-2">
              <Label htmlFor="swing-direction">Door Swing Direction</Label>
              <Select value={swingDirection} onValueChange={(v) => setSwingDirection(v as DoorSwingDirection)}>
                <SelectTrigger id="swing-direction" data-testid="select-swing-direction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {doorSwingDirections.map((d) => (
                    <SelectItem key={d} value={d}>
                      {swingDirectionLabels[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="has-frame">Include Frame</Label>
            <Switch
              id="has-frame"
              checked={hasFrame}
              onCheckedChange={setHasFrame}
              data-testid="switch-has-frame"
            />
          </div>

          <div className="grid gap-2">
            <Label>Opening Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {RAL_COLORS.slice(0, 10).map((c) => {
                const isSelected = color === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setColor(c.code)}
                    className={`w-full aspect-square rounded-md border-2 transition-all ${
                      isSelected ? 'border-[#F7941D] ring-2 ring-[#F7941D]/30' : 'border-transparent hover:border-muted-foreground/50'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                    data-testid={`color-option-${c.code.replace(/\s+/g, '-')}`}
                  />
                );
              })}
            </div>
          </div>

          {hasFrame && (
            <div className="grid gap-2">
              <Label>Frame Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {RAL_COLORS.slice(0, 10).map((c) => {
                  const isSelected = frameColor === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setFrameColor(c.code)}
                      className={`w-full aspect-square rounded-md border-2 transition-all ${
                        isSelected ? 'border-[#F7941D] ring-2 ring-[#F7941D]/30' : 'border-transparent hover:border-muted-foreground/50'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                      data-testid={`frame-color-option-${c.code.replace(/\s+/g, '-')}`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-opening">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-[#F7941D] hover:bg-[#e8850f]"
            data-testid="button-add-opening"
          >
            <Grid2x2 className="h-4 w-4 mr-2" />
            Add Opening
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
