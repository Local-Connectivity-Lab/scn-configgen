export default config => `\
:global nodenumber ${config.nodenumber}
:global bgpasn ${config.bgpasn}
:global ipprefix ${config.ipprefix ? `"${config.ipprefix}"` : config.ipprefix}
:global iptenantsrange ${config.iptenantsrange}
:global iptenantsgw ${config.iptenantsgw}
:global ippublicrange ${config.ippublicrange}
:global ippublicgw ${config.ippublicgw}
:global dns ${config.dns}

/delay 15

:for j from=1 to=4 step=1 do={
  :for i from=2000 to=50 step=-400 do={
    :beep frequency=$i length=11ms;
    :delay 11ms;
  }
  :for i from=800 to=2000 step=400 do={
    :beep frequency=$i length=11ms;
    :delay 11ms;
  }
}

:foreach x in=[/interface wireless find] do={ /interface wireless reset-configuration $x }

:for t from=1200 to=350 step=-50 do={
  :beep frequency=$t length=33ms;
  :delay 33ms;
}

:beep frequency=500 length=100ms

/ip address add address=192.168.88.1/24 interface=ether3 network=192.168.88.0

:beep frequency=600 length=100ms

/interface ethernet
set [ find default-name=ether5 ] poe-out=forced-on

:beep frequency=700 length=100ms

/interface wireless security-profiles
add authentication-types=wpa-psk,wpa2-psk management-protection=allowed mode=\
    dynamic-keys name=nycmeshnet supplicant-identity=nycmesh \
    wpa-pre-shared-key=nycmeshnet wpa2-pre-shared-key=nycmeshnet

:beep frequency=800 length=100ms

/interface wireless
set [ find default-name=wlan1 ] band=5ghz-a/n/ac channel-width=20/40/80mhz-Ceee disabled=no distance=indoors frequency=auto mode=ap-bridge security-profile=nycmeshnet ssid=("nycmesh-" . $nodenumber . "-omni")  wireless-protocol=802.11 wps-mode=disabled
add disabled=no master-interface=wlan1 name=wlan2 ssid="-NYC Mesh Community WiFi-" wps-mode=disabled

:beep frequency=900 length=100ms

/interface bridge
add auto-mac=yes name=publicaccess
add auto-mac=yes name=tenants

:beep frequency=1000 length=100ms

/ip address
add address=($ipprefix . ".1/25") interface=tenants network=($ipprefix . ".0")
add address=($ipprefix . ".129/26") interface=publicaccess network=($ipprefix . ".128")

:beep frequency=1100 length=100ms

/interface bridge port
add bridge=tenants interface=ether1
add bridge=tenants interface=ether2
add bridge=tenants interface=ether3
add bridge=tenants interface=ether4
add bridge=tenants interface=wlan1
add bridge=publicaccess interface=wlan2

:beep frequency=1200 length=100ms

/ip pool
add name=tenants ranges=$iptenantsrange
add name=publicaccess ranges=$ippublicrange

:beep frequency=1300 length=100ms

/ip dhcp-server
add address-pool=tenants disabled=no interface=tenants name=tenantsdhcp
add address-pool=publicaccess disabled=no interface=publicaccess name=publicaccessdhcp

:beep frequency=1400 length=100ms

/routing bgp instance
set default as=$bgpasn disabled=no

:beep frequency=1500 length=100ms

/routing bgp network
add network=($ipprefix . ".0/24") synchronize=no

:beep frequency=1600 length=100ms

/ip dhcp-server network
add address=($ipprefix . ".0/25") dns-server=10.10.10.10 gateway=($ipprefix . ".1") netmask=25
add address=($ipprefix . ".128/26") dns-server=10.10.10.10 gateway=($ipprefix . ".129") netmask=25

:beep frequency=1700 length=100ms

/ip firewall filter
add action=accept chain=input protocol=icmp
add action=drop chain=forward in-interface=publicaccess out-interface=tenants
add action=drop chain=input in-interface=publicaccess
add action=accept chain=forward
add action=accept chain=input

:beep frequency=1800 length=100ms

/system clock set time-zone-name=America/New_York
/system identity set name=("nycmesh-" . $nodenumber . "-omni")

:beep frequency=500 length=200ms;
:delay 500ms;
:beep frequency=500 length=200ms;
:delay 200ms;
:beep frequency=800 length=500ms;
:delay 50ms;`;
