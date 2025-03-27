// 全局变量
const selectedImages = [];
const CANVAS_WIDTH = 1242;
const CANVAS_HEIGHT = 1656;
let GRID_SIZE = 2; // 默认2x2网格

// 文字配置
let customFont = null;
const textConfig = {
    topText: '',
    bottomText: '',
    fontSize: 40,
    textColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 2
};

// 布局配置
const layoutConfig = {
    4: { size: 2, name: '四宫格' },
    9: { size: 3, name: '九宫格' }
};

/**
 * 从文件名中提取编号
 * 支持格式：
 * - 1.jpg, 01.jpg, 001.jpg
 * - image1.jpg, image01.jpg
 * - 1-xxx.jpg, 01-xxx.jpg
 * - xxx-1.jpg, xxx-01.jpg
 */
function extractNumber(filename) {
    // 移除文件扩展名
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    
    // 尝试匹配不同格式的数字
    const matches = nameWithoutExt.match(/\d+/);
    
    if (matches) {
        return parseInt(matches[0], 10);
    }
    return Infinity; // 如果没有数字，放到最后
}

// DOM 元素
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const uploadButton = document.getElementById('uploadButton');
const selectedImagesContainer = document.getElementById('selectedImages');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const downloadSection = document.querySelector('.download-section');
const clearPreviewBtn = document.getElementById('clearPreviewBtn');
const clearCollageBtn = document.getElementById('clearCollageBtn');
const gapSizeSlider = document.getElementById('gapSize');
const gapSizeValue = document.getElementById('gapSizeValue');
const collageContainer = document.getElementById('collageContainer');

// 文字控制元素
const fontFile = document.getElementById('fontFile');
const fontUploadBtn = document.getElementById('fontUploadBtn');
const fontName = document.getElementById('fontName');
const textTop = document.getElementById('textTop');
const textBottom = document.getElementById('textBottom');
const fontSize = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const textColor = document.getElementById('textColor');
const strokeColor = document.getElementById('strokeColor');
const strokeWidth = document.getElementById('strokeWidth');
const strokeWidthValue = document.getElementById('strokeWidthValue');
const clearTextBtn = document.getElementById('clearTextBtn');
const applyTextBtn = document.getElementById('applyTextBtn');

// 添加新的 DOM 元素引用
const previewModal = document.getElementById('previewModal');
const modalClose = document.getElementById('modalClose');
const modalImage = document.getElementById('modalImage');
const clearFontBtn = document.getElementById('clearFontBtn');
const layout4Btn = document.getElementById('layout4');
const layout9Btn = document.getElementById('layout9');
const saveSettingsBtn = document.getElementById('saveSettings');
const settingsSlots = document.querySelectorAll('.settings-slot');

// 事件监听器
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('drop', handleDrop);
uploadButton.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', handleFileSelect);
generateBtn.addEventListener('click', generateCollages);
downloadBtn.addEventListener('click', downloadAllImages);
clearPreviewBtn.addEventListener('click', clearPreview);
clearCollageBtn.addEventListener('click', clearCollages);
gapSizeSlider.addEventListener('input', updateGapSize);

// 添加文字相关的事件监听器
fontUploadBtn.addEventListener('click', () => fontFile.click());
fontFile.addEventListener('change', handleFontUpload);
textTop.addEventListener('input', updateTextConfig);
textBottom.addEventListener('input', updateTextConfig);
fontSize.addEventListener('input', updateTextConfig);
textColor.addEventListener('input', updateTextConfig);
strokeColor.addEventListener('input', updateTextConfig);
strokeWidth.addEventListener('input', updateTextConfig);
clearTextBtn.addEventListener('click', clearText);
applyTextBtn.addEventListener('click', generateCollages);

// 添加新的事件监听器
modalClose.addEventListener('click', closePreview);
previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) {
        closePreview();
    }
});
clearFontBtn.addEventListener('click', clearFont);
layout4Btn.addEventListener('click', () => switchLayout(4));
layout9Btn.addEventListener('click', () => switchLayout(9));
saveSettingsBtn.addEventListener('click', showSaveDialog);
settingsSlots.forEach(slot => {
    const loadBtn = slot.querySelector('.load-btn');
    const deleteBtn = slot.querySelector('.delete-btn');
    if (loadBtn) loadBtn.addEventListener('click', () => loadSettings(slot.dataset.slot));
    if (deleteBtn) deleteBtn.addEventListener('click', () => deleteSettings(slot.dataset.slot));
});

