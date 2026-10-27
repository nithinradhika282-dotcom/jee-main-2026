import os
import math
from PIL import Image, ImageDraw, ImageFont

icons_dir = r"C:\Users\chary\.gemini\antigravity\scratch\jee-main-2026\public\icons"
os.makedirs(icons_dir, exist_ok=True)

def create_icon(size, is_maskable=False):
    # 1. Background image
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    center = size // 2
    radius = size // 2 if is_maskable else int(size * 0.46)
    corner_radius = 0 if is_maskable else int(size * 0.22)

    # Rounded rectangle or full rect for maskable
    if is_maskable:
        # Full background with gradient
        for y in range(size):
            ratio = y / size
            r = int(2 + ratio * 15)
            g = int(6 + ratio * 23)
            b = int(23 + ratio * 42)
            draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
    else:
        # Beautiful rounded rect app icon
        draw.rounded_rectangle([center - radius, center - radius, center + radius, center + radius], radius=corner_radius, fill=(15, 23, 42, 255))
        # Gradient border
        draw.rounded_rectangle([center - radius, center - radius, center + radius, center + radius], radius=corner_radius, outline=(56, 189, 248, 255), width=max(2, size // 64))

    # Center glow
    glow_radius = int(size * 0.28)
    for r in range(glow_radius, 0, -2):
        alpha = int(35 * (1 - r / glow_radius))
        draw.ellipse([center - r, center - r, center + r, center + r], fill=(14, 165, 233, alpha))

    # Atom / Orbit rings
    ring_radius_x = int(size * 0.32)
    ring_radius_y = int(size * 0.12)
    for angle in [0, 60, 120]:
        rad = math.radians(angle)
        # Create rotated ellipse on temporary canvas
        temp = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        temp_draw = ImageDraw.Draw(temp)
        temp_draw.ellipse(
            [center - ring_radius_x, center - ring_radius_y, center + ring_radius_x, center + ring_radius_y],
            outline=(56, 189, 248, 200) if angle == 0 else ((168, 85, 247, 200) if angle == 60 else (16, 185, 129, 200)),
            width=max(2, size // 80)
        )
        rotated = temp.rotate(angle, center=(center, center), resample=Image.BICUBIC)
        img.alpha_composite(rotated)

    # Core Nucleus
    core_r = int(size * 0.08)
    draw.ellipse([center - core_r, center - core_r, center + core_r, center + core_r], fill=(255, 255, 255, 255), outline=(56, 189, 248, 255), width=max(2, size // 100))

    # Subtle '2026' text or symbol
    text_y = int(size * 0.76)
    # Draw bottom pill with 'JEE 2026'
    pill_w = int(size * 0.5)
    pill_h = int(size * 0.14)
    pill_x0 = center - pill_w // 2
    pill_y0 = text_y - pill_h // 2
    pill_x1 = center + pill_w // 2
    pill_y1 = text_y + pill_h // 2
    draw.rounded_rectangle([pill_x0, pill_y0, pill_x1, pill_y1], radius=pill_h // 2, fill=(2, 132, 199, 230), outline=(56, 189, 248, 255), width=max(1, size // 150))

    try:
        font = ImageFont.truetype("arial.ttf", int(pill_h * 0.6))
    except:
        font = ImageFont.load_default()
    
    text = "JEE 2026"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((center - tw // 2, text_y - th // 2 - 2), text, font=font, fill=(255, 255, 255, 255))

    return img

icon_192 = create_icon(192)
icon_192.save(os.path.join(icons_dir, "icon-192x192.png"))

icon_512 = create_icon(512)
icon_512.save(os.path.join(icons_dir, "icon-512x512.png"))

icon_maskable = create_icon(512, is_maskable=True)
icon_maskable.save(os.path.join(icons_dir, "maskable-icon-512x512.png"))

icon_apple = create_icon(180)
icon_apple.save(os.path.join(icons_dir, "apple-touch-icon.png"))

print("Successfully generated all PWA icons in", icons_dir)
