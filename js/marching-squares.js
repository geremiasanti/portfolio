/*
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


/* GLOBAL VARIABLES */
/* 2d array containing float values between 0 and 1 */
var field_float;
var field_bool;
var field_midpoints;
var t = 0;


/* PARAMETERS */
const getResolution = function() {
    return 70;
};
/* get the iso-value */
const getTreshold = function() {
    return 0.5;
};
/* the size of the edge of the imaginary cell 
(distance between cell's corners) */
const getCellSize = function() {
    return $(window).width() / (getResolution() - 1);
};
/* how many cols and rows have to be drawn 
(e.g. on resize cols number change) */
const getCols = function() {
    return getResolution();
};
const getRows = function() {
    return Math.trunc( $(window).height() / getCellSize() ) + 2; 
};
const getPointSize = function() {
    return getCellSize() * 0.15;
};
const getLineSize = function() {
    return getCellSize() * 0.05;
};
const getDrawDots = function() {
    return false;
};
/* draw iso-lines */
const getDrawLines = function() {
    return true;
};
const getType = function() {
    return 'float';
};
const populateGetNoise = function() {
    return 'p5_basic';
};


/* FUNCTIONS */
const getCellCenter = function(col, row) {
    return [(col + 0.5) * getCellSize(), (row + 0.5) * getCellSize()];
};

const getIndex = function(col, row) {
    return col + row * getCols();
};

/* put new values in the fields */
const populateFields = function(field_float, field_bool) {
    //TESTONLY
    /*
    let field_float_copy = new Float32Array(field_float.length);
    let field_bool_copy = new Uint8Array(field_bool.length);
    field_float_copy.set(field_float);
    field_bool_copy.set(field_bool);
    */

    let value, cellCenterPx, mouseCellDistance; 
    let whichNoise = populateGetNoise();
    let xInc = 0.3;
    let yInc = 0.3;
    let zInc = 0.1;
    for(let col = 0; col < getCols(); col++) {
        for(let row = 0; row < getRows(); row++) {
            let i = getIndex(col, row);
            switch(whichNoise) {
               case 'random':
                    value = Math.random();
                    break;
               case 'p5_basic':
                    value = noise(xInc * col, yInc * row, zInc * t);
                    break;
            }
            
            field_float[i] = value;
            
            if(value >= getTreshold()) {
                field_bool[i] = 1;
            } else {
                field_bool[i] = 0;
            }

            /* mouse shit */
            if(true) {
                cellCenterPx = getCellCenter(col, row); 
                mouseCellDistance = dist(mouseX, mouseY, cellCenterPx[0], cellCenterPx[1]);
                    if(mouseCellDistance < 200) {
                    field_float[i] = 1;
                    field_bool[i] = 1;
                }
            }
        }
    }
    return [field_float, field_bool];
};


/* this will return the cell corners as a 4 bit number */
const getCellStatus = function(col, row) {
    let out = '';
    /* I don't want more nested loops */
    out += str( field_bool[getIndex(col, row)] ); //up left corner
    out += str( field_bool[getIndex(col+1, row)] ); //up right corner
    out += str( field_bool[getIndex(col+1, row+1)] ); //down right corner
    out += str( field_bool[getIndex(col, row+1)] ); //down left corner
    return out;
};


const drawLines = function(col, row, cellMidpoints) {
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


function setup() {
    createCanvas( $(window).width(), $(window).height(), P2D);
    
    /* istantiating empty field */
    field_float = new Float32Array(getCols() * getRows());
    field_bool = new Int8Array(getCols() * getRows());
    field_midpoints = Array(getCols()).fill().map(() => Array(getRows()));

    /* calculating every cell's midpoints positions */
    let cellSize = getCellSize();
    for(let col = 0; col < getCols(); col++) {
        for(let row = 0; row < getRows(); row++) {
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
}


function draw() {                      
    /* clear the canvas every frame */
    clear();
    /* incrementing t at every frame*/
    t++;
    
    let resolution = getResolution();
    let cellSize = getCellSize();
    let cols = getCols();
    let rows = getRows();
    let field_midpoints_copy = field_midpoints;

    populated = populateFields(field_float, field_bool);
    field_float = populated[0];
    field_bool = populated[1];

    /* main loop, processes every cell */
    for(let col = 0; col < cols; col++) {
        for(let row = 0; row < rows; row++) {
            let i = getIndex(col, row);
            let cellValue_float = field_float[i];
            let cellValue_bool = field_bool[i];

            if(getDrawDots()) {
                strokeWeight(getPointSize());
                switch(dotsGetFloatOrBool()) {
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
            if(col > getCols()-2 || row > getRows()-2) {
                continue;
            }
            
            if(getDrawLines()) {
                stroke(0);
                strokeWeight(getLineSize()); 
                drawLines(col, row, field_midpoints_copy[col][row]);
            }
        }
    }
    
    //TESTONLY
    //noLoop();
} 


$(window).resize(function() { 
    setup();
    draw();
});


/* maintenence */
setInterval(function() {
    console.log(frameRate());
}, 1000);
