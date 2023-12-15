import os
import sys
from pathlib import Path

cwd = Path(__file__).parent.parent
sys.path.append(os.fspath(cwd))

import unittest
from auwpy import auw_cloud


class TestCase(unittest.TestCase):
    def test_get_droplets(self):
        rv = auw_cloud.get_droplets()
        self.assertIsNotNone(rv)

    def test_get_primary_droplet_id(self):
        rv = auw_cloud.get_primary_droplet_id()
        self.assertIsNotNone(rv)

    def test_get_snapshot_name(self):
        rv = auw_cloud.get_snapshot_name()
        self.assertIsNotNone(rv)

    def test_create_snapshot(self):
        rv = auw_cloud.create_snapshot()
        self.assertIsNotNone(rv)

    def test_get_latest_snapshot(self):
        rv = auw_cloud.get_latest_snapshot()
        self.assertIsNotNone(rv)

    def test_transfer_snapshot(self):
        rv = auw_cloud.transfer_snapshot()
        self.assertIsNotNone(rv)

    def test_delete_snapshot(self):
        rv = auw_cloud.delete_snapshot(1)
        self.assertIsNotNone(rv)

    def test_create_droplet_from_snapshot(self):
        rv = auw_cloud.create_droplet_from_snapshot()
        self.assertIsNotNone(rv)

    def test_create_and_process_snapshot(self):
        rv = auw_cloud.create_and_process_snapshot()
        self.assertIsNotNone(rv)
