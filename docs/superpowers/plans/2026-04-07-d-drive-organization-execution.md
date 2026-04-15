# D Drive Organization Execution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize `D:\` into the approved shallow structure, preserve every file, skip protected system and game-install paths, and delete only verified empty folders after moves.

**Architecture:** Create the final top-level folders first, then migrate content in bounded batches by purpose: downloads, application materials, learning/work, family/media, hobbies/fonts/private data. Use explicit source-to-target mappings, verify each batch immediately, and only remove empty source folders that are outside the protected path list.

**Tech Stack:** Windows PowerShell, filesystem moves, directory verification

---

### Task 1: Create Final Top-Level Folders And Snapshot Current Root

**Files:**
- Create: `D:\00_下载待整理`
- Create: `D:\01_证件申请`
- Create: `D:\02_学习作品证书`
- Create: `D:\03_工作业务`
- Create: `D:\04_家庭亲友`
- Create: `D:\05_照片视频`
- Create: `D:\06_兴趣收藏`
- Create: `D:\07_字体安装包`
- Create: `D:\08_私密资料`

- [ ] **Step 1: Record the current top-level root listing**

Run:

```powershell
Get-ChildItem -Path D:\ -Force |
  Select-Object @{Name='Type';Expression={if($_.PSIsContainer){'Dir'}else{'File'}}}, Name |
  Sort-Object Type, Name |
  Format-Table -AutoSize
```

Expected:

- A readable inventory of the current `D:\` root before any new moves.

- [ ] **Step 2: Create the final shallow root folders**

Run:

```powershell
$targets = @(
  'D:\00_下载待整理',
  'D:\01_证件申请',
  'D:\02_学习作品证书',
  'D:\03_工作业务',
  'D:\04_家庭亲友',
  'D:\05_照片视频',
  'D:\06_兴趣收藏',
  'D:\07_字体安装包',
  'D:\08_私密资料'
)
foreach ($path in $targets) {
  if (-not (Test-Path -Path $path)) {
    New-Item -ItemType Directory -Path $path | Out-Null
  }
}
Get-ChildItem -Path D:\ -Force |
  Where-Object { $_.Name -in @(
    '00_下载待整理','01_证件申请','02_学习作品证书','03_工作业务',
    '04_家庭亲友','05_照片视频','06_兴趣收藏','07_字体安装包','08_私密资料'
  ) } |
  Sort-Object Name |
  Select-Object Name |
  Format-Table -AutoSize
```

Expected:

- The nine approved top-level folders exist.

- [ ] **Step 3: Commit the root-folder creation checkpoint**

Run:

```bash
git add docs/superpowers/plans/2026-04-07-d-drive-organization-execution.md
git commit -m "docs: add d-drive organization execution plan"
```

Expected:

- The plan file is committed. No `D:\` content is committed.

### Task 2: Move Download And Intake Folders Into `00_下载待整理`

**Files:**
- Modify: `D:\01_收件箱`
- Modify: `D:\Downloads`
- Modify: `D:\BaiduNetdiskDownload`
- Modify: `D:\迅雷下载`
- Modify: `D:\00_下载待整理`

- [ ] **Step 1: Move the old intake folders into the new download root**

Run:

```powershell
function Move-WholePath {
  param([string]$Source, [string]$Target)
  if (-not (Test-Path -Path $Source)) { return }
  if (Test-Path -Path $Target) {
    Get-ChildItem -Path $Source -Force | ForEach-Object {
      Move-Item -Path $_.FullName -Destination $Target
    }
  } else {
    Move-Item -Path $Source -Destination $Target
  }
}

Move-WholePath 'D:\01_收件箱' 'D:\00_下载待整理'
Move-WholePath 'D:\Downloads' 'D:\00_下载待整理\Downloads'
Move-WholePath 'D:\BaiduNetdiskDownload' 'D:\00_下载待整理\BaiduNetdiskDownload'
Move-WholePath 'D:\迅雷下载' 'D:\00_下载待整理\迅雷下载'
```

Expected:

- Download-related folders are under `D:\00_下载待整理`.

- [ ] **Step 2: Verify the moved intake folders**

Run:

```powershell
Get-ChildItem -Path 'D:\00_下载待整理' -Force |
  Select-Object Mode, Name |
  Format-Table -AutoSize
