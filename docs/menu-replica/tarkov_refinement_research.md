# Tarkov refinement research — 2026-08-12

## Sources consulted

| Source | Relevance | Key implementation cue |
|---|---|---|
| [Saving Content interface screenshot archive](https://www.savingcontent.com/2016/04/22/interface-screenshots-released-for-escape-from-tarkov/) | Publishes official pre-release interface captures for the main menu, raid selection, character data, inventory and settings. | Character and inventory must use a dense dark grid, a gear silhouette and narrow system bars rather than broad portfolio cards. |
| [Markus Kuuranta, *Escape from Tarkov Menu UX Redesign*](https://www.heiolenmarkus.com/blog/escape-from-tarkov-menu-ux-redesign/) | Detailed visual/functional analysis of the original interface. | The Character experience is based on a 2D inventory grid; traders combine item lists/grids; orange is the interaction color; Hideout uses a 2.5D overhead base plus module controls. |
| [IGN, *Hideout Guide*](https://www.ign.com/wikis/escape-from-tarkov/Hideout_Guide) | Confirms the Hideout is a dark base with buildable modules and a bottom module list. | The replica Hideout should show a dark industrial environment, module tiles, construction levels and a clear power/fuel state. |

## Applied refinement brief

| Surface | Visual hierarchy | Functional response |
|---|---|---|
| Character | Thin global header; left equipment slots around a centered operator silhouette; right stash as a compact square grid; narrow health/status row. | Slot hover selects an equipment zone; stash cells and action buttons respond without leaving dead controls. |
| Trading | Top trader / buy-sell context; category rail; dense item rows with availability and price; small inventory grid. | A category selection changes the highlighted content; Buy/Sell control updates the call to action. |
| Hideout | Dark, smoky 2.5D shelter backdrop; central technical progress indicator; bottom module strip; fuel/power indicator. | Loading display resolves to an inspectable module view; power control and module tiles toggle/announce their states. |

The reference images are used for composition and interaction study only; no newly downloaded third-party game screenshot is being bundled into the site.
