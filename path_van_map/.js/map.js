
        (() => {
            const canvas = document.getElementById('mapCanvas');
            const ctx = canvas.getContext('2d');
            const gridSize = 40;
            const waypoints = [
                { x: 80, y: 560 },
                { x: 80, y: 240 },
                { x: 240, y: 240 },
                { x: 240, y: 560 },
                { x: 400, y: 560 },
                { x: 400, y: 240 },
                { x: 560, y: 240 },
                { x: 560, y: 560 },
                { x: 680, y: 560 },
                { x: 680, y: 340 },
                { x: 680, y: 160 },
                { x: 100, y: 160 },
                { x: 100, y: 100 },
                { x: 600, y: 100 },
            ];

            const samplesPerSegment = 12;

            function catmullRomPoint(p0, p1, p2, p3, t) {
                const t2 = t * t;
                const t3 = t2 * t;
                const x = 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
                const y = 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
                return { x, y };
            }

            function computePathPoints(ctrlPoints, samplesPerSeg) {
                const pts = [];
                const n = ctrlPoints.length;
                if (n === 0) return pts;
                for (let i = 0; i < n - 1; i++) {
                    const p0 = i - 1 >= 0 ? ctrlPoints[i - 1] : ctrlPoints[i];
                    const p1 = ctrlPoints[i];
                    const p2 = ctrlPoints[i + 1];
                    const p3 = i + 2 < n ? ctrlPoints[i + 2] : ctrlPoints[i + 1];
                    for (let s = 0; s < samplesPerSeg; s++) {
                        const t = s / samplesPerSeg;
                        pts.push(catmullRomPoint(p0, p1, p2, p3, t));
                    }
                }
                pts.push({ x: ctrlPoints[n - 1].x, y: ctrlPoints[n - 1].y });
                return pts;
            }

            const pathPoints = computePathPoints(waypoints, samplesPerSegment);

            const enemy = {
                x: pathPoints[0].x,
                y: pathPoints[0].y,
                speed: 120,
                index: 0
            };

            let running = false;
            let lastTime = 0;

            // Sneeuwvlokken animatie
            const snowflakes = [];
            for (let i = 0; i < 50; i++) {
                snowflakes.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 3 + 1,
                    speed: Math.random() * 1 + 0.5,
                    drift: Math.random() * 0.5 - 0.25
                });
            }

            function drawSnow() {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                snowflakes.forEach(flake => {
                    ctx.beginPath();
                    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
                    ctx.fill();

                    flake.y += flake.speed;
                    flake.x += flake.drift;

                    if (flake.y > canvas.height) {
                        flake.y = -10;
                        flake.x = Math.random() * canvas.width;
                    }
                    if (flake.x > canvas.width) flake.x = 0;
                    if (flake.x < 0) flake.x = canvas.width;
                });
            }

            function drawChristmasTree(x, y, size) {
                // Stam
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(x - size * 0.15, y, size * 0.3, size * 0.4);

                // Boom (3 lagen)
                ctx.fillStyle = '#0f5e0f';
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(x, y - size * 0.8 + i * size * 0.25);
                    ctx.lineTo(x - size * (0.6 - i * 0.15), y - size * 0.4 + i * size * 0.25);
                    ctx.lineTo(x + size * (0.6 - i * 0.15), y - size * 0.4 + i * size * 0.25);
                    ctx.closePath();
                    ctx.fill();
                }

                // Ster
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(x, y - size * 0.85, size * 0.12, 0, Math.PI * 2);
                ctx.fill();
            }

            function drawBackground() {
                // Sneeuw op de grond
                ctx.fillStyle = '#ffffff';
                for (let i = 0; i < 15; i++) {
                    const x = (i * 60 + Math.sin(i) * 20) % canvas.width;
                    const y = canvas.height - 20 - Math.random() * 10;
                    ctx.beginPath();
                    ctx.arc(x, y, 15 + Math.random() * 10, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Kerstbomen rondom
                drawChristmasTree(700, 120, 35);
                drawChristmasTree(650, 450, 25);
                drawChristmasTree(150, 500, 28);
                drawChristmasTree(900,80, 32);
            }

            function drawPath() {
                // Schaduw van pad
                ctx.lineWidth = 24;
                ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(pathPoints[0].x + 2, pathPoints[0].y + 2);
                for (let i = 1; i < pathPoints.length; i++) {
                    ctx.lineTo(pathPoints[i].x + 2, pathPoints[i].y + 2);
                }
                ctx.stroke();

                // IJzig pad (blauw/wit)
                ctx.lineWidth = 22;
                ctx.strokeStyle = '#b8d4e8';
                ctx.beginPath();
                ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
                for (let i = 1; i < pathPoints.length; i++) {
                    ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
                }
                ctx.stroke();

                // Middelste ijslaag
                ctx.lineWidth = 18;
                ctx.strokeStyle = '#d4e8f5';
                ctx.beginPath();
                ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
                for (let i = 1; i < pathPoints.length; i++) {
                    ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
                }
                ctx.stroke();

                // Waypoint markers (sneeuwballen)
                for (const p of waypoints) {
                    ctx.fillStyle = '#ffffff';
                    ctx.strokeStyle = '#b0c4de';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
            }

            function drawEnemy() {
                ctx.fillStyle = 'crimson';
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawGrid();
                drawPath();
                drawEnemy();
            }

            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawBackground();
                drawPath();
                drawSnow();
                drawEnemy();
            }

            function reset() {
                enemy.index = 0;
                enemy.x = pathPoints[0].x;
                enemy.y = pathPoints[0].y;
                running = false;
                lastTime = 0;
                draw();
            }

            function step(dt) {
                if (enemy.index >= pathPoints.length - 1) {
                    running = false;
                    return;
                }
                const a = pathPoints[enemy.index];
                const b = pathPoints[enemy.index + 1];
                const vx = b.x - a.x;
                const vy = b.y - a.y;
                const segLen = Math.hypot(vx, vy);
                if (segLen === 0) {
                    enemy.index++;
                    return;
                }
                const dirX = vx / segLen;
                const dirY = vy / segLen;
                const move = enemy.speed * dt;

                const toBX = b.x - enemy.x;
                const toBY = b.y - enemy.y;
                const distToB = Math.hypot(toBX, toBY);
                if (move >= distToB) {
                    enemy.x = b.x;
                    enemy.y = b.y;
                    enemy.index++;
                } else {
                    enemy.x += dirX * move;
                    enemy.y += dirY * move;
                }
            }

            function loop(ts) {
                if (!lastTime) lastTime = ts;
                const dt = (ts - lastTime) / 1000;
                lastTime = ts;
                if (running) step(dt);
                draw();
                requestAnimationFrame(loop);
            }

            document.getElementById('startBtn').addEventListener('click', () => {
                if (!running) {
                    running = true;
                    lastTime = 0;
                }
            });
            document.getElementById('resetBtn').addEventListener('click', () => reset());

            reset();
            requestAnimationFrame(loop);
        })();
