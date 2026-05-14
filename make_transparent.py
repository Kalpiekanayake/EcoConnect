from PIL import Image, ImageOps

def make_transparent_and_crop(img_path, output_path):
    # Open image
    img = Image.open(img_path).convert("RGBA")
    
    datas = img.getdata()
    new_data = []
    
    # Threshold for black background
    threshold = 35 
    
    for item in datas:
        # If the pixel is close to black, make it transparent
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            new_data.append((0, 0, 0, 0))
        else:
            # Preserve original color
            new_data.append((item[0], item[1], item[2], 255))

    img.putdata(new_data)
    
    # Auto-crop: find the bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # Save as high-quality PNG
    img.save(output_path, "PNG", optimize=True)

if __name__ == "__main__":
    # Process the main logo
    make_transparent_and_crop("frontend/src/assets/illustrations/eco-logo-source.jpg", "frontend/src/assets/illustrations/eco-logo.png")
    
    # Create a sharpened favicon
    img = Image.open("frontend/src/assets/illustrations/eco-logo.png")
    # Favicon should be square, so let's pad it to a square before resizing if it's not
    w, h = img.size
    max_dim = max(w, h)
    new_img = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
    new_img.paste(img, ((max_dim - w) // 2, (max_dim - h) // 2))
    new_img.thumbnail((128, 128), Image.Resampling.LANCZOS)
    new_img.save("frontend/src/assets/illustrations/favicon.png", "PNG")
