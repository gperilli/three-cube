import * as THREE from 'three';
//import * as THREE from '/js/three/build/three.module.js';
import {WEBGL} from './WebGL.js';

import {OBJLoader} from '/node_modules/three/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '/node_modules/three/examples/jsm/loaders/MTLLoader.js';
import {MeshSurfaceSampler} from '/node_modules/three/examples/jsm/math/MeshSurfaceSampler.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';

import { degrees_to_radians } from './DegreesToRadians.js';

const textureLoader = new THREE.TextureLoader();
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();

const MODELS_URL = 'models/'

const objectModelView = function () {
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

  let direction = 'left';
  let objectModelAnim = null;
  let objectModel = null;
  let sampler = null;
  const lines = [];


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
        camera.position.z = 2;
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
        loadObjectModelAnim();
        loadObjectModel();
      }

      function initEvents() {
        window.addEventListener("resize", onWindowResize);
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
        const divisions = 5;
        
        const gridHelper = new THREE.GridHelper( size, divisions );
        //scene.add( gridHelper ); 
      }



      function loadObjectModelAnim() {
        objLoader.load(
          MODELS_URL + "cube.obj",
          (obj) => {
            objectModelAnim = obj.children[0];
            objectModelAnim.geometry.scale(1, 1, 1);
            objectModelAnim.geometry.translate(0, 0.15, 0);
            objectModelAnim.geometry.rotateX(0);

          },
          (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
          (err) => console.log("An error happened", err)
        );
      }

      function loadObjectModel() {
        mtlLoader.load(MODELS_URL + 'cube.obj', function (materials) {
          materials.preload();
          objLoader.setMaterials(materials)
          objLoader.load(
            MODELS_URL + "cube.obj",
            (obj) => {
              objectModel = obj;
              objectModel.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                  child.geometry.scale(0.48, 0.48, 0.48);
                  child.geometry.translate(0, 0, 0);
                  child.geometry.rotateY(0);
                  child.material.transparent = true;
                  child.material.opacity = 0;
                }
              });
              objectModel.rotation.x = 1;
              objectModel.rotation.y = 1;
              //scene.add(objectModel);
              objectModel.layers.enableAll();

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
        sampler = new MeshSurfaceSampler(objectModelAnim).build();

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
        objectModel.rotation.x = Math.sin(a * 0.0003) * 0.1;

        if (direction === 'left') {
          group.rotation.y -= 0.001;
          //objectModel.rotation.y -= 0.001;
        } else {
          group.rotation.y += 0.001;
          //objectModel.rotation.y += 0.001;
        }

        if (a - _prev > 30) {
          objectModel.traverse(function (child) {
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
  objectModelView.init();
});




























