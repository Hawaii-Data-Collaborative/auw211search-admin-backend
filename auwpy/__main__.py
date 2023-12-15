import argparse
from auwpy import auw_cloud

parser = argparse.ArgumentParser(description="CLI tool for managing auw211 servers")

CREATE_SNAPSHOT = "create-snapshot"
CREATE_DROPLET = "create-droplet"

parser.add_argument("action", choices=[CREATE_SNAPSHOT, CREATE_DROPLET])

args = parser.parse_args()
if args.action == CREATE_SNAPSHOT:
    auw_cloud.create_and_process_snapshot()
elif args.action == CREATE_DROPLET:
    auw_cloud.create_droplet_from_snapshot()
