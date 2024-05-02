/* EXPLANATION
-field: 2d array containing float values from 0 to 1 
-how is field drawn: 
    I'm thinking of the field's values as corners of the cells we are drawing.
    Example with a sample int 2d array of size (2, 2):    

        +---+---+      +---4---2 
        | 4 | 2 |      |   |   |   
        +---+---+  ->  +---6---9   
        | 6 | 9 |      |   |   | 
        +---+---+      +---+---+ 

    Now I can draw a pattern inside the cell, the choice of pattern is based on 
        a rule. The most common one (I don't know if others exist) is to set a 
        treshold, then the pattern will have to be positioned in such a way that 
        it divides the corners that have a value higher than the trashold from 
        the other (which will have a value less than or equal to the treshold). 
    The only thing the observer will see are the lines that connect the corners, 
        which will not be drawn. The edges are not going to be drawn either. 
    Some examples of the different ways a single cell can be rendered (with
        treshold=5):

        4------2   7------2   7------2   7------6
        |______|   |  |   |   |    \ |   |      |
        |      |   |  |   |   | \    |   | \    |
        6------9   6------3   3------6   2------9   ...and so on.

    To draw the needed lines inside a cell we just need to connect 4 points (a, 
        b, c, d) which are along the cell's edges:

        +---a---+
        |       |
        d       b
        |       |
        +---c---+
        
    This is a simplification, it is possible to place our points closer to one 
        edge or another based on the values of the two corner to have smooter 
        lines.
    While drawing the lines I will refer to a cell by his up left corner's 
        indexes.
*/

// const
const baseBackgroundColor = '#FF671F';
const hoverBackgroundColor = '#121212';
const contentColor = '#FFFFFF';

// params 
let resolution, 
    treshold, 
    cellSize, 
    cols, 
    rows, 
    pointSize,
    lineSize,
    drawDots, 
    whichNoise,
    octaves,
    fallOff,
    backgroundColor
;

// variables
let t = 0;
let field_float,
    field_bool,
    field_midpoints;

$(document).ready(function() {
    // handle resize
    $(window).resize(
        debounce(function() { 
            setup();
        })
    );

    // on hover turn dark
    $('.link').mouseenter(() => {
        backgroundColor = hoverBackgroundColor;    
        $('.link').removeClass('text-saffron').addClass('text-black');
    }).mouseleave(() => {
        backgroundColor = baseBackgroundColor;    
        $('.link').removeClass('text-black').addClass('text-saffron');
    }).mouseleave();

    // check performance
    setInterval(function() {
        console.log(frameRate());
    }, 1000);
})


function setup() {
    // instantiate params
    resolution = 100;
    treshold = .5;
    
    if($(window).width() > $(window).height()) {
        cellSize = $(window).width() / (resolution - 1);
        cols = resolution;
        rows = Math.trunc( $(window).height() / cellSize ) + 2; 
    } else {
        cellSize = $(window).height() / (resolution - 1);
        rows = resolution;
        cols = Math.trunc( $(window).width() / cellSize ) + 2; 
    }

    pointSize = cellSize * .3;
    lineSize = cellSize * .15;
    drawDots = false;
    whichNoise = 'p5_noise';

    // fields 
    field_float = new Float32Array(cols * rows);
    field_bool = new Int8Array(cols * rows);

    // calculating every cell's midpoints positions
    field_midpoints = Array(cols).fill().map(() => Array(rows));
    for(let col = 0; col < cols; col++) {
        for(let row = 0; row < rows; row++) {
            let xa = (col + 0.5) * cellSize; 
            let ya = row * cellSize;
            let xb = (col + 1) * cellSize; 
            let yb = (row + 0.5) * cellSize;
            let xc = (col + 0.5) * cellSize;
            let yc = (row + 1) * cellSize;
            let xd = col * cellSize;
            let yd = (row + 0.5) * cellSize;
            field_midpoints[col][row] = {xa: xa, ya: ya, xb: xb, yb: yb, xc: xc, yc: yc, xd: xd, yd: yd};
        }
    }

    // noise params (see perlin noise)
    octaves = 4;
    fallOff = .3;
    noiseDetail(octaves, fallOff);


    // canvas
    createCanvas($(window).width(), $(window).height(), P2D, document.getElementById('p5canvas'));
}



function draw() {                      
    // maintanance
    clear();
    t++;

    // background
    background(backgroundColor);

    // values into 2d Arrays
    [field_float, field_bool] = populateFields(field_float, field_bool);

    // main loop, processes every cell
    for(let col = 0; col < cols; col++) {
        for(let row = 0; row < rows; row++) {
            let i = getIndex(col, row);
            let cellValue_float = field_float[i];
            let cellValue_bool = field_bool[i];

            if(drawDots) {
                strokeWeight(pointSize);
                switch('float') {
                    case 'bool':
                        stroke(255 * cellValue_bool);
                        break;
                    case 'float':
                        stroke(Math.trunc(255 * cellValue_float));
                        break;
                }
                point(col * cellSize, row * cellSize); 
            }
    
            /* after this I'll put everithing that needs to be done INSIDE the 
               cell (e.g. isolines), because the last row and col of the field 
               are just the last drawn edges; the last cell instead will be 
               delimited by the last col and the one before (same for the 
               rows) */
            if(col > cols-2 || row > rows-2) {
                continue;
            }
            
            // lines
            stroke('contentColor');
            strokeWeight(lineSize); 
            drawLines(col, row, field_midpoints[col][row]);
        }
    }
} 

