
        (() => {
            const canvas = document.getElementById('mapCanvas');
            const ctx = canvas.getContext('2d');
            const gridSize = 40;
            
            // 3 verschillende kaarten met waypoints
            const mapConfigs = [
                { // Map 1: U-vormig (origineel)
                    name: 'Map 1',
                    waypoints: [
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
                    ]
                },
                { // Map 2: Spiraal
                    name: 'Map 2',
                    waypoints: [
                        { x: 200, y: 600 },
                        { x: 200, y: 200 },
                        { x: 600, y: 200 },
                        { x: 600, y: 500 },
                        { x: 300, y: 500 },
                        { x: 300, y: 300 },
                        { x: 500, y: 300 },
                        { x: 500, y: 400 },
                        { x: 400, y: 400 },
                        { x: 400, y: 30 },
                    ]
                },
                { // Map 3: Zigzag
                    name: 'Map 3',
                    waypoints: [
                        { x: 100, y: 600 },
                        { x: 100, y: 300 },
                        { x: 400, y: 300 },
                        { x: 400, y: 150 },
                        { x: 700, y: 150 },
                        { x: 700, y: 400 },
                        { x: 350, y: 400 },
                        { x: 350, y: 600 },
                        { x: 650, y: 600 },
                        { x: 820, y: 100 },
                    ]
                }
            ];
            
            // Kies willekeurig een kaart
            const selectedMapIndex = Math.floor(Math.random() * mapConfigs.length);
            const currentMap = mapConfigs[selectedMapIndex];
            const waypoints = currentMap.waypoints.map(p => ({ x: p.x, y: p.y })); // Clone waypoints

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

            // expose path points and helper to check if a position lies on the path
            window.pathPoints = pathPoints;
            window.isOnPath = function (x, y, threshold = 20) {
                // check distance to each segment for a robust collision test
                function distToSeg(px, py, a, b) {
                    const vx = b.x - a.x;
                    const vy = b.y - a.y;
                    const wx = px - a.x;
                    const wy = py - a.y;
                    const c1 = vx * wx + vy * wy;
                    if (c1 <= 0) return Math.hypot(px - a.x, py - a.y);
                    const c2 = vx * vx + vy * vy;
                    if (c2 <= c1) return Math.hypot(px - b.x, py - b.y);
                    const t = c1 / c2;
                    const projx = a.x + vx * t;
                    const projy = a.y + vy * t;
                    return Math.hypot(px - projx, py - projy);
                }
                for (let i = 0; i < pathPoints.length - 1; i++) {
                    const d = distToSeg(x, y, pathPoints[i], pathPoints[i + 1]);
                    if (d <= threshold) return true;
                }
                return false;
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
                ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                snowflakes.forEach(flake => {
                    ctx.beginPath();
                    ctx.arc(flake.x, flake.y, flake.radius + 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // glow effect voor zichtbaarheid
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();

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
                // Sneeuw op de grond (basis achtergrond)
                ctx.fillStyle = '#e8f4f8';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Donkerdere sneeuwlaag onderaan
                ctx.fillStyle = '#ffffff';
                for (let i = 0; i < 20; i++) {
                    const x = (i * 100 + Math.sin(i) * 30) % canvas.width;
                    const y = canvas.height - 40 - Math.random() * 20;
                    ctx.beginPath();
                    ctx.arc(x, y, 20 + Math.random() * 15, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Helper: teken boom alleen als hij niet op het pad staat
                function safeTreeDraw(x, y, size) {
                    const threshold = Math.max(24, size * 0.9);
                    if (window.isOnPath && window.isOnPath(x, y, threshold)) return;
                    drawChristmasTree(x, y, size);
                }

                // Kerstbomen rondom - veel meer, maar gecontroleerd
                safeTreeDraw(100, 200, 40);
                safeTreeDraw(200, 300, 35);
                safeTreeDraw(350, 150, 38);
                safeTreeDraw(500, 280, 42);
                safeTreeDraw(700, 120, 35);
                safeTreeDraw(900, 220, 40);
                safeTreeDraw(1100, 150, 38);
                safeTreeDraw(1350, 250, 42);
                safeTreeDraw(1550, 180, 36);
                safeTreeDraw(1750, 300, 39);

                // Extra kleine bomen op achtergrond
                safeTreeDraw(150, 450, 28);
                safeTreeDraw(400, 500, 25);
                safeTreeDraw(650, 450, 25);
                safeTreeDraw(950, 520, 26);
                safeTreeDraw(1200, 480, 27);
                safeTreeDraw(1500, 500, 24);
                safeTreeDraw(1800, 450, 28);
                safeTreeDraw(1900, 80, 32);
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
                // Draw a glowing start-star at the beginning of the path
                if (pathPoints.length > 0) {
                    const start = pathPoints[0];
                    drawStartStar(ctx, start.x, start.y, 28);
                }

                // Draw Christmas tree at end (goal)
                const endPoint = pathPoints[pathPoints.length - 1];
                drawChristmasTreeLarge(ctx, endPoint.x, endPoint.y - 20, 50);
            }

            

            function drawChristmasTreeLarge(ctx, x, y, size) {
                ctx.save();

                // Trunk
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(x - size * 0.1, y + size * 0.5, size * 0.2, size * 0.4);

                // Star on top
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                for (let i = 0; i < 10; i++) {
                    const radius = i % 2 === 0 ? size * 0.15 : size * 0.08;
                    const angle = (i * Math.PI) / 5 - Math.PI / 2;
                    const px = x + radius * Math.cos(angle);
                    const py = y + radius * Math.sin(angle);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }


                ctx.closePath();
                ctx.fill();
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 15;
                ctx.strokeStyle = '#ffed4e';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Tree layers (3 triangles)
                ctx.fillStyle = '#0f5e0f';
                for (let layer = 0; layer < 3; layer++) {
                    const layerY = y + layer * size * 0.25;
                    const layerSize = size * (0.6 - layer * 0.1);
                    ctx.beginPath();
                    ctx.moveTo(x, layerY);
                    ctx.lineTo(x - layerSize * 0.5, layerY + layerSize * 0.4);
                    ctx.lineTo(x + layerSize * 0.5, layerY + layerSize * 0.4);
                    ctx.closePath();
                    ctx.fill();

                    // Border
                    ctx.strokeStyle = '#0a3a0a';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // Ornaments (small colored circles)
                const colors = ['#ff1744', '#ffd700', '#00e676', '#2979f3'];
                for (let layer = 0; layer < 3; layer++) {
                    const layerY = y + layer * size * 0.25;
                    const layerSize = size * (0.6 - layer * 0.1);
                    for (let i = 0; i < 3 + layer; i++) {
                        const orbX = x - layerSize * 0.3 + (i / (2 + layer)) * layerSize * 0.6;
                        const orbY = layerY + layerSize * 0.3;
                        ctx.fillStyle = colors[(layer + i) % colors.length];
                        ctx.beginPath();
                        ctx.arc(orbX, orbY, 4, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }

                ctx.restore();
            }

            function drawStartStar(ctx, x, y, size) {
                ctx.save();
                // outer glow
                ctx.shadowColor = 'rgba(255,215,0,0.9)';
                ctx.shadowBlur = 20;

                // star body
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                const outer = size * 0.9;
                const inner = size * 0.35;
                for (let i = 0; i < 10; i++) {
                    const r = (i % 2 === 0) ? outer : inner;
                    const a = (i * Math.PI) / 5 - Math.PI / 2;
                    const sx = x + Math.cos(a) * r;
                    const sy = y + Math.sin(a) * r;
                    if (i === 0) ctx.moveTo(sx, sy);
                    else ctx.lineTo(sx, sy);
                }
                ctx.closePath();
                ctx.fill();

                // bright core
                ctx.shadowBlur = 8;
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.beginPath();
                ctx.arc(x, y, size * 0.22, 0, Math.PI * 2);
                ctx.fill();

                // subtle stroke
                ctx.shadowBlur = 0;
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#ffed4e';
                ctx.stroke();

                // tiny sparkles
                for (let i = 0; i < 6; i++) {
                    const ang = (i / 6) * Math.PI * 2 + Math.random() * 0.4;
                    const sx = x + Math.cos(ang) * (outer + 6 + Math.random() * 6);
                    const sy = y + Math.sin(ang) * (outer + 6 + Math.random() * 6);
                    ctx.beginPath();
                    ctx.fillStyle = 'rgba(255, 240, 180, 0.85)';
                    ctx.arc(sx, sy, 1 + Math.random() * 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                // small snow oval beneath
                ctx.fillStyle = 'rgba(255,255,255,0.95)';
                ctx.beginPath();
                ctx.ellipse(x, y + size * 0.6, size * 0.8, size * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }

            function drawEnemy(e) {
                ctx.fillStyle = 'crimson';
                ctx.beginPath();
                ctx.arc(e.x, e.y, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                ctx.lineWidth = 2;
                ctx.stroke();

                // hp bar
                const w = 24;
                const h = 4;
                const px = e.x - w / 2;
                const py = e.y - 18;
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(px, py, w, h);
                ctx.fillStyle = '#ff5555';
                ctx.fillRect(px + 1, py + 1, Math.max(0, (w - 2) * (e.hp / e.maxHp)), h - 2);
            }

            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawBackground();
                drawPath();
                drawSnow();
                if (window.drawOverlay) window.drawOverlay(ctx);
            }

            function reset() {
                running = false;
                lastTime = 0;
                draw();
            }

            function step(dt) {
                // map logic goes here
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
                    // spawn first enemy immediately
                    spawnTimer = 0;
                    spawnEnemy();
                }
            });
            document.getElementById('resetBtn').addEventListener('click', () => reset());

            reset();
            requestAnimationFrame(loop);
        })();
