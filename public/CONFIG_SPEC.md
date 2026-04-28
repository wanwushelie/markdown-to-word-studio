# Config Specification / 配置规范说明书

> **Purpose / 用途**: Give this document to any AI along with your formatting requirements. The AI will output a config text that you can paste into the "Smart Config" panel to auto-fill all settings.
>
> **用法**: 将本文档连同你的格式要求一起给任何 AI。AI 会输出一段配置文本，你可以粘贴到「Smart Config」面板中自动填充所有设置。

---

## Supported Formats / 支持的格式

The system accepts **two formats** (auto-detected):

### Format 1: Key-Value Text (Recommended / 推荐)

Human-readable, one setting per line. Format: `key: value`

```
body-font: SimSun
heading-font: SimHei
english-font: Times New Roman
code-font: Consolas
body-size: 12
h1-size: 22
h2-size: 18
h3-size: 16
h4-size: 14
h5-size: 12
h6-size: 11
code-size: 10
line-spacing: 1.5
paragraph-spacing: 6
heading-spacing: 12
margin-top: 1440
margin-bottom: 1440
margin-left: 1800
margin-right: 1800
heading-color: #000000
text-color: #000000
link-color: #0563C1
code-bg-color: #F5F5F5
quote-border-color: #CCCCCC
page-size: A4
orientation: portrait
header-text: Document Title
footer-text: Confidential
page-numbers: true
image-max-width: 80
image-align: center
doc-title: My Document
doc-author: Author Name
```

### Format 2: JSON

```json
{
  "font": {
    "body": "SimSun",
    "heading": "SimHei",
    "english": "Times New Roman",
    "code": "Consolas"
  },
  "size": {
    "body": 12,
    "heading1": 22,
    "heading2": 18,
    "heading3": 16,
    "heading4": 14,
    "heading5": 12,
    "heading6": 11,
    "code": 10
  },
  "spacing": {
    "lineSpacing": 1.5,
    "paragraphSpacing": 6,
    "headingSpacing": 12
  },
  "margin": {
    "top": 1440,
    "bottom": 1440,
    "left": 1800,
    "right": 1800
  },
  "color": {
    "heading": "000000",
    "text": "000000",
    "link": "0563C1",
    "codeBackground": "F5F5F5",
    "blockquoteBorder": "CCCCCC"
  },
  "pageSize": "A4",
  "orientation": "portrait",
  "headerFooter": {
    "header": "Document Title",
    "footer": "Confidential",
    "pageNumbers": true
  },
  "image": {
    "maxWidthPercent": 80,
    "defaultAlign": "center"
  },
  "meta": {
    "title": "My Document",
    "author": "Author Name"
  }
}
```

---

## All Config Fields / 所有配置字段

### Fonts / 字体

| Key (KV format) | JSON path | Type | Default | Description / 描述 |
|---|---|---|---|---|
| `body-font` | `font.body` | string | `Microsoft YaHei` | Body text font / 正文字体 |
| `heading-font` | `font.heading` | string | `SimHei` | Heading font / 标题字体 |
| `english-font` | `font.english` | string | `Times New Roman` | English text font / 英文字体 |
| `code-font` | `font.code` | string | `Consolas` | Code block font / 代码字体 |

**Common Chinese fonts / 常用中文字体**: SimSun (宋体), SimHei (黑体), KaiTi (楷体), FangSong (仿宋), Microsoft YaHei (微软雅黑), DengXian (等线), STZhongsong (华文中宋), STXihei (华文细黑)

**Common English fonts / 常用英文字体**: Times New Roman, Arial, Calibri, Cambria, Georgia, Helvetica

### Sizes / 字号

| Key | JSON path | Type | Default | Description |
|---|---|---|---|---|
| `body-size` | `size.body` | number (pt) | `11` | Body font size / 正文字号 |
| `h1-size` | `size.heading1` | number (pt) | `22` | H1 size / 一级标题字号 |
| `h2-size` | `size.heading2` | number (pt) | `18` | H2 size / 二级标题字号 |
| `h3-size` | `size.heading3` | number (pt) | `16` | H3 size / 三级标题字号 |
| `h4-size` | `size.heading4` | number (pt) | `14` | H4 size / 四级标题字号 |
| `h5-size` | `size.heading5` | number (pt) | `12` | H5 size / 五级标题字号 |
| `h6-size` | `size.heading6` | number (pt) | `11` | H6 size / 六级标题字号 |
| `code-size` | `size.code` | number (pt) | `10` | Code font size / 代码字号 |

**Common Chinese sizes / 常用中文字号对照**: 小四=12pt, 四号=14pt, 小三=15pt, 三号=16pt, 小二=18pt, 二号=22pt, 小一=24pt, 一号=26pt

### Spacing / 间距

| Key | JSON path | Type | Default | Description |
|---|---|---|---|---|
| `line-spacing` | `spacing.lineSpacing` | number | `1.5` | Line spacing multiplier / 行间距倍数 |
| `paragraph-spacing` | `spacing.paragraphSpacing` | number (pt) | `6` | Space after paragraph / 段后间距 |
| `heading-spacing` | `spacing.headingSpacing` | number (pt) | `12` | Space after heading / 标题后间距 |

### Margins / 页边距

Unit: **twips** (1 inch = 1440 twips, 1 cm ≈ 567 twips)

| Key | JSON path | Type | Default | Description |
|---|---|---|---|---|
| `margin-top` | `margin.top` | number (twips) | `1440` | Top margin / 上边距 |
| `margin-bottom` | `margin.bottom` | number (twips) | `1440` | Bottom margin / 下边距 |
| `margin-left` | `margin.left` | number (twips) | `1440` | Left margin / 左边距 |
| `margin-right` | `margin.right` | number (twips) | `1440` | Right margin / 右边距 |