// 添加键盘事件监听
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && previewModal.classList.contains('active')) {
        closePreview();
    }
});

/**
 * 更新间距值显示
 */
function updateGapSize() {
    gapSizeValue.textContent = gapSizeSlider.value;
    if (collageContainer.children.length > 0) {
        generateCollages(); // 重新生成拼图
    }
}

/**
 * 处理拖拽文件
 */
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.style.borderColor = '#0071e3';
}

/**
 * 处理文件拖放
 */
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.style.borderColor = '#d2d2d7';
    
    const files = [...e.dataTransfer.files];
    handleFiles(files);
}

/**
 * 处理文件选择
 */
function handleFileSelect(e) {
    const files = [...e.target.files];
    handleFiles(files);
}

/**
 * 处理文件上传
 */
function handleFiles(files) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const promises = [];
    
    // 创建所有图片加载的Promise
    for (const file of imageFiles) {
        promises.push(new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    resolve({
                        element: img,
                        file: file,
                        originalName: file.name,
                        number: extractNumber(file.name)
                    });
                };
            };
            reader.readAsDataURL(file);
        }));
    }
    
    // 等待所有图片加载完成后排序并更新
    Promise.all(promises).then(newImages => {
        // 按编号排序
        newImages.sort((a, b) => a.number - b.number);
        
        // 添加到已有图片列表
        selectedImages.push(...newImages);
        updatePreview();
    });
}

/**
 * 更新预览区域
 */
function updatePreview() {
    selectedImagesContainer.innerHTML = '';
    
    selectedImages.forEach((image, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'preview-image';
        
        // 添加编号标签
        const numberLabel = document.createElement('div');
        numberLabel.className = 'image-number';
        numberLabel.textContent = image.number === Infinity ? '-' : image.number;
        
        const img = document.createElement('img');
        img.src = image.element.src;
        
        imgContainer.appendChild(img);
        imgContainer.appendChild(numberLabel);
        selectedImagesContainer.appendChild(imgContainer);
    });

    generateBtn.disabled = selectedImages.length === 0;
    clearPreviewBtn.disabled = selectedImages.length === 0;
}

/**
 * 清除预览区域
 */
function clearPreview() {
    selectedImages.length = 0;
    updatePreview();
    clearCollages();
}

/**
 * 清除拼图
 */
function clearCollages() {
    collageContainer.innerHTML = '';
    downloadSection.style.display = 'none';
}

/**
 * 切换布局
 */
