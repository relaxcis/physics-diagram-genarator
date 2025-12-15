// main.js

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const taskInput = document.getElementById('taskInput');
    const diagramContainer = document.getElementById('diagramContainer');
    const formulaOutput = document.getElementById('formulaOutput');

    // --- 1. ТЕСТОВЫЕ ДАННЫЕ (Имитация ответа ИИ) ---
    // Эти данные будут использоваться для первоначального отображения при загрузке страницы.
    const MOCK_RESPONSE = {
        environment: {
            type: "inclined_plane",
            angle: 30, // Угол наклона в градусах
            friction: true
        },
        objects: [
            { "id": "block1", "mass": 2, "unit": "kg" }
        ],
        // Формулы в формате LaTeX (для рендеринга MathJax/KaTeX)
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
    const stage = new Konva.Stage({
        container: 'diagramContainer',
        width: diagramContainer.clientWidth,
        height: diagramContainer.clientHeight,
    });
    
    const layer = new Konva.Layer();
    stage.add(layer);

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
            x: endX + (angleDeg > 180 || angleDeg < 0 ? -20 : 5), // Смещение текста для читаемости
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
        
        const centerX = stage.width() / 2;
        const centerY = stage.height() * 0.7; // Смещаем чертеж немного вниз
        
        if (data.environment.type === 'inclined_plane') {
            const angle = data.environment.angle; 
            const height = 150;
            const width = height / Math.tan(angle * (Math.PI / 180));
            
            // 1. Рисуем наклонную плоскость (треугольник)
            const plane = new Konva.Shape({
                sceneFunc: function (ctx, shape) {
                    ctx.beginPath();
                    ctx.moveTo(centerX - width / 2, centerY); // Нижний левый угол
                    ctx.lineTo(centerX + width / 2, centerY); // Нижний правый угол
                    ctx.lineTo(centerX - width / 2, centerY - height); // Верхний угол
                    ctx.closePath();
                    ctx.fillStrokeShape(shape);
                },
                fill: '#2A4072', // Цвет, гармонирующий с фоном
                stroke: '#64FFDA',
                strokeWidth: 3,
            });
            layer.add(plane);

            // 2. Рисуем брусок (объект)
            const blockCenterY = centerY - height * 0.3; // Размещаем брусок на склоне
            const blockCenterX = centerX - width * 0.3;
            const blockCenter = {x: blockCenterX, y: blockCenterY};
            
            const block = new Konva.Rect({
                x: blockCenter.x - 20,
                y: blockCenter.y - 20,
                width: 40,
                height: 40,
                fill: '#64FFDA', // Акцентный цвет
                stroke: '#3C5B8B',
                strokeWidth: 2,
                rotation: -angle 
            });
            layer.add(block);
            
            // 3. Рисуем силы
            const forceLen = 80;

            // Гравитация: угол 90 градусов (строго вниз)
            drawArrow(layer, blockCenter.x, blockCenter.y, 90, forceLen, 'mg', 'red'); 
            
            // Нормальная сила: угол перпендикулярно плоскости (угол = 90 - alpha)
            drawArrow(layer, blockCenter.x, blockCenter.y, -(90 - angle), forceLen * 0.9, 'N', 'green'); 

            // Трение: параллельно плоскости (угол = 180 + alpha, против движения)
            drawArrow(layer, blockCenter.x, blockCenter.y, 180 + angle, forceLen * 0.4, 'F_{tr}', 'orange');
            
            // Вставляем формулы
            formulaOutput.innerHTML = data.formulas.join('<br>');

        } else {
            formulaOutput.innerHTML = "Тип сцены не поддерживается для отрисовки.";
        }
        
        layer.draw();
    }


    // --- 4. Обработчик нажатия кнопки ---
    generateBtn.addEventListener('click', () => {
        // В реальном проекте здесь будет запрос к LLM/AI. 
        // Сейчас просто используем заглушку.
        renderDiagram(MOCK_RESPONSE);
    });
    taskInput.value = "Пример: Брусок массой 2 кг скользит по наклонной плоскости с углом 30 градусов. Коэффициент трения 0.2. Найдите ускорение.";
    renderDiagram(MOCK_RESPONSE);
});
