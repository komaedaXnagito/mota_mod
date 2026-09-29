"""Run with: python -B tests/editor_images_server_test.py"""
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('editor_server', ROOT / 'server.py')
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)


class ImageDirectoryTest(unittest.TestCase):
    def test_recursive_paths_and_legacy_listing(self):
        os.chdir(ROOT)
        with tempfile.TemporaryDirectory(prefix='editor-images-python-', dir=ROOT / 'tmp') as folder:
            names = ['hero.png', 'a/hero.png', 'b/hero.png', 'a/deep/portrait.webp']
            for name in names:
                target = Path(folder) / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(name.encode())
            relative = Path(folder).relative_to(ROOT).as_posix()
            client = server.app.test_client()
            result = client.post('/listDirectoryRecursive', data='name=' + relative)
            self.assertEqual(result.status_code, 200)
            self.assertEqual(result.get_json(), sorted(names))
            flat = client.post('/listFile', data='name=' + relative)
            self.assertEqual(json.loads(flat.data), ['hero.png'])
            image = client.get('/' + relative + '/a/deep/portrait.webp')
            self.assertEqual(image.status_code, 200)
            self.assertEqual(image.content_type, 'image/webp')
            self.assertEqual(client.post('/listDirectoryRecursive', data='name=..').status_code, 403)


if __name__ == '__main__':
    unittest.main()
