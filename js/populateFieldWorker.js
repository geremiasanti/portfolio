onmessage = (message) => {
    postMessage({
        t: message.data.t,
        fields: populateField(
            message.data.t,
            message.data.cols,
            message.data.rows,
            message.data.threshold,
            message.data.boundsToAvoid,
        )
    });
};

function populateField(t, cols, rows, threshold, boundsToAvoid) {
    fieldFloat = new Float32Array(cols * rows);
    fieldBool = new Int8Array(cols * rows);

    let value, cellCenterPx, mouseCellDistance; 
    let xInc = 0.03;
    let yInc = 0.03;
    let zInc = 0.05;

    let boundsGroupsAmount = boundsToAvoid.length; 

    col: for(let col = 0; col < cols; col++) {
        cell: for(let row = 0; row < rows; row++) {
            let i = getIndex(cols, col, row);

            for(let boundsGroupI = 0; boundsGroupI < boundsGroupsAmount; boundsGroupI++) {
                let bounds = boundsToAvoid[boundsGroupI]; 
                // if inside bounds
                if(col > bounds.left && col < bounds.right && row > bounds.top && row < bounds.bottom) {
                    fieldFloat[i] = 0;
                    fieldBool[i] = 0;
                    continue cell;
                } 
            }
            
            cellNoiseValue = noise(4, .3, xInc * col, yInc * row, zInc * t);

            fieldFloat[i] = cellNoiseValue;
            if(cellNoiseValue >= threshold) {
                fieldBool[i] = 1;
            } else {
                fieldBool[i] = 0;
            }
        }
    }
    return {
        fieldBool: fieldBool,
        fieldFloat: fieldFloat,
    }
};

// copied from https://github.com/processing/p5.js/blob/v1.9.3/src/math/noise.js
// because worker couldn't access p5.js
const PERLIN_YWRAPB = 4;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
const PERLIN_ZWRAPB = 8;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
const PERLIN_SIZE = 4095;
const scaled_cosine = i => 0.5 * (1.0 - Math.cos(i * Math.PI));
let perlin; // will be initialized lazily by noise() or noiseSeed()
function noise(perlin_octaves, perlin_amp_falloff, x, y = 0, z = 0) {
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
