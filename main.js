// main.js - Гарантированная инициализация

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const taskInput = document.getElementById('taskInput');
    const diagramContainer = document.getElementById('diagramContainer');
    const formulaOutput = document.getElementById('formulaOutput');

    // --- 1. ТЕСТОВЫЕ ДАННЫЕ (Имитация ответа ИИ) ---
    const MOCK_RESPONSE = {
        environment: {
            type: "inclined_plane",
            angle: 30, // Угол наклона в градусах
            friction: true
        },
        objects: [
            { "id": "block1", "mass": 2, "unit": "kg" }
        ],
        // Формулы в формате LaTeX
        formulas: [
            "$$\\text{Уравнение движения по оси } Ox:$$",
            "$$\\sum F_x = ma \\implies mg\\sin(\\alpha) - F_{tr} = ma$$",
            "$$\\text{Условие равновесия по оси } Oy:$$",
            "$$\\sum F_y = 0 \\implies N - mg\\cos(\\alpha) = 0$$",
            "$$\\text{Сила трения:}$$",
            "$$F_{tr} = \\mu N$$"
        ]
    };

    // --- 2. НАСТРОЙКА KONVA.JS ---
    // Получаем фактические размеры контейнера (важно для Konva)
    const stage = new Konva.Stage({
        container: 'diagramContainer',
        width: diagramContainer.clientWidth, 
        height: diagramContainer.clientHeight, 
    });
    
    const layer = new Konva.Layer();
    stage.add(layer);
    
    // Функция, которая гарантирует, что Konva адаптируется при изменении размера окна
    window.addEventListener('resize', () => {
        stage.width(diagramContainer.clientWidth);
        stage.height(diagramContainer.clientHeight);
        // В реальном проекте здесь нужно вызвать renderDiagram(MOCK_RESPONSE) 
        // для перерисовки элементов с новыми пропорциями.
        layer.draw(); 
    });

    // --- Вспомогательная функция для рисования стрелок (векторов) ---
    function drawArrow(layer, x, y, angleDeg, length, label, color) {
        const angleRad = angleDeg * (Math.PI / 180);
        const endX = x + length * Math.cos(angleRad);
        const endY = y + length * Math.sin(angleRad);
        
        const arrow = new Konva.Arrow({
            points: [x, y, endX, endY],
            stroke: color,
            strokeWidth: 3,
            pointerLength: 10,
            pointerWidth: 10,
            fill: color,
        });
        layer.add(arrow);
        
        const text = new Konva.Text({
            x: endX + (angleDeg > 180 || angleDeg < 0 ? -20 : 5), 
            y: endY - 10,
            text: label,
            fontSize: 16,
            fill: color,
            fontFamily: 'Arial',
        });
        layer.add(text);
    }
    
    // --- 3. Основная функция рендеринга чертежа ---
    function renderDiagram(data) {
        layer.destroyChildren(); // Очищаем предыдущий чертеж
        
        // Пересчитываем центр на основе текущего размера Stage
        const centerX = stage.width() / 2;
        const centerY = stage.height() * 0.7; 
        
        if (data.environment.type === 'inclined_plane') {
            const angle = data.environment.angle; 
            const height = 150;
            const width = height / Math.tan(angle * (Math.PI / 180));
            
            // 1. Рисуем наклонную плоскость
            const plane = new Konva.Shape({
                sceneFunc: function (ctx, shape) {
                    ctx.beginPath();
                    ctx.moveTo(centerX - width / 2, centerY); 
                    ctx.lineTo(centerX + width / 2, centerY); 
                    ctx.lineTo(centerX - width / 2, centerY - height);
                    ctx.closePath();
                    ctx.fillStrokeShape(shape);
                },
                fill: '#2A4072',
                stroke: '#64FFDA',
                strokeWidth: 3,
            });
            layer.add(plane);

            // 2. Рисуем брусок
            const blockCenterY = centerY - height * 0.3; 
            const blockCenterX = centerX - width * 0.3;
            const blockCenter = {x: blockCenterX, y: blockCenterY};
            
            const block = new Konva.Rect({
                x: blockCenter.x - 20,
                y: blockCenter.y - 20,
                width: 40,
                height: 40,
                fill: '#64FFDA', 
                stroke: '#3C5B8B',
                strokeWidth: 2,
                rotation: -angle 
            });
            layer.add(block);
            
            // 3. Рисуем силы
            const forceLen = 80;

            // Гравитация
            drawArrow(layer, blockCenter.x, blockCenter.y, 90, forceLen, 'mg', 'red'); 
            
            // Нормальная сила
            drawArrow(layer, blockCenter.x, blockCenter.y, -(90 - angle), forceLen * 0.9, 'N', 'green'); 

            // Трение
            drawArrow(layer, blockCenter.x, blockCenter.y, 180 + angle, forceLen * 0.4, 'F_{tr}', 'orange');
            
            // Вставляем формулы
            formulaOutput.innerHTML = data.formulas.join('<br>');

            // Вставляем изображение чертежа для наглядности
            //  
            
        } else {
            formulaOutput.innerHTML = "Тип сцены не поддерживается для отрисовки.";
        }
        
        layer.draw();
    }


    // --- 4. Обработчик нажатия кнопки ---
    generateBtn.addEventListener('click', () => {
        // Здесь должен быть запрос к вашему ИИ/бэкенду.
        renderDiagram(MOCK_RESPONSE);
    });

    // --- 5. АВТОМАТИЧЕСКАЯ ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ---
    
    // 5.1. Добавляем начальный текст
    taskInput.value = "Пример: Брусок массой 2 кг скользит по наклонной плоскости с углом 30 градусов. Коэффициент трения 0.2. Найдите ускорение.";
    
    // 5.2. Автоматически рендерим чертеж при загрузке
    renderDiagram(MOCK_RESPONSE);
});
