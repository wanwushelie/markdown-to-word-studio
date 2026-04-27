export const htmlTemplates: Record<string, string> = {
  modernDark: `
    .html-creative-preview { font-family: 'Inter', system-ui, sans-serif; background: #121212; color: #e0e0e0; padding: 40px; border-radius: 8px; line-height: 1.8; font-size: 16px; }
    .html-creative-preview h1, .html-creative-preview h2, .html-creative-preview h3, .html-creative-preview h4, .html-creative-preview h5, .html-creative-preview h6 { color: #ffffff; font-weight: 700; letter-spacing: -0.02em; margin: 1.5em 0 0.5em 0; }
    .html-creative-preview h1 { font-size: 2.5em; border-bottom: 2px solid #333; padding-bottom: 10px; margin-top: 0; }
    .html-creative-preview h2 { font-size: 1.8em; border-bottom: 1px solid #222; padding-bottom: 8px; }
    .html-creative-preview p { margin: 1em 0; color: #b0b0b0; }
    .html-creative-preview a { color: #64ffda; text-decoration: none; border-bottom: 1px dashed #64ffda; transition: all 0.2s; }
    .html-creative-preview a:hover { color: #121212; background: #64ffda; }
    .html-creative-preview ul, .html-creative-preview ol { margin: 1em 0; padding-left: 2em; color: #b0b0b0; }
    .html-creative-preview li { margin-bottom: 0.5em; }
    .html-creative-preview blockquote { border-left: 4px solid #64ffda; margin: 1.5em 0; padding: 1em 1.5em; background: #1e1e1e; font-style: italic; border-radius: 0 8px 8px 0; }
    .html-creative-preview pre { background: #1e1e1e; padding: 20px; border-radius: 8px; border: 1px solid #333; overflow-x: auto; margin: 1.5em 0; }
    .html-creative-preview code { color: #ff8a65; font-family: 'Fira Code', Consolas, monospace; font-size: 0.9em; padding: 0.2em 0.4em; background: rgba(255,255,255,0.05); border-radius: 4px; }
    .html-creative-preview pre code { color: #e0e0e0; background: transparent; padding: 0; }
    .html-creative-preview table { width: 100%; border-collapse: collapse; margin: 2em 0; }
    .html-creative-preview th, .html-creative-preview td { border-bottom: 1px solid #333; padding: 12px; text-align: left; }
    .html-creative-preview th { color: #ffffff; background: #1e1e1e; }
    .html-creative-preview img { max-width: 100%; border-radius: 8px; margin: 1.5em 0; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
    .html-creative-preview hr { border: 0; border-top: 1px solid #333; margin: 2em 0; }
  `,
  glassmorphism: `
    .html-creative-preview { font-family: 'Poppins', sans-serif; min-height: 100%; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 40px; font-size: 16px; }
    .html-creative-preview .glass-container { background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.5); padding: 40px; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1); color: #2d3748; }
    .html-creative-preview h1, .html-creative-preview h2, .html-creative-preview h3 { color: #1a202c; margin: 1.2em 0 0.5em 0; }
    .html-creative-preview h1 { font-size: 2.8em; text-align: center; text-transform: uppercase; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); margin-bottom: 1em; margin-top: 0; }
    .html-creative-preview p { line-height: 1.8; margin: 1em 0; }
    .html-creative-preview ul, .html-creative-preview ol { margin: 1em 0; padding-left: 2.5em; line-height: 1.8; }
    .html-creative-preview li { margin-bottom: 0.5em; }
    .html-creative-preview blockquote { background: rgba(255,255,255,0.6); border-left: 5px solid #4a90e2; padding: 15px 20px; border-radius: 0 10px 10px 0; font-weight: 500; margin: 1.5em 0; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .html-creative-preview pre { background: rgba(0,0,0,0.8); border-radius: 12px; padding: 20px; color: #a0aec0; margin: 1.5em 0; box-shadow: inset 0 2px 10px rgba(0,0,0,0.2); overflow-x: auto; font-family: Consolas, monospace; }
    .html-creative-preview code { font-family: Consolas, monospace; color: #d53f8c; background: rgba(255,255,255,0.5); padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; }
    .html-creative-preview pre code { color: #a0aec0; background: transparent; padding: 0; }
    .html-creative-preview a { color: #4a90e2; font-weight: 600; text-decoration: none; }
    .html-creative-preview img { border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 100%; margin: 1.5em 0; }
    .html-creative-preview table { width: 100%; border-collapse: collapse; margin: 1.5em 0; background: rgba(255,255,255,0.3); border-radius: 8px; overflow: hidden; }
    .html-creative-preview th, .html-creative-preview td { padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.05); }
    .html-creative-preview hr { border: 0; border-top: 1px solid rgba(0,0,0,0.1); margin: 2em 0; }
  `,
  magazine: `
    .html-creative-preview { font-family: 'Georgia', serif; background: #fffcf8; color: #1a1a1a; padding: 50px 10%; line-height: 1.8; font-size: 18px; }
    .html-creative-preview h1, .html-creative-preview h2, .html-creative-preview h3 { font-family: 'Playfair Display', serif; font-weight: 400; color: #d9534f; margin: 1.5em 0 0.5em 0; }
    .html-creative-preview h1 { font-size: 4em; text-align: center; margin-top: 0; margin-bottom: 0.2em; }
    .html-creative-preview h1::after { content: ''; display: block; width: 60px; height: 3px; background: #d9534f; margin: 20px auto 40px; }
    .html-creative-preview h2 { font-size: 2em; margin-top: 2em; }
    .html-creative-preview p { text-align: justify; margin-bottom: 1.5em; }
    .html-creative-preview p:first-of-type::first-letter { float: left; font-size: 4.5em; line-height: 0.8; margin-right: 0.1em; font-weight: bold; color: #d9534f; font-family: 'Playfair Display', serif; }
    .html-creative-preview ul, .html-creative-preview ol { margin: 1.5em 0; padding-left: 2em; }
    .html-creative-preview li { margin-bottom: 0.5em; padding-left: 0.5em; }
    .html-creative-preview blockquote { font-size: 1.6em; text-align: center; font-style: italic; color: #555; margin: 2em 0; padding: 2em 0; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; }
    .html-creative-preview pre { background: #f4f4f4; padding: 20px; margin: 1.5em 0; border-left: 4px solid #d9534f; font-family: monospace; font-size: 0.85em; overflow-x: auto; }
    .html-creative-preview code { font-family: monospace; font-size: 0.9em; background: #f4f4f4; padding: 0.2em 0.4em; }
    .html-creative-preview pre code { background: transparent; padding: 0; }
    .html-creative-preview table { width: 100%; border-top: 2px solid #1a1a1a; border-bottom: 2px solid #1a1a1a; margin: 2em 0; border-collapse: collapse; }
    .html-creative-preview th, .html-creative-preview td { padding: 15px; border-bottom: 1px solid #ddd; }
    .html-creative-preview img { max-width: 100%; margin: 2em 0; border: 1px solid #eee; padding: 10px; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .html-creative-preview hr { border: 0; text-align: center; margin: 3em 0; }
    .html-creative-preview hr::after { content: '***'; font-size: 2em; letter-spacing: 0.5em; color: #ccc; }
  `,
  neonCyber: `
    .html-creative-preview { font-family: 'Courier New', Courier, monospace; background: #050505; color: #0f0; padding: 40px; text-shadow: 0 0 5px #0f0; min-height: 100%; font-size: 16px; }
    .html-creative-preview h1, .html-creative-preview h2, .html-creative-preview h3 { text-transform: uppercase; margin: 1.5em 0 0.5em 0; }
    .html-creative-preview h1 { font-size: 3em; color: #f0f; margin-top: 0; text-shadow: 0 0 10px #f0f, 0 0 20px #f0f, 0 0 30px #f0f; letter-spacing: 5px; border-bottom: 2px solid #f0f; padding-bottom: 10px; margin-bottom: 30px; animation: glitch 2s linear infinite; }
    .html-creative-preview h2 { color: #0ff; text-shadow: 0 0 5px #0ff, 0 0 10px #0ff; border-left: 5px solid #0ff; padding-left: 15px; margin-top: 40px; }
    .html-creative-preview p { line-height: 1.6; margin: 1em 0; }
    .html-creative-preview ul, .html-creative-preview ol { margin: 1.5em 0; padding-left: 2em; list-style-type: square; }
    .html-creative-preview li { margin-bottom: 0.5em; }
    .html-creative-preview a { color: #ff0; text-decoration: none; text-shadow: 0 0 5px #ff0; border-bottom: 1px solid #ff0; }
    .html-creative-preview a:hover { background: #ff0; color: #000; text-shadow: none; }
    .html-creative-preview blockquote { border: 1px solid #0f0; padding: 20px; background: rgba(0, 255, 0, 0.1); margin: 30px 0; box-shadow: inset 0 0 15px rgba(0, 255, 0, 0.2); }
    .html-creative-preview pre { background: #111; border: 1px solid #333; margin: 1.5em 0; padding: 20px; color: #fff; text-shadow: none; overflow-x: auto; box-shadow: 0 0 10px rgba(255,255,255,0.1); }
    .html-creative-preview code { color: #f0f; text-shadow: none; }
    .html-creative-preview pre code { color: #fff; }
    .html-creative-preview table { width: 100%; border-collapse: separate; border-spacing: 2px; margin: 30px 0; }
    .html-creative-preview th { background: rgba(0,255,0,0.2); color: #0f0; padding: 10px; border: 1px solid #0f0; }
    .html-creative-preview td { padding: 10px; border: 1px solid rgba(0,255,0,0.3); }
    .html-creative-preview img { max-width: 100%; border: 2px solid #0ff; box-shadow: 0 0 15px #0ff; margin: 1.5em 0; }
    .html-creative-preview hr { border: 0; border-top: 1px dashed #0f0; margin: 2em 0; }
    @keyframes glitch { 2%, 64% { transform: translate(2px,0) skew(0deg); } 4%, 60% { transform: translate(-2px,0) skew(0deg); } 62% { transform: translate(0,0) skew(5deg); } }
  `
};

export const PRESETS: Record<string, string> = {
  academic: `body-font: SimSun
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
image-align: center`,
  business: `body-font: Microsoft YaHei
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
image-align: center`,
  resume: `body-font: Microsoft YaHei
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
image-align: right`
};
