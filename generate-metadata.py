#!/usr/bin/env python3
"""Generate icon metadata JSON files from icon directories."""

import os
import json
from pathlib import Path

def generate_metadata(provider_name, directory):
    """Generate metadata for a provider."""
    icons = []
    
    if os.path.isdir(directory):
        for root, dirs, files in os.walk(directory):
            dirs[:] = sorted(
                directory_name
                for directory_name in dirs
                if not directory_name.startswith(".") and directory_name != "__MACOSX"
            )
            for file in sorted(files):
                if not file.startswith(".") and file.lower().endswith('.svg'):
                    full_path = os.path.join(root, file)
                    # Make path relative to wwwroot
                    rel_path = os.path.relpath(full_path, "wwwroot").replace(os.sep, "/")
                    
                    icons.append({
                        "name": os.path.splitext(file)[0],
                        "path": f"/{rel_path}",
                        "fileName": file
                    })
    
    if not icons:
        raise ValueError(f"No SVG icons found for {provider_name} in {directory}")

    return {
        "Category": provider_name.capitalize(),
        "Count": len(icons),
        "Icons": icons
    }

def main():
    """Generate metadata for all providers."""
    providers = {
        'azure': 'wwwroot/icons/azure',
        'aws': 'wwwroot/icons/aws',
        'gcp': 'wwwroot/icons/gcp',
        'fabric': 'wwwroot/icons/fabric',
        'microsoft365': 'wwwroot/icons/microsoft365',
        'powerplatform': 'wwwroot/icons/powerplatform',
        'dynamics365': 'wwwroot/icons/dynamics365',
        'entra': 'wwwroot/icons/entra'
    }

    os.makedirs('wwwroot/data', exist_ok=True)

    for provider, directory in providers.items():
        metadata = generate_metadata(provider, directory)
        output_file = f'wwwroot/data/{provider}.json'
        with open(output_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"Generated {output_file} with {metadata['Count']} icons")

if __name__ == '__main__':
    main()