// put new values in the fields
function populateFields(field_float, field_bool) {
    let value, cellCenterPx, mouseCellDistance; 
    let xInc = 0.1;
    let yInc = 0.1;
    let zInc = 0.1;
    for(let col = 0; col < cols; col++) {
        for(let row = 0; row < rows; row++) {
            let i = getIndex(col, row);

            value = noise(xInc * col, yInc * row, zInc * t);
            
            field_float[i] = value;
            
            if(value >= treshold) {
                field_bool[i] = 1;
            } else {
                field_bool[i] = 0;
            }

            // mouse shit
            if(true) {
                cellCenterPx = getCellCenter(col, row); 
                mouseCellDistance = dist(mouseX, mouseY, cellCenterPx[0], cellCenterPx[1]);
                    if(mouseCellDistance < 100) {
                    field_float[i] = 1;
                    field_bool[i] = 1;
                }
            }
        }
    }
    return [field_float, field_bool];
};


function drawLines(col, row, cellMidpoints) {
    let cellStatus = getCellStatus(col, row);

    /* I did the evaluation in this way because:
       -if there are 0 or 4 ones i don't have to draw nothing
       -if there are 1 or 3 ones i just have to put a single line
           -if there is only 1 one i put the line around that corner 
           -if there is only 1 zero i put the line around that corner 
       -if there are 2 ones i need to evaluate further
           -if those corners are on the same edge I draw one of the two possible 
            lines that split the cell in half.
           -if the 2 ones are on opposite corners I have to draw two lines that 
            isolates those corners, each of the ones will be isolated */
    let ones = (cellStatus.match(/1/g) || []).length;
    if (ones == 0 || ones == 4) {
        return;
    } else if(ones == 2) {
        if(cellStatus === '0110' || cellStatus === '1001') {
            /* AC */
            line(cellMidpoints.xa, cellMidpoints.ya, cellMidpoints.xc, cellMidpoints.yc);
        } else if(cellStatus === '1100' || cellStatus === '0011') {
            /* BD */
            line(cellMidpoints.xb, cellMidpoints.yb, cellMidpoints.xd, cellMidpoints.yd);
        } else if(cellStatus == '0101') {
            /* AB and CD */ 
            line(cellMidpoints.xa, cellMidpoints.ya, cellMidpoints.xb, cellMidpoints.yb);
            line(cellMidpoints.xc, cellMidpoints.yc, cellMidpoints.xd, cellMidpoints.yd);
        } else if(cellStatus == '1010') {
            /* AD and BC */ 
            line(cellMidpoints.xa, cellMidpoints.ya, cellMidpoints.xd, cellMidpoints.yd);
            line(cellMidpoints.xb, cellMidpoints.yb, cellMidpoints.xc, cellMidpoints.yc);
        }
    } else {
        /* if there is only 1 one I will draw the line that isolates that 
           corner, else if there are 3 ones I will draw the line that isolates
           the only zero */
        let searchFor;
        if(ones == 1) {
            searchFor = '1';
        } else /* ones == 3 */ { 
            searchFor = '0';
        }
        /* in which position is the only one (or the only zero) */
        switch(cellStatus.indexOf(searchFor)) {
            case 0:
                /* AD */
                line(cellMidpoints.xa, cellMidpoints.ya, cellMidpoints.xd, cellMidpoints.yd);
                break;
            case 1:
                /* AB */
                line(cellMidpoints.xa, cellMidpoints.ya, cellMidpoints.xb, cellMidpoints.yb);
                break;
            case 2:
                /* BC */
                line(cellMidpoints.xb, cellMidpoints.yb, cellMidpoints.xc, cellMidpoints.yc);
                break;
            case 3:
                /* CD */
                line(cellMidpoints.xc, cellMidpoints.yc, cellMidpoints.xd, cellMidpoints.yd);
                break;
        }
    }
};


function getCellStatus(col, row) {
    // return the cell corners as a 4 bit number as string
    let out = '';
    out += str( field_bool[getIndex(col, row)] ); //up left corner
    out += str( field_bool[getIndex(col+1, row)] ); //up right corner
    out += str( field_bool[getIndex(col+1, row+1)] ); //down right corner
    out += str( field_bool[getIndex(col, row+1)] ); //down left corner
    return out;
};


function getCellCenter(col, row) {
    return [(col + 0.5) * cellSize, (row + 0.5) * cellSize];
};


function getIndex(col, row) {
    return col + row * cols;
};


function debounce(callback, wait = 100) {
    // last timeout id
    let timeoutId = null;
    return (...args) => {
        // on input clear previous timeout
        window.clearTimeout(timeoutId);
        // set new timeout
        timeoutId = window.setTimeout(() => {
            callback(...args);
        }, wait);
    };
}
