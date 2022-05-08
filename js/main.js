import * as THREE from './three/build/three.module.js';
import {WEBGL} from './WebGL.js';
import {OBJLoader} from './three/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from './three/examples/jsm/loaders/MTLLoader.js';
import {MeshSurfaceSampler} from './three/examples/jsm/math/MeshSurfaceSampler.js';
import {OrbitControls} from './three/examples/jsm/controls/OrbitControls.js';

import { degrees_to_radians } from './DegreesToRadians.js';

const textureLoader = new THREE.TextureLoader();
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();

const MODELS_URL = 'models/'

const diamondData = {
  face_cloud: {
    title: 'SaaS On Cloud',
    icon: {
      default: textureLoader.load(MODELS_URL + 'cloud.jpg'),
      active: textureLoader.load(MODELS_URL + 'active_cloud.png')
    },
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit animi minima ad, saepe possimus numquam. Sunt odio, ratione labore. Vitae ea omnis modi, fugiat, ducimus nulla illum minus culpa'
  },
  face_space_ship: {
    title: 'Space Systems',
    icon: {
      default: textureLoader.load(MODELS_URL + 'spaceship.jpg'),
      active: textureLoader.load(MODELS_URL + 'active_spaceship.png')
    },
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit animi minima ad, saepe possimus numquam. Sunt odio, ratione labore. Vitae ea omnis modi, fugiat, ducimus nulla illum minus culpa'
  },
  face_plane: {
    title: 'Air Systems',
    icon: {
      default: textureLoader.load(MODELS_URL + 'plane.jpg'),
      active: textureLoader.load(MODELS_URL + 'active_plane.png')
    },
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit animi minima ad, saepe possimus numquam. Sunt odio, ratione labore. Vitae ea omnis modi, fugiat, ducimus nulla illum minus culpa'

  },
  face_Leaf: {
    title: 'Sustainability',
    icon: {
      default: textureLoader.load(MODELS_URL + 'leaf.jpg'),
      active: textureLoader.load(MODELS_URL + 'active_leaf.png')
    },
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit animi minima ad, saepe possimus numquam. Sunt odio, ratione labore. Vitae ea omnis modi, fugiat, ducimus nulla illum minus culpa'


  },
  face_kran: {
    title: 'SaaS On The Asset',
    icon: {
      default: textureLoader.load(MODELS_URL + 'kran.jpg'),
      active: textureLoader.load(MODELS_URL + 'active_kran.png')
    },
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit animi minima ad, saepe possimus numquam. Sunt odio, ratione labore. Vitae ea omnis modi, fugiat, ducimus nulla illum minus culpa'


  },
  Face_lock: {
    title: 'Security',
    icon: {
      default: textureLoader.load(MODELS_URL + 'shield.jpg'),
      active: textureLoader.load(MODELS_URL + 'active_shield.png')
    },
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit animi minima ad, saepe possimus numquam. Sunt odio, ratione labore. Vitae ea omnis modi, fugiat, ducimus nulla illum minus culpa'


  },
  face_plant: {
    title: 'Ground Systems',
    icon: {
      default: textureLoader.load(MODELS_URL + 'factory.jpg'),
      active: textureLoader.load(MODELS_URL + 'active_factory.png')
    },
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit animi minima ad, saepe possimus numquam. Sunt odio, ratione labore. Vitae ea omnis modi, fugiat, ducimus nulla illum minus culpa'


  },
  face_Top: {
    title: 'Safety',
    icon: {
      default: textureLoader.load(MODELS_URL + 'Helmet.jpg'),
      active: textureLoader.load(MODELS_URL + 'active_helmet.png')
    },
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit animi minima ad, saepe possimus numquam. Sunt odio, ratione labore. Vitae ea omnis modi, fugiat, ducimus nulla illum minus culpa'


  },
  face_chip: {
    title: 'SaaS At The Edge',
    icon: {
      default: textureLoader.load(MODELS_URL + 'chip.jpg'),
      active: textureLoader.load(MODELS_URL + 'active_chip.png')
    },
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit animi minima ad, saepe possimus numquam. Sunt odio, ratione labore. Vitae ea omnis modi, fugiat, ducimus nulla illum minus culpa'


  }
}

