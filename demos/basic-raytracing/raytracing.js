class Canvas {
    constructor(canvasElementId, width, height) {
        this.htmlElement = document.getElementById(canvasElementId);
        this.context = this.htmlElement.getContext("2d");

        this.width = width; 
        this.height = height;
        this.htmlElement.width = this.width; 
        this.htmlElement.height = this.height;
        this.minX = -this.width/2;
        this.maxX = this.width/2;
        this.minY = -this.height/2;
        this.maxY = this.height/2;
    }
    
    putPixel(x, y, rgb) {
        // color
        this.context.fillStyle = rgb;

        // position
        this.context.fillRect(
            this.width/2 + x,
            this.height/2 - y,
            1,
            1
        );
    }
    
    toViewport(viewport, camera, canvasX, canvasY) {
        return [
            (canvasX * viewport.width / this.width) + camera.pos.x,
            (canvasY * viewport.height / this.height) + camera.pos.y,
            viewport.center.z + camera.pos.z
        ];
    } 
}

function rgb(r, g, b) {
    return `rgb(${r}, ${g}, ${b})`;
}

function dotProduct(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]; 
}

// p1 and p2 are 2 different points along the ray
function intersectRaySphere(cameraPos, cameraToViewportVector, sphere) {
    let cameraToSphereCenterVector = [
        cameraPos.x - sphere.center.x,
        cameraPos.y - sphere.center.y,
        cameraPos.z - sphere.center.z
    ]

    let a = dotProduct(cameraToViewportVector, cameraToViewportVector); 
    let b = 2 * dotProduct(cameraToSphereCenterVector, cameraToViewportVector); 
    let c = dotProduct(cameraToSphereCenterVector, cameraToSphereCenterVector)
        - sphere.radius * sphere.radius; 

    let discriminant = b * b - 4 * a * c;
    if(discriminant < 0)
        return [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];

    return [
        (-b + Math.sqrt(discriminant)) / 2 * a, 
        (-b - Math.sqrt(discriminant)) / 2 * a, 
    ]; 
}

function traceRay(cameraPos, cameraToViewportVector, minT, maxT, spheres) {
    let closestT = Number.MAX_SAFE_INTEGER;
    let closestSphere = null;
    spheres.forEach((sphere) => {
        [t1, t2] = intersectRaySphere(cameraPos, cameraToViewportVector, sphere);
        if(minT < t1 && t1 < maxT && t1 < closestT) {
            closestT = t1;
            closestSphere = sphere;
        }
        if(minT < t2 && t2 < maxT && t2 < closestT) {
            closestT = t2;
            closestSphere = sphere;
        }
    });

    if(closestSphere == null) 
        return rgb(255, 255, 255); // background

    return closestSphere.color;
}

function getElementValueById(id) {
    let value = document.getElementById(id).value;
    let valueInt = parseFloat(value);
    return valueInt;
}

function render() {
    // canvas
    let canvas = new Canvas(
        "canvas",
        getElementValueById("canvas-width"),
        getElementValueById("canvas-height"),
    );

    // scene
    let camera = {
        pos: {
            x: getElementValueById("camera-x"),
            y: getElementValueById("camera-y"),
            z: getElementValueById("camera-z"),
        }
    };
    let viewport = {
        // perpendicular to Z axis
        width: getElementValueById("viewport-width"),
        height: getElementValueById("viewport-height"),
        center: {
            x: 0,
            y: 0,
            z: getElementValueById("viewport-z"),
        }
    };
    let spheres = [
        {
            center: {
                x: getElementValueById("red-sphere-x"),
                y: getElementValueById("red-sphere-y"),
                z: getElementValueById("red-sphere-z"),
            },
            radius: getElementValueById("red-sphere-radius"),
            color: rgb(255, 0, 0) // red
        }, {
            center: {
                x: getElementValueById("green-sphere-x"),
                y: getElementValueById("green-sphere-y"),
                z: getElementValueById("green-sphere-z"),
            },
            radius: getElementValueById("green-sphere-radius"),
            color: rgb(0, 255, 0) // green
        }, {
            center: {
                x: getElementValueById("blue-sphere-x"),
                y: getElementValueById("blue-sphere-y"),
                z: getElementValueById("blue-sphere-z"),
            },
            radius: getElementValueById("blue-sphere-radius"),
            color: rgb(0, 0, 255) // blue
        }
    ];

    // rendering
    for(let canvasX = canvas.minX; canvasX <= canvas.maxX; canvasX++) {
        for(let canvasY = canvas.minY; canvasY <= canvas.maxY; canvasY++) {
            let cameraToViewportVector = canvas.toViewport(viewport, camera, canvasX, canvasY); 
            let color = traceRay(
                camera.pos, 
                cameraToViewportVector, 
                viewport.center.z,
                Number.MAX_SAFE_INTEGER,
                spheres
            );
            canvas.putPixel(canvasX, canvasY, color);
        }
    }
}

function initInputs() {
    let inputs = document.getElementsByClassName("render-on-change");
    for(let i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener("change", (event) => {
            render()
        });; 
    }
}

function main() {
    document.addEventListener("DOMContentLoaded", function() {
        render();
        initInputs();    
    });
}
 
main();
