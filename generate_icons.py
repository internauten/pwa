"""
Generate PWA icons in various sizes
This script creates simple placeholder icons with a gradient background
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Icon sizes needed for PWA
sizes = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512]

# Create icons directory if it doesn't exist
icons_dir = "icons"
if not os.path.exists(icons_dir):
    os.makedirs(icons_dir)

def create_icon(size):
    # Create a new image with gradient-like effect
    img = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(img)
    
    # Create gradient background
    for i in range(size):
        ratio = i / size
        r = int(102 + (118 - 102) * ratio)  # 667eea to 764ba2
        g = int(126 + (75 - 126) * ratio)
        b = int(234 + (162 - 234) * ratio)
        draw.line([(0, i), (size, i)], fill=(r, g, b))
    
    # Draw a circle
    margin = size // 6
    draw.ellipse([margin, margin, size - margin, size - margin], 
                 fill='white', outline='white', width=size//20)
    
    # Try to add text (will work if default font is available)
    try:
        # Calculate font size based on icon size
        font_size = size // 3
        try:
            # Try to use a nice font if available
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            # Fall back to default font
            font = ImageFont.load_default()
        
        # Add "PWA" text
        text = "PWA"
        # Get text bounding box for centering
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        position = ((size - text_width) // 2, (size - text_height) // 2 - bbox[1])
        
        draw.text(position, text, fill=(102, 126, 234), font=font)
    except Exception as e:
        # If text fails, just use the circle
        print(f"Note: Could not add text to icon (using default icon): {e}")
    
    # Save the icon
    filename = f"{icons_dir}/icon-{size}x{size}.png"
    img.save(filename, "PNG")
    print(f"Created {filename}")

# Generate all icon sizes
print("Generating PWA icons...")
for size in sizes:
    create_icon(size)

print("\nAll icons generated successfully!")
print("Icons are saved in the 'icons' directory")
