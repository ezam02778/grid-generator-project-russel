import * as THREE from "three";


/* ==========================
   ELEMENTS
========================== */

const grid =
    document.getElementById("grid");

const imageInput =
    document.getElementById("imageInput");

const uploadButton =
    document.getElementById("uploadButton");


const columns =
    document.getElementById("columns");

const rows =
    document.getElementById("rows");

const depth =
    document.getElementById("depth");

const perspective =
    document.getElementById("perspective");

const gap =
    document.getElementById("gap");

const scale =
    document.getElementById("scale");


let imageURL = null;


/* ==========================
   THREE SCENE
========================== */

const scene =
    new THREE.Scene();


scene.background =
    new THREE.Color(0x000000);


const camera =
    new THREE.PerspectiveCamera(
        35,
        1,
        0.1,
        100
    );


camera.position.z = 7;


/* ==========================
   RENDERER
========================== */

const renderer =
    new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true
    });


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


renderer.setSize(
    grid.clientWidth,
    grid.clientHeight
);


grid.appendChild(
    renderer.domElement
);


/* ==========================
   LIGHT
========================== */

const ambient =
    new THREE.AmbientLight(
        0xffffff,
        2
    );

scene.add(ambient);


const light =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );

light.position.set(
    -2,
    3,
    5
);

scene.add(light);


/* ==========================
   VARIABLES
========================== */

let faceGroup =
    new THREE.Group();

scene.add(faceGroup);


/* ==========================
   IMAGE
========================== */

function loadImage() {

    if (!imageURL)
        return;


    const loader =
        new THREE.TextureLoader();


    loader.load(
        imageURL,
        texture => {

            texture.colorSpace =
                THREE.SRGBColorSpace;

            createGrid(texture);

        }
    );

}


/* ==========================
   CREATE 3D FACE
========================== */

function createFace(
    texture,
    x,
    y,
    angle,
    depthAmount
) {

    /*
        Curved plane.

        The vertices are pushed
        forward near the center,
        producing a face-like
        relief.
    */

    const geometry =
        new THREE.PlaneGeometry(
            1.35,
            1.65,
            32,
            32
        );


    const position =
        geometry.attributes.position;


    for (
        let i = 0;
        i < position.count;
        i++
    ) {

        const px =
            position.getX(i);

        const py =
            position.getY(i);


        const nx =
            px / 0.675;

        const ny =
            py / 0.825;


        const distance =
            Math.sqrt(
                nx * nx +
                ny * ny
            );


        /*
            Rounded depth.

            Center = forward
            Edge = shallow
        */

        const bulge =
            Math.max(
                0,
                1 - distance
            );


        const z =
            Math.pow(
                bulge,
                1.7
            ) *
            depthAmount;


        position.setZ(
            i,
            z
        );

    }


    position.needsUpdate =
        true;


    geometry.computeVertexNormals();


    const material =
        new THREE.MeshStandardMaterial({

            map: texture,

            roughness: .72,

            metalness: 0,

            side: THREE.DoubleSide

        });


    const face =
        new THREE.Mesh(
            geometry,
            material
        );


    face.position.set(
        x,
        y,
        0
    );


    face.rotation.y =
        THREE.MathUtils.degToRad(
            angle
        );


    return face;

}


/* ==========================
   GRID
========================== */

