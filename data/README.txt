用途：
- 存放网站前端直接读取的 JSON 数据。

当前文件：
- `works.json`：作品数据
- `exhibitions.json`：展览数据
- `news.json`：新闻数据
- `profile.json`：品牌、首页、about、contact 等站点级内容

更新方式：
1. 作品 / 展览 / 新闻先维护 `excel/content.xlsx`
2. 运行 `scripts/excel_to_json.py`
3. 覆盖这里的 `works.json`、`exhibitions.json`、`news.json`
4. `profile.json` 需要单独维护，不通过 Excel 自动生成

注意：
- 当前网站直接读取这里的 JSON
- 如果这里与 Excel 不一致，以这里的内容为页面实际显示结果
