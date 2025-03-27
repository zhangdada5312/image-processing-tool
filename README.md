# 图片处理工具

这是一个简单易用的图片处理工具，主要用于图片拼接和排版，采用苹果设计风格的界面。

## 核心功能

### 1. 文档转换
- PDF转图片（开发中）
- Word转图片（开发中）

### 2. 图片拼接
- 支持四宫格和九宫格两种布局
- 画布尺寸：1242 * 1656 px
- 小红书风格白色底板
- 可调节图片间距（0-30px）
- 保持图片高清晰度
- 支持批量上传和多组拼图
- 智能识别文件名编号并排序
- 支持拼图预览和放大查看

### 3. 文字添加
- 支持自定义字体（TTF格式）
- 支持添加上下两行文字
- 文字大小可调整（20-100px）
- 支持文字颜色自定义
- 支持文字描边颜色和宽度调整
- 文字阴影效果增强可读性

### 4. 设置管理
- 支持保存三组常用设置
- 可保存的设置包括：
  - 布局选择（四宫格/九宫格）
  - 图片间距
  - 文字内容和样式
  - 字体设置
- 设置带时间戳，方便识别
- 支持一键加载历史设置

## 使用说明

### 图片命名规则
工具支持以下文件命名格式的自动编号识别：
- 纯数字：`1.jpg`, `01.jpg`, `001.jpg`
- 前缀数字：`image1.jpg`, `image01.jpg`
- 带分隔符：`1-xxx.jpg`, `01-xxx.jpg`
- 后缀数字：`xxx-1.jpg`, `xxx-01.jpg`

### 操作步骤

1. 布局选择
   - 选择四宫格或九宫格布局
   - 布局可随时切换，拼图会自动重新生成

2. 图片上传
   - 点击"选择图片"按钮上传
   - 或直接拖拽图片到上传区域
   - 支持多图片同时上传

3. 图片管理
   - 上传的图片会按文件名中的编号自动排序
   - 可以随时点击"清除所有图片"重新选择
   - 点击任意拼图可放大预览

4. 拼图设置
   - 使用滑块调节图片间距（0-30像素）
   - 点击"生成拼图"按钮创建拼图
   - 每组拼图都有独立的下载按钮

5. 文字设置
   - 可选择上传自定义TTF字体
   - 输入上方和下方文字内容
   - 调整字体大小、颜色
   - 设置描边颜色和宽度
   - 可一键清除文字或字体

6. 设置管理
   - 点击"保存当前设置"保存当前配置
   - 最多可保存三组不同设置
   - 点击"加载"恢复历史设置
   - 点击"删除"移除不需要的设置

### 注意事项
- 四宫格模式每组拼图最多支持4张图片
- 九宫格模式每组拼图最多支持9张图片
- 图片会按照文件名中的编号顺序排列
- 没有编号的图片会排在最后
- 支持多组拼图同时生成
- 设置保存在浏览器本地，清除浏览器数据会导致设置丢失

## 技术栈
- HTML5
- CSS3
- JavaScript
- Canvas API
- Web Font API
- Local Storage API

## 版本历史
- v0.3: 添加九宫格布局、设置保存功能、拼图预览功能
- v0.2: 添加图片编号识别和排序功能，支持单独下载拼图
- v0.1: 基础图片拼接功能 