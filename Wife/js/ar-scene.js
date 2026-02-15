/* ============================================
   AR SCENE - Three.js 3D Experience
   Gift Box, Balloons, Rose, AirPods Pro with Strings
   ============================================ */

class ARScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.mixer = null;
        this.placed = false;
        this.animationStarted = false;
        this.giftGroup = null;
        this.boxLid = null;
        this.boxBase = null;
        this.ribbon = null;
        this.balloons = [];
        this.strings = [];
        this.airpodsGroup = null;
        this.roseGroup = null;
        this.particles = [];
        this.phase = 0; // 0=waiting, 1=boxOpening, 2=balloonsRising, 3=roseAppearing, 4=finale
        this.phaseTime = 0;
        this.cameraMode = 'none'; // 'camera' or 'none'
        this.groundPlane = null;
        this.ambientParticles = [];
        this.heartParticles = [];
        this.onFinale = null;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    init(container, withCamera = false) {
        this.container = container;
        this.cameraMode = withCamera ? 'camera' : 'none';

        // Scene
        this.scene = new THREE.Scene();
        if (!withCamera) {
            this.scene.background = new THREE.Color(0x1a0a10);
            this.scene.fog = new THREE.FogExp2(0x1a0a10, 0.015);
        }

        // Camera
        this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 3, 8);
        this.camera.lookAt(0, 1.5, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('ar-canvas'),
            alpha: withCamera,
            antialias: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        // Lights
        this.setupLights();

        // Ground
        if (!withCamera) {
            this.createGround();
        }

        // Ambient particles
        this.createAmbientParticles();

        // Handle resize
        window.addEventListener('resize', () => this.onResize());

        // Start render loop
        this.animate();
    }

    setupLights() {
        // Warm ambient
        const ambient = new THREE.AmbientLight(0xffe0e8, 0.4);
        this.scene.add(ambient);

        // Key light - warm rose
        const keyLight = new THREE.DirectionalLight(0xfff0f5, 1.0);
        keyLight.position.set(5, 10, 7);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 50;
        keyLight.shadow.camera.left = -10;
        keyLight.shadow.camera.right = 10;
        keyLight.shadow.camera.top = 10;
        keyLight.shadow.camera.bottom = -10;
        this.scene.add(keyLight);

        // Fill light - golden
        const fillLight = new THREE.DirectionalLight(0xffd700, 0.3);
        fillLight.position.set(-5, 5, -3);
        this.scene.add(fillLight);

        // Rim light - pink
        const rimLight = new THREE.PointLight(0xff69b4, 0.6, 20);
        rimLight.position.set(0, 8, -5);
        this.scene.add(rimLight);

        // Ground bounce
        const bounceLight = new THREE.PointLight(0xc41e3a, 0.3, 15);
        bounceLight.position.set(0, 0, 3);
        this.scene.add(bounceLight);

        this.keyLight = keyLight;
    }

    createGround() {
        const groundGeo = new THREE.CircleGeometry(20, 64);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x1a0a10,
            roughness: 0.8,
            metalness: 0.1,
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Decorative ring
        const ringGeo = new THREE.RingGeometry(3, 3.05, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xd4af37,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.01;
        this.scene.add(ring);
    }

    createAmbientParticles() {
        const count = 100;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = Math.random() * 15;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
            sizes[i] = Math.random() * 3 + 1;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.PointsMaterial({
            color: 0xffd6e0,
            size: 0.08,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(geo, mat);
        this.scene.add(particles);
        this.ambientParticleSystem = particles;
    }

    // ========== 3D OBJECT CREATION ==========

    createGiftBox() {
        this.giftGroup = new THREE.Group();
        this.giftGroup.position.set(0, 0, 0);

        const boxSize = { w: 1.8, h: 1.5, d: 1.8 };

        // Box base
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0xc41e3a,
            roughness: 0.3,
            metalness: 0.2,
        });
        const baseGeo = new THREE.BoxGeometry(boxSize.w, boxSize.h, boxSize.d);
        this.boxBase = new THREE.Mesh(baseGeo, baseMat);
        this.boxBase.position.y = boxSize.h / 2;
        this.boxBase.castShadow = true;
        this.giftGroup.add(this.boxBase);

        // Box lid
        const lidGroup = new THREE.Group();
        lidGroup.position.y = boxSize.h;

        const lidMat = new THREE.MeshStandardMaterial({
            color: 0x8b0035,
            roughness: 0.3,
            metalness: 0.2,
        });
        const lidGeo = new THREE.BoxGeometry(boxSize.w + 0.1, 0.15, boxSize.d + 0.1);
        const lid = new THREE.Mesh(lidGeo, lidMat);
        lid.position.y = 0.075;
        lid.castShadow = true;
        lidGroup.add(lid);

        // Lid ribbon cross
        this.createRibbon(lidGroup, boxSize);

        this.boxLid = lidGroup;
        // Pivot the lid from the back edge
        this.boxLid.position.z = -boxSize.d / 2;
        this.boxLid.children.forEach(c => c.position.z = boxSize.d / 2);
        this.giftGroup.add(this.boxLid);

        // Base ribbon
        this.createBaseRibbon(boxSize);

        // Bow on top
        this.createBow(boxSize);

        this.scene.add(this.giftGroup);
    }

    createRibbon(parent, boxSize) {
        const ribbonMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.2,
            metalness: 0.6,
        });

        // Ribbon across X
        const r1Geo = new THREE.BoxGeometry(boxSize.w + 0.12, 0.17, 0.15);
        const r1 = new THREE.Mesh(r1Geo, ribbonMat);
        r1.position.y = 0.085;
        parent.add(r1);

        // Ribbon across Z
        const r2Geo = new THREE.BoxGeometry(0.15, 0.17, boxSize.d + 0.12);
        const r2 = new THREE.Mesh(r2Geo, ribbonMat);
        r2.position.y = 0.085;
        parent.add(r2);
    }

    createBaseRibbon(boxSize) {
        const ribbonMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.2,
            metalness: 0.6,
        });

        // Vertical ribbon on front
        const vr = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, boxSize.h, 0.01),
            ribbonMat
        );
        vr.position.set(0, boxSize.h / 2, boxSize.d / 2 + 0.006);
        this.giftGroup.add(vr);

        // Vertical ribbon on right
        const vr2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.01, boxSize.h, 0.15),
            ribbonMat
        );
        vr2.position.set(boxSize.w / 2 + 0.006, boxSize.h / 2, 0);
        this.giftGroup.add(vr2);

        // Vertical ribbon on back
        const vr3 = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, boxSize.h, 0.01),
            ribbonMat
        );
        vr3.position.set(0, boxSize.h / 2, -(boxSize.d / 2 + 0.006));
        this.giftGroup.add(vr3);

        // Vertical ribbon on left
        const vr4 = new THREE.Mesh(
            new THREE.BoxGeometry(0.01, boxSize.h, 0.15),
            ribbonMat
        );
        vr4.position.set(-(boxSize.w / 2 + 0.006), boxSize.h / 2, 0);
        this.giftGroup.add(vr4);
    }

    createBow(boxSize) {
        const bowMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.2,
            metalness: 0.6,
        });

        const bowGroup = new THREE.Group();
        bowGroup.position.y = boxSize.h + 0.16;

        // Bow loops
        for (let side = -1; side <= 1; side += 2) {
            const loopGeo = new THREE.TorusGeometry(0.2, 0.06, 8, 16, Math.PI);
            const loop = new THREE.Mesh(loopGeo, bowMat);
            loop.rotation.z = side * 0.3;
            loop.position.x = side * 0.15;
            loop.rotation.x = Math.PI / 2;
            bowGroup.add(loop);
        }

        // Center knot
        const knotGeo = new THREE.SphereGeometry(0.1, 12, 12);
        const knot = new THREE.Mesh(knotGeo, bowMat);
        bowGroup.add(knot);

        this.bowGroup = bowGroup;
        this.giftGroup.add(bowGroup);
    }

    createBalloons() {
        const colors = [0xe74c6f, 0xff69b4, 0xc41e3a, 0xff1493, 0xdb7093];
        const balloonPositions = [
            { x: -0.6, z: 0.3 },
            { x: 0.4, z: -0.4 },
            { x: 0, z: 0.5 },
            { x: -0.3, z: -0.3 },
            { x: 0.5, z: 0.2 },
        ];

        for (let i = 0; i < 5; i++) {
            const group = new THREE.Group();

            // Balloon
            const balloonGeo = new THREE.SphereGeometry(0.4, 24, 24);
            balloonGeo.scale(1, 1.2, 1);
            const balloonMat = new THREE.MeshStandardMaterial({
                color: colors[i],
                roughness: 0.2,
                metalness: 0.1,
                transparent: true,
                opacity: 0.9,
            });
            const balloon = new THREE.Mesh(balloonGeo, balloonMat);
            group.add(balloon);

            // Balloon knot
            const knotGeo = new THREE.ConeGeometry(0.06, 0.12, 8);
            const knotMat = new THREE.MeshStandardMaterial({ color: colors[i] });
            const knot = new THREE.Mesh(knotGeo, knotMat);
            knot.position.y = -0.48;
            knot.rotation.x = Math.PI;
            group.add(knot);

            // Highlight/reflection
            const highlightGeo = new THREE.SphereGeometry(0.12, 16, 16);
            const highlightMat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.3,
            });
            const highlight = new THREE.Mesh(highlightGeo, highlightMat);
            highlight.position.set(-0.12, 0.15, 0.2);
            group.add(highlight);

            // Initial position inside box
            group.position.set(
                balloonPositions[i].x,
                1.0,
                balloonPositions[i].z
            );
            group.scale.set(0, 0, 0);
            group.userData = {
                targetY: 5.5 + i * 0.5,
                baseX: balloonPositions[i].x,
                baseZ: balloonPositions[i].z,
                swayOffset: Math.random() * Math.PI * 2,
                swaySpeed: 0.5 + Math.random() * 0.3,
                swayAmount: 0.15 + Math.random() * 0.1,
            };

            this.balloons.push(group);
            this.scene.add(group);
        }
    }

    createStringsAndAirPods() {
        this.airpodsGroup = new THREE.Group();
        this.airpodsGroup.position.set(0, 1.0, 0);
        this.airpodsGroup.scale.set(0, 0, 0);

        const caseMat = new THREE.MeshStandardMaterial({
            color: 0xf5f5f0,
            roughness: 0.15,
            metalness: 0.05,
        });
        const caseMatDark = new THREE.MeshStandardMaterial({
            color: 0xe8e8e0,
            roughness: 0.2,
            metalness: 0.05,
        });
        const silverMat = new THREE.MeshStandardMaterial({
            color: 0xc0c0c0,
            roughness: 0.05,
            metalness: 0.8,
        });

        // ---- AirPods Pro Case (enlarged for visibility) ----
        const caseW = 1.2, caseH = 1.5, caseD = 0.7;

        // Case body (bottom)
        const bodyGeo = new THREE.BoxGeometry(caseW, caseH * 0.6, caseD);
        bodyGeo.translate(0, 0, 0);
        // Round the edges by using a rounded box approach
        const body = new THREE.Mesh(bodyGeo, caseMat);
        body.position.y = caseH * 0.3;
        body.castShadow = true;
        this.airpodsGroup.add(body);

        // Case lid (top portion, hinged open)
        const lidGroup = new THREE.Group();
        const lidGeo = new THREE.BoxGeometry(caseW, caseH * 0.42, caseD);
        const lid = new THREE.Mesh(lidGeo, caseMatDark);
        lid.position.y = caseH * 0.21;
        lidGroup.add(lid);

        // Lid hinge line
        const hingeMat = new THREE.MeshStandardMaterial({ color: 0xddddd5, roughness: 0.3 });
        const hinge = new THREE.Mesh(
            new THREE.BoxGeometry(caseW * 0.9, 0.02, caseD * 0.6),
            hingeMat
        );
        hinge.position.y = 0.01;
        lidGroup.add(hinge);

        // Pivot lid from bottom-back edge
        lidGroup.position.set(0, caseH * 0.6, -caseD / 2);
        lidGroup.children.forEach(c => c.position.z += caseD / 2);
        // Open the lid
        lidGroup.rotation.x = -Math.PI * 0.55;
        this.airpodsGroup.add(lidGroup);
        this.airpodsLid = lidGroup;

        // LED indicator on front
        const ledGeo = new THREE.CircleGeometry(0.04, 16);
        const ledMat = new THREE.MeshBasicMaterial({ color: 0x00ff44, transparent: true });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(0, caseH * 0.45, caseD / 2 + 0.01);
        this.airpodsGroup.add(led);
        this.airpodsLED = led;

        // ---- AirPods Earbuds (sticking out of case) ----
        for (let side = -1; side <= 1; side += 2) {
            const earbudGroup = new THREE.Group();

            // Earbud body (oval)
            const budGeo = new THREE.SphereGeometry(0.16, 16, 16);
            budGeo.scale(1, 1.1, 0.85);
            const bud = new THREE.Mesh(budGeo, caseMat);
            earbudGroup.add(bud);

            // Earbud stem
            const stemGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.4, 12);
            const stem = new THREE.Mesh(stemGeo, caseMat);
            stem.position.y = -0.32;
            earbudGroup.add(stem);

            // Stem tip (silver ring)
            const tipGeo = new THREE.CylinderGeometry(0.048, 0.044, 0.04, 12);
            const tip = new THREE.Mesh(tipGeo, silverMat);
            tip.position.y = -0.52;
            earbudGroup.add(tip);

            // Ear tip (silicone)
            const silTipGeo = new THREE.SphereGeometry(0.1, 12, 12);
            silTipGeo.scale(1, 0.6, 1);
            const silTipMat = new THREE.MeshStandardMaterial({
                color: 0xe0e0d8,
                roughness: 0.6,
                metalness: 0,
            });
            const silTip = new THREE.Mesh(silTipGeo, silTipMat);
            silTip.position.set(0, 0.05, 0.08);
            earbudGroup.add(silTip);

            // Speaker mesh (dark circle)
            const meshGeo = new THREE.CircleGeometry(0.06, 16);
            const meshMat = new THREE.MeshStandardMaterial({
                color: 0x333333,
                roughness: 0.8,
            });
            const meshGrill = new THREE.Mesh(meshGeo, meshMat);
            meshGrill.position.set(0, 0.05, 0.14);
            earbudGroup.add(meshGrill);

            earbudGroup.position.set(side * 0.22, caseH * 0.6 + 0.25, 0);
            earbudGroup.rotation.z = side * 0.15;
            this.airpodsGroup.add(earbudGroup);
        }

        // ---- Love message tag (hanging below case) ----
        const tagGroup = new THREE.Group();

        // Tag card
        const tagGeo = new THREE.PlaneGeometry(1.4, 0.8);
        const tagCanvas = document.createElement('canvas');
        tagCanvas.width = 350;
        tagCanvas.height = 200;
        const tCtx = tagCanvas.getContext('2d');

        // Tag background
        tCtx.fillStyle = '#FFF8F0';
        tCtx.beginPath();
        tCtx.roundRect(0, 0, 350, 200, 12);
        tCtx.fill();

        // Tag border
        tCtx.strokeStyle = '#D4AF37';
        tCtx.lineWidth = 3;
        tCtx.beginPath();
        tCtx.roundRect(8, 8, 334, 184, 8);
        tCtx.stroke();

        // Heart
        tCtx.fillStyle = '#C41E3A';
        tCtx.font = '36px serif';
        tCtx.textAlign = 'center';
        tCtx.fillText('\u2764', 175, 50);

        // Text
        tCtx.fillStyle = '#8B0035';
        tCtx.font = 'italic 22px Georgia, serif';
        tCtx.fillText('For My Love', 175, 90);

        tCtx.fillStyle = '#D4AF37';
        tCtx.font = 'bold 30px Georgia, serif';
        tCtx.fillText('Shivani', 175, 130);

        tCtx.fillStyle = '#C41E3A';
        tCtx.font = 'italic 16px Georgia, serif';
        tCtx.fillText('~ with love, Pritam', 175, 170);

        const tagTexture = new THREE.CanvasTexture(tagCanvas);
        const tagMat = new THREE.MeshBasicMaterial({
            map: tagTexture,
            side: THREE.DoubleSide,
        });
        const tag = new THREE.Mesh(tagGeo, tagMat);
        tagGroup.add(tag);

        // Tag string
        const tagStringGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.4, 6);
        const tagStringMat = new THREE.MeshStandardMaterial({ color: 0xd4af37 });
        const tagString = new THREE.Mesh(tagStringGeo, tagStringMat);
        tagString.position.y = 0.6;
        tagGroup.add(tagString);

        tagGroup.position.set(0, -0.7, caseD / 2 + 0.1);
        this.airpodsGroup.add(tagGroup);

        // ---- Glow effect around AirPods ----
        const glowGeo = new THREE.SphereGeometry(1.2, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.04,
            blending: THREE.AdditiveBlending,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.y = caseH * 0.4;
        this.airpodsGroup.add(glow);

        this.scene.add(this.airpodsGroup);

        // Create strings from balloons to AirPods
        this.createStrings();
    }

    createStrings() {
        const stringMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
        });

        for (let i = 0; i < this.balloons.length; i++) {
            const points = [];
            for (let j = 0; j <= 10; j++) {
                points.push(new THREE.Vector3(0, j * 0.3, 0));
            }
            const stringGeo = new THREE.BufferGeometry().setFromPoints(points);
            const stringLine = new THREE.Line(stringGeo, stringMat);
            stringLine.visible = false;
            this.strings.push(stringLine);
            this.scene.add(stringLine);
        }
    }

    updateStrings() {
        for (let i = 0; i < this.balloons.length; i++) {
            const balloon = this.balloons[i];
            const string = this.strings[i];
            if (!string.visible) continue;

            const bPos = balloon.position;
            const aPos = this.airpodsGroup.position;

            // Attach point on AirPods case top
            const attachX = (i - 2) * 0.18;
            const attachPos = new THREE.Vector3(
                aPos.x + attachX,
                aPos.y + 1.1,
                aPos.z
            );

            const positions = string.geometry.attributes.position.array;
            const segments = 10;
            for (let j = 0; j <= segments; j++) {
                const t = j / segments;
                // Catenary-like curve
                const sag = Math.sin(t * Math.PI) * 0.15;
                positions[j * 3] = attachPos.x + (bPos.x - attachPos.x) * t;
                positions[j * 3 + 1] = attachPos.y + (bPos.y - 0.48 - attachPos.y) * t - sag;
                positions[j * 3 + 2] = attachPos.z + (bPos.z - attachPos.z) * t;
            }
            string.geometry.attributes.position.needsUpdate = true;
        }
    }

    createRose() {
        this.roseGroup = new THREE.Group();
        this.roseGroup.position.set(2.2, 0, 1.5);
        this.roseGroup.scale.set(0, 0, 0);

        // Stem
        const stemCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.05, 0.5, 0.02),
            new THREE.Vector3(-0.03, 1.0, -0.01),
            new THREE.Vector3(0.02, 1.5, 0.02),
            new THREE.Vector3(0, 2.0, 0),
        ]);
        const stemGeo = new THREE.TubeGeometry(stemCurve, 20, 0.03, 8, false);
        const stemMat = new THREE.MeshStandardMaterial({
            color: 0x2d5a27,
            roughness: 0.6,
        });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.castShadow = true;
        this.roseGroup.add(stem);

        // Thorns
        for (let i = 0; i < 4; i++) {
            const t = 0.2 + i * 0.2;
            const point = stemCurve.getPoint(t);
            const thornGeo = new THREE.ConeGeometry(0.02, 0.08, 4);
            const thorn = new THREE.Mesh(thornGeo, stemMat);
            thorn.position.copy(point);
            thorn.rotation.z = (i % 2 === 0 ? 1 : -1) * Math.PI / 3;
            this.roseGroup.add(thorn);
        }

        // Leaves
        for (let i = 0; i < 3; i++) {
            const t = 0.25 + i * 0.25;
            const point = stemCurve.getPoint(t);
            const leaf = this.createLeaf();
            leaf.position.copy(point);
            leaf.rotation.y = i * Math.PI * 0.7;
            leaf.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.5;
            this.roseGroup.add(leaf);
        }

        // Rose bloom
        const bloom = this.createRoseBloom();
        bloom.position.y = 2.0;
        this.roseGroup.add(bloom);

        // Glow around bloom
        const glowGeo = new THREE.SphereGeometry(0.6, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xc41e3a,
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.y = 2.0;
        this.roseGroup.add(glow);

        this.scene.add(this.roseGroup);
    }

    createLeaf() {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.bezierCurveTo(0.1, 0.05, 0.15, 0.15, 0.08, 0.3);
        shape.bezierCurveTo(0.04, 0.35, 0, 0.35, 0, 0.3);
        shape.bezierCurveTo(0, 0.35, -0.04, 0.35, -0.08, 0.3);
        shape.bezierCurveTo(-0.15, 0.15, -0.1, 0.05, 0, 0);

        const leafGeo = new THREE.ShapeGeometry(shape, 8);
        const leafMat = new THREE.MeshStandardMaterial({
            color: 0x3a7d34,
            roughness: 0.5,
            side: THREE.DoubleSide,
        });
        return new THREE.Mesh(leafGeo, leafMat);
    }

    createRoseBloom() {
        const bloomGroup = new THREE.Group();
        const petalCount = 25;

        for (let ring = 0; ring < 4; ring++) {
            const petalsInRing = ring === 0 ? 4 : ring === 1 ? 6 : ring === 2 ? 7 : 8;
            const ringRadius = ring * 0.08 + 0.02;
            const petalSize = 0.12 + ring * 0.04;
            const curlAmount = 0.3 - ring * 0.05;

            for (let i = 0; i < petalsInRing; i++) {
                const angle = (i / petalsInRing) * Math.PI * 2 + ring * 0.3;
                const petal = this.createPetal(petalSize, curlAmount, ring);
                petal.position.x = Math.cos(angle) * ringRadius;
                petal.position.z = Math.sin(angle) * ringRadius;
                petal.position.y = -ring * 0.03;
                petal.rotation.y = -angle;
                petal.rotation.x = -0.4 - ring * 0.25;
                bloomGroup.add(petal);
            }
        }

        // Center bud
        const budGeo = new THREE.SphereGeometry(0.06, 12, 12);
        const budMat = new THREE.MeshStandardMaterial({
            color: 0x8b0035,
            roughness: 0.3,
        });
        const bud = new THREE.Mesh(budGeo, budMat);
        bud.position.y = 0.02;
        bloomGroup.add(bud);

        // Sepals
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const sepal = this.createLeaf();
            sepal.scale.set(0.7, 0.7, 0.7);
            sepal.position.x = Math.cos(angle) * 0.15;
            sepal.position.z = Math.sin(angle) * 0.15;
            sepal.position.y = -0.15;
            sepal.rotation.y = -angle;
            sepal.rotation.x = -1.8;
            bloomGroup.add(sepal);
        }

        return bloomGroup;
    }

    createPetal(size, curl, ring) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.bezierCurveTo(size * 0.6, size * 0.2, size * 0.8, size * 0.6, size * 0.3, size);
        shape.bezierCurveTo(size * 0.1, size * 1.1, -size * 0.1, size * 1.1, -size * 0.3, size);
        shape.bezierCurveTo(-size * 0.8, size * 0.6, -size * 0.6, size * 0.2, 0, 0);

        const geo = new THREE.ShapeGeometry(shape, 8);

        // Curl the petal
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            const t = y / size;
            pos.setZ(i, Math.sin(t * Math.PI) * curl * size);
        }
        geo.computeVertexNormals();

        const colors = [0xc41e3a, 0xb01830, 0xa01528, 0x8b0035];
        const mat = new THREE.MeshStandardMaterial({
            color: colors[ring],
            roughness: 0.4,
            metalness: 0.05,
            side: THREE.DoubleSide,
        });

        return new THREE.Mesh(geo, mat);
    }

    createHeartParticles() {
        // Will be spawned during animation
        this.heartSpawnTimer = 0;
    }

    spawnHeart() {
        const heartShape = new THREE.Shape();
        const x = 0, y = 0;
        heartShape.moveTo(x, y + 0.05);
        heartShape.bezierCurveTo(x, y + 0.05, x - 0.025, y, x - 0.05, y);
        heartShape.bezierCurveTo(x - 0.09, y, x - 0.09, y + 0.035, x - 0.09, y + 0.035);
        heartShape.bezierCurveTo(x - 0.09, y + 0.055, x - 0.07, y + 0.077, x - 0.05, y + 0.09);
        heartShape.bezierCurveTo(x - 0.025, y + 0.1, x, y + 0.125, x, y + 0.14);
        heartShape.bezierCurveTo(x, y + 0.125, x + 0.025, y + 0.1, x + 0.05, y + 0.09);
        heartShape.bezierCurveTo(x + 0.07, y + 0.077, x + 0.09, y + 0.055, x + 0.09, y + 0.035);
        heartShape.bezierCurveTo(x + 0.09, y + 0.035, x + 0.09, y, x + 0.05, y);
        heartShape.bezierCurveTo(x + 0.025, y, x, y + 0.05, x, y + 0.05);

        const geo = new THREE.ShapeGeometry(heartShape);
        const mat = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(Math.random() * 0.05 + 0.95, 0.8, 0.6),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
        });
        const heart = new THREE.Mesh(geo, mat);

        const scale = 2 + Math.random() * 4;
        heart.scale.set(scale, scale, scale);
        heart.position.set(
            (Math.random() - 0.5) * 8,
            -1,
            (Math.random() - 0.5) * 8
        );
        heart.userData = {
            speed: 0.5 + Math.random() * 1,
            rotSpeed: (Math.random() - 0.5) * 2,
            swaySpeed: 1 + Math.random(),
            swayAmount: 0.3 + Math.random() * 0.5,
            life: 0,
            maxLife: 4 + Math.random() * 3,
            startX: heart.position.x,
        };

        this.scene.add(heart);
        this.heartParticles.push(heart);
    }

    // ========== PLACE & START ==========

    placeAndStart() {
        if (this.placed) return;
        this.placed = true;

        // Create all objects
        this.createGiftBox();
        this.createBalloons();
        this.createStringsAndAirPods();
        this.createRose();
        this.createHeartParticles();

        // Start animation sequence
        this.phase = 1;
        this.phaseTime = 0;
        this.animationStarted = true;
    }

    // ========== ANIMATION PHASES ==========

    updateAnimation(delta) {
        if (!this.animationStarted) return;

        this.phaseTime += delta;

        switch (this.phase) {
            case 1: this.animateBoxOpening(delta); break;
            case 2: this.animateBalloonsRising(delta); break;
            case 3: this.animateRoseGrowing(delta); break;
            case 4: this.animateFinale(delta); break;
        }

        // Always update swaying balloons and strings
        if (this.phase >= 2) {
            this.updateBalloonsSway(delta);
            this.updateStrings();
        }

        // Heart particles
        if (this.phase >= 2) {
            this.heartSpawnTimer += delta;
            if (this.heartSpawnTimer > 0.3) {
                this.heartSpawnTimer = 0;
                this.spawnHeart();
            }
            this.updateHeartParticles(delta);
        }

        // Ambient particles float
        if (this.ambientParticleSystem) {
            const positions = this.ambientParticleSystem.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += delta * 0.1;
                if (positions[i + 1] > 15) positions[i + 1] = 0;
            }
            this.ambientParticleSystem.geometry.attributes.position.needsUpdate = true;
        }
    }

    animateBoxOpening(delta) {
        const t = this.phaseTime;

        // Shake slightly before opening
        if (t < 1.5) {
            const shake = Math.sin(t * 20) * 0.02 * Math.min(t / 0.5, 1);
            this.giftGroup.rotation.z = shake;
            this.giftGroup.position.y = Math.abs(Math.sin(t * 15)) * 0.03 * Math.min(t / 0.5, 1);
            return;
        }

        // Open lid
        const openT = Math.min((t - 1.5) / 1.5, 1);
        const eased = 1 - Math.pow(1 - openT, 3);
        this.boxLid.rotation.x = -eased * Math.PI * 0.75;
        this.giftGroup.rotation.z = 0;

        // Light burst on open
        if (openT > 0 && openT < 0.5) {
            const intensity = (1 - openT * 2) * 2;
            this.keyLight.intensity = 1.0 + intensity;
        } else {
            this.keyLight.intensity = 1.0;
        }

        // Move bow with lid
        if (this.bowGroup) {
            this.bowGroup.visible = openT < 0.3;
        }

        if (openT >= 1) {
            this.phase = 2;
            this.phaseTime = 0;
        }
    }

    animateBalloonsRising(delta) {
        const t = this.phaseTime;

        // Stagger balloon appearances
        for (let i = 0; i < this.balloons.length; i++) {
            const balloon = this.balloons[i];
            const startTime = i * 0.3;

            if (t < startTime) continue;

            const bt = t - startTime;

            // Scale up
            if (bt < 0.5) {
                const s = bt / 0.5;
                const eased = 1 - Math.pow(1 - s, 3);
                balloon.scale.setScalar(eased);
            } else {
                balloon.scale.setScalar(1);
            }

            // Rise up
            if (bt > 0.3) {
                const riseT = Math.min((bt - 0.3) / 3, 1);
                const eased = 1 - Math.pow(1 - riseT, 2);
                balloon.position.y = 1.0 + (balloon.userData.targetY - 1.0) * eased;
            }

            // Show strings
            if (bt > 0.5 && this.strings[i]) {
                this.strings[i].visible = true;
            }
        }

        // AirPods rise with balloons (delayed)
        if (t > 1.5) {
            const apT = Math.min((t - 1.5) / 3, 1);
            const eased = 1 - Math.pow(1 - apT, 2);

            // Scale up
            if (apT < 0.3) {
                const s = apT / 0.3;
                this.airpodsGroup.scale.setScalar(1 - Math.pow(1 - s, 3));
            } else {
                this.airpodsGroup.scale.setScalar(1);
            }

            this.airpodsGroup.position.y = 1.0 + (3.5 - 1.0) * eased;
            // Gentle sway
            this.airpodsGroup.rotation.z = Math.sin(t * 0.5) * 0.08;
            this.airpodsGroup.rotation.y = Math.sin(t * 0.3) * 0.15;
        }

        // Pulse LED
        if (this.airpodsLED && t > 2) {
            this.airpodsLED.material.opacity = 0.5 + Math.sin(t * 3) * 0.5;
        }

        // Camera slowly pans
        if (t > 1) {
            this.camera.position.y = 3 + Math.sin(t * 0.2) * 0.5;
            this.camera.lookAt(0, 2 + t * 0.2, 0);
        }

        if (t > 5) {
            this.phase = 3;
            this.phaseTime = 0;
        }
    }

    animateRoseGrowing(delta) {
        const t = this.phaseTime;

        // Rose grows
        const growT = Math.min(t / 2, 1);
        const eased = 1 - Math.pow(1 - growT, 3);
        this.roseGroup.scale.setScalar(eased);
        this.roseGroup.rotation.y = t * 0.3;

        // Rose glow pulse
        const glow = this.roseGroup.children.find(c =>
            c.material && c.material.opacity < 0.2
        );
        if (glow) {
            glow.material.opacity = 0.05 + Math.sin(t * 2) * 0.04;
        }

        // Camera orbits gently
        const camAngle = Math.sin(t * 0.15) * 0.3;
        this.camera.position.x = Math.sin(camAngle) * 8;
        this.camera.position.z = Math.cos(camAngle) * 8;
        this.camera.position.y = 3.5 + Math.sin(t * 0.2) * 0.3;
        this.camera.lookAt(0, 2.5, 0);

        if (t > 4) {
            this.phase = 4;
            this.phaseTime = 0;
        }
    }

    animateFinale(delta) {
        const t = this.phaseTime;

        // Continue gentle scene animation
        this.roseGroup.rotation.y += delta * 0.3;
        this.airpodsGroup.rotation.z = Math.sin(t * 0.5) * 0.08;

        // Camera slowly pulls back and orbits
        const camAngle = t * 0.1;
        this.camera.position.x = Math.sin(camAngle) * 9;
        this.camera.position.z = Math.cos(camAngle) * 9;
        this.camera.position.y = 4 + Math.sin(t * 0.15) * 0.5;
        this.camera.lookAt(0, 2.5, 0);

        // Trigger finale overlay after a bit
        if (t > 3 && this.onFinale && !this.finaleTriggered) {
            this.finaleTriggered = true;
            this.onFinale();
        }
    }

    updateBalloonsSway(delta) {
        const time = this.clock.getElapsedTime();

        for (const balloon of this.balloons) {
            const d = balloon.userData;
            balloon.position.x = d.baseX + Math.sin(time * d.swaySpeed + d.swayOffset) * d.swayAmount;
            balloon.position.z = d.baseZ + Math.cos(time * d.swaySpeed * 0.7 + d.swayOffset) * d.swayAmount * 0.5;
            // Gentle bob
            balloon.position.y += Math.sin(time * 0.8 + d.swayOffset) * 0.001;
        }
    }

    updateHeartParticles(delta) {
        for (let i = this.heartParticles.length - 1; i >= 0; i--) {
            const heart = this.heartParticles[i];
            heart.userData.life += delta;
            const d = heart.userData;

            heart.position.y += d.speed * delta;
            heart.position.x = d.startX + Math.sin(d.life * d.swaySpeed) * d.swayAmount;
            heart.rotation.z += d.rotSpeed * delta;

            // Fade
            if (d.life > d.maxLife - 1) {
                heart.material.opacity = Math.max(0, (d.maxLife - d.life));
            }

            if (d.life >= d.maxLife) {
                this.scene.remove(heart);
                heart.geometry.dispose();
                heart.material.dispose();
                this.heartParticles.splice(i, 1);
            }
        }
    }

    // ========== RENDER LOOP ==========

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = Math.min(this.clock.getDelta(), 0.05);

        this.updateAnimation(delta);
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    reset() {
        // Clear scene objects
        if (this.giftGroup) this.scene.remove(this.giftGroup);
        this.balloons.forEach(b => this.scene.remove(b));
        this.strings.forEach(s => this.scene.remove(s));
        if (this.airpodsGroup) this.scene.remove(this.airpodsGroup);
        if (this.roseGroup) this.scene.remove(this.roseGroup);
        this.heartParticles.forEach(h => {
            this.scene.remove(h);
            h.geometry.dispose();
            h.material.dispose();
        });

        this.balloons = [];
        this.strings = [];
        this.heartParticles = [];
        this.placed = false;
        this.animationStarted = false;
        this.finaleTriggered = false;
        this.phase = 0;
        this.phaseTime = 0;

        this.camera.position.set(0, 3, 8);
        this.camera.lookAt(0, 1.5, 0);
    }
}

// Export global
window.ARScene = ARScene;
