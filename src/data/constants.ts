import { ToolItem, TaskItem, Settings } from '@/types/job';

export const ESSENTIAL_TOOLS: Omit<ToolItem, 'owned' | 'borrowed' | 'borrowedFrom'>[] = [
  { id: 'tape-measure', name: 'Tape measure', essential: true },
  { id: 'spirit-level', name: 'Spirit level', essential: true },
  { id: 'tile-cutter', name: 'Tile cutter', essential: true },
  { id: 'notched-trowel', name: 'Notched trowel', essential: true },
  { id: 'rubber-mallet', name: 'Rubber mallet', essential: true },
  { id: 'tile-spacers', name: 'Tile spacers', essential: true },
  { id: 'sponge-bucket', name: 'Sponge and bucket', essential: true },
  { id: 'mixing-paddle', name: 'Mixing paddle/drill', essential: true },
  { id: 'grout-float', name: 'Grout float', essential: true },
  { id: 'safety-glasses', name: 'Safety glasses', essential: true },
  { id: 'knee-pads', name: 'Knee pads', essential: true },
  { id: 'pencil-marker', name: 'Pencil/marker', essential: true },
];

export const TASK_WORKFLOW: Omit<TaskItem, 'completed' | 'timeSpent'>[] = [
  { id: 'prep-1', group: 'Preparation', label: 'Clear and clean the room', tip: 'Remove all furniture and loose debris. Sweep and vacuum thoroughly.' },
  { id: 'prep-2', group: 'Preparation', label: 'Check floor/wall is level', tip: 'Use a spirit level in multiple directions. Mark any high/low spots.' },
  { id: 'prep-3', group: 'Preparation', label: 'Measure and mark layout', tip: 'Find the center of the room and snap chalk lines for reference.' },
  { id: 'prep-4', group: 'Preparation', label: 'Check moisture levels if needed', tip: 'Use a moisture meter. Levels above 75% may need a waterproof membrane.' },
  { id: 'prep-5', group: 'Preparation', label: 'Plan tile layout (dry fit)', tip: 'Lay tiles without adhesive to check the pattern and minimize cuts.' },
  { id: 'surf-1', group: 'Surface Prep', label: 'Repair any cracks or damage', tip: 'Fill cracks with appropriate filler and let dry completely.' },
  { id: 'surf-2', group: 'Surface Prep', label: 'Prime surface if needed', tip: 'Use a suitable primer for porous surfaces to ensure good adhesion.' },
  { id: 'surf-3', group: 'Surface Prep', label: 'Ensure surface is clean and dry', tip: 'Wipe down with a damp cloth and allow to dry fully.' },
  { id: 'tile-1', group: 'Tiling', label: 'Mix adhesive (proper consistency)', tip: 'Follow manufacturer instructions. Should be like thick peanut butter.' },
  { id: 'tile-2', group: 'Tiling', label: 'Apply adhesive with notched trowel', tip: 'Spread evenly at 45° angle. Only cover an area you can tile in 15 min.' },
  { id: 'tile-3', group: 'Tiling', label: 'Lay first tile (reference point)', tip: 'Start from center lines. Press firmly and twist slightly for good contact.' },
  { id: 'tile-4', group: 'Tiling', label: 'Use spacers between tiles', tip: 'Insert spacers at each corner. Standard spacing is 2-3mm.' },
  { id: 'tile-5', group: 'Tiling', label: 'Check level frequently', tip: 'Check every 3-4 tiles. Tap down high tiles with rubber mallet.' },
  { id: 'tile-6', group: 'Tiling', label: 'Cut edge tiles as needed', tip: 'Measure each cut tile individually. Always wear safety glasses when cutting.' },
  { id: 'tile-7', group: 'Tiling', label: 'Allow adhesive to cure (24-48 hours)', tip: "Don't walk on floor tiles during curing. Keep the area ventilated." },
  { id: 'grout-1', group: 'Grouting', label: 'Remove tile spacers', tip: 'Carefully pry out spacers with a flat tool. Clean any adhesive from gaps.' },
  { id: 'grout-2', group: 'Grouting', label: 'Mix grout', tip: 'Mix to a smooth paste. Let it sit 5 min then remix (slaking).' },
  { id: 'grout-3', group: 'Grouting', label: 'Apply grout with rubber float', tip: 'Work diagonally across tiles at 45°. Push grout firmly into joints.' },
  { id: 'grout-4', group: 'Grouting', label: 'Clean excess grout (damp sponge)', tip: 'Wring sponge well. Wipe diagonally. Rinse frequently.' },
  { id: 'grout-5', group: 'Grouting', label: 'Allow grout to cure', tip: 'Wait at least 24 hours. Avoid getting the grout wet during curing.' },
  { id: 'grout-6', group: 'Grouting', label: 'Apply sealer if needed', tip: 'Use a grout sealer for wet areas. Apply with a small brush or applicator.' },
  { id: 'finish-1', group: 'Finishing', label: 'Final cleaning', tip: 'Buff tiles with a dry cloth to remove grout haze.' },
  { id: 'finish-2', group: 'Finishing', label: 'Remove protective materials', tip: 'Remove any tape, plastic sheeting, or cardboard protection.' },
  { id: 'finish-3', group: 'Finishing', label: 'Client walkthrough', tip: 'Walk through the job with the client. Note any concerns.' },
  { id: 'finish-4', group: 'Finishing', label: 'Take after photos', tip: 'Photograph from multiple angles. Include close-ups of detail work.' },
];

export const JOB_TYPES = [
  { value: 'full-house', label: 'Full House' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'single-room', label: 'Single Room' },
  { value: 'repair', label: 'Repair/Patch' },
] as const;

export const DEFAULT_SETTINGS: Settings = {
  hourlyRate: 25,
  defaultProfitMargin: 30,
  commonTileSizes: [30, 45, 60],
  businessName: '',
  measurementUnit: 'meters',
};

export const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
