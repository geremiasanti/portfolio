onmessage = (message) => {
    postMessage({
        t: message.data.t,
        field: populateField(
            message.data.t,
            message.data.cols,
            message.data.rows,
            message.data.threshold,
        )
    });
};

function populateField(t, cols, rows, threshold) {
    field = new Int8Array(cols * rows);

    let value, cellCenterPx, mouseCellDistance; 
    let xInc = 0.1;
    let yInc = 0.1;
    let zInc = 0.1;

    let frameNoiseValue = noise(t * .15);
    for(let col = 0; col < cols; col++) {
        for(let row = 0; row < rows; row++) {
            let i = getIndex(cols, col, row);
            cellNoiseValue = noise(xInc * col, yInc * row, zInc * t);

            // mouse sphere
            /* TEMP
            cellCenterPx = getCellCenter(col, row); 
            mouseCellDistance = dist(
                mouseX + 10, mouseY + 10, 
                cellCenterPx[0], cellCenterPx[1]
            );
            */

            if(mouseCellDistance < 250 * frameNoiseValue) {
                cellNoiseValue += .3;
            } else if(mouseCellDistance < 500 * frameNoiseValue) {
                cellNoiseValue += .15;
            }

            if(cellNoiseValue >= threshold) {
                field[i] = 1;
            } else {
                field[i] = 0;
            }

        }
    }
    return field;
};

// copied from https://github.com/processing/p5.js/blob/v1.9.3/src/math/noise.js
// because worker couldn't access p5.js
const PERLIN_YWRAPB = 4;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
const PERLIN_ZWRAPB = 8;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
const PERLIN_SIZE = 4095;
let perlin_octaves = 4; // default to medium smooth
let perlin_amp_falloff = 0.5; // 50% reduction/octave
const scaled_cosine = i => 0.5 * (1.0 - Math.cos(i * Math.PI));
let perlin; // will be initialized lazily by noise() or noiseSeed()
function noise(x, y = 0, z = 0) {
    if (perlin == null) {
        perlin = new Array(PERLIN_SIZE + 1);
        for (let i = 0; i < PERLIN_SIZE + 1; i++) {
            perlin[i] = Math.random();
        }
    }

    if (x < 0) {
        x = -x;
    }
    if (y < 0) {
        y = -y;
    }
    if (z < 0) {
        z = -z;
    }

    let xi = Math.floor(x),
    yi = Math.floor(y),
    zi = Math.floor(z);
    let xf = x - xi;
    let yf = y - yi;
    let zf = z - zi;
    let rxf, ryf;

    let r = 0;
    let ampl = 0.5;

    let n1, n2, n3;

    for (let o = 0; o < perlin_octaves; o++) {
        let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);

        rxf = scaled_cosine(xf);
        ryf = scaled_cosine(yf);

        n1 = perlin[of & PERLIN_SIZE];
        n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
        n2 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
        n2 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
        n1 += ryf * (n2 - n1);

        of += PERLIN_ZWRAP;
        n2 = perlin[of & PERLIN_SIZE];
        n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
        n3 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
        n3 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
        n2 += ryf * (n3 - n2);

        n1 += scaled_cosine(zf) * (n2 - n1);

        r += n1 * ampl;
        ampl *= perlin_amp_falloff;
        xi <<= 1;
        xf *= 2;
        yi <<= 1;
        yf *= 2;
        zi <<= 1;
        zf *= 2;

        if (xf >= 1.0) {
            xi++;
            xf--;
        }
        if (yf >= 1.0) {
            yi++;
            yf--;
        }
        if (zf >= 1.0) {
            zi++;
            zf--;
        }
    }
    return r;
};

function getIndex(cols, col, row) {
    return col + row * cols;
};
