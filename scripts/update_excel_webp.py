import pandas as pd
import os

def update_to_webp(filepath):
    # 读取Excel文件
    xls = pd.ExcelFile(filepath)
    
    # 创建一个字典来存储所有工作表
    sheets = {}
    
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet_name)
        
        # 查找所有包含图片路径的列
        for col in df.columns:
            if 'image' in col.lower() or 'cover' in col.lower():
                # 将所有 .jpg 替换为 .webp
                df[col] = df[col].astype(str).str.replace(r'\.jpg$', '.webp', regex=True)
                df[col] = df[col].astype(str).str.replace(r'\.jpeg$', '.webp', regex=True)
        
        sheets[sheet_name] = df
    
    # 写回Excel文件
    with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
        for sheet_name, df in sheets.items():
            df.to_excel(writer, sheet_name=sheet_name, index=False)
    
    print('Excel updated successfully!')

if __name__ == '__main__':
    update_to_webp('excel/content.xlsx')
