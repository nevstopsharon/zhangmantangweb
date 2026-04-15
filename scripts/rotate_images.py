from PIL import Image
import os

def rotate_images(folder):
    count = 0
    for filename in os.listdir(folder):
        if filename.endswith('.jpg') or filename.endswith('.webp'):
            filepath = os.path.join(folder, filename)
            try:
                img = Image.open(filepath)
                img_rotated = img.rotate(-90, expand=True)
                img_rotated.save(filepath)
                count += 1
            except:
                pass
    return count

if __name__ == '__main__':
    total = 0
    
    # Process work-042 folder
    total += rotate_images('images/works/work-042')
    total += rotate_images('images/works/work-042/thumbnails/works/work-042')
    
    # Process news-006 folder
    total += rotate_images('images/news/news-006')
    total += rotate_images('images/news/news-006/thumbnails/news/news-006')
    
    print(f'Total rotated: {total}')
    print('Done!')