```

Expected:

- `Downloads`
- `BaiduNetdiskDownload`
- `迅雷下载`
- Any remaining carried-over content from the old intake folder

- [ ] **Step 3: Delete the old intake folder only if it is empty**

Run:

```powershell
if ((Test-Path 'D:\01_收件箱') -and ((Get-ChildItem -Path 'D:\01_收件箱' -Force | Measure-Object).Count -eq 0)) {
  Remove-Item -Path 'D:\01_收件箱'
}
```

Expected:

- `D:\01_收件箱` is removed only if empty.

- [ ] **Step 4: Commit the download batch**

Run:

```bash
git commit --allow-empty -m "chore: execute d-drive download intake reorganization"
```

Expected:

- A checkpoint commit exists for the batch execution log.

### Task 3: Normalize Application And Credential Materials Under `01_证件申请`

**Files:**
- Modify: `D:\02_申请与证件`
- Create: `D:\01_证件申请\求职材料`
- Create: `D:\01_证件申请\学位申请`
- Create: `D:\01_证件申请\签证与出入境`
- Create: `D:\01_证件申请\认证与证明`
- Create: `D:\01_证件申请\通用材料`

- [ ] **Step 1: Create the destination subfolders**

Run:

```powershell
$targets = @(
  'D:\01_证件申请\求职材料',
  'D:\01_证件申请\学位申请',
  'D:\01_证件申请\签证与出入境',
  'D:\01_证件申请\认证与证明',
  'D:\01_证件申请\通用材料'
)
foreach ($path in $targets) {
  if (-not (Test-Path -Path $path)) {
    New-Item -ItemType Directory -Path $path | Out-Null
  }
}
```

Expected:

- The five destination folders exist under `D:\01_证件申请`.

- [ ] **Step 2: Move each current application subfolder into its final name**

Run:

```powershell
function Move-WholePath {
  param([string]$Source, [string]$Target)
  if (-not (Test-Path -Path $Source)) { return }
  if (Test-Path -Path $Target) {
    Get-ChildItem -Path $Source -Force | ForEach-Object {
      Move-Item -Path $_.FullName -Destination $Target
    }
  } else {
    Move-Item -Path $Source -Destination $Target
  }
}

Move-WholePath 'D:\02_申请与证件\01_求职与工作' 'D:\01_证件申请\求职材料'
Move-WholePath 'D:\02_申请与证件\02_学位与博士申请' 'D:\01_证件申请\学位申请'
Move-WholePath 'D:\02_申请与证件\03_签证与出入境' 'D:\01_证件申请\签证与出入境'
Move-WholePath 'D:\02_申请与证件\04_认证与证明' 'D:\01_证件申请\认证与证明'
Move-WholePath 'D:\02_申请与证件\05_通用申请材料' 'D:\01_证件申请\通用材料'
```

Expected:

- All current application material lives under `D:\01_证件申请`.

- [ ] **Step 3: Verify the final application structure**

Run:

```powershell
Get-ChildItem -Path 'D:\01_证件申请' -Force |
  Select-Object Mode, Name |
  Sort-Object Name |
  Format-Table -AutoSize
