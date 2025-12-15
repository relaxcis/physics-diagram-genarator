// main.js

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const taskInput = document.getElementById('taskInput');
    const diagramContainer = document.getElementById('diagramContainer');

    // Настройка сцены Konva
    const stage = new Konva.Stage({
        container: 'diagramContainer',
        width: diagramContainer.clientWidth,
        height: diagramContainer.clientHeight,
    });
    
    // Создаем слой для рисования
    const layer = new Konva.Layer();
    stage.add(layer);

    // --- Вспомогательная функция для рисования стрелок (векторов) ---
    function drawArrow(layer, x, y, angleDeg, length, label, color) {
        // Переводим угол в радианы
        const angleRad = angleDeg * (Math.PI / 180);
        
        // Вычисляем конечную точку
        const endX = x + length * Math.cos(angleRad);
        const endY = y + length * Math.sin(angleRad);
        
        // Рисуем линию (стрелку)
        const arrow = new Konva.Arrow({
            points: [x, y, endX, endY],
            stroke: color,
            strokeWidth: 3,
            pointerLength: 10,
            pointerWidth: 10,
            fill: color,
        });
        layer.add(arrow);
        
        // Рисуем метку (формулу силы)
        const text = new Konva.Text({
            x: endX + (length > 0 ? 5 : -5), // Смещение текста для читаемости
            y: endY - 10,
            text: label,
            fontSize: 16,
            fill: color,
            fontFamily: 'Arial',
        });
        layer.add(text);
    }
    
    // --- Основная функция рендеринга по данным ИИ ---
    function renderDiagram(data) {
        layer.destroyChildren(); // Очищаем предыдущий чертеж
        
        const centerX = stage.width() / 2;
        const centerY = stage.height() / 2;
        
        if (data.environment.type === 'inclined_plane') {
            const angle = data.environment.angle; // Угол наклона
            const height = 200;
            const width = height / Math.tan(angle * (Math.PI / 180));
            
            // 1. Рисуем наклонную плоскость (треугольник)
            const plane = new Konva.Shape({
                sceneFunc: function (ctx, shape) {
                    ctx.beginPath();
                    ctx.moveTo(centerX - width / 2, centerY + height / 2); // Нижний левый угол
                    ctx.lineTo(centerX + width / 2, centerY + height / 2); // Нижний правый угол
                    ctx.lineTo(centerX - width / 2, centerY + height / 2 - height); // Верхний угол
                    ctx.closePath();
                    ctx.fillStrokeShape(shape);
                },
                fill: '#ccc',
                stroke: '#555',
                strokeWidth: 2,
            });
            layer.add(plane);
            
            // 2. Рисуем объект (брусок)
            const blockCenterY = centerY + height/2 - (height / 2) * (1 - Math.cos(angle * (Math.PI / 180)));
            const blockCenterX = centerX - width/4;
            
            const block = new Konva.Rect({
                x: blockCenterX - 20,
                y: blockCenterY - 20,
                width: 40,
                height: 40,
                fill: 'red',
                stroke: 'black',
                strokeWidth: 1,
                rotation: -angle // Поворот бруска по углу наклона
            });
            layer.add(block);
            
            // 3. Рисуем силы, действующие на центр масс
            const centerM = {x: blockCenterX, y: blockCenterY};
            const forceLen = 100;

            // Гравитация (всегда вниз)
            drawArrow(layer, centerM.x, centerM.y, 90, forceLen, 'mg', 'blue'); 
            
            // Нормальная сила (перпендикулярно)
            // Угол: -90 (вверх) + angle (относительно вертикали)
            drawArrow(layer, centerM.x, centerM.y, -(90 - angle), forceLen, 'N', 'green'); 

            // Трение (параллельно, вверх по плоскости, если движение вниз)
            // Угол: 180 (влево) + angle
            drawArrow(layer, centerM.x, centerM.y, 180 + angle, forceLen * 0.5, 'F_тр', 'orange');
            
            // Добавляем формулы (нужен KaTeX или MathJax для красивого рендеринга LaTeX)
            const formulas = data.formulas.join('<br>');
            document.getElementById('formulaOutput').innerHTML = formulas;

        } else {
            document.getElementById('formulaOutput').textContent = "Тип сцены не поддерживается для отрисовки.";
        }
        
        layer.draw();
    }


    // --- Обработчик нажатия кнопки ---
    generateBtn.addEventListener('click', async () => {
        const taskText = taskInput.value.trim();
        if (!taskText) {
            alert('Пожалуйста, введите условие задачи.');
            return;
        }

        // В реальном приложении здесь будет HTTP-запрос к  Back-end ИИ
        // const response = await fetch('/api/analyze', { method: 'POST', body: JSON.stringify({ task: taskText }) });
        // const data = await response.json();
        
        // Это тестовый JSON, который должен возвращать ваш ИИ-бэкенд
        const mockResponse = {
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
                "$$\\sum F_x = ma \\implies mg\\sin(\\alpha) - F_{tr} = ma$$",
                "$$\\sum F_y = 0 \\implies N - mg\\cos(\\alpha) = 0$$",
                "$$F_{tr} = \\mu N$$"
            ]
        };

        try {
            // В реальном приложении: renderDiagram(data);
            renderDiagram(mockResponse); 
        } catch (error) {
            console.error("Ошибка при рендеринге:", error);
            document.getElementById('formulaOutput').textContent = "Не удалось сгенерировать чертеж по данным ИИ.";
        }
    });

});
