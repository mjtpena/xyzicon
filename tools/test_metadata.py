import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest


spec = importlib.util.spec_from_file_location(
    "metadata", Path(__file__).resolve().parents[1] / "generate-metadata.py"
)
metadata = importlib.util.module_from_spec(spec)
spec.loader.exec_module(metadata)


class StencilRefreshTests(unittest.TestCase):
    def test_refresh_preserves_artwork_and_rejects_missing_alias_before_writing(self):
        cwd = Path.cwd()
        with tempfile.TemporaryDirectory() as directory:
            try:
                os.chdir(directory)
                for provider in ("azure", "aws", "gcp", "fabric", "entra",
                                 "microsoft365", "powerplatform", "dynamics365"):
                    folder = Path("wwwroot/icons") / provider
                    folder.mkdir(parents=True)
                    (folder / "one.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
                stencils = Path("wwwroot/stencils")
                stencils.mkdir()
                artwork = stencils / "drawing.svg"
                artwork.write_text("curated artwork")
                catalog = stencils / "catalog.json"
                catalog.write_text(json.dumps({"items": [{"sources": ["/icons/azure/one.svg"]}]}))
                metadata.main()
                before = Path("wwwroot/data/azure.json").read_bytes()
                self.assertEqual(artwork.read_text(), "curated artwork")
                catalog.write_text(json.dumps({"items": [{"sources": ["/icons/azure/missing.svg"]}]}))
                with self.assertRaisesRegex(ValueError, "Stencil aliases need review"):
                    metadata.main()
                self.assertEqual(Path("wwwroot/data/azure.json").read_bytes(), before)
                self.assertEqual(artwork.read_text(), "curated artwork")
            finally:
                os.chdir(cwd)


if __name__ == "__main__":
    unittest.main()
