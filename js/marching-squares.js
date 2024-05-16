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

// disables FES (avoid p5 function parameters validating for better performance)
p5.disableFriendlyErrors = true;

// consts
const minFieldBufferSize = 8;
const workersAmount = 16;
const populateFieldWorker = new Worker('./js/populateFieldWorker.js');
const framerate = 30;
const tInc = .3;
const bgTransitionInc = .1;

// colors
let firstBackgroundColor = '#FC580A';
let secondBackgroundColor = '#121212';
let firstContentColor = '#F6C8A2';
let secondContentColor = '#2F4858';

// params 
let threshold, 
    cellSize, 
    cols, 
    rows, 
    basePointSize,
    lineSize,
    boundsToAvoid,
    isMobile,
    resolution;

// variables
let t = 0;
let fieldMidpoints,
    fieldBuffer,
    fieldBool,
    fieldFloat;
let backgroundColor,
    contentColor,
    lerpBgIn = false,
    lerpBgOut = false,
    startingColor,
    transitionPerc;


$(document).ready(() => {
    // handle resize
    $(window).resize(
        debounce(() => { 
            setup();
        })
    );

    // on hover turn dark
    $('.btn-section').mouseenter(() => {
        lerpBgIn = true;
        lerpBgOut = false;
        transitionPerc = 0;
        startingBackgroundColor = backgroundColor;
        startingContentColor = contentColor;
    }).mouseleave(() => {
        lerpBgOut = true;
        lerpBgIn = false;
        transitionPerc = 0;
        startingBackgroundColor = backgroundColor;
        startingContentColor = contentColor;
    })

    // monitoring
    /*
    setInterval(() => {
        console.log(`resolution: ${resolution}, frameRate: ${frameRate()}`);
    }, 1000);
    */
})


function setup(newCanvas = true) {
    isMobile = detectMobileBrowser();

    let windowWidth = $(window).outerWidth();
    let windowHeight = $(window).outerHeight();
    if(newCanvas)
        createCanvas(windowWidth, windowHeight, P2D, document.getElementById('p5canvas'));

    // resolution
    resolution = 140;
    if(isMobile) {
        resolution = 90;
    }

    if(windowWidth > windowHeight) {
        cellSize = windowWidth / (resolution - 1);
        cols = resolution;
        rows = Math.trunc(windowHeight / cellSize) + 2; 
    } else {
        cellSize = windowHeight / (resolution - 1);
        rows = resolution;
        cols = Math.trunc(windowWidth / cellSize) + 2; 
    }

    basePointSize = cellSize * 6;
    lineSize = cellSize * .2;

    threshold = .4;

    boundsToAvoid = getBoundsToAvoid('.avoid');

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

    fieldBuffer = new Array();
    // on resize roll back t
    if(t > 0) t -= fieldBuffer.length * tInc;

    // calling worker the first time
    executePopulateFieldWorker(populateFieldWorker);
    // worker response handler
    populateFieldWorker.onmessage = (response) => {
        fieldBuffer.push(response.data);
        fieldBuffer.sort((a, b) => (a.t < b.t) ? 1 : -1);
    };

    firstBackgroundColor = color('#FC580A');
    secondBackgroundColor = color('#121212');
    firstContentColor = color('#F6C8A2');
    secondContentColor = color('#2F4858');
    backgroundColor = firstBackgroundColor;
    contentColor = firstContentColor;

    frameRate(framerate);
}


function draw() {
    if(frameCount == 2) {
        document.getElementById('p5canvas').dispatchEvent(new Event('firstDrawCompleted'));
    } 

    // get next field of values, if any present
    if(fieldBuffer.length < minFieldBufferSize) {
        executePopulateFieldWorker(populateFieldWorker);
    }

    if(fieldBuffer.length > 0) {
        fields = fieldBuffer.pop().fields;
        fieldBool = fields.fieldBool;
        fieldFloat = fields.fieldFloat;
    } 
    if(typeof fieldBool === "undefined") {
        return;
    }

    clear();

    // background color transition
    if(lerpBgIn) {
        transitionPerc += bgTransitionInc;

        backgroundColor = lerpColor(startingBackgroundColor, secondBackgroundColor, transitionPerc)
        contentColor = lerpColor(startingContentColor, secondContentColor, transitionPerc)
        
        if(transitionPerc >= 1) 
            lerpBgIn = false;
    }
    if(lerpBgOut) {
        transitionPerc += bgTransitionInc;

        backgroundColor = lerpColor(startingBackgroundColor, firstBackgroundColor, transitionPerc)
        contentColor = lerpColor(startingContentColor, firstContentColor, transitionPerc)
        
        if(transitionPerc >= 1) 
            lerpBgOut = false;
    }
    // background
    background(backgroundColor);

    // main loop, processes every cell
    for(let col = 0; col < cols; col++) {
        for(let row = 0; row < rows; row++) {
            let i = getIndex(col, row);

            if(fieldBool[i]) {
                strokeWeight(basePointSize * (fieldFloat[i] - threshold * .93));
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
            stroke(contentColor);
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
            boundsToAvoid: boundsToAvoid,
        });
    }
}


function drawLines(col, row, cellMidpoints) {
    let cellStatus = getCellStatus(col, row);

    /* I did the evaluation this way because:
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


// return the cell corners as a 4 bit number as string
function getCellStatus(col, row) {
    let out = '';
    out += str( fieldBool[getIndex(col, row)] ); //up left corner
    out += str( fieldBool[getIndex(col+1, row)] ); //up right corner
    out += str( fieldBool[getIndex(col+1, row+1)] ); //down right corner
    out += str( fieldBool[getIndex(col, row+1)] ); //down left corner
    return out;
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


// returns outer bounds of elements matching selector
// (in cells, not pixels) 
function getBoundsToAvoid(selector) {
    let bounds = new Array();

    let elements = $(selector).each(function() {
        let group = parseInt(this.dataset.avoidGroup);
        if(typeof bounds[group] === 'undefined') {
            bounds[group] = {
                top: $(window).outerHeight(),
                left: $(window).outerWidth(),
                bottom: 0,
                right: 0,
            };
        }

        let elementBounds = this.getBoundingClientRect();
        if(elementBounds.top < bounds[group].top) {
            bounds[group].top = elementBounds.top;
        }
        if(elementBounds.left < bounds[group].left) {
            bounds[group].left = elementBounds.left;
        }
        if(elementBounds.bottom > bounds[group].bottom) {
            bounds[group].bottom = elementBounds.bottom;
        }
        if(elementBounds.right > bounds[group].right) {
            bounds[group].right = elementBounds.right;
        }
    }); 

    bounds.forEach((groupBounds) => {
        let groupHeight = groupBounds.bottom - groupBounds.top;
        let groupWidth = groupBounds.right - groupBounds.left;
        let paddingY = Math.min(groupHeight, groupWidth) * .075; 
        let paddingX = Math.min(groupHeight, groupWidth) * .2; 

        // padding
        groupBounds.top -= paddingY;
        groupBounds.left -= paddingX;
        groupBounds.bottom += paddingY;
        groupBounds.right += paddingX;

        // converting from pixels to cells
        groupBounds.top /= cellSize;
        groupBounds.left /= cellSize;
        groupBounds.bottom /= cellSize;
        groupBounds.right /= cellSize;

    });

    return bounds
}

// script from http://detectmobilebrowsers.com/
function detectMobileBrowser(){
    // returns true if mobile
    let a = navigator.userAgent||navigator.vendor||window.opera;
    return(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))
}