```

Expected:

- `求职材料`
- `学位申请`
- `签证与出入境`
- `认证与证明`
- `通用材料`

- [ ] **Step 4: Delete the old container only if empty**

Run:

```powershell
if ((Test-Path 'D:\02_申请与证件') -and ((Get-ChildItem -Path 'D:\02_申请与证件' -Force | Measure-Object).Count -eq 0)) {
  Remove-Item -Path 'D:\02_申请与证件'
}
```

Expected:

- The old top-level container disappears only if empty.

- [ ] **Step 5: Commit the application-material batch**

Run:

```bash
git commit --allow-empty -m "chore: execute d-drive application material reorganization"
```

Expected:

- A checkpoint commit exists for this batch.

### Task 4: Move Learning, Portfolio, Certificate, And Study Materials Into `02_学习作品证书`

**Files:**
- Modify: `D:\03_项目与作品\01_设计源文件`
- Modify: `D:\04_学习资料\01_课程与术语`
- Modify: `D:\UX_Portfolio_Projects`
- Modify: `D:\Training_Certificates_HealthSafety`
- Modify: `D:\UX_Ebooks`
- Modify: `D:\MA_E-reading books`
- Modify: `D:\数据可视化练习`
- Modify: `D:\08_长期归档\dyp作业修改`
- Modify: `D:\08_长期归档\01_学术归档\190181116_SCS3044_dissertation_2022_NA - 副本.pdf`

- [ ] **Step 1: Create the learning destination folders**

Run:

```powershell
$targets = @(
  'D:\02_学习作品证书\用户体验设计作品集',
  'D:\02_学习作品证书\培训证书',
  'D:\02_学习作品证书\数据可视化练习',
  'D:\02_学习作品证书\课程与术语',
  'D:\02_学习作品证书\学习资料_用户体验设计电子书',
  'D:\02_学习作品证书\学习资料_电子阅读',
  'D:\02_学习作品证书\dyp作业修改'
)
foreach ($path in $targets) {
  if (-not (Test-Path -Path $path)) {
    New-Item -ItemType Directory -Path $path | Out-Null
  }
}
```

Expected:

- All destination learning folders exist.

- [ ] **Step 2: Merge the mapped directories into their destinations**

Run:

```powershell
function Merge-Directory {
  param([string]$Source, [string]$Target)
  if (-not (Test-Path -Path $Source)) { return }
  if (-not (Test-Path -Path $Target)) {
    New-Item -ItemType Directory -Path $Target | Out-Null
  }
  Get-ChildItem -Path $Source -Force | ForEach-Object {
    Move-Item -Path $_.FullName -Destination $Target
  }
}

Merge-Directory 'D:\UX_Portfolio_Projects' 'D:\02_学习作品证书\用户体验设计作品集'
Merge-Directory 'D:\03_项目与作品\01_设计源文件' 'D:\02_学习作品证书\用户体验设计作品集'
Merge-Directory 'D:\Training_Certificates_HealthSafety' 'D:\02_学习作品证书\培训证书'
Merge-Directory 'D:\数据可视化练习' 'D:\02_学习作品证书\数据可视化练习'
Merge-Directory 'D:\04_学习资料\01_课程与术语' 'D:\02_学习作品证书\课程与术语'
Merge-Directory 'D:\UX_Ebooks' 'D:\02_学习作品证书\学习资料_用户体验设计电子书'
Merge-Directory 'D:\MA_E-reading books' 'D:\02_学习作品证书\学习资料_电子阅读'
Merge-Directory 'D:\08_长期归档\dyp作业修改' 'D:\02_学习作品证书\dyp作业修改'
```

Expected:

- The content is merged into the seven final learning folders.

- [ ] **Step 3: Move the standalone dissertation file to the learning root**

Run:

```powershell
$source = 'D:\08_长期归档\01_学术归档\190181116_SCS3044_dissertation_2022_NA - 副本.pdf'
$target = 'D:\02_学习作品证书\190181116_SCS3044_dissertation_2022_NA - 副本.pdf'
if ((Test-Path $source) -and (-not (Test-Path $target))) {
  Move-Item -Path $source -Destination $target
}
```

Expected:

- The dissertation PDF sits directly under `D:\02_学习作品证书`.

- [ ] **Step 4: Verify the learning root**

Run:

```powershell
Get-ChildItem -Path 'D:\02_学习作品证书' -Force |
  Select-Object Mode, Name |
  Sort-Object Name |
  Format-Table -AutoSize