**Margin presets / 页边距预设**:
| Preset | Top | Bottom | Left | Right | Description |
|---|---|---|---|---|---|
| Normal | 1440 | 1440 | 1440 | 1440 | 1" all sides / 全部 1 英寸 |
| Narrow | 720 | 720 | 720 | 720 | 0.5" all sides / 全部 0.5 英寸 |
| Moderate | 1440 | 1440 | 1080 | 1080 | 1"/0.75" / 上下1"左右0.75" |
| Wide | 1440 | 1440 | 2880 | 2880 | 1"/2" / 上下1"左右2" |
| Academic | 1440 | 1440 | 1800 | 1800 | Standard academic / 学术标准 (1"/1.25") |

### Colors / 颜色

Use hex format: `#RRGGBB` (in KV) or `RRGGBB` (in JSON, no #).

| Key | JSON path | Default | Description |
|---|---|---|---|
| `heading-color` | `color.heading` | `#000000` | Heading text color / 标题颜色 |
| `text-color` | `color.text` | `#000000` | Body text color / 正文颜色 |
| `link-color` | `color.link` | `#0563C1` | Link color / 链接颜色 |
| `code-bg-color` | `color.codeBackground` | `#F5F5F5` | Code background / 代码背景色 |
| `quote-border-color` | `color.blockquoteBorder` | `#CCCCCC` | Blockquote border / 引用边框色 |

### Page Layout / 页面布局

| Key | JSON path | Values | Default | Description |
|---|---|---|---|---|
| `page-size` | `pageSize` | `A4`, `Letter` | `A4` | Page size / 纸张大小 |
| `orientation` | `orientation` | `portrait`, `landscape` | `portrait` | Orientation / 页面方向 |

### Header & Footer / 页眉页脚

| Key | JSON path | Type | Default | Description |
|---|---|---|---|---|
| `header-text` | `headerFooter.header` | string | (empty) | Header text / 页眉文本 |
| `footer-text` | `headerFooter.footer` | string | (empty) | Footer text / 页脚文本 |
| `page-numbers` | `headerFooter.pageNumbers` | boolean | `false` | Show page numbers / 显示页码 |

### Images / 图片

| Key | JSON path | Type | Default | Description |
|---|---|---|---|---|
| `image-max-width` | `image.maxWidthPercent` | number (1-100) | `80` | Max image width % / 最大图片宽度% |
| `image-align` | `image.defaultAlign` | `left`, `center`, `right` | `center` | Default alignment / 默认对齐 |

### Document Metadata / 文档元数据

| Key | JSON path | Type | Default | Description |
|---|---|---|---|---|
| `doc-title` | `meta.title` | string | `My Document` | Document title / 文档标题 |
| `doc-author` | `meta.author` | string | (empty) | Author name / 作者 |

---

## Preset Templates / 预设模板

### Academic Paper / 学术论文
```
body-font: SimSun
heading-font: SimHei
english-font: Times New Roman
code-font: Courier New
body-size: 12
h1-size: 22
h2-size: 18
h3-size: 16
h4-size: 14
h5-size: 12
h6-size: 12
code-size: 10
line-spacing: 1.5
paragraph-spacing: 0
heading-spacing: 12
margin-top: 1440
margin-bottom: 1440
margin-left: 1800
margin-right: 1800
heading-color: #000000
text-color: #000000
link-color: #000000
page-size: A4
orientation: portrait
page-numbers: true
image-max-width: 80
image-align: center
```

### Business Report / 商务报告
```
body-font: Microsoft YaHei
heading-font: Microsoft YaHei
english-font: Calibri
code-font: Consolas
body-size: 11
h1-size: 24
h2-size: 18
h3-size: 14
h4-size: 12
h5-size: 11
h6-size: 11
code-size: 10
line-spacing: 1.5
paragraph-spacing: 6
heading-spacing: 12
margin-top: 1440
margin-bottom: 1440
margin-left: 1440
margin-right: 1440
heading-color: #1a3c6e
text-color: #333333
link-color: #0563C1
page-size: A4
orientation: portrait
page-numbers: true
image-max-width: 90
image-align: center
```

### Resume / 简历
```
body-font: Microsoft YaHei
heading-font: SimHei
english-font: Arial
code-font: Consolas
body-size: 11
h1-size: 20
h2-size: 14
h3-size: 12
h4-size: 11
h5-size: 11
h6-size: 11
code-size: 10
line-spacing: 1.15
paragraph-spacing: 3
heading-spacing: 6
margin-top: 720
margin-bottom: 720
margin-left: 720
margin-right: 720
heading-color: #2c3e50
text-color: #333333
link-color: #3498db
page-size: A4
orientation: portrait
page-numbers: false
image-max-width: 30
image-align: right
```

---

## Example Prompt for AI / 给 AI 的示例提示

> "Based on the following config specification, generate a Key-Value config text for a Chinese university graduation thesis. Requirements: body text SimSun 12pt, headings SimHei, English Times New Roman, 1.5x line spacing, A4, margins top/bottom 2.54cm left/right 3.18cm, page numbers enabled, no bold links."
>
> "根据以下配置规范，为中国大学毕业论文生成一段 Key-Value 配置文本。要求：正文宋体小四（12pt），标题黑体，英文 Times New Roman，1.5 倍行距，A4 纸，页边距上下 2.54cm 左右 3.18cm，启用页码，链接不要蓝色用黑色。"
