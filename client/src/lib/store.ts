import { create } from 'zustand';
import { 
  BuildingConfig, 
  VisualizationSettings, 
  ViewMode,
  TemplateType,
  createDefaultBuildingConfig,
  createDefaultProject,
  createDefaultLeanTo,
  createDefaultMezzanine,
  createDefaultCanopy,
  createDefaultSkylight,
  createDefaultVentilator,
  createBaysFromPattern,
  Opening,
  Accessory,
  Project,
  LeanTo,
  Mezzanine,
  Canopy,
  Skylight,
  Ventilator,
  Bay,
  WallPosition,
  VentilationType,
  CraneConfig,
  InsulationConfig,
  PanelConfig,
  generateId,
} from '@shared/schema';

interface ConfiguratorState {
  // Project with multiple buildings
  project: Project | null;
  
  // Currently selected building
  buildingConfig: BuildingConfig | null;
  selectedTemplate: TemplateType | null;
  
  // Active panel
  activePanel: string;
  
  // Visualization settings
  visualization: VisualizationSettings;
  
  // View mode
  viewMode: ViewMode;
  
  // History for undo/redo
  history: BuildingConfig[];
  historyIndex: number;
  
  // Project actions
  initializeProject: (name?: string) => void;
  setProjectName: (name: string) => void;
  
  // Building management
  addBuilding: (templateType: TemplateType, name?: string) => void;
  removeBuilding: (id: string) => void;
  selectBuilding: (id: string) => void;
  duplicateBuilding: (id: string) => void;
  
  // Building configuration actions
  setSelectedTemplate: (template: TemplateType) => void;
  initializeBuilding: (templateType: TemplateType) => void;
  updateDimensions: (updates: Partial<BuildingConfig['dimensions']>) => void;
  updateRoof: (updates: Partial<BuildingConfig['roof']>) => void;
  updateColors: (updates: Partial<BuildingConfig['colors']>) => void;
  updateFrameType: (frameType: string) => void;
  updateEndWallType: (endWallType: string) => void;
  
  // Bay management
  updateBays: (bays: Bay[]) => void;
  addBay: (width?: number) => void;
  removeBay: (id: string) => void;
  updateBayWidth: (id: string, width: number) => void;
  
  // Panel & Insulation
  updateWallPanelConfig: (config: Partial<PanelConfig>) => void;
  updateRoofPanelConfig: (config: Partial<PanelConfig>) => void;
  updateWallInsulation: (config: Partial<InsulationConfig>) => void;
  updateRoofInsulation: (config: Partial<InsulationConfig>) => void;
  
  // Crane
  updateCrane: (crane: Partial<CraneConfig>) => void;
  
  // Openings
  addOpening: (opening: Opening) => void;
  removeOpening: (id: string) => void;
  updateOpening: (id: string, updates: Partial<Opening>) => void;
  
  // Accessories
  addAccessory: (accessory: Accessory) => void;
  removeAccessory: (id: string) => void;
  
  // Lean-tos
  addLeanTo: (attachedTo: "left" | "right") => void;
  removeLeanTo: (id: string) => void;
  updateLeanTo: (id: string, updates: Partial<LeanTo>) => void;
  
  // Mezzanines
  addMezzanine: () => void;
  removeMezzanine: (id: string) => void;
  updateMezzanine: (id: string, updates: Partial<Mezzanine>) => void;
  
  // Canopies
  addCanopy: (wall: WallPosition) => void;
  removeCanopy: (id: string) => void;
  updateCanopy: (id: string, updates: Partial<Canopy>) => void;
  
  // Skylights
  addSkylight: () => void;
  removeSkylight: (id: string) => void;
  updateSkylight: (id: string, updates: Partial<Skylight>) => void;
  
  // Ventilators
  addVentilator: (type: VentilationType) => void;
  removeVentilator: (id: string) => void;
  