```

Expected:

- `用户体验设计作品集`
- `培训证书`
- `数据可视化练习`
- `课程与术语`
- `学习资料_用户体验设计电子书`
- `学习资料_电子阅读`
- `dyp作业修改`
- `190181116_SCS3044_dissertation_2022_NA - 副本.pdf`

- [ ] **Step 5: Delete empty old containers that are now unused**

Run:

```powershell
$cleanup = @(
  'D:\03_项目与作品\01_设计源文件',
  'D:\03_项目与作品',
  'D:\04_学习资料\01_课程与术语',
  'D:\04_学习资料',
  'D:\UX_Portfolio_Projects',
  'D:\Training_Certificates_HealthSafety',
  'D:\UX_Ebooks',
  'D:\MA_E-reading books',
  'D:\数据可视化练习',
  'D:\08_长期归档\dyp作业修改',
  'D:\08_长期归档\01_学术归档'
)
foreach ($path in $cleanup) {
  if ((Test-Path $path) -and ((Get-ChildItem -Path $path -Force | Measure-Object).Count -eq 0)) {
    Remove-Item -Path $path
  }
}
```

Expected:

- Only empty containers are removed.

- [ ] **Step 6: Commit the learning-material batch**

Run:

```bash
git commit --allow-empty -m "chore: execute d-drive learning and portfolio reorganization"
```

Expected:

- A checkpoint commit exists for this batch.

### Task 5: Move Work And Business Content Into `03_工作业务`

**Files:**
- Modify: `D:\蜂鸟小课`
- Modify: `D:\07_家族企业相关\东惠广告暂存`
- Modify: `D:\07_家族企业相关\陈惠玲发票内容`

- [ ] **Step 1: Create the business destination folders**

Run:

```powershell
$targets = @(
  'D:\03_工作业务\实习公司_蜂鸟小课',
  'D:\03_工作业务\家族企业_东惠广告',
  'D:\03_工作业务\家族企业_发票'
)
foreach ($path in $targets) {
  if (-not (Test-Path -Path $path)) {
    New-Item -ItemType Directory -Path $path | Out-Null
  }
}
```

Expected:

- The three business destination folders exist.

- [ ] **Step 2: Merge the business directories into their final homes**

Run:

```powershell
function Merge-Directory {
  param([string]$Source, [string]$Target)
  if (-not (Test-Path -Path $Source)) { return }
  if (-not (Test-Path -Path $Target)) {
    New-Item -ItemType Directory -Path $Target | Out-Null
  }
  Get-ChildItem -Path $Source -Force | ForEach-Object {
    Move-Item -Path $_.FullName -Destination $Target
  }
}

Merge-Directory 'D:\蜂鸟小课' 'D:\03_工作业务\实习公司_蜂鸟小课'
Merge-Directory 'D:\07_家族企业相关\东惠广告暂存' 'D:\03_工作业务\家族企业_东惠广告'
Merge-Directory 'D:\07_家族企业相关\陈惠玲发票内容' 'D:\03_工作业务\家族企业_发票'
```

Expected:

- All three business data sets live under `D:\03_工作业务`.

- [ ] **Step 3: Verify the business root**

Run:

```powershell
Get-ChildItem -Path 'D:\03_工作业务' -Force |
  Select-Object Mode, Name |
  Sort-Object Name |
  Format-Table -AutoSize
