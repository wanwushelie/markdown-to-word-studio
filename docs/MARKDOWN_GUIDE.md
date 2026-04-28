# Markdown Guide / Markdown 使用说明

## 1. Basics / 基础语法

### Heading / 标题

```md
# H1
## H2
### H3
```

### Emphasis / 强调

```md
**bold**
*italic*
<u>underline</u>
~~strikethrough~~
```

### List / 列表

```md
- item A
- item B

1. first
2. second
```

### Quote / 引用

```md
> This is a quote.
```

### Code / 代码

Inline:

```md
Use `npm run build`.
```

Block:

```md
```ts
console.log("hello");
```
```

### Table / 表格

```md
| Name | Age |
|------|-----|
| Tom  | 18  |
```

### Link & Image / 链接与图片

```md
[OpenAI](https://openai.com)
![Alt text](https://example.com/image.png)
```

## 2. Line Break Rules / 换行规则

- Single Enter normally does not create a visible line break in standard Markdown.
- 在标准 Markdown 中，单次回车通常不会产生可见换行。

Use one of these:

- Insert a blank line for a new paragraph.
- 空一行，形成新段落。
- Add two spaces at line end, then press Enter.
- 行尾加两个空格再回车。
- Use `<br>` for explicit line break.
- 使用 `<br>` 强制换行。

## 3. Notes for This Project / 本项目说明

- Core conversion target: Markdown -> `.docx`
- 核心转换目标：Markdown -> `.docx`
- Some preview/export capabilities are optional and controlled by runtime capabilities.
- 预览/导出能力可能按运行环境开关启用。
