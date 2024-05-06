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
        threshold, then the pattern will have to be positioned in such a way that 
        it divides the corners that have a value higher than the trashold from 
        the other (which will have a value less than or equal to the threshold). 
    The only thing the observer will see are the lines that connect the corners, 
        which will not be drawn. The edges are not going to be drawn either. 
    Some examples of the different ways a single cell can be rendered (with
        threshold=5):

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


// consts
const firstBackgroundColor = '#FC580A';
const secondBackgroundColor = '#121212';
const firstContentColor = '#F6C8A2';
const secondContentColor = '#2F4858';
const startingResolution = 100;
const minFieldBufferSize = 8;
const workersAmount = 16;
const populateFieldWorker = new Worker('./js/populateFieldWorker.js');
const framerate = 30;
const tInc = .3;

// params 
let resolution, 
    threshold, 
    cellSize, 
    cols, 
    rows, 
    pointSize,
    lineSize,
    backgroundColor,
    contentColor;


// variables
let t = 0;
let fieldMidpoints,
    fieldBuffer,
    field;


$(document).ready(function() {
    // handle resize
    $(window).resize(
        debounce(function() { 
            setup();
        })
    );

    // on hover turn dark
    $('.link').mouseenter(() => {
        backgroundColor = secondBackgroundColor;    
        contentColor = secondContentColor;    
        $('.link').removeClass('text-saffron').addClass('text-black');
    }).mouseleave(() => {
        backgroundColor = firstBackgroundColor;    
        contentColor = firstContentColor;    
        $('.link').removeClass('text-black').addClass('text-saffron');
    }).mouseleave();

    // monitoring
    setInterval(function() {
        console.log(`resolution: ${resolution}, frameRate: ${frameRate()}`);
    }, 1000);
})


function setup(newResolution = startingResolution, newCanvas = true) {
    let windowWidth = $(window).outerWidth();
    let windowHeight = $(window).outerHeight();

    // instantiate params
    threshold = .5;
    resolution = newResolution;
    if(windowWidth > windowHeight) {
        cellSize = windowWidth / (resolution - 1);
        cols = resolution;
        rows = Math.trunc(windowHeight / cellSize) + 2; 
    } else {
        cellSize = windowHeight / (resolution - 1);
        rows = resolution;
        cols = Math.trunc(windowWidth / cellSize) + 2; 
    }

    pointSize = cellSize * .3;
    lineSize = cellSize * .2;

    // calculating every cell's midpoints positions
    fieldMidpoints = Array(cols).fill().map(() => Array(rows));
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
            fieldMidpoints[col][row] = {xa: xa, ya: ya, xb: xb, yb: yb, xc: xc, yc: yc, xd: xd, yd: yd};
        }
    }

    if(newCanvas)
        createCanvas(windowWidth, windowHeight, P2D, document.getElementById('p5canvas'));

    if(t > 0) {
        // on resize roll back t
        t -= fieldBuffer.length * tInc;
    }

    fieldBuffer = new Array();
    // calling worker the first time
    executePopulateFieldWorker(populateFieldWorker);
    // worker response handler
    populateFieldWorker.onmessage = (response) => {
        fieldBuffer.push(response.data);
        fieldBuffer.sort((a,b) => (a.t < b.t) ? 1 : -1);
    };

    frameRate(framerate);
}


function draw() {
    // maintanance
    clear();

    // background
    background(backgroundColor);

    // get next field of values, if any present
    if(fieldBuffer.length < minFieldBufferSize) {
        executePopulateFieldWorker(populateFieldWorker);
    }

    if(fieldBuffer.length > 0) {
        field = fieldBuffer.pop().field;
    } 
    if(typeof field === "undefined") {
        return;
    }

    // main loop, processes every cell
    for(let col = 0; col < cols; col++) {
        for(let row = 0; row < rows; row++) {
            let i = getIndex(col, row);
            stroke(contentColor);
            strokeWeight(pointSize);
            if(field[i])
                point(col * cellSize, row * cellSize); 
    
            /* after this I'll put everithing that needs to be done INSIDE the 
               cell (e.g. isolines), because the last row and col of the field 
               are just the last drawn edges; the last cell instead will be 
               delimited by the last col and the one before (same for the 
               rows) */
            if(col > cols-2 || row > rows-2) {
                continue;
            }
            
            // lines
            strokeWeight(lineSize); 
            drawLines(col, row, fieldMidpoints[col][row]);
        }
    }
} 


function executePopulateFieldWorker(populateFieldWorker) {
    for(let i = 0; i < workersAmount; i++) {
        t += tInc;
        populateFieldWorker.postMessage({
            t: t,
            cols: cols,
            rows: rows,
            threshold: threshold,
        });
    }
}


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
    out += str( field[getIndex(col, row)] ); //up left corner
    out += str( field[getIndex(col+1, row)] ); //up right corner
    out += str( field[getIndex(col+1, row+1)] ); //down right corner
    out += str( field[getIndex(col, row+1)] ); //down left corner
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