```

Expected:

- `实习公司_蜂鸟小课`
- `家族企业_东惠广告`
- `家族企业_发票`

- [ ] **Step 4: Delete empty source containers only if they are empty**

Run:

```powershell
$cleanup = @(
  'D:\蜂鸟小课',
  'D:\07_家族企业相关\东惠广告暂存',
  'D:\07_家族企业相关\陈惠玲发票内容',
  'D:\07_家族企业相关'
)
foreach ($path in $cleanup) {
  if ((Test-Path $path) -and ((Get-ChildItem -Path $path -Force | Measure-Object).Count -eq 0)) {
    Remove-Item -Path $path
  }
}
```

Expected:

- Empty business source folders are removed, non-empty ones remain.

- [ ] **Step 5: Commit the business batch**

Run:

```bash
git commit --allow-empty -m "chore: execute d-drive work and business reorganization"
```

Expected:

- A checkpoint commit exists for this batch.

### Task 6: Move Family And Personal Media Into `04_家庭亲友` And `05_照片视频`

**Files:**
- Modify: `D:\陈惠玲iphone11照片`
- Modify: `D:\慧玲聚会视频`
- Modify: `D:\05_照片与视频\Family_Photos_Mom`
- Modify: `D:\05_照片与视频\佳能照片`
- Modify: `D:\05_照片与视频\Dji 大疆nano视频`
- Modify: `D:\大疆视频pocket 3`
- Modify: `D:\05_照片与视频\vlog拍摄成品和脚本`
- Modify: `D:\05_照片与视频\剪映材料`
- Modify: `D:\GameVideos`
- Modify: `D:\RazerCortexGameClips`

- [ ] **Step 1: Create the family and media destination folders**

Run:

```powershell
$targets = @(
  'D:\04_家庭亲友\陈惠玲_照片',
  'D:\04_家庭亲友\陈惠玲_聚会视频',
  'D:\04_家庭亲友\家庭照片',
  'D:\05_照片视频\个人照片_佳能',
  'D:\05_照片视频\个人视频_大疆Nano',
  'D:\05_照片视频\个人视频_大疆Pocket3',
  'D:\05_照片视频\个人视频_vlog成片与脚本',
  'D:\05_照片视频\个人视频_剪映材料',
  'D:\05_照片视频\游戏视频',
  'D:\05_照片视频\游戏视频_RazerCortex'
)
foreach ($path in $targets) {
  if (-not (Test-Path -Path $path)) {
    New-Item -ItemType Directory -Path $path | Out-Null
  }
}
```

Expected:

- The ten destination folders exist.

- [ ] **Step 2: Merge family content into `04_家庭亲友`**

Run:

```powershell
function Merge-Directory {
  param([string]$Source, [string]$Target)
  if (-not (Test-Path -Path $Source)) { return }
  if (-not (Test-Path -Path $Target)) {
    New-Item -ItemType Directory -Path $Target | Out-Null
  }
  Get-ChildItem -Path $Source -Force | ForEach-Object {
    Move-Item -Path $_.FullName -Destination $Target
  }
}

Merge-Directory 'D:\陈惠玲iphone11照片' 'D:\04_家庭亲友\陈惠玲_照片'
Merge-Directory 'D:\慧玲聚会视频' 'D:\04_家庭亲友\陈惠玲_聚会视频'
Merge-Directory 'D:\05_照片与视频\Family_Photos_Mom' 'D:\04_家庭亲友\家庭照片'
```

Expected:

- The family content is grouped under `D:\04_家庭亲友`.

- [ ] **Step 3: Merge personal and game media into `05_照片视频`**

Run:

```powershell
function Merge-Directory {
  param([string]$Source, [string]$Target)
  if (-not (Test-Path -Path $Source)) { return }
  if (-not (Test-Path -Path $Target)) {
    New-Item -ItemType Directory -Path $Target | Out-Null
  }
  Get-ChildItem -Path $Source -Force | ForEach-Object {
    Move-Item -Path $_.FullName -Destination $Target
  }
}