function switchLayout(gridCount) {
    const layoutBtns = document.querySelectorAll('.layout-btn');
    layoutBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-grid="${gridCount}"]`).classList.add('active');
    
    GRID_SIZE = layoutConfig[gridCount].size;
    if (collageContainer.children.length > 0) {
        generateCollages();
    }
}

/**
 * 获取当前设置
 */
function getCurrentSettings() {
    return {
        gridSize: GRID_SIZE,
        gapSize: gapSizeSlider.value,
        textConfig: { ...textConfig },
        customFont: customFont,
        timestamp: new Date().toLocaleString()
    };
}

/**
 * 显示保存对话框
 */
function showSaveDialog() {
    const settings = getCurrentSettings();
    const emptySlots = [];
    settingsSlots.forEach((slot, index) => {
        if (!localStorage.getItem(`settings_${index + 1}`)) {
            emptySlots.push(index + 1);
        }
    });

    if (emptySlots.length === 0) {
        const confirmed = confirm('所有槽位都已被占用，是否覆盖最旧的设置？');
        if (confirmed) {
            saveSettings(1); // 覆盖第一个槽位
        }
    } else {
        saveSettings(emptySlots[0]);
    }
}

/**
 * 保存设置
 */
function saveSettings(slotNumber) {
    const settings = getCurrentSettings();
    localStorage.setItem(`settings_${slotNumber}`, JSON.stringify(settings));
    updateSettingsSlots();
}

/**
 * 加载设置
 */
function loadSettings(slotNumber) {
    const settings = JSON.parse(localStorage.getItem(`settings_${slotNumber}`));
    if (!settings) return;

    // 应用布局
    switchLayout(settings.gridSize === 2 ? 4 : 9);
    
    // 应用间距
    gapSizeSlider.value = settings.gapSize;
    gapSizeValue.textContent = settings.gapSize;
    
    // 应用文字设置
    textConfig.topText = settings.textConfig.topText;
    textConfig.bottomText = settings.textConfig.bottomText;
    textConfig.fontSize = settings.textConfig.fontSize;
    textConfig.textColor = settings.textConfig.textColor;
    textConfig.strokeColor = settings.textConfig.strokeColor;
    textConfig.strokeWidth = settings.textConfig.strokeWidth;
    
    // 更新输入框
    textTop.value = settings.textConfig.topText;
    textBottom.value = settings.textConfig.bottomText;
    fontSize.value = settings.textConfig.fontSize;
    textColor.value = settings.textConfig.textColor;
    strokeColor.value = settings.textConfig.strokeColor;
    strokeWidth.value = settings.textConfig.strokeWidth;
    
    // 重新生成拼图
    if (collageContainer.children.length > 0) {
        generateCollages();
    }
}

/**
 * 删除设置
 */
function deleteSettings(slotNumber) {
    if (confirm('确定要删除这组设置吗？')) {
        localStorage.removeItem(`settings_${slotNumber}`);
        updateSettingsSlots();
    }
}

/**
 * 更新设置槽位显示
 */
function updateSettingsSlots() {
    settingsSlots.forEach((slot, index) => {
        const slotNumber = index + 1;
        const settings = JSON.parse(localStorage.getItem(`settings_${slotNumber}`));
        const slotName = slot.querySelector('.slot-name');
        const loadBtn = slot.querySelector('.load-btn');
        const deleteBtn = slot.querySelector('.delete-btn');
        
        if (settings) {
            slot.classList.remove('empty');
            slotName.textContent = `设置 ${slotNumber} (${settings.timestamp})`;
            loadBtn.style.display = 'block';
            deleteBtn.style.display = 'block';
        } else {
            slot.classList.add('empty');
            slotName.textContent = `设置 ${slotNumber}`;
            loadBtn.style.display = 'none';
            deleteBtn.style.display = 'none';
        }
    });
}

/**
 * 加载保存的设置
 */
function loadSavedSettings() {
    updateSettingsSlots();
}

/**
 * 生成拼图
 */
function generateCollages() {
    clearCollages();
    
    const gap = parseInt(gapSizeSlider.value);
    const imagesPerGroup = GRID_SIZE * GRID_SIZE;
    const groups = Math.ceil(selectedImages.length / imagesPerGroup);
    
    for (let i = 0; i < groups; i++) {
        const startIndex = i * imagesPerGroup;
        const groupImages = selectedImages.slice(startIndex, startIndex + imagesPerGroup);
        
        if (groupImages.length > 0) {
            createCollage(groupImages, gap, i + 1);
        }
    }
    
    if (selectedImages.length > 0) {
        downloadSection.style.display = 'block';
    }
}

/**
 * 创建单个拼图
 */
function createCollage(images, gap, groupNumber) {
    const wrapper = document.createElement('div');
    wrapper.className = 'collage-wrapper';
    
    // 创建标题和下载按钮容器
    const header = document.createElement('div');
    header.className = 'collage-header';
    
    const title = document.createElement('p');
    title.className = 'collage-title';
    title.textContent = `拼图 ${groupNumber}`;
    
    const downloadButton = document.createElement('button');
    downloadButton.className = 'secondary-btn';
    downloadButton.textContent = '下载';
    downloadButton.style.padding = '0.5rem 1rem';
    downloadButton.style.fontSize = '0.9rem';
    
    header.appendChild(title);
    header.appendChild(downloadButton);
    wrapper.appendChild(header);
    
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.className = 'collage-canvas';
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 计算单个图片的尺寸
    const availableWidth = CANVAS_WIDTH - (gap * (GRID_SIZE + 1));
    const availableHeight = CANVAS_HEIGHT - (gap * (GRID_SIZE + 1));
    const imageWidth = availableWidth / GRID_SIZE;
    const imageHeight = availableHeight / GRID_SIZE;
    
    // 绘制图片
    images.forEach((image, index) => {
        const row = Math.floor(index / GRID_SIZE);
        const col = index % GRID_SIZE;
        
        const x = gap + col * (imageWidth + gap);
        const y = gap + row * (imageHeight + gap);
        
        // 绘制图片
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, imageWidth, imageHeight, 8); // 添加圆角
        ctx.clip();
        ctx.drawImage(image.element, x, y, imageWidth, imageHeight);
        ctx.restore();
        
        // 绘制间隔线
        ctx.fillStyle = '#f0f0f0';
        if (col < GRID_SIZE - 1) {
            ctx.fillRect(x + imageWidth, y, gap, imageHeight);
        }
        if (row < GRID_SIZE - 1) {
            ctx.fillRect(x, y + imageHeight, imageWidth, gap);
        }
    });

    // 绘制文字
    if (textConfig.topText || textConfig.bottomText) {
        // 添加半透明遮罩
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, 'rgba(0,0,0,0.4)');
        gradient.addColorStop(0.3, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.7, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        if (textConfig.topText) {
            drawText(ctx, textConfig.topText, CANVAS_HEIGHT / 3);
        }
        if (textConfig.bottomText) {
            drawText(ctx, textConfig.bottomText, CANVAS_HEIGHT * 2 / 3);
        }
    }
    
    // 添加预览点击事件
    canvas.addEventListener('click', () => {
        openPreview(canvas.toDataURL('image/png'));
    });
    
    // 添加下载事件监听器
    downloadButton.addEventListener('click', (e) => {
        e.stopPropagation(); // 防止触发预览
        downloadSingleCollage(canvas, groupNumber);
    });
    
    wrapper.appendChild(canvas);
    collageContainer.appendChild(wrapper);
}

/**
 * 下载单个拼图
 */
function downloadSingleCollage(canvas, groupNumber) {
    const link = document.createElement('a');
    link.download = `collage_${groupNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

/**
 * 下载所有拼图
 */
function downloadAllImages() {
    const canvases = document.querySelectorAll('.collage-canvas');
    canvases.forEach((canvas, index) => {
        downloadSingleCollage(canvas, index + 1);
    });
}

/**
 * 处理字体文件上传
 */
function handleFontUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fontFace = new FontFace('CustomFont', e.target.result);
            fontFace.load().then(function(loadedFace) {
                document.fonts.add(loadedFace);
                customFont = 'CustomFont';
                fontName.textContent = file.name;
                clearFontBtn.style.display = 'block'; // 显示清除按钮
                generateCollages(); // 重新生成拼图
            }).catch(function(error) {
                alert('字体加载失败，请检查文件是否正确');
                console.error(error);
            });
        };
        reader.readAsArrayBuffer(file);
    }
}

