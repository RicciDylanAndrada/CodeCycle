#!/usr/bin/env python3
"""
Generate CodeCycle Chrome extension icons as PNG files.
Uses only Python stdlib (struct, zlib) - no external dependencies.

Design: Rounded green (#5B8C5A) square with white cycle arrows.
"""

import struct
import zlib
import math


def create_png(width, height, pixels):
    """Create a PNG file from RGBA pixel data."""
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xFFFFFFFF)
        return struct.pack('>I', len(data)) + c + crc

    # PNG signature
    sig = b'\x89PNG\r\n\x1a\n'

    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr = chunk(b'IHDR', ihdr_data)

    # IDAT - pixel data with filter bytes
    raw = b''
    for y in range(height):
        raw += b'\x00'  # filter: none
        for x in range(width):
            idx = (y * width + x) * 4
            raw += bytes(pixels[idx:idx+4])

    compressed = zlib.compress(raw, 9)
    idat = chunk(b'IDAT', compressed)

    # IEND
    iend = chunk(b'IEND', b'')

    return sig + ihdr + idat + iend


def distance(x1, y1, x2, y2):
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)


def blend(bg, fg, alpha):
    """Blend fg over bg with alpha (0-1)."""
    return int(bg * (1 - alpha) + fg * alpha)


def draw_icon(size):
    """Draw the CodeCycle icon at the given size."""
    pixels = [0] * (size * size * 4)

    green_r, green_g, green_b = 0x5B, 0x8C, 0x5A
    white_r, white_g, white_b = 255, 255, 255

    cx, cy = size / 2, size / 2
    corner_radius = size * 0.2

    def set_pixel(x, y, r, g, b, a):
        if 0 <= x < size and 0 <= y < size:
            idx = (y * size + x) * 4
            # Alpha blending with existing pixel
            existing_a = pixels[idx + 3] / 255.0
            new_a = a / 255.0
            if existing_a > 0 and new_a < 1:
                out_a = new_a + existing_a * (1 - new_a)
                if out_a > 0:
                    pixels[idx + 0] = int((r * new_a + pixels[idx+0] * existing_a * (1 - new_a)) / out_a)
                    pixels[idx + 1] = int((g * new_a + pixels[idx+1] * existing_a * (1 - new_a)) / out_a)
                    pixels[idx + 2] = int((b * new_a + pixels[idx+2] * existing_a * (1 - new_a)) / out_a)
                    pixels[idx + 3] = int(out_a * 255)
            else:
                pixels[idx + 0] = r
                pixels[idx + 1] = g
                pixels[idx + 2] = b
                pixels[idx + 3] = a

    def is_in_rounded_rect(px, py, x0, y0, x1, y1, r):
        """Check if point is inside rounded rectangle, return coverage (0-1)."""
        # Clamp to inner rect + corners
        if px < x0 or px > x1 or py < y0 or py > y1:
            return 0.0

        # Check corners
        corners = [
            (x0 + r, y0 + r),  # top-left
            (x1 - r, y0 + r),  # top-right
            (x0 + r, y1 - r),  # bottom-left
            (x1 - r, y1 - r),  # bottom-right
        ]

        for (ccx, ccy) in corners:
            in_corner_region = False
            if px < x0 + r and py < y0 + r and ccx == x0 + r and ccy == y0 + r:
                in_corner_region = True
            elif px > x1 - r and py < y0 + r and ccx == x1 - r and ccy == y0 + r:
                in_corner_region = True
            elif px < x0 + r and py > y1 - r and ccx == x0 + r and ccy == y1 - r:
                in_corner_region = True
            elif px > x1 - r and py > y1 - r and ccx == x1 - r and ccy == y1 - r:
                in_corner_region = True

            if in_corner_region:
                d = distance(px, py, ccx, ccy)
                if d > r + 0.7:
                    return 0.0
                elif d > r - 0.7:
                    return max(0, min(1, (r + 0.7 - d) / 1.4))
                else:
                    return 1.0

        return 1.0

    # Draw rounded rectangle background
    margin = size * 0.02
    for y in range(size):
        for x in range(size):
            coverage = is_in_rounded_rect(
                x + 0.5, y + 0.5,
                margin, margin,
                size - 1 - margin, size - 1 - margin,
                corner_radius
            )
            if coverage > 0:
                a = int(coverage * 255)
                set_pixel(x, y, green_r, green_g, green_b, a)

    # Draw cycle arrows (two curved arrows forming a circle)
    # Arc parameters
    arc_radius = size * 0.28
    stroke_width = max(1.5, size * 0.09)
    arrow_size = max(2, size * 0.12)

    # Draw two arcs (top-right and bottom-left halves of circle)
    # Arc 1: from ~30deg to ~170deg (top arc)
    # Arc 2: from ~210deg to ~350deg (bottom arc)

    def draw_arc(start_deg, end_deg, arrow_at_end=True):
        """Draw an arc with an arrowhead."""
        steps = max(200, size * 20)

        # Draw the arc with anti-aliasing
        for y in range(size):
            for x in range(size):
                px, py = x + 0.5, y + 0.5
                # Distance from center
                dx = px - cx
                dy = py - cy
                d = math.sqrt(dx * dx + dy * dy)

                # Distance from the arc circle
                dist_from_arc = abs(d - arc_radius)

                if dist_from_arc > stroke_width / 2 + 1:
                    continue

                # Angle of this point
                angle = math.degrees(math.atan2(dy, dx)) % 360

                # Check if angle is within arc range
                in_arc = False
                if start_deg < end_deg:
                    in_arc = start_deg <= angle <= end_deg
                else:
                    in_arc = angle >= start_deg or angle <= end_deg

                if not in_arc:
                    continue

                # Anti-aliased coverage
                if dist_from_arc <= stroke_width / 2 - 0.5:
                    coverage = 1.0
                elif dist_from_arc <= stroke_width / 2 + 0.5:
                    coverage = (stroke_width / 2 + 0.5 - dist_from_arc)
                else:
                    coverage = 0.0

                if coverage > 0:
                    a = int(min(1.0, coverage) * 255)
                    set_pixel(x, y, white_r, white_g, white_b, a)

        # Draw arrowhead at the end of the arc
        if arrow_at_end:
            end_rad = math.radians(end_deg)
            arrow_x = cx + arc_radius * math.cos(end_rad)
            arrow_y = cy + arc_radius * math.sin(end_rad)

            # Arrow direction: tangent to circle at endpoint
            tangent_angle = end_rad + math.pi / 2  # perpendicular to radius = tangent

            # Two sides of the arrowhead
            angle1 = tangent_angle + math.radians(150)
            angle2 = tangent_angle - math.radians(150)

            tip_x, tip_y = arrow_x, arrow_y
            p1_x = tip_x + arrow_size * math.cos(angle1)
            p1_y = tip_y + arrow_size * math.sin(angle1)
            p2_x = tip_x + arrow_size * math.cos(angle2)
            p2_y = tip_y + arrow_size * math.sin(angle2)

            # Fill the triangle
            draw_triangle(tip_x, tip_y, p1_x, p1_y, p2_x, p2_y)

    def draw_triangle(x0, y0, x1, y1, x2, y2):
        """Fill a triangle with white pixels."""
        min_x = max(0, int(min(x0, x1, x2) - 1))
        max_x = min(size - 1, int(max(x0, x1, x2) + 1))
        min_y = max(0, int(min(y0, y1, y2) - 1))
        max_y = min(size - 1, int(max(y0, y1, y2) + 1))

        def sign(px, py, ax, ay, bx, by):
            return (px - bx) * (ay - by) - (ax - bx) * (py - by)

        for y in range(min_y, max_y + 1):
            for x in range(min_x, max_x + 1):
                px, py = x + 0.5, y + 0.5
                d1 = sign(px, py, x0, y0, x1, y1)
                d2 = sign(px, py, x1, y1, x2, y2)
                d3 = sign(px, py, x2, y2, x0, y0)

                has_neg = (d1 < 0) or (d2 < 0) or (d3 < 0)
                has_pos = (d1 > 0) or (d2 > 0) or (d3 > 0)

                if not (has_neg and has_pos):
                    set_pixel(x, y, white_r, white_g, white_b, 255)

    # Draw two arcs with gap for arrows
    # Top-right arc (going clockwise from upper-left to lower-right)
    draw_arc(200, 350, arrow_at_end=True)
    # Bottom-left arc (going clockwise from lower-right to upper-left)
    draw_arc(20, 170, arrow_at_end=True)

    return pixels


def main():
    sizes = [16, 48, 128]

    for size in sizes:
        print(f"Generating {size}x{size} icon...")
        pixels = draw_icon(size)
        png_data = create_png(size, size, pixels)

        filename = f"icon{size}.png"
        with open(f"/Users/dylanandrada/Projects/codecycle/extension/icons/{filename}", 'wb') as f:
            f.write(png_data)
        print(f"  Saved {filename} ({len(png_data)} bytes)")

    print("Done!")


if __name__ == '__main__':
    main()