Merge-Directory 'D:\05_照片与视频\佳能照片' 'D:\05_照片视频\个人照片_佳能'
Merge-Directory 'D:\05_照片与视频\Dji 大疆nano视频' 'D:\05_照片视频\个人视频_大疆Nano'
Merge-Directory 'D:\大疆视频pocket 3' 'D:\05_照片视频\个人视频_大疆Pocket3'
Merge-Directory 'D:\05_照片与视频\vlog拍摄成品和脚本' 'D:\05_照片视频\个人视频_vlog成片与脚本'
Merge-Directory 'D:\05_照片与视频\剪映材料' 'D:\05_照片视频\个人视频_剪映材料'
Merge-Directory 'D:\GameVideos' 'D:\05_照片视频\游戏视频'
Merge-Directory 'D:\RazerCortexGameClips' 'D:\05_照片视频\游戏视频_RazerCortex'
```

Expected:

- Personal media and game recordings live under `D:\05_照片视频`.

- [ ] **Step 4: Verify both media roots**

Run:

```powershell
Get-ChildItem -Path 'D:\04_家庭亲友' -Force |
  Select-Object Mode, Name |
  Sort-Object Name |
  Format-Table -AutoSize

Get-ChildItem -Path 'D:\05_照片视频' -Force |
  Select-Object Mode, Name |
  Sort-Object Name |
  Format-Table -AutoSize
```

Expected:

- `D:\04_家庭亲友` shows the three family folders.
- `D:\05_照片视频` shows the seven media folders.

- [ ] **Step 5: Delete empty source folders after verification**

Run:

```powershell
$cleanup = @(
  'D:\陈惠玲iphone11照片',
  'D:\慧玲聚会视频',
  'D:\05_照片与视频\Family_Photos_Mom',
  'D:\05_照片与视频\佳能照片',
  'D:\05_照片与视频\Dji 大疆nano视频',
  'D:\大疆视频pocket 3',
  'D:\05_照片与视频\vlog拍摄成品和脚本',
  'D:\05_照片与视频\剪映材料',
  'D:\GameVideos',
  'D:\RazerCortexGameClips',
  'D:\05_照片与视频'
)
foreach ($path in $cleanup) {
  if ((Test-Path $path) -and ((Get-ChildItem -Path $path -Force | Measure-Object).Count -eq 0)) {
    Remove-Item -Path $path
  }
}
```

Expected:

- Only empty media source folders are removed.

- [ ] **Step 6: Commit the family-and-media batch**

Run:

```bash
git commit --allow-empty -m "chore: execute d-drive family and media reorganization"
```

Expected:

- A checkpoint commit exists for this batch.

### Task 7: Move Hobbies, Fonts, Installers, And Private Material

**Files:**
- Modify: `D:\HuGe_Media`
- Modify: `D:\摩尔庄园周边`
- Modify: `D:\2026-03-01_星露谷成就表格.xlsx`
- Modify: `D:\06_软件安装包与字体`
- Modify: `D:\Font_Files`
- Modify: `D:\Noto_Sans_SC`
- Modify: `D:\Noto_Serif_SC`
- Modify: `D:\FlashBrowser_x64_v1.1.1`
- Modify: `D:\安卓VPN软件`
- Modify: `D:\有道词典_`
- Modify: `D:\植物大战僵尸安装包_魔改版`
- Modify: `D:\窦笛月`
- Modify: `D:\08_长期归档\02_个人文稿\2025-08-17_去往下一段旅程前的一封信.docx`

- [ ] **Step 1: Create the destination folders**

Run:

```powershell
$targets = @(
  'D:\06_兴趣收藏\胡歌_照片收藏',
  'D:\06_兴趣收藏\摩尔庄园_周边图片',
  'D:\07_字体安装包\字体_其他',
  'D:\07_字体安装包\字体_Noto Sans SC',
  'D:\07_字体安装包\字体_Noto Serif SC',
  'D:\07_字体安装包\安装包_FlashBrowser_x64_v1.1.1',
  'D:\07_字体安装包\安装包_安卓VPN软件',
  'D:\07_字体安装包\安装包_有道词典',
  'D:\07_字体安装包\安装包_植物大战僵尸_魔改版',
  'D:\08_私密资料\窦笛月_资料'
)
foreach ($path in $targets) {
  if (-not (Test-Path -Path $path)) {
    New-Item -ItemType Directory -Path $path | Out-Null
  }
}
```

Expected:

- The hobby, font, installer, and private-material destination folders exist.

- [ ] **Step 2: Move the hobby items**

Run:

```powershell
function Move-WholePath {
  param([string]$Source, [string]$Target)
  if (-not (Test-Path -Path $Source)) { return }
  if (Test-Path -Path $Target) {
    Get-ChildItem -Path $Source -Force | ForEach-Object {
      Move-Item -Path $_.FullName -Destination $Target
    }
  } else {
    Move-Item -Path $Source -Destination $Target
  }
}

