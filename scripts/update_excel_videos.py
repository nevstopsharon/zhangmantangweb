import pandas as pd

def update_video_links(filepath):
    # 读取Excel文件
    xls = pd.ExcelFile(filepath)
    
    # 创建一个字典来存储所有工作表
    sheets = {}
    
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet_name)
        
        # 查找包含视频链接的列
        for col in df.columns:
            if 'video' in col.lower() or 'url' in col.lower():
                # 更新 news-010 的视频链接
                df[col] = df[col].astype(str).str.replace(
                    r'.*news-010/video-web\.mp4.*', 
                    'https://player.bilibili.com/player.html?bvid=BV1hhQEBvE8G&page=1', 
                    regex=True
                )
                # 更新 news-011 的视频链接
                df[col] = df[col].astype(str).str.replace(
                    r'.*news-011/video-web\.mp4.*', 
                    'https://player.bilibili.com/player.html?bvid=BV13hQEBiEDg&page=1', 
                    regex=True
                )
        
        sheets[sheet_name] = df
    
    # 写回Excel文件
    with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
        for sheet_name, df in sheets.items():
            df.to_excel(writer, sheet_name=sheet_name, index=False)
    
    print('Excel video links updated successfully!')

if __name__ == '__main__':
    update_video_links('excel/content.xlsx')
