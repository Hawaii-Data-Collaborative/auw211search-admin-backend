import datetime
import json
import os
import subprocess


class CloudError(Exception):
    pass


PRIMARY_DROPLET_NAME = os.getenv("PRIMARY_DROPLET_NAME", "auw-ubuntu-01")
NEW_DROPLET_REGION = os.getenv("NEW_DROPLET_REGION", "sgp1")
NEW_DROPLET_SIZE = os.getenv("NEW_DROPLET_SIZE", "g-2vcpu-8gb")


def get_droplets():
    cmd = "doctl compute droplet list -o json"
    print(f"[get_droplets] cmd={cmd}")
    result = subprocess.check_output(cmd, shell=True, text=True)
    droplets = json.loads(result)
    return droplets


def get_primary_droplet_id():
    droplets = get_droplets()
    droplet = next((d for d in droplets if d["name"] == PRIMARY_DROPLET_NAME), None)
    if not droplet:
        raise CloudError("Droplet not found")
    return droplet["id"]


def get_snapshot_name():
    return datetime.datetime.today().strftime("%Y%m%d") + "_" + PRIMARY_DROPLET_NAME


def create_snapshot():
    droplet_id = get_primary_droplet_id()
    snapshot_name = get_snapshot_name()
    cmd = f"doctl compute droplet-action snapshot {droplet_id} --snapshot-name {snapshot_name} -o json"
    print(f"[create_snapshot] cmd={cmd}")
    result = subprocess.check_output(cmd, shell=True, text=True)
    return json.loads(result)


def get_snapshots():
    cmd = "doctl compute snapshot list -o json"
    print(f"[get_latest_snapshot] cmd={cmd}")
    result = subprocess.check_output(cmd, shell=True, text=True)
    snapshots = json.loads(result)
    snapshots.sort(key=lambda x: x["created_at"])
    return snapshots


def get_latest_snapshot():
    snapshots = get_snapshots()
    if not snapshots:
        raise CloudError("Snapshots not found")
    return snapshots.pop()


def transfer_snapshot(snapshot_id=None):
    if snapshot_id is None:
        snapshot = get_latest_snapshot()
        snapshot_id = snapshot["id"]
    cmd = f"doctl compute image-action transfer {snapshot_id} --region={NEW_DROPLET_REGION} -o json"
    print(f"[transfer_latest_snapshot] cmd={cmd}")
    result = subprocess.check_output(cmd, shell=True, text=True)
    return json.loads(result)


def delete_snapshot(snapshot_id):
    cmd = f"doctl compute snapshot delete {snapshot_id} -f -o json"
    print(f"[transfer_latest_snapshot] cmd={cmd}")
    result = subprocess.check_output(cmd, shell=True, text=True)
    return json.loads(result)


def create_droplet_from_snapshot():
    droplets = get_droplets()
    nums = []
    for d in droplets:
        name = d["name"]
        if name.startswith("auw-ubuntu-"):
            nums.append(int(name.replace("auw-ubuntu-", "")))
    if not nums:
        raise CloudError("auw-ubuntu-* droplets not found")
    maxnum = max(nums) + 1
    if maxnum < 10:
        maxnum = f"0{maxnum}"
    droplet_name = f"auw-ubuntu-{maxnum}"
    snapshot = get_latest_snapshot()
    snapshot_id = snapshot["id"]
    cmd = f"doctl compute droplet create {droplet_name} --size {NEW_DROPLET_SIZE} --image {snapshot_id} --region {NEW_DROPLET_REGION} -o json"
    print(f"[create_droplet_from_snapshot] cmd={cmd}")
    result = subprocess.check_output(cmd, shell=True, text=True)
    return json.loads(result)


def create_and_process_snapshot():
    result = create_snapshot()
    snapshot_id = result["id"]
    transfer_snapshot(snapshot_id)
    snapshots = get_snapshots()
    filtered_snapshots = [
        x for x in snapshots if x["name"].endswith(PRIMARY_DROPLET_NAME)
    ]
    while len(filtered_snapshots) > 3:
        snapshot = filtered_snapshots.pop(0)
        delete_snapshot(snapshot["id"])
