from PIL import Image

png_path = 'public/logo-icon.png'
ico_path = 'public/favicon.ico'
with Image.open(png_path) as img:
    img = img.convert('RGBA')
    sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    img.save(ico_path, format='ICO', sizes=sizes)
print(f'created {ico_path}')
