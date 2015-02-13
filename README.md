# skytap-vpn
Utilities for attaching/detaching VPN resources

##Usage

Catalog VPN attachments
```
node catalog --username="SOME_USER" --token="TOKEN" --vpn="VPN_ID" --out="OUTPUT_PATH"
node catalog -u "SOME_USER" -t "TOKEN" -v "VPN_ID" -o "OUTPUT_PATH"
```

This produces a file in the outpu location that is of the format:
```
[
  { 
    "network_id": "VALUE", 
    "configuration_id": "VALUE", 
    "name": "VALUE"
  }
]
```

Detach network attachments from a VPN
```
node attach --username="SOME_USER" --token="TOKEN" --vpn="VPN_ID" --in="INPUT_FILE"
node attach -u "SOME_USER" -t "TOKEN" -v "VPN_ID" -i "INPUT_FILE"
```

Attach networks to a VPN
```
node attach --username="SOME_USER" --token="TOKEN" --vpn="VPN_ID" --in="INPUT_FILE"
node attach -u "SOME_USER" -t "TOKEN" -v "VPN_ID" -i "INPUT_FILE"
```
