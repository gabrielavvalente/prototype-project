# Feature 037: Aspect and Impact Master Data

## Goal

Provide the standard catalogs of Environmental Aspects and Environmental Impacts, and their validated associations, so that environmental events and risk assessments are classified consistently across all sites.

## Why

Environmental impacts can affect air quality, water resources, soil quality, biodiversity and ecosystems, climate, human health and well-being, and natural resources; they may be direct or indirect, positive or negative. A shared the organization catalog — based on the official enterprise EHS methodology Environmental Risk Assessment Method 2 template — is required so that every plant uses the same aspect and impact values instead of local ad-hoc lists.

## Platform context

- Modules involved: Event Reporting (Environmental events) and the Risk Assessment tool (consumers); Environment pillar control panel (configuration).
- Platform contracts reused: governed multi-level master data model, pillar-based access assignment, and consumption interface of Feature 030. Environmental Aspects and Environmental Impacts are two master data categories of the **Environment pillar**.
- Source methodology: enterprise EHS methodology Environmental Risk Assessment Method 2 / environmental assessment methodology template (catalog origin).

### Reference data — Master List: Environmental Aspects

Elements of an organization's activities, products, or services that can interact with the environment:

- **Water withdrawal/consumption**: Process water, cooling water, domestic water, and leaks.
- **Energy consumption**: Use of electricity, natural gas, diesel, steam, coal, etc.
- **Water discharge**: Release of trade effluents, sanitary wastewater, rainwater runoff.
- **Raw material consumption**: Sand, gypsum, paper, chemicals, packaging, additives.
- **Waste / Other Production Residue generation**: Scrap materials, chemical wastes, office sorting, packaging residues.
- **Spill, leak**: Accidental releases of oils, chemicals, solvents, wastewater on ground or into water.
- **Land use & visual integration**: Site footprint, landscape integration, biodiversity zoning.
- **Air emissions**: Channelled or diffuse emissions of dust, SOx, NOx, CO, VOCs.
- **Biodiversity**: Impact on local plant/animal habitats.
- **Noise**: Sound emissions from fans, chimneys, shipping, grinding, production lines.
- **Smell / odour**: Sensory nuisances from processing or biological waste digestion.
- **Vibrations**: Secondary mechanical impacts on surrounding soils or properties.
- **Light**: Nighttime operation lighting affecting neighbors or fauna.
- **Related to transport**: Deliveries, shipping of goods, employee commuting.
- **Related to the end of life**: Reusability or final disposal of products.

### Reference data — Master List: Environmental Impacts

Modifications to the environment, whether adverse or beneficial, resulting from environmental aspects:

- **Non hazardous waste**
- **Hazardous waste**
- **Water pollution**
- **Depletion of water resources**
- **Depletion of Energy resources**
- **Nuisance (visual, odour, noise, etc.)**
- **Air pollution / climate change**
- **Impact of transport** (including impact on air emissions and energy depletion)
- **Impact of the end of life of the product**
- **Resource depletion (raw material)**
- **Resource / utility inefficiency**
- **Biodiversity**
- **Soil / land pollution**

### Reference data — Standard Aspect → Impact Association Matrix

Standard validated mappings from actual the organization plant assessments (environmental assessment methodology methodology) linking aspects to logical environmental impacts:

| Environmental Aspect (Cause) | Environmental Impact (Effect) | Practical Context / Examples |
| :--- | :--- | :--- |
| **Energy consumption** | Depletion of Energy resources | Use of natural gas, fuel oil, or coal for furnace heating. |
| **Energy consumption** | Resource / utility inefficiency | Use of green electricity or high-efficiency cogeneration power. |
| **Water withdrawal/consumption** | Depletion of water resources | Process water extraction from wells, municipal network usage. |
| **Water discharge** | Water pollution | Discharge of treated scrubber water or sanitary effluents. |
| **Raw material consumption** | Resource depletion (raw material) | Consumption of sand, gypsum, industrial mineral additive, paper liner, etc. |
| **Waste / other production residue generation** | Hazardous waste | Scrap glue, spent lubricants, oily rags, chemical sludge. |
| **Waste / other production residue generation** | Non hazardous waste | Scrap glass, paper clippings, wood pallets, general municipal waste. |
| **Spill, leak** | Soil / land pollution | Chemical container breakages, forklift oil drips on unpaved soils. |
| **Spill, leak** | Water pollution | Chemical spills entering rainwater storm drains or direct water bodies. |
| **Air emissions** | Air pollution / climate change | Stack emissions of fine particulate matter, VOCs, heat, or GHGs. |
| **Related to transport** | Impact of transport | Logistics, product shipping by truck, sea cargo, or heavy rail. |
| **Related to the end of life** | Impact of the end of life of the product | Manufacturing recyclable glass versus composite multi-layer panels. |


### Reference data — environmental assessment methodology Severity Scoring Scales (Including Receptor Sensitivity)