Move-WholePath 'D:\HuGe_Media' 'D:\06_兴趣收藏\胡歌_照片收藏'
Move-WholePath 'D:\摩尔庄园周边' 'D:\06_兴趣收藏\摩尔庄园_周边图片'

$gameRecordSource = 'D:\2026-03-01_星露谷成就表格.xlsx'
$gameRecordTarget = 'D:\06_兴趣收藏\2026-03-01_星露谷成就表格.xlsx'
if ((Test-Path $gameRecordSource) -and (-not (Test-Path $gameRecordTarget))) {
  Move-Item -Path $gameRecordSource -Destination $gameRecordTarget
}
```

Expected:

- Hobby collections are under `D:\06_兴趣收藏`.

- [ ] **Step 3: Move fonts and installers**

Run:

```powershell
function Move-WholePath {
  param([string]$Source, [string]$Target)
  if (-not (Test-Path -Path $Source)) { return }
  if (Test-Path -Path $Target) {
    Get-ChildItem -Path $Source -Force | ForEach-Object {
      Move-Item -Path $_.FullName -Destination $Target
    }
  } else {
    Move-Item -Path $Source -Destination $Target
  }
}

Move-WholePath 'D:\Font_Files' 'D:\07_字体安装包\字体_其他'
Move-WholePath 'D:\Noto_Sans_SC' 'D:\07_字体安装包\字体_Noto Sans SC'
Move-WholePath 'D:\Noto_Serif_SC' 'D:\07_字体安装包\字体_Noto Serif SC'
Move-WholePath 'D:\FlashBrowser_x64_v1.1.1' 'D:\07_字体安装包\安装包_FlashBrowser_x64_v1.1.1'
Move-WholePath 'D:\安卓VPN软件' 'D:\07_字体安装包\安装包_安卓VPN软件'
Move-WholePath 'D:\有道词典_' 'D:\07_字体安装包\安装包_有道词典'
Move-WholePath 'D:\植物大战僵尸安装包_魔改版' 'D:\07_字体安装包\安装包_植物大战僵尸_魔改版'
```

Expected:

- Fonts and installers are grouped under `D:\07_字体安装包`.

- [ ] **Step 4: Move private material**

Run:

```powershell
function Move-WholePath {
  param([string]$Source, [string]$Target)
  if (-not (Test-Path -Path $Source)) { return }
  if (Test-Path -Path $Target) {
    Get-ChildItem -Path $Source -Force | ForEach-Object {
      Move-Item -Path $_.FullName -Destination $Target
    }
  } else {
    Move-Item -Path $Source -Destination $Target
  }
}

Move-WholePath 'D:\窦笛月' 'D:\08_私密资料\窦笛月_资料'

$letterSource = 'D:\08_长期归档\02_个人文稿\2025-08-17_去往下一段旅程前的一封信.docx'
$letterTarget = 'D:\08_私密资料\2025-08-17_去往下一段旅程前的一封信.docx'
if ((Test-Path $letterSource) -and (-not (Test-Path $letterTarget))) {
  Move-Item -Path $letterSource -Destination $letterTarget
}
```

Expected:

- Sensitive material sits under `D:\08_私密资料`.

- [ ] **Step 5: Verify the hobby, font, and private roots**

Run:

```powershell
Get-ChildItem -Path 'D:\06_兴趣收藏' -Force |
  Select-Object Mode, Name |
  Sort-Object Name |
  Format-Table -AutoSize

Get-ChildItem -Path 'D:\07_字体安装包' -Force |
  Select-Object Mode, Name |
  Sort-Object Name |
  Format-Table -AutoSize

