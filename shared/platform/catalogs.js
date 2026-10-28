// Initial global master data catalogs (spec FR-014): Health & Safety from the business's master
// data workbook (012), the others from the source specs in specs/001-event-reporting/source/Control
// Panel/. Every value is owned by Central and Active.
// Shared code: imports no packages and nothing from apps/ (constitution v2.3.0).

const CREATED_AT = '2026-10-01T09:00:00.000Z';

function value(listId, index, fields) {
  return {
    id: `${listId}-${index + 1}`,
    listId,
    code: '',
    description: '',
    parentId: '',
    ownerLevel: 'central',
    ownerPlantIds: [],
    status: 'Active',
    createdBy: 'system',
    createdAt: CREATED_AT,
    updatedBy: 'system',
    updatedAt: CREATED_AT,
    ...fields,
  };
}

// The business's master data workbook (012): Standards and Hazards in its order, with codes
// STD-01… and HZ-01… given because both lists require codes.
const standards = [
  'Confined Spaces',
  'Fork Lift Trucks',
  'LockOut / TagOut (LO/TO)',
  'Machinery safety',
  'Mobile phones and smartphones',
  'Not related to a Group standard',
  'Road Risk Management',
  'Vehicles and Pedestrians',
  'Warehousing and Loading',
  'Working at height',
  'Assessment of Health & Safety risks',
  'Control of contractors',
].map((name, index) => value('standards', index, { code: `STD-${String(index + 1).padStart(2, '0')}`, name }));

const hazards = [
  'Acts of violence',
  'Contact with electricity or electrical discharge',
  'Contact with moving machinery',
  'Drowning or asphyxiation',
  'Exposure to an explosion',
  'Exposure to fire',
  'Exposure to, or contact with, a harmful substance',
  'Falls from a height',
  'Injured by an animal',
  'Injured while handling, lifting or carrying',
  'Other kind of accident',
  'Slips, trips or falls on same level',
  'Strike against something fixed or stationary',
  'Struck by moving vehicle',
  'Struck by moving, including flying / falling, object',
  'Trapped by something collapsing / overturning',
].map((name, index) => value('hazards', index, { code: `HZ-${String(index + 1).padStart(2, '0')}`, name }));

const bodyPartsByCategory = {
  Head: ['Cranium', 'Ear', 'Eyes', 'Nose', 'Teeth, Gingiva', 'Face (Other)', 'Cervical spine', 'Neck'],
  'Torso, organs and back': ['Back and spine', 'Abdomen', 'Pelvis'],
  'Thoracic cavity': ['Thorax'],
  'Upper limbs': [
    'Whole upper limb',
    'Shoulder',
    'Arm (Left)',
    'Arm (Right)',
    'Elbow',
    'Forearm (Left)',
    'Forearm (Right)',
    'Wrist',
  ],
  'Hands and Fingers': [
    'Hand, Palmar and dorsal side (Left)',
    'Hand, Palmar and dorsal side (Right)',
    'Fingers',
  ],
  'Lower limbs': [
    'Whole lower limb',
    'Hip',
    'Thigh (Left)',
    'Thigh (Right)',
    'Knee (Left)',
    'Knee (Right)',
    'Leg (Left)',
    'Leg (Right)',
    'Ankle (Left)',
    'Ankle (Right)',
  ],
  'Foot(s) and toe(s)': ['Foot (Left)', 'Foot (Right)', 'Toe(s)'],
  General: ['General'],
};

const bodyPartCategories = Object.keys(bodyPartsByCategory).map((name, index) =>
  value('bodyPartCategories', index, { name }),
);

const bodyParts = bodyPartCategories
  .flatMap((category) => bodyPartsByCategory[category.name].map((name) => ({ name, parentId: category.id })))
  .map((fields, index) => value('bodyParts', index, fields));

const injuries = [
  'Burn (1°/2° degree)',
  'Burn (3°/4° degree)',
  'Contusion, ecchymosis',
  'Dermatosis (skin infection)',
  'Fracture',
  'Bruise',
  'Cephalalgia',
  'Pain, sensory trouble',
  'Sting, bite',
  'Foreign matters presence',
  'Bleeding',
  'Tinnitus (buzzing)',
  'Hearing Loss',
  'Damage to the cornea',
  'Conjunctival irritation',
  'Temporary loss of sight',
  'Permanent loss of sight',
  'Amputation',
  'Paralysis',
  'Fracture with paralysis',
  'Pain (cervicalgia)',
  'Muscular tear or sprain',
  'Pain (back, lumbago)',
  'Hernia',
  'Internal Injuries (liver, spleen, kidney)',
  'Inguinal hernia',
  'Internal Injuries (urinary, genital)',
  'Inhalation, foreign body',
  'Dislocation',
  'Avulsion',
  'Drowning',
  'Malaise, dizziness, loss of consciousness',
  'Asphyxia, breathing difficulty',
  'Intoxication',
  'Heat stroke',
  'Electrical shock',
  'Allergic shock',
  'Other',
];

