# Premium UI Pass 2 — Menu review checklist

This pass makes the first visible screen of each major menu calmer while keeping deeper systems available. It does not remove game mechanics, change progress, or modify the save schema.

## In this PR
- **Home:** maintain Flight, Development, Pioneer and Exploration as primary destinations; place Records and Help in a clearly labeled expandable section.
- **Worlds:** keep world list, targeting, scanning and upgrade controls visible; move World History and detailed surveys behind separate descriptive disclosures.
- **Cargo:** show balances and the collection action immediately, while colony-by-colony production detail expands on demand.
- **Upgrades:** use the existing two-tab structure as the primary navigation; remove four repeated technical badges, and place ship renaming in settings.
- **Appearance:** show current equipped ship, Pioneer and trail visuals first; expand larger starship/Pioneer and fleet design catalogs as needed.
- **Operations:** tabs lead directly into their content without duplicating sector, target and modifier information above every section.
- **Pioneer:** retain the simplified command page from PR #35 and all its specialist decks.
- **Visual rhythm:** unify mobile card headings, spacing, secondary text, minimum control size, disclosure indicators and keyboard focus.

## Next review on iPhone
1. At 390×844, open each main menu and locate its primary action without scrolling through a numeric dashboard.
2. Confirm every expandable section opens and all old actions inside it work.
3. Review Crew, Fleet, Vault, Expedition and Cosmetic screens for actual visual density, accessibility and performance.
4. Test Home-to-Pioneer-to-Fleet-to-Home navigation, including background/resume and safe-area clearance.
5. Validate status, locked/missing-resource messages and mission rewards are still understandable.

Passing automated checks proves content and action retention; **this is not an on-device visual certification**. The next pass is procedural-system visual differentiation.