/**
 * 更新文字配置
 */
function updateTextConfig() {
    textConfig.topText = textTop.value;
    textConfig.bottomText = textBottom.value;
    textConfig.fontSize = parseInt(fontSize.value);
    textConfig.textColor = textColor.value;
    textConfig.strokeColor = strokeColor.value;
    textConfig.strokeWidth = parseInt(strokeWidth.value);
    
    fontSizeValue.textContent = `${textConfig.fontSize}px`;
    strokeWidthValue.textContent = `${textConfig.strokeWidth}px`;
    
    if (collageContainer.children.length > 0) {
        generateCollages(); // 实时更新拼图
    }
}

/**
 * 清除文字
 */
function clearText() {
    textTop.value = '';
    textBottom.value = '';
    fontSize.value = 40;
    textColor.value = '#ffffff';
    strokeColor.value = '#000000';
    strokeWidth.value = 2;
    updateTextConfig();
}

/**
 * 在画布上绘制文字
 */
function drawText(ctx, text, y) {
    const x = CANVAS_WIDTH / 2;
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${textConfig.fontSize}px ${customFont || '-apple-system'}`;
    
    // 绘制描边
    if (textConfig.strokeWidth > 0) {
        ctx.strokeStyle = textConfig.strokeColor;
        ctx.lineWidth = textConfig.strokeWidth;
        ctx.strokeText(text, x, y);
    }
    
    // 绘制文字阴影
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    
    // 绘制文字
    ctx.fillStyle = textConfig.textColor;
    ctx.fillText(text, x, y);
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

/**
 * 打开预览
 */
function openPreview(imageSrc) {
    modalImage.src = imageSrc;
    previewModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

/**
 * 关闭预览
 */
function closePreview() {
    previewModal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * 清除自定义字体
 */
function clearFont() {
    customFont = null;
    fontName.textContent = '默认字体';
    clearFontBtn.style.display = 'none';
    fontFile.value = ''; // 清除文件输入
    generateCollages(); // 重新生成拼图
} 