// The injuries offered for each body part, from the workbook (012 MD-4).
const injuriesByBodyPart = {
  'Cranium': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Fracture', 'Bruise', 'Cephalalgia', 'Other'],
  'Ear': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Sting, bite', 'Bruise', 'Foreign matters presence', 'Bleeding', 'Tinnitus (buzzing)', 'Hearing Loss', 'Other'],
  'Eyes': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Pain, sensory trouble', 'Sting, bite', 'Bruise', 'Damage to the cornea', 'Foreign matters presence', 'Conjunctival irritation', 'Temporary loss of sight', 'Permanent loss of sight', 'Other'],
  'Nose': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Foreign matters presence', 'Bleeding', 'Other'],
  'Teeth, Gingiva': ['Pain, sensory trouble', 'Fracture', 'Bruise', 'Bleeding', 'Other', 'Amputation'],
  'Face (Other)': ['Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Bruise', 'Bleeding', 'Paralysis', 'Other'],
  'Cervical spine': ['Contusion, ecchymosis', 'Fracture', 'Sting, bite', 'Bruise', 'Fracture with paralysis', 'Pain (cervicalgia)', 'Other'],
  'Neck': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Other'],
  'Back and spine': ['Contusion, ecchymosis', 'Fracture', 'Sting, bite', 'Bruise', 'Pain (back, lumbago)', 'Fracture with paralysis', 'Other'],
  'Abdomen': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Muscular tear or sprain', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Sting, bite', 'Bruise', 'Hernia', 'Internal Injuries (liver, spleen, kidney)', 'Other'],
  'Pelvis': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Muscular tear or sprain', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Inguinal hernia', 'Internal Injuries (urinary, genital)', 'Other'],
  'Thorax': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Muscular tear or sprain', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Inhalation, foreign body', 'Sting, bite', 'Bruise', 'Other'],
  'Whole upper limb': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Muscular tear or sprain', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Amputation', 'Other'],
  'Shoulder': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Muscular tear or sprain', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Dislocation', 'Other'],
  'Arm (Left)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Muscular tear or sprain', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Amputation', 'Other'],
  'Arm (Right)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Muscular tear or sprain', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Amputation', 'Other'],
  'Elbow': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Muscular tear or sprain', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Dislocation', 'Other'],
  'Forearm (Left)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Amputation', 'Other'],
  'Forearm (Right)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Amputation', 'Other'],
  'Wrist': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Dislocation', 'Other'],
  'Hand, Palmar and dorsal side (Left)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Amputation', 'Paralysis', 'Avulsion', 'Other'],
  'Hand, Palmar and dorsal side (Right)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Amputation', 'Paralysis', 'Avulsion', 'Other'],
  'Fingers': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Amputation', 'Paralysis', 'Avulsion', 'Other'],
  'Whole lower limb': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Amputation', 'Other'],
  'Hip': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Dislocation', 'Other'],
  'Thigh (Left)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Amputation', 'Other'],
  'Thigh (Right)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Amputation', 'Other'],
  'Knee (Left)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Dislocation', 'Other'],
  'Knee (Right)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Dislocation', 'Other'],
  'Leg (Left)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Amputation', 'Other'],
  'Leg (Right)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Amputation', 'Other'],
  'Ankle (Left)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Dislocation', 'Other'],
  'Ankle (Right)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Dislocation', 'Other'],
  'Foot (Left)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Amputation', 'Paralysis', 'Avulsion', 'Other'],
  'Foot (Right)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Amputation', 'Paralysis', 'Avulsion', 'Other'],
  'Toe(s)': ['Burn (1°/2° degree)', 'Burn (3°/4° degree)', 'Contusion, ecchymosis', 'Dermatosis (skin infection)', 'Pain, sensory trouble', 'Fracture', 'Sting, bite', 'Bruise', 'Bleeding', 'Muscular tear or sprain', 'Amputation', 'Paralysis', 'Avulsion', 'Other'],
  'General': ['Drowning', 'Malaise, dizziness, loss of consciousness', 'Asphyxia, breathing difficulty', 'Intoxication', 'Heat stroke', 'Electrical shock', 'Allergic shock'],
};