Get-ChildItem -Path 'D:\08_私密资料' -Force |
  Select-Object Mode, Name |
  Sort-Object Name |
  Format-Table -AutoSize
```

Expected:

- The three destination roots show their approved contents.

- [ ] **Step 6: Delete only empty source folders**

Run:

```powershell
$cleanup = @(
  'D:\HuGe_Media',
  'D:\摩尔庄园周边',
  'D:\06_软件安装包与字体',
  'D:\Font_Files',
  'D:\Noto_Sans_SC',
  'D:\Noto_Serif_SC',
  'D:\FlashBrowser_x64_v1.1.1',
  'D:\安卓VPN软件',
  'D:\有道词典_',
  'D:\植物大战僵尸安装包_魔改版',
  'D:\窦笛月',
  'D:\08_长期归档\02_个人文稿'
)
foreach ($path in $cleanup) {
  if ((Test-Path $path) -and ((Get-ChildItem -Path $path -Force | Measure-Object).Count -eq 0)) {
    Remove-Item -Path $path
  }
}
```

Expected:

- Only empty hobby, font, installer, and private source folders are removed.

- [ ] **Step 7: Commit the hobby-font-private batch**

Run:

```bash
git commit --allow-empty -m "chore: execute d-drive hobbies fonts and private reorganization"
```

Expected:

- A checkpoint commit exists for this batch.

### Task 8: Final Cleanup And Protected-Path Verification

**Files:**
- Modify: `D:\`

- [ ] **Step 1: Verify that protected paths still exist and were not targeted**

Run:

```powershell
$protected = @(
  'D:\Program Files',
  'D:\Program Files (x86)',
  'D:\WindowsApps',
  'D:\WpSystem',
  'D:\Recovery',
  'D:\System Volume Information',
  'D:\$RECYCLE.BIN',
  'D:\SteamLibrary',
  'D:\Epic Games',
  'D:\Riot Games',
  'D:\XboxGames',
  'D:\Xbox_GameFiles',
  'D:\RiotGames_GameFiles',
  'D:\Delta Force',
  'D:\Counter-Strike Global Offensive_Game files'
)
$protected | ForEach-Object {
  [pscustomobject]@{ Path = $_; Exists = Test-Path -Path $_ }
} | Format-Table -AutoSize
```

Expected:

- Every protected path still exists.

- [ ] **Step 2: Remove remaining empty old root folders that are outside the protected list**

Run:

```powershell
$protected = @(
  'D:\Program Files',
  'D:\Program Files (x86)',
  'D:\WindowsApps',
  'D:\WpSystem',
  'D:\Recovery',
  'D:\System Volume Information',
  'D:\$RECYCLE.BIN',
  'D:\SteamLibrary',
  'D:\Epic Games',
  'D:\Riot Games',
  'D:\XboxGames',
  'D:\Xbox_GameFiles',
  'D:\RiotGames_GameFiles',
  'D:\Delta Force',
  'D:\Counter-Strike Global Offensive_Game files'
)

Get-ChildItem -Path D:\ -Directory -Force |
  Where-Object { $_.FullName -notin $protected } |
  ForEach-Object {
    if ((Get-ChildItem -Path $_.FullName -Force | Measure-Object).Count -eq 0) {
      Remove-Item -Path $_.FullName
    }
  }
```

Expected:

- Any non-protected empty old root folders are removed.

- [ ] **Step 3: Print the final `D:\` root**

Run:

```powershell
Get-ChildItem -Path D:\ -Force |
  Select-Object @{Name='Type';Expression={if($_.PSIsContainer){'Dir'}else{'File'}}}, Name |
  Sort-Object Type, Name |
  Format-Table -AutoSize
```

Expected:

- The final approved root structure is visible.

- [ ] **Step 4: Commit the final cleanup checkpoint**

Run:

```bash
git commit --allow-empty -m "chore: complete d-drive root cleanup and verification"
```

Expected:

- A final checkpoint commit exists for the full execution sequence.
