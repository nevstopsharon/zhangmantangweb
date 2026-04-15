from PIL import Image
import os

jpg_files = [
    "exhibitions/exhibition-004/2010年上海图书馆毛体书法展开幕式.JPG",
    "exhibitions/exhibition-004/2010年中宣部原常务副部长龚心翰出席上海书展现场.JPG",
    "exhibitions/exhibition-005/2011年青岛博物馆毛体书法展现场.JPG",
    "exhibitions/exhibition-008/2013年全国人大原副委员长布赫出席纪念毛泽东主席诞辰120周年书画展现场.JPG",
    "exhibitions/exhibition-008/2013年在北京军事博物馆，与百名将军联合举办纪念毛泽东主席诞辰120周年书画展.JPG",
    "news/news-005/detail-13.jpg",
    "news/news-006/军民情.jpg",
    "news/news-008/detail-010.jpg",
    "news/news-014/2011年青岛博物馆毛体书法展现场.JPG",
    "works/work-015/gallery-01.jpg",
    "works/work-016/gallery-01.jpg",
    "works/work-019/gallery-01.jpg",
    "works/work-019/gallery-02.jpg",
    "works/work-020/gallery-01.jpg",
    "works/work-021/gallery-01.jpg"
]

originals_dir = "originals"
images_dir = "images"

converted_count = 0
failed_count = 0
failed_files = []

for i, jpg_file in enumerate(jpg_files):
    src_path = os.path.join(originals_dir, jpg_file)
    webp_file = jpg_file.replace(".jpg", ".webp").replace(".JPG", ".webp")
    dst_path = os.path.join(images_dir, webp_file)
    
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    
    try:
        with Image.open(src_path) as img:
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            img.save(dst_path, 'webp', quality=80)
        converted_count += 1
    except Exception as e:
        failed_count += 1
        failed_files.append(jpg_file)

print("Convert completed!")
print("Total: " + str(len(jpg_files)))
print("Success: " + str(converted_count))
print("Failed: " + str(failed_count))

if failed_files:
    print("\nFailed files count: " + str(len(failed_files)))