function createGrid(texture) {

    faceGroup.clear();


    const c =
        Number(columns.value);

    const r =
        Number(rows.value);

    const perspectiveAmount =
        Number(perspective.value);

    const gapAmount =
        Number(gap.value);

    const depthAmount =
        Number(depth.value) / 100;


    const scaleAmount =
        Number(scale.value) / 100;


    const spacingX =
        1.45 +
        gapAmount / 100;


    const spacingY =
        1.75 +
        gapAmount / 100;


    for (
        let row = 0;
        row < r;
        row++
    ) {

        for (
            let col = 0;
            col < c;
            col++
        ) {


            const centerX =
                (c - 1) / 2;


            const centerY =
                (r - 1) / 2;


            const relativeX =
                col - centerX;


            const relativeY =
                row - centerY;


            const posX =
                relativeX *
                spacingX;


            const posY =
                -relativeY *
                spacingY;


            /*
                Left → negative

                Center → zero

                Right → positive
            */

            const angle =
                relativeX *
                perspectiveAmount *
                0.75;


            const face =
                createFace(
                    texture,
                    posX,
                    posY,
                    angle,
                    depthAmount
                );


            face.scale.set(
                scaleAmount,
                scaleAmount,
                scaleAmount
            );


            /*
                Slight vertical
                variation.
            */

            face.rotation.x =
                THREE.MathUtils.degToRad(
                    relativeY *
                    perspectiveAmount *
                    0.06
                );


            faceGroup.add(face);

        }

    }


    /*
        Automatically center
        the complete grid.
    */

    faceGroup.position.set(
        0,
        0,
        0
    );

}


/* ==========================
   RENDER
========================== */

function render() {

    renderer.render(
        scene,
        camera
    );

}


function animate() {

    requestAnimationFrame(
        animate
    );

    render();

}


animate();


/* ==========================
   RESIZE
========================== */

function resize() {

    const width =
        grid.clientWidth;

    const height =
        grid.clientHeight;


    camera.aspect =
        width / height;


    camera.updateProjectionMatrix();


    renderer.setSize(
        width,
        height
    );

}


window.addEventListener(
    "resize",
    resize
);


/* ==========================
   UPLOAD
========================== */

uploadButton.onclick =
    () => {

        imageInput.click();

    };


imageInput.onchange =
    event => {

        const file =
            event.target.files[0];

        if (!file)
            return;


        imageURL =
            URL.createObjectURL(file);


        const welcome =
            grid.querySelector(
                ".welcome"
            );


        if (welcome)
            welcome.remove();


        loadImage();

    };


/* ==========================
   SLIDER VALUES
========================== */

function updateValues() {

    document.getElementById(
        "columnsValue"
    ).textContent =
        columns.value;


    document.getElementById(
        "rowsValue"
    ).textContent =
        rows.value;


    document.getElementById(
        "depthValue"
    ).textContent =
        depth.value;


    document.getElementById(
        "perspectiveValue"
    ).textContent =
        perspective.value;


    document.getElementById(
        "gapValue"
    ).textContent =
        gap.value;


    document.getElementById(
        "scaleValue"
    ).textContent =
        scale.value;

}


[
    columns,
    rows,
    depth,
    perspective,
    gap,
    scale

].forEach(
    slider => {

        slider.addEventListener(
            "input",
            () => {

                updateValues();

                if (imageURL)
                    loadImage();

            }
        );

    }
);


/* ==========================
   RANDOMIZE
========================== */

document
    .getElementById(
        "randomButton"
    )
    .onclick = () => {


        function random(
            min,
            max
        ) {

            return Math.floor(
                Math.random() *
                (max - min + 1)
            ) + min;

        }


        columns.value =
            random(3, 6);


        rows.value =
            random(4, 8);


        depth.value =
            random(20, 70);


        perspective.value =
            random(15, 45);


        gap.value =
            random(5, 20);


        scale.value =
            random(80, 105);


        updateValues();


        if (imageURL)
            loadImage();

    };


/* ==========================
   EXPORT
========================== */

document
    .getElementById(
        "downloadButton"
    )
    .onclick = () => {

        if (!imageURL) {

            alert(
                "Upload an image first."
            );

            return;

        }


        renderer.render(
            scene,
            camera
        );


        const link =
            document.createElement("a");


        link.download =
            "3d-face-grid.png";


        link.href =
            renderer.domElement
                .toDataURL(
                    "image/png"
                );


        link.click();

    };


/* ==========================
   START
========================== */

updateValues();

resize();
