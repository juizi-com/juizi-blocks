"""Download a calendar file without letting a link reach inside the network.

The host is resolved once, every address must be public, and the connection
is made to that address, so a second DNS answer can't swap it. Redirects are
checked the same way.
"""

from urllib.parse import urljoin
from urllib.parse import urlsplit

import certifi
import ipaddress
import socket
import time
import urllib3


MAX_BYTES = 3 * 1024 * 1024
MAX_REDIRECTS = 3
DEADLINE = 15  # seconds
PORTS = {"http": 80, "https": 443}
# Addresses that can carry a private IPv4 address inside them.
TUNNELS = tuple(
    ipaddress.ip_network(network)
    for network in ("64:ff9b::/96", "64:ff9b:1::/48", "2002::/16", "::/96")
)


class FetchError(Exception):
    """The link can't be used. The message never contains the link."""


def is_public(address: str) -> bool:
    try:
        ip = ipaddress.ip_address(address)
    except ValueError:
        return False
    if ip.version == 6:
        if ip.ipv4_mapped:
            ip = ip.ipv4_mapped
        elif any(ip in network for network in TUNNELS):
            return False
    return ip.is_global and not ip.is_multicast and not ip.is_reserved


def check_url(url: str) -> tuple:
    try:
        parts = urlsplit(url)
        port = parts.port
    except ValueError:
        raise FetchError("Not a web address") from None
    if parts.scheme not in PORTS or not parts.hostname:
        raise FetchError("Not a web address")
    if parts.username or parts.password:
        raise FetchError("Addresses with a password aren't supported")
    if port not in (None, PORTS[parts.scheme]):
        raise FetchError("Unusual ports aren't allowed")
    try:
        found = socket.getaddrinfo(
            parts.hostname, PORTS[parts.scheme], proto=socket.IPPROTO_TCP
        )
    except (OSError, UnicodeError):
        raise FetchError("Host not found") from None
    addresses = [info[4][0] for info in found]
    if not addresses or not all(is_public(address) for address in addresses):
        raise FetchError("Not a public address")
    # IPv4 first: many servers have no IPv6 route out.
    return parts, sorted(addresses, key=lambda address: ":" in address)[0]


def open_response(parts, address: str):
    options = {
        "host": address,
        "port": PORTS[parts.scheme],
        "timeout": urllib3.Timeout(connect=4, read=6),
        "retries": False,
    }
    if parts.scheme == "https":
        pool = urllib3.HTTPSConnectionPool(
            server_hostname=parts.hostname,
            assert_hostname=parts.hostname,
            cert_reqs="CERT_REQUIRED",
            ca_certs=certifi.where(),
            **options,
        )
    else:
        pool = urllib3.HTTPConnectionPool(**options)
    target = (parts.path or "/") + (f"?{parts.query}" if parts.query else "")
    response = pool.urlopen(
        "GET",
        target,
        redirect=False,
        preload_content=False,
        decode_content=False,
        headers={
            "Host": parts.hostname,
            "User-Agent": "calendar-reader/1.0",
            "Accept": "text/calendar, */*;q=0.5",
            # No compression, so the size limit is the real size.
            "Accept-Encoding": "identity",
        },
    )
    return pool, response


def fetch(url: str) -> bytes:
    deadline = time.monotonic() + DEADLINE
    for _hop in range(MAX_REDIRECTS + 1):
        parts, address = check_url(url)
        try:
            pool, response = open_response(parts, address)
            try:
                if response.status in (301, 302, 303, 307, 308):
                    url = urljoin(url, response.headers.get("Location", ""))
                    continue
                if response.status != 200:
                    raise FetchError(f"The server answered {response.status}")
                body = bytearray()
                for chunk in response.stream(64 * 1024, decode_content=False):
                    body.extend(chunk)
                    if len(body) > MAX_BYTES:
                        raise FetchError("The calendar is too big")
                    if time.monotonic() > deadline:
                        raise FetchError("The server is too slow")
                return bytes(body)
            finally:
                response.close()
                pool.close()
        except urllib3.exceptions.HTTPError as error:
            # Only the type: urllib3 puts the address in its messages.
            raise FetchError(f"Download failed ({type(error).__name__})") from None
    raise FetchError("Too many redirects")