const DiamondModelView = function () {
  /** Setup global variables */
  let camera, scene, renderer, pmremGenerator, controls;
  let group, sparkles, sparklesGeometry, pointsMaterial, points;

  let raycaster = new THREE.Raycaster();
  const vector3 = new THREE.Vector3();

  const elContent = document.querySelector('.content');
  const elTooltip = document.querySelector('#tooltip');
  const elTooltipInner = document.querySelector('.tooltip-inner');
  const elPerspective = document.querySelector('.perspective');
  const elPerspectiveItemImg = document.querySelector('.perspective-item__icon img');
  const elPerspectiveItemTitle = document.querySelector('.perspective-item__title');
  const elPerspectiveItemText = document.querySelector('.perspective-item__text');
  const elPerspectiveItemClose = document.querySelector('.perspective-item__close');

  const pixelRatio = 2;
  let isLocal;
  let _prev = 0;
  let animationInProgress = true;
  let selectedObject;
  let hoveredObject;
  let selectedMode = false;
  let startMoveX = 0;
  let mouseDown = false;
  let direction = 'left';
  let diamondModelAnim = null;
  let diamondModel = null;
  let sampler = null;
  const lines = [];
  let mousePosition = {};

  class Sparkle extends THREE.Vector3 {
    setup(origin, color) {
      this.x = origin.x;
      this.y = origin.y;
      this.z = origin.z;
      this.v = new THREE.Vector3();
      /* X Speed */
      this.v.x = THREE.MathUtils.randFloat(0.001, 0.006);
      this.v.x *= Math.random() > 0.5 ? 1 : -1;
      /* Y Speed */
      this.v.y = THREE.MathUtils.randFloat(0.001, 0.006);
      this.v.y *= Math.random() > 0.5 ? 1 : -1;
      /* Z Speed */
      this.v.z = THREE.MathUtils.randFloat(0.001, 0.006);
      this.v.z *= Math.random() > 0.5 ? 1 : -1;

      this.size = Math.random() * 4 + 0.5 * pixelRatio;
      this.slowDown = 0.4 + Math.random() * 0.58;
      this.color = color;
    }

    update() {
      if (this.v.x > 0.001 || this.v.y > 0.001 || this.v.z > 0.001) {
        this.add(this.v);
        this.v.multiplyScalar(this.slowDown);
      }
    }
  }

  return {
    init: function () {
      isLocal = true;
      if (WEBGL.isWebGLAvailable()) {
        initRenderer();
        initCamera();
        initScene();
        initControls();
        initLight();
        initSparkles();
        loadModels();
        initEvents();
      } else {
        console.log("WEBGL_ERROR")
      }

      function initRenderer() {
        renderer = new THREE.WebGLRenderer({alpha: true});
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(elContent.offsetWidth, elContent.offsetHeight);
        renderer.setClearColor(0x000000, 0);

        elContent.appendChild(renderer.domElement);

        pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();

      }

      function initControls() {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = true;
        controls.enableZoom = true;
        controls.update();
        //controls.rotateX(3);
      }

      function initScene() {
        scene = new THREE.Scene();
        group = new THREE.Group();
        
        scene.add(group);
        scene.rotateX(degrees_to_radians(270));
      }

      function initCamera() {
        camera = new THREE.PerspectiveCamera(
          100,
          elContent.offsetWidth / elContent.offsetHeight,
          0.001,
          50
        );
        //camera = new THREE.PerspectiveCamera( 15, container.innerWidth / container.innerHeight, .1, 10000 );
        camera.position.y = 0;
        camera.position.x = 0;
        camera.position.z = 0.5;
      }

      function initLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);

        const directionalLightTop = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLightTop.position.set(0, 4, 0);
        directionalLightTop.name = 'top_light';

        const directionalLightBottom = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLightBottom.position.set(0, -4, 0);
        directionalLightBottom.name = 'bottom_light';

        scene.add(ambientLight);
        scene.add(directionalLightTop);
        scene.add(directionalLightBottom);
      }

      function loadModels() {
        loadDiamondModelAnim();
        loadDiamondModel();
      }

      function initEvents() {
        //renderer.domElement.addEventListener("mousedown", mousedown, true);
        //renderer.domElement.addEventListener("mouseup", mouseup, true);
        //renderer.domElement.addEventListener("mousemove", mousemove, true);
        window.addEventListener("resize", onWindowResize);
        //elPerspectiveItemClose.addEventListener("click", closeInfoPanel, true);
      }

      function initSparkles() {
        sparkles = [];
        sparklesGeometry = new THREE.BufferGeometry();
        pointsMaterial = new THREE.PointsMaterial({
          size: 0.02, color: 0xff, opacity: 1, depthTest: false,
          transparent: true,
        });
        points = new THREE.Points(sparklesGeometry, pointsMaterial);
        group.add(points);
        const size = 10;
        const divisions = 10;
        
        const gridHelper = new THREE.GridHelper( size, divisions );
        scene.add( gridHelper ); 
      }

      function mousedown(event) {
        mouseDown = true
        mousePosition = {
          clientX: event.clientX,
          clientY: event.clientY
        }
      }

      function mouseup(event) {
        mouseDown = false
        if (mousePosition.clientX === event.clientX && mousePosition.clientY === event.clientY) {
          //showInfoPanel(event)
        }
      }

      function mousemove(event) {
        if (!diamondModel || animationInProgress) return;

        if (mouseDown) {
          if (event.pageX < startMoveX) {
            direction = "left"
          } else if (event.pageX > startMoveX) {
            direction = "right"
          }
          startMoveX = event.pageX;
        }

        const mouse = {
          x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
          y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
        }
        raycaster.setFromCamera(mouse, camera);
        elTooltip.style.top = `${event.clientY - 30}px`
        elTooltip.style.left = `${event.clientX + 5}px`
        let intersects = raycaster.intersectObjects(diamondModel.children, true); //array
        if (intersects.length > 0) {
          if (!diamondData[intersects[0].object.name]) return;
          if (hoveredObject && hoveredObject.object.name === intersects[0].object.name) return;
          if (hoveredObject) {
            if (selectedObject) {
              updateHoveredObject()
            } else {
              let texture = diamondData[hoveredObject.object.name].icon.default;
              hoveredObject.object.material.map = texture;
              hoveredObject.active = false;
              texture.dispose();
            }
          }
          hoveredObject = intersects[0];

          if (!animationInProgress) {
            let texture = diamondData[hoveredObject.object.name].icon.active;
            let name = diamondData[hoveredObject.object.name].title;
            elTooltip.classList.add('show');
            elTooltipInner.textContent = name
            hoveredObject.object.material.map = texture;
            texture.dispose();
          }
        } else {
          if (hoveredObject) {
            elTooltip.classList.remove('show');
            elTooltipInner.textContent = ''
            if (selectedObject) {
              updateHoveredObject()
            } else {
              let texture = diamondData[hoveredObject.object.name].icon.default;
              hoveredObject.object.material.map = texture;
              hoveredObject.active = false;
              texture.dispose();
            }
            hoveredObject = null;

          }
        }
      }

      function updateHoveredObject() {
        if (hoveredObject.object.name !== selectedObject.object.name) {
          let texture = diamondData[hoveredObject.object.name].icon.default;
          hoveredObject.object.material.map = texture;
          hoveredObject.active = false;
          texture.dispose();
        }
      }

      function loadDiamondModelAnim() {
        objLoader.load(
          MODELS_URL + "diamond.obj",
          (obj) => {
            diamondModelAnim = obj.children[0];
            diamondModelAnim.geometry.scale(0.25, 0.25, 0.25);
            diamondModelAnim.geometry.translate(0, -1, 0);
            diamondModelAnim.geometry.rotateX(0);

          },
          (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
          (err) => console.log("An error happened", err)
        );
      }

      function loadDiamondModel() {
        mtlLoader.load(MODELS_URL + 'diamond.obj', function (materials) {
          materials.preload();
          objLoader.setMaterials(materials)
          objLoader.load(
            MODELS_URL + "sphere.obj",
            (obj) => {
              diamondModel = obj;
              diamondModel.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                  child.geometry.scale(0.48, 0.48, 0.48);
                  child.geometry.translate(0, 0, 0);
                  child.geometry.rotateY(0);
                  child.material.transparent = true;
                  child.material.opacity = 0;
                }
              });
              diamondModel.rotation.x = 1;
              diamondModel.rotation.y = 1;
              //scene.add(diamondModel);
              diamondModel.layers.enableAll();

              initDots();
            },
            (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
            (err) => console.log("An error happened", err)
          );
        })

      }

      function initDots() {
        let linesMaterials = [
          new THREE.LineBasicMaterial({transparent: true, color: 0xD7DBDD}),
          new THREE.LineBasicMaterial({transparent: true, color: 0xCFD6DE})
        ];
        sampler = new MeshSurfaceSampler(diamondModelAnim).build();

        for (let i = 0; i < 6; i++) {
          const linesMesh = new THREE.Line(new THREE.BufferGeometry(), linesMaterials[i % 2]);
          linesMesh.coordinates = [];
          linesMesh.previous = null;
          lines.push(linesMesh);
          group.add(linesMesh);
        }
        render();
      }

      function nextDot(line) {
        let ok = false;
        while (!ok) {
          sampler.sample(vector3);
          if (line.previous && vector3.distanceTo(line.previous) < 0.3) {
            line.coordinates.push(vector3.x, vector3.y, vector3.z);
            line.previous = vector3.clone();

            for (let i = 0; i < 2; i++) {
              const spark = new Sparkle();
              spark.setup(vector3, line.material.color);
              sparkles.push(spark);
            }
            ok = true;
          } else if (!line.previous) {
            line.previous = vector3.clone();
          }
        }
      }

      function updateSparklesGeometry() {
        let tempSparklesArraySizes = [];
        let tempSparklesArrayColors = [];
        sparkles.forEach((s) => {
          tempSparklesArraySizes.push(s.size);
          tempSparklesArrayColors.push(s.color.r, s.color.g, s.color.b);
        });
        sparklesGeometry.setAttribute("color", new THREE.Float32BufferAttribute(tempSparklesArrayColors, 3));
        sparklesGeometry.setAttribute("size", new THREE.Float32BufferAttribute(tempSparklesArraySizes, 1));
        pointsMaterial.opacity = 1 - sparkles.length / 100000
      }





      

      

      function onWindowResize() {
        camera.aspect = elContent.offsetWidth / elContent.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(elContent.offsetWidth, elContent.offsetHeight);
      }

      function render(a) {
        requestAnimationFrame(render);

        group.rotation.x = Math.sin(a * 0.0003) * 0.1;
        diamondModel.rotation.x = Math.sin(a * 0.0003) * 0.1;

        if (direction === 'left') {
          group.rotation.y -= 0.001;
          //diamondModel.rotation.y -= 0.001;
        } else {
          group.rotation.y += 0.001;
          //diamondModel.rotation.y += 0.001;
        }

        if (a - _prev > 30) {
          diamondModel.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              child.material.opacity = sparkles.length / 50000
            }
          });
          lines.forEach((l) => {
            if (sparkles.length < 50000) {
              for (let i = 0; i < 50; i++) {
                nextDot(l);
              }
            } else {
              animationInProgress = false;
            }
            const tempVertices = new Float32Array(l.coordinates);
            l.material.opacity = 1 - sparkles.length / 50000
            l.geometry.setAttribute("position", new THREE.BufferAttribute(tempVertices, 3));
            l.geometry.computeBoundingSphere();
          });
          if (animationInProgress) updateSparklesGeometry();
          _prev = a;
        }

        let tempSparklesArray = [];
        sparkles.forEach((s) => {
          s.update();
          if (animationInProgress) tempSparklesArray.push(s.x, s.y, s.z);
        });

        if (animationInProgress) sparklesGeometry.setAttribute("position", new THREE.Float32BufferAttribute(tempSparklesArray, 3));
        controls.update();
        renderer.render(scene, camera);
      }

    }
  };

}();

window.addEventListener('DOMContentLoaded', (event) => {
  DiamondModelView.init();
});



