const injuryValues = injuries.map((name, index) =>
  value('injuries', index, {
    name,
    bodyPartIds: bodyParts.filter((part) => injuriesByBodyPart[part.name]?.includes(name)).map((part) => part.id),
  }),
);

// Health & Safety diseases, from the workbook (typos fixed); used by the form later (012 MD-1).
const diseases = [
  'Bone, articular and peri-articular pathology of lower limbs',
  'Bone, articular and peri-articular pathology of upper limbs',
  'Broncho-pulmonary and pleural pathology',
  'Cardiac and vascular pathology',
  'Cutaneous and mucosal pathology',
  'Digestive and liver pathology',
  'Lumbar pathology',
  'Neurological pathology',
  'Parasitic and infectious pathology, non dermal',
  'Pathology of blood and bloodforming organs',
  'Pathology of head and neck',
  'Pathology of hearing',
  'Pathology of oral and upper respiratory tract (other than lung)',
  'Pathology of the eye',
  'Psychological pathology',
  'Renal and vesical pathology',
  'Other',
].map((name, index) => value('diseases', index, { name }));

const aspects = [
  ['Water withdrawal/consumption', 'Process water, cooling water, domestic water, and leaks.'],
  ['Energy consumption', 'Use of electricity, natural gas, diesel, steam, coal, etc.'],
  ['Water discharge', 'Release of trade effluents, sanitary wastewater, rainwater runoff.'],
  ['Raw material consumption', 'Sand, gypsum, paper, chemicals, packaging, additives.'],
  ['Waste / Other Production Residue generation', 'Scrap materials, chemical wastes, office sorting, packaging residues.'],
  ['Spill, leak', 'Accidental releases of oils, chemicals, solvents, wastewater on ground or into water.'],
  ['Land use & visual integration', 'Site footprint, landscape integration, biodiversity zoning.'],
  ['Air emissions', 'Channelled or diffuse emissions of dust, SOx, NOx, CO, VOCs.'],
  ['Biodiversity', 'Impact on local plant/animal habitats.'],
  ['Noise', 'Sound emissions from fans, chimneys, shipping, grinding, production lines.'],
  ['Smell / odour', 'Sensory nuisances from processing or biological waste digestion.'],
  ['Vibrations', 'Secondary mechanical impacts on surrounding soils or properties.'],
  ['Light', 'Nighttime operation lighting affecting neighbors or fauna.'],
  ['Related to transport', 'Deliveries, shipping of goods, employee commuting.'],
  ['Related to the end of life', 'Reusability or final disposal of products.'],
].map(([name, description], index) => value('aspects', index, { name, description }));

const impacts = [
  'Non hazardous waste',
  'Hazardous waste',
  'Water pollution',
  'Depletion of water resources',
  'Depletion of Energy resources',
  'Nuisance (visual, odour, noise, etc.)',
  'Air pollution / climate change',
  'Impact of transport',
  'Impact of the end of life of the product',
  'Resource depletion (raw material)',
  'Resource / utility inefficiency',
  'Biodiversity',
  'Soil / land pollution',
].map((name, index) => value('impacts', index, { name }));

// "IRC1 - Fire" → code IRC1, name "Fire".
function coded(listId, lines) {
  return lines.map((line, index) => {
    const [code, ...rest] = line.split(' - ');
    return value(listId, index, { code, name: rest.join(' - ') });
  });
}

const irCategories = coded('irCategories', [
  'IRC1 - Fire',
  'IRC2 - Explosion',
  'IRC3 - Machinery breakdown / critical equipment failure',
  'IRC4 - Structural failure or collapse',
  'IRC5 - Loss of utilities (power, gas, water, steam, compressed air, IT/OT)',
  'IRC6 - Hazardous material release / uncontrolled reaction',
  'IRC7 - Natural hazard (flood, storm, earthquake, lightning, snow load, extreme temperature)',
  'IRC8 - Business interruption / supply chain disruption',
  'IRC9 - Logistics and internal/external transport incident',
  'IRC10 - Security event (intrusion, theft, sabotage, malicious act)',
  'IRC11 - Other industrial risk',
]);

export const masterValues = [
  ...standards,
  ...hazards,
  ...bodyPartCategories,
  ...bodyParts,
  ...injuryValues,
  ...diseases,
  ...aspects,
  ...impacts,
  ...irCategories,
];