| Score | Severity Level | Environmental Context | Nuisance & Reputation Context | Logistics & Transport Context |
| :---: | :--- | :--- | :--- | :--- |
| **10** | **Major** (EvE1) | Major damage to a highly sensitive receptor; Serious Impact Potential (**HPR**) event; very excessive untreated discharge limit breaches. | International media impact; damage to global brand or corporate reputation. | Product/Raw materials mostly transported by airplane. |
| **8** | **Significant** (EvE2) | Significant damage; requires external intervention to recover; frequent parameter breaches. | Stakeholder complaints at National or Regional level; regional reputation damage. | Product/Raw materials mostly transported by truck. |
| **6** | **Moderate** (EvE3) | Moderate damage; local recovery quick; minor parameters breach. | Stakeholder complaints affecting local or community-level reputation. | Product/Raw materials mostly transported by train. |
| **4** | **Minor** (EvE4) | Environment recovers quickly and easily; no obvious long-term impact. | Minor nuisance; Aspect could be better controlled or reduced. | Product/Raw materials mostly transported by cargo boat. |
| **2** | **Best Practice** (EvE5) | Fully controlled; best practice performance achieved; negligible footprint. | Scope of nuisance fully minimized; strong local stakeholder relations. | Transport powered by green electricity / clean renewable fuels. |

### Reference data — Environmental Impacts in an Office Environment

Even offices have distinct environmental configurations:

| Environmental Aspect | Environmental Impact | Key Measures |
|:---|:---|:---|
| Electricity consumption | Greenhouse gas emissions / Depletion | LED transitions, smart heating. |
| Paper use | Deforestation and waste generation | Virtualization, recycling policies. |
| Water consumption | Resource depletion | Flow-limiting aerators, leak checks. |
| Business travel | Carbon emissions | Teams meetings, public transit incentives. |
| Printing activities | Resource consumption and waste | Printing quotas, secure pull printing. |
| Electronic equipment | E-waste generation | Standardized life cycles, certified recyclers. |
| Air conditioning | Energy consumption and indirect emissions | Temperature threshold policies. |

## User stories

1. As an Environment pillar administrator (per the roles defined in Feature 030), I want the standard the organization Aspect and Impact catalogs available as governed master data so that all plants classify environmental events and risk assessments against the same lists.
2. As a module user reporting an Environmental event or performing a Risk Assessment, I want to select the applicable Environmental Aspect and its associated Environmental Impact from the standard catalogs so that classification is consistent and reportable across sites.

## Scope

- IN:
  - The standard Environmental Aspects master list (15 values) and Environmental Impacts master list (13 values) as Environment pillar master data.
  - The standard Aspect → Impact association matrix (validated environmental assessment methodology mappings) as reference data linking the two catalogs.
  - Consumption by Event Reporting (Environmental events) and Risk Assessment through the Feature 030 consumption model.
- OUT:
  - The environmental risk assessment workflow itself (scoring, prioritization, action planning) — the environmental assessment methodology scoring scales are reproduced here as source-methodology reference only.
  - Governance, access control, and lifecycle rules beyond the common Feature 030 model — no aspect/impact-specific deviations are defined yet (see Open questions).

## Functional requirements (EARS)

- FR-1: WHEN the Environment pillar control panel is initialized THEN the system SHALL provide the standard Environmental Aspects master list and Environmental Impacts master list ) as the global catalogs of the Environment pillar.
- FR-2: WHEN a user classifies an Environmental event or a risk assessment line THEN the system SHALL offer the Environmental Aspect and Environmental Impact values from these governed catalogs, filtered per the Feature 030 consumption rules (active values, user scope, module and pillar context).
- FR-3: WHEN an Environmental Aspect is selected THEN the system SHALL make available the standard Aspect → Impact associations of the validated matrix so that the impact chosen is consistent with the aspect (cause → effect).
- FR-4: WHEN aspect or impact values are used in records THEN the system SHALL characterize impacts per the source model as direct or indirect and positive or negative, where the record requires it.

## Non-functional requirements

- Reporting consistency: catalog values remain aligned with the enterprise EHS methodology / environmental assessment methodology source methodology so that plant assessments and consolidated environmental reporting use the same taxonomy.

## Acceptance criteria (testable)

- [ ] Given the Environment pillar control panel, when an administrator opens the Environmental Aspects and Environmental Impacts categories, then the standard master lists above are present as the global catalogs.
- [ ] Given a user reporting an Environmental event, when they classify it, then the aspect and impact pickers offer the governed catalog values applicable to their site and scope.
- [ ] Given a user who selected the aspect "Spill, leak", when they choose the impact, then the standard associated impacts ("Soil / land pollution", "Water pollution") are available per the association matrix.

## Dependencies

- Follows the governed multi-level model defined in Feature 030: Master Data Control Panel ([master-data-control.md](master-data-control.md)) — Environmental Aspects and Environmental Impacts are Environment pillar categories consumed by Event Reporting (Environmental events) and Risk Assessment.
- Downstream consumers: Environment Event reporting (Feature 024) and the Risk Assessment tool (link per Feature 030).

## Open questions

- [OPEN]: This source is a catalog only — governance by level, access control, validation rules, and lifecycle specific to Aspects & Impacts are not yet defined at the depth of the Hazard/Standard/Body Part/Injury specifications (also flagged in Feature 030); confirm whether the common Feature 030 model applies unchanged (including whether extensions or local activation are allowed for these catalogs).
- [OPEN]: Confirm whether the Aspect → Impact association matrix is enforced (only associated impacts selectable) or advisory (suggested but overridable).
- [OPEN]: Confirm whether the environmental assessment methodology Probability/Frequency and Severity scoring scales belong to this master data or to the Risk Assessment tool configuration — they are kept here as source-methodology reference.
- [OPEN]: Confirm whether the "Office Environment" aspect/impact table extends the master catalogs (some values, e.g. "Electricity consumption", "Paper use", are not in the standard lists) or is illustrative only.
- [OPEN]: Aspect and impact values have no codes or identifiers in the source; confirm reporting codes per Feature 030 requirements.
