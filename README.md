# Official Cloud Icons

CloudIcons is a Blazor WebAssembly application that lets you download official icons for Azure, AWS, and GCP in SVG and PNG formats. The app is now hosted as a static web application on GitHub Pages.

🌐 **Live Demo**: [https://mjtpena.github.io/cloudicons/](https://mjtpena.github.io/cloudicons/)

## Features

- Download official icons for Azure, AWS, and GCP
- Choose between SVG and PNG formats
- Browse icons easily with a user-friendly interface
- Search and filter icons by name
- Copy images to clipboard for quick use
- Fast loading with pre-generated metadata

## Icon Sources

The catalog is refreshed from official provider packages. The dates below describe the newest package/update published by each provider; some providers publish rolling downloads without version numbers.

| Provider | Official source | Package represented in this catalog |
| --- | --- | --- |
| AWS | [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/) | July 31, 2026 package |
| Azure | [Azure Architecture Icons](https://learn.microsoft.com/en-us/azure/architecture/icons/) | Version 25, November 2026 |
| Google Cloud | [Google Cloud Icon Library](https://cloud.google.com/icons) | Current core and category icons, plus the official legacy set (new iconography announced in 2025) |
| Microsoft Entra | [Entra architecture icons](https://learn.microsoft.com/en-us/entra/architecture/architecture-icons) | October 2023 package, the latest linked by Microsoft |
| Microsoft Fabric | [Fabric icons](https://learn.microsoft.com/en-us/fabric/fundamentals/icons) | Official Fabric samples package, version 6.1.0 |
| Microsoft 365 | [Microsoft 365 architecture icons](https://learn.microsoft.com/en-us/previous-versions/microsoft-365/solutions/architecture-icons-templates) | 2024 package, the latest linked by Microsoft |
| Power Platform | [Power Platform icons](https://learn.microsoft.com/en-us/power-platform/guidance/icons) | December 2025 update |
| Dynamics 365 | [Dynamics 365 icons](https://learn.microsoft.com/en-us/dynamics365/get-started/icons) | February 2026 update |

### Updating the icon catalog

Run `bash update-icons.sh` to download the official packages, validate and stage all eight provider sets, replace the local assets, and regenerate their metadata. The script requires `curl`, `unzip`, and Python 3 (`python3`, or `python` on Windows); it leaves the existing catalog untouched if a download, archive check, extraction, or metadata generation fails.

### Hand-drawn icon library

Choose **Hand-drawn** to browse independently composed service/concept illustrations across the provider collections. These are **unofficial conceptual illustrations**, not altered provider logos or approved brand assets. The original catalog remains unchanged. The library is incomplete: the app and review sheet report current coverage. SVG download, PNG download and copy use the selected style; hand-drawn exports have a `-hand-drawn` filename suffix.

Each concept has its own authored geometry in the `stencils/` artwork modules. Repeated source files and size/colour variants are explicit aliases, not additional drawings. There is no generic cloud fallback: concepts not yet drawn appear only in Original mode. Search, usage tracking and card identity use the full source path so same-named variants remain distinct.

The [review sheet](wwwroot/stencils/review.html) is available at `stencils/review.html` in the running app. It includes official references, 128/64/32px previews, blind review, source aliases, closest silhouette matches and per-drawing decisions. Filter by provider, decision or name, and use the page controls to work through the catalog; selecting a closest match opens its page. Download the full library or a provider's `.excalidrawlib` there and import it via Excalidraw's library menu. All components are editable native elements, grouped by concept, with no embedded raster images. SVG and library exports use the same geometry; their respective renderers can produce slightly different rough strokes.

```powershell
npm ci
npm run stencils
npm test
python -m unittest discover -s tools -p "test_*.py"
npm run stencils:check
```

**Source alias audit:** `npm run stencils:audit` rasterizes every mapped source SVG and
writes `alias-audit.json`. It fails immediately on unreadable or blank source/raster
output, and explicitly lists unsupported SVG constructs (transforms, `use`, defs,
clips, masks, or styles) that cannot support exact-geometry proof. Cross-composition
matches and normalized primitive differences are triage candidates only; they require
manual visual and semantic evidence before mapping changes. The report is not a claim
of exhaustive catalog review. `alias-audit.json` is generated and gitignored because it
becomes stale as source mappings and artwork change.

**Revision-bound visual review utility:** `npm run stencils:review-sheet -- <selection.json> <new-output-directory>`.
The selection JSON is an array such as `[{"id":"azure-download","semanticNeighbors":["azure-wac-installer"]}]`.
The utility renders mapped sources, 128/64/32 target previews, geometric neighbors and selected semantic neighbors,
and writes a manifest containing source, drawing, comparison and SVG revisions. It creates a new directory only and
records no approvals. Import the manifest decision manually, preserving all revision and 128/64/32 evidence.

**Lexical neighbor suggestions (developer triage only):** `npm run stencils:suggest-neighbors -- <drawing-id>...`.
This prints lexical/ID candidates only and explicitly warns that they are incomplete. It does not approve drawings,
prove semantic neighbor coverage, or satisfy the independent review gate.
Raster comparisons use fixed 64x64 alpha masks for transparent/light SVG artwork.
Sources with an explicit full-canvas opaque rect are reported as triage-only and
excluded from silhouette comparisons, avoiding solid-background rectangle artifacts.

**Raster overflow/nonblank triage (developer-only):** `npm run stencils:raster-check`.
It reports 32px blank previews and pixels outside the original 128 viewBox. It does not assess
recognizability, semantic correctness or independent visual approval.

**Review / repeat gate:** new drawings start pending review, not automatically approved. Review every drawing for recognizability without its caption, distinctness from its three closest matches, direction, clipping and small-size legibility. Mark **Needs rework** with specific notes or approve it. Browser decisions are local until exported and imported:

```powershell
npm run stencils:review -- C:\path\to\stencil-reviews.json
# Edit only the affected composition, regenerate, and review again.
npm run stencils
npm run stencils:check -- --approved
# When every official source entry is covered, check both coverage and approvals:
npm run stencils:check -- --approved --complete
```

Reviews persist in `stencils/reviews.json` and pair decisions in `stencils/pair-reviews.json`; both are revision-bound, so editing either drawing invalidates its pair decision. An approval also expires when its source variants, three closest matches or their revisions change. Older approvals without a comparison revision are retained as history but require a new visual review. Generation rejects duplicate normalized geometry (ignoring names, colours, seeds, translation and scale), missing/ambiguous aliases and invalid bounds. `qa.json` reports source-entry coverage per provider, ranks normalized monochrome outline similarity and flags pairs at 0.65 intersection-over-union. This is a triage heuristic, **not proof of uniqueness**. Compare each flagged pair and record why it is distinct or needs rework. The `--approved` gate fails while any drawing is unapproved or any flagged pair is unresolved; `--complete` separately fails while any source entry is unmapped. Both gates also run on `main` before deployment.

Generated SVGs, libraries, catalog and QA data are committed for static hosting; Node and Rough.js/Sharp are authoring dependencies only. The official refresh script does not regenerate or overwrite curated drawings, and rolls back if an existing alias disappears. After refresh, run `npm run stencils` and review any mapping changes; newly added variants are resolved from the explicit source-name allowlists, never fuzzy name matching.

Generated stencil files use LF line endings so the exact-output check also works on Windows. If an existing checkout converted them to CRLF before this rule was added, run `npm run stencils` once to restore the expected bytes.

## Getting Started

### Prerequisites

- .NET 8.0 or later
- Visual Studio 2019 or later (or VS Code)

### Installation

1. Clone the repo

```bash
git clone https://github.com/mjtpena/cloudicons.git
```

2. Navigate to the project directory
```bash
cd cloudicons
```

3. Restore dependencies
```bash
dotnet restore
```

4. Run the project
```bash
dotnet run
```

## Building for Production

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages. The deployment happens automatically when changes are pushed to the `main` branch via GitHub Actions.

#### Manual Build for GitHub Pages

To build the static files for GitHub Pages deployment manually:

```bash
dotnet publish -c Release -o ./dist
```

The output will be in `./dist/wwwroot/cloudicons/` with the correct base path configured for GitHub Pages subpath deployment.

#### Local Development

For local development, use:

```bash
dotnet run
```

This will start the development server at `https://localhost:5001` (or similar).

## Usage

1. Navigate to the live demo or run locally
2. Select an icon provider from the navigation menu (Azure, AWS, GCP, etc.)
3. Use the search box to find specific icons
4. Click "Download SVG" to download the vector format
5. Check "Download as PNG" and click the link to download as PNG
6. Right-click on any icon to copy it to clipboard

## Technology

- **Frontend**: Blazor WebAssembly (.NET 8)
- **Hosting**: GitHub Pages (Static)
- **Icons**: 5,419 official cloud service icon files
- **Build**: GitHub Actions for CI/CD

## Deployment

### GitHub Pages Deployment

The application is automatically deployed to GitHub Pages using GitHub Actions:

1. **Automatic Deployment**: Every push to the `main` branch triggers the deployment workflow
2. **Workflow**: The `.github/workflows/deploy.yml` workflow handles:
   - Building the .NET 8 Blazor WebAssembly application
   - Configuring the base path for GitHub Pages subpath (`/cloudicons/`)
   - Adding the `.nojekyll` file for proper asset serving
   - Deploying to GitHub Pages

### Manual Deployment Steps

If you need to deploy manually or troubleshoot:

1. Ensure the repository has GitHub Pages enabled in Settings → Pages
2. Set the source to "GitHub Actions"
3. The workflow will automatically handle deployment on push to `main`

### Local Testing of Production Build

To test the production build locally:

```bash
dotnet publish -c Release -o ./dist
# Serve the ./dist/wwwroot/cloudicons/ directory with a static file server
```

Note: The production build includes the `/cloudicons/` base path configuration for GitHub Pages.

## Contributing

Pull requests are welcome. Please open an issue first to discuss major changes.

## License

This project is licensed under the MIT License. See `LICENSE` for more details.

## Disclaimer

I don't own these icons - they belong to their respective cloud providers. This application simply redistributes them for your convenience in a user-friendly interface.

## Contact

Michael John Peña - michael.pena@playtimesolutions.com.au
Project Link: https://github.com/mjtpena/cloudicons
