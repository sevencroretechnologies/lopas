# Design Guidelines: PEB 3D Building Configurator

## Design Approach
**Selected Approach:** Design System with Industrial B2B Customization

This is a professional-grade configurator tool requiring **precision, clarity, and efficiency**. Draw inspiration from enterprise design systems (Material Design, Fluent) while adapting for industrial/construction industry expectations. Prioritize **functional clarity over decorative elements** - the 3D viewport is the visual hero.

---

## Layout System

### Desktop-First Three-Column Layout
```
[Left Nav: 280px fixed] [3D Viewport: flex-grow] [Right Sidebar: 320px fixed]
```

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm
- Panel padding: `p-6` (24px)
- Section spacing: `space-y-6` between form groups
- Input groups: `space-y-4` between fields
- Tight spacing: `gap-2` for related elements (labels, buttons)
- Generous spacing: `gap-8` between major sections

**Layout Constraints:**
- Minimum viewport width: 1280px (configurator is desktop-only)
- Left navigation: Fixed width, full height, scrollable content
- Right sidebar: Fixed width, collapsible sections with smooth transitions
- 3D viewport: Fills remaining space, maintains aspect ratio

---

## Typography Hierarchy

**Font Stack:** System fonts for performance and professionalism
- Primary: `font-sans` (Inter or system-ui fallback)
- Monospace: `font-mono` for dimension values and technical data

**Type Scale:**
- **Panel Headers (H2):** `text-lg font-semibold` - Left nav section titles
- **Section Headers (H3):** `text-base font-semibold` - Form subsections
- **Form Labels:** `text-sm font-medium` - Input field labels
- **Body Text:** `text-sm` - Descriptions, help text
- **Button Text:** `text-sm font-medium` - All action buttons
- **Dimension Labels:** `text-xs font-mono` - 3D annotations, measurements
- **Small Print:** `text-xs` - Validation messages, hints

**Text Treatment:**
- High contrast for readability (avoid gray text on white below 4.5:1 ratio)
- All caps for category labels: `uppercase tracking-wide text-xs`
- Tabular numbers: `font-mono` for any numerical inputs/displays

---

## Component Architecture

### Left Navigation Panel (7 Sections)
- **Accordion-style sections** with expand/collapse animation
- Active section: Expanded with highlighted state
- Each section header: Full-width clickable with chevron icon (right-aligned)
- Section content: Form fields with consistent vertical spacing `space-y-4`
- Sticky panel headers when scrolling within long forms

### 3D Viewport (Center Canvas)
- Full viewport height minus header
- Ground plane grid with subtle lines
- Dimension annotations: Small labels with leader lines
- Interactive circular buttons: Floating on building surfaces with subtle shadow
- Axis indicator: Fixed bottom-left (X/Y/Z arrows with labels)
- Orientation cube: Fixed bottom-right (clickable faces)

### Right Sidebar (Toggles & Controls)
**Two collapsible sections:**

1. **Visualization Controls** (Top)
   - Toggle switches for Edges/Faces
   - Clean on/off states with immediate visual feedback

2. **Component Visibility** (Bottom)
   - Checkboxes in two-column grid (`grid-cols-2 gap-2`)
   - Compact spacing to fit 15+ options
   - Grouped by type with subtle dividers

### Top Control Bar
**Right-aligned button group:**
- View mode buttons (6 views): Icon buttons in horizontal row `gap-1`
- Action buttons (Undo/Redo/Help/Save/Share): Separated with `gap-4`
- Consistent button sizing: `h-10 w-10` for icon buttons

---

## Form Components

### Input Fields
- Standard height: `h-10` for text inputs, selects, number spinners
- Label above input: `space-y-1` between label and field
- Full-width inputs within panels: `w-full`
- Number inputs: Right-aligned text `text-right` for dimensions
- Validation states: Border changes, inline error text below field

### Dropdown Selectors
- **Color Pickers:** Custom dropdown with color swatch previews
  - Swatch size: `h-6 w-10` rectangle showing color
  - Label next to swatch: Color name/code
  - Dropdown list: Grid of swatches `grid-cols-4 gap-2`
  
- **Standard Dropdowns:** Native select appearance with custom arrow icon
- Dropdown max-height: `max-h-60` with scroll for long lists

### Button Hierarchy
- **Primary Actions:** Solid fill, medium prominence (e.g., "Send Inquiry")
- **Secondary Actions:** Outlined style, lower prominence (e.g., "Cancel")
- **Icon Buttons:** Square, minimal (view controls, undo/redo)
- **Interactive 3D Buttons:** Circular, floating on canvas with subtle shadow/glow

### Form Layout Patterns
```
[Label]
[Input Field - Full Width]

[Label]          [Label]
[Input 50%]      [Input 50%]   (for related pairs like Width/Height)

[Label]
[Dropdown with Icon]
```

---

## Interactive 3D Elements

### On-Canvas Buttons
- Circular shape: `rounded-full`
- Size: 40px diameter minimum for clickability
- Semi-transparent backdrop with blur effect
- Icon-only (+ or configure icon)
- Hover state: Scale slightly larger `hover:scale-110`
- Position: Absolute on building face centers

### Dimension Annotations
- White text on semi-transparent dark background
- Leader lines: Thin strokes pointing to measurement endpoints
- Font: `font-mono text-xs`
- Always readable: Automatic repositioning to avoid overlap

---

## Responsive Behavior

**This is desktop-only application:**
- No mobile/tablet layouts needed
- Minimum width enforcement: Show message on screens <1280px
- Layout does not reflow - maintains three-column structure
- Sidebar panels may hide on smaller desktops (>1280px, <1440px) with toggle buttons

---

## Visual Feedback & Micro-interactions

- **Form changes:** Immediate 3D model updates (debounced 300ms)
- **Loading states:** Subtle spinner overlay on 3D viewport during heavy calculations
- **Hover states:** All clickable elements have clear hover indication
- **Focus states:** Keyboard navigation with visible focus rings
- **Tooltips:** On complex controls, position near element with `z-50`
- **Transitions:** Use `transition-all duration-200` for smooth state changes
- **Disabled states:** Reduced opacity `opacity-50` with cursor-not-allowed

---

## Special Considerations

### Professional Industrial Aesthetic
- Clean, minimal interface - let 3D model be the focal point
- High information density without clutter
- Precise alignment and consistent spacing throughout
- Professional language in all labels (no casual tone)

### Accessibility
- Keyboard navigation for all form controls
- Focus management when switching between panels
- ARIA labels for icon-only buttons
- Sufficient contrast ratios (WCAG AA minimum)
- Form validation with clear error messaging

### Performance
- Optimize 3D rendering: Limit draw calls, use instanced meshes
- Debounce form inputs to prevent excessive re-renders
- Lazy load configuration panels (render only active section)
- Smooth 60fps viewport interaction

---

## No Images Required
This application is a functional configurator tool - no hero images, marketing imagery, or decorative graphics needed. The 3D viewport serves as the primary visual element. All visual interest comes from the interactive 3D building model itself.