  // UI State
  setActivePanel: (panel: string) => void;
  setVisualization: (updates: Partial<VisualizationSettings>) => void;
  setViewMode: (mode: ViewMode) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  resetConfig: () => void;
}

const defaultVisualization: VisualizationSettings = {
  showEdges: true,
  showFaces: true,
  showPanels: true,
  showSolidWalls: true,
  showOpenings: true,
  showFrames: true,
  showPurlins: false,
  showGirts: false,
  showFlashing: true,
  showAccessories: true,
  showBasePlate: true,
  showDimensions: true,
  showButtons: true,
};

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  project: null,
  buildingConfig: null,
  selectedTemplate: null,
  activePanel: 'building',
  visualization: defaultVisualization,
  viewMode: '3D',
  history: [],
  historyIndex: -1,

  // Project actions
  initializeProject: (name = "New Project") => {
    const project = createDefaultProject(name);
    set({ project });
  },

  setProjectName: (name) => {
    const { project } = get();
    if (!project) return;
    set({ project: { ...project, name, updatedAt: new Date().toISOString() } });
  },

  // Building management
  addBuilding: (templateType, name) => {
    const { project } = get();
    if (!project) {
      const newProject = createDefaultProject();
      const building = createDefaultBuildingConfig(templateType, name);
      set({
        project: { ...newProject, buildings: [building], selectedBuildingId: building.id },
        buildingConfig: building,
        selectedTemplate: templateType,
      });
    } else {
      const building = createDefaultBuildingConfig(templateType, name);
      set({
        project: {
          ...project,
          buildings: [...project.buildings, building],
          selectedBuildingId: building.id,
          updatedAt: new Date().toISOString(),
        },
        buildingConfig: building,
        selectedTemplate: templateType,
      });
    }
  },

  removeBuilding: (id) => {
    const { project, buildingConfig } = get();
    if (!project) return;
    
    const newBuildings = project.buildings.filter(b => b.id !== id);
    const newSelected = buildingConfig?.id === id 
      ? newBuildings[0] || null 
      : buildingConfig;
    
    set({
      project: {
        ...project,
        buildings: newBuildings,
        selectedBuildingId: newSelected?.id,
        updatedAt: new Date().toISOString(),
      },
      buildingConfig: newSelected,
    });
  },

  selectBuilding: (id) => {
    const { project } = get();
    if (!project) return;
    
    const building = project.buildings.find(b => b.id === id);
    if (building) {
      set({
        project: { ...project, selectedBuildingId: id },
        buildingConfig: building,
        selectedTemplate: building.templateType,
      });
    }
  },

  duplicateBuilding: (id) => {
    const { project } = get();
    if (!project) return;
    
    const building = project.buildings.find(b => b.id === id);
    if (building) {
      const newBuilding = {
        ...JSON.parse(JSON.stringify(building)),
        id: generateId(),
        name: `${building.name || 'Building'} (Copy)`,
      };
      set({
        project: {
          ...project,
          buildings: [...project.buildings, newBuilding],
          selectedBuildingId: newBuilding.id,
          updatedAt: new Date().toISOString(),
        },
        buildingConfig: newBuilding,
      });
    }
  },

  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  initializeBuilding: (templateType) => {
    const config = createDefaultBuildingConfig(templateType);
    const { project } = get();
    
    if (project) {
      set({
        project: {
          ...project,
          buildings: [...project.buildings, config],
          selectedBuildingId: config.id,
          updatedAt: new Date().toISOString(),
        },
        buildingConfig: config,
        selectedTemplate: templateType,
        history: [config],
        historyIndex: 0,
      });
    } else {
      const newProject = createDefaultProject();
      set({ 
        project: {
          ...newProject,
          buildings: [config],
          selectedBuildingId: config.id,
        },
        buildingConfig: config,
        selectedTemplate: templateType,
        history: [config],
        historyIndex: 0,
      });
    }
  },

  updateDimensions: (updates) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    let newBays = buildingConfig.bays;
    if (updates.baysPattern && updates.baysPattern !== buildingConfig.dimensions.baysPattern) {
      newBays = createBaysFromPattern(updates.baysPattern);
    }
    
    const newConfig = {
      ...buildingConfig,
      dimensions: { ...buildingConfig.dimensions, ...updates },
      bays: newBays,
    };
    
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  updateRoof: (updates) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = {
      ...buildingConfig,
      roof: { ...buildingConfig.roof, ...updates },
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  updateColors: (updates) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = {
      ...buildingConfig,
      colors: { ...buildingConfig.colors, ...updates },
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  updateFrameType: (frameType) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = { ...buildingConfig, frameType };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  updateEndWallType: (endWallType) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = { ...buildingConfig, endWallType };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  // Bay management
  updateBays: (bays) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const totalLength = bays.reduce((sum, bay) => sum + bay.width, 0);
    const newConfig = {
      ...buildingConfig,
      bays,
      dimensions: {
        ...buildingConfig.dimensions,
        length: totalLength,
        baysPattern: `${bays.length}*${bays[0]?.width || 6}`,
      },
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  addBay: (width = 6) => {
    const { buildingConfig } = get();
    if (!buildingConfig) return;
    
    const newBay: Bay = {
      id: generateId(),
      width,
      index: (buildingConfig.bays?.length || 0),
    };
    const newBays = [...(buildingConfig.bays || []), newBay];
    get().updateBays(newBays);
  },

  removeBay: (id) => {
    const { buildingConfig } = get();
    if (!buildingConfig || !buildingConfig.bays) return;
    
    const newBays = buildingConfig.bays.filter(b => b.id !== id).map((b, i) => ({ ...b, index: i }));
    get().updateBays(newBays);
  },

  updateBayWidth: (id, width) => {
    const { buildingConfig } = get();
    if (!buildingConfig || !buildingConfig.bays) return;
    
    const newBays = buildingConfig.bays.map(b => b.id === id ? { ...b, width } : b);
    get().updateBays(newBays);
  },

  // Panel & Insulation
  updateWallPanelConfig: (config) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = {
      ...buildingConfig,
      wallPanelConfig: { ...buildingConfig.wallPanelConfig, ...config } as PanelConfig,
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
  },

  updateRoofPanelConfig: (config) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = {
      ...buildingConfig,
      roofPanelConfig: { ...buildingConfig.roofPanelConfig, ...config } as PanelConfig,
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
  },

  updateWallInsulation: (config) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = {
      ...buildingConfig,
      wallInsulation: { ...buildingConfig.wallInsulation, ...config } as InsulationConfig,
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
  },

  updateRoofInsulation: (config) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = {
      ...buildingConfig,
      roofInsulation: { ...buildingConfig.roofInsulation, ...config } as InsulationConfig,
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
  },

  // Crane
  updateCrane: (crane) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newCrane = crane.type === 'none' ? undefined : { 
      ...buildingConfig.crane, 
      ...crane,
      type: crane.type || buildingConfig.crane?.type || 'none',
      capacity: crane.capacity ?? buildingConfig.crane?.capacity ?? 0,
    } as CraneConfig;
    
    const newConfig = { ...buildingConfig, crane: newCrane };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  // Openings
  addOpening: (opening) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = { 
      ...buildingConfig, 
      openings: [...buildingConfig.openings, opening] 
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  removeOpening: (id) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = { 
      ...buildingConfig, 
      openings: buildingConfig.openings.filter(o => o.id !== id) 
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  updateOpening: (id, updates) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = {
      ...buildingConfig,
      openings: buildingConfig.openings.map(o => o.id === id ? { ...o, ...updates } : o),
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
  },

  // Accessories
  addAccessory: (accessory) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = { 
      ...buildingConfig, 
      accessories: [...buildingConfig.accessories, accessory] 
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  removeAccessory: (id) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = { 
      ...buildingConfig, 
      accessories: buildingConfig.accessories.filter(a => a.id !== id) 
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  // Lean-tos
  addLeanTo: (attachedTo) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const leanTo = createDefaultLeanTo(attachedTo);
    const newConfig = { 
      ...buildingConfig, 
      leanTos: [...(buildingConfig.leanTos || []), leanTo] 
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  removeLeanTo: (id) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = { 
      ...buildingConfig, 
      leanTos: (buildingConfig.leanTos || []).filter(l => l.id !== id) 
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  updateLeanTo: (id, updates) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = {
      ...buildingConfig,
      leanTos: (buildingConfig.leanTos || []).map(l => l.id === id ? { ...l, ...updates } : l),
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
  },

  // Mezzanines
  addMezzanine: () => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const mezzanine = createDefaultMezzanine();
    const newConfig = { 
      ...buildingConfig, 
      mezzanines: [...(buildingConfig.mezzanines || []), mezzanine] 
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  removeMezzanine: (id) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = { 
      ...buildingConfig, 
      mezzanines: (buildingConfig.mezzanines || []).filter(m => m.id !== id) 
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  updateMezzanine: (id, updates) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = {
      ...buildingConfig,
      mezzanines: (buildingConfig.mezzanines || []).map(m => m.id === id ? { ...m, ...updates } : m),
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
  },

  // Canopies
  addCanopy: (wall) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const canopy = createDefaultCanopy(wall);
    const newConfig = { 
      ...buildingConfig, 
      canopies: [...(buildingConfig.canopies || []), canopy] 
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  removeCanopy: (id) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = { 
      ...buildingConfig, 
      canopies: (buildingConfig.canopies || []).filter(c => c.id !== id) 
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  updateCanopy: (id, updates) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = {
      ...buildingConfig,
      canopies: (buildingConfig.canopies || []).map(c => c.id === id ? { ...c, ...updates } : c),
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
  },

  // Skylights
  addSkylight: () => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const skylight = createDefaultSkylight();
    const newConfig = { 
      ...buildingConfig, 
      skylights: [...(buildingConfig.skylights || []), skylight] 
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  removeSkylight: (id) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = { 
      ...buildingConfig, 
      skylights: (buildingConfig.skylights || []).filter(s => s.id !== id) 
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  updateSkylight: (id, updates) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = {
      ...buildingConfig,
      skylights: (buildingConfig.skylights || []).map(s => s.id === id ? { ...s, ...updates } : s),
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
  },

  // Ventilators
  addVentilator: (type) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const ventilator = createDefaultVentilator(type);
    const newConfig = { 
      ...buildingConfig, 
      ventilators: [...(buildingConfig.ventilators || []), ventilator] 
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  removeVentilator: (id) => {
    const { buildingConfig, project } = get();
    if (!buildingConfig || !project) return;
    
    const newConfig = { 
      ...buildingConfig, 
      ventilators: (buildingConfig.ventilators || []).filter(v => v.id !== id) 
    };
    const newBuildings = project.buildings.map(b => b.id === buildingConfig.id ? newConfig : b);
    set({ 
      buildingConfig: newConfig,
      project: { ...project, buildings: newBuildings, updatedAt: new Date().toISOString() },
    });
    get().saveToHistory();
  },

  // UI State
  setActivePanel: (panel) => set({ activePanel: panel }),

  setVisualization: (updates) => {
    set((state) => ({
      visualization: { ...state.visualization, ...updates },
    }));
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  // History
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({ 
        buildingConfig: history[historyIndex - 1],
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({ 
        buildingConfig: history[historyIndex + 1],
        historyIndex: historyIndex + 1,
      });
    }
  },

  saveToHistory: () => {
    const { buildingConfig, history, historyIndex } = get();
    if (!buildingConfig) return;
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(buildingConfig);
    
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    set({ 
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  resetConfig: () => {
    set({
      project: null,
      buildingConfig: null,
      selectedTemplate: null,
      history: [],
      historyIndex: -1,
    });
  },
}));
