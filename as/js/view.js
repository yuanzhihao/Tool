/**
 *
 * It uses raphael.js to show the grids.
 */
var prex=[];
var prey=[];
var View = {
    nodeSize: 50, // width and height of a single node, in pixel
    nodeStyle: {
        normal: {
            fill: 'white',
            'stroke-opacity': 0.2, // the border
        },
        blocked: {
            fill: '#5F9DD5',
            'stroke-opacity': 0.2,
        },
        start: {
            fill: '#ffe735',
            'stroke-opacity': 0.2,
        },
        end: {
            fill: '#e60',
            'stroke-opacity': 0.2,
        },
        opened: {
            fill: '#afeeee',
            'stroke-opacity': 0.2,
        },
        closed: {
            fill: '#B0E2FF',
            'stroke-opacity': 0.2,


        },
        failed: {
            fill: '#ff8888',
            'stroke-opacity': 0.2,
        },
        tested: {
            fill: '#e5e5e5',
            'stroke-opacity': 0.2,
        },
    },
    nodeColorizeEffect: {
        duration: 50,
    },
    nodeZoomEffect: {
        duration: 200,
        transform: 's1.2', // scale by 1.2x
        transformBack: 's1.0',
    },
    pathStyle: {
        stroke: 'black',
        'stroke-width': 3,
        opacity: 0.4,
    },
    supportedOperations: ['opened', 'closed', 'tested'],
    init: function(opts) {
        this.numCols      = opts.numCols;
        this.numRows      = opts.numRows;
        this.paper        = Raphael('draw_area');
        this.$stats       = $('#stats');
    },
    /**
     * Generate the grid asynchronously.
     * This method will be a very expensive task.
     * Therefore, in order to not to block the rendering of browser ui,
     * I decomposed the task into smaller ones. Each will only generate a row.
     */
    generateGrid: function(callback) {
        var i, j, x, y,
            rect,
            normalStyle, nodeSize,
            createRowTask, sleep, tasks,isTag
            nodeSize    = this.nodeSize,
            normalStyle = this.nodeStyle.normal,
            numCols     = this.numCols,
            numRows     = this.numRows,
            paper       = this.paper,
            rects   =  isTag  = this.rects = [],
            $stats      = this.$stats;

        paper.setSize(numCols * nodeSize, numRows * nodeSize);

        createRowTask = function(rowId) {
            return function(done) {
                isTag[rowId]=[];
                for (j = 0; j < numCols; ++j) {
                    x = j * nodeSize;
                    y = rowId * nodeSize;

                    rect = paper.rect(x, y, nodeSize, nodeSize);
                    rect.attr(normalStyle);
                    rects[rowId].push(rect);

                }
                // $stats.text(
                //     'generating grid ' +
                //     Math.round((rowId + 1) / numRows * 100) + '%'
                // );
                done(null);
            };
        };

        sleep = function(done) {
            setTimeout(function() {
                done(null);
            }, 0);
        };

        tasks = [];
        for (i = 0; i < numRows; ++i) {
            tasks.push(createRowTask(i));
            tasks.push(sleep);
        }

        async.series(tasks, function() {
            if (callback) {
                callback();
            }
        });
    },
    setStartPos: function(gridX, gridY,i,px,py) {
        var coord = this.toPageCoordinate(gridX, gridY);
        if (!this.startNode) {
            this.startNode=[];}

            if(i==-1){
                this.startNode.push(this.paper.rect(
                    coord[0],
                    coord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                    .data("cooperative",
                        this.paper.text( coord[0]+this.nodeSize/2,coord[1]+this.nodeSize/2,this.startNode.length+1)
                                        .attr({"font-size":"18px",}))
                    .animate(this.nodeStyle.start, 1000));


            } else {
            var lb=this.startNode[i].data("cooperative");
                this.startNode[i].attr({ x: coord[0], y: coord[1]}).toFront();
                lb.attr({ x: (coord[0]+this.nodeSize/2), y: (coord[1]+this.nodeSize/2)}).toFront();

        }
    },

    setEndPos: function(gridX, gridY) {
        var coord = this.toPageCoordinate(gridX, gridY);
        if (!this.endNode) {
            this.endNode = this.paper.rect(
                coord[0],
                coord[1],
                this.nodeSize,
                this.nodeSize
            ).attr(this.nodeStyle.normal)
             .animate(this.nodeStyle.end, 1000);
        } else {
            this.endNode.attr({ x: coord[0], y: coord[1] }).toFront();
        }
    },
    /**
     * Set the attribute of the node at the given coordinate.
     */
    setAttributeAt: function(gridX, gridY, attr, value,tag) {
        var color, nodeStyle = this.nodeStyle;
        switch (attr) {

        case 'walkable':
            color = value ? nodeStyle.normal.fill : nodeStyle.blocked.fill;
            this.setWalkableAt(gridX, gridY, value);
            break;
        case 'opened':
            this.colorizeNode(this.rects[gridY][gridX], nodeStyle.opened.fill);
            this.setCoordDirty(gridX, gridY, true);
            break;
        case 'closed':


            if(tag){

            if(!this.rects[gridY][gridX].taged){
            this.tagNode(gridX, gridY,nodeStyle.tested.fill,tag);
            this.rects[gridY][gridX].taged=true;
            }
            // if(prex[tag]){
            //         this.colorizeNode(this.rects[prey[tag]][prex[tag]], nodeStyle.normal.fill);
            //         prex[tag]=gridX;
            //         prey[tag]=gridY;
            //     }else {
            //         prex[tag]=gridX;
            //         prey[tag]=gridY;
            //     }
            //  }
            this.colorizeNode(this.rects[gridY][gridX], nodeStyle.start.fill);
            this.setCoordDirty(gridX, gridY, true);
            break;
        case 'tested':
            color = (value === true) ? nodeStyle.tested.fill : nodeStyle.normal.fill;

            this.colorizeNode(this.rects[gridY][gridX], color);
            this.setCoordDirty(gridX, gridY, true);
            break;
        case 'parent':

            break;
        default:
            console.error('unsupported operation: ' + attr + ':' + value);
            return;
        }
    },

    colorizeNode: function(node,color) {
        node.animate({
            fill: color
        }, this.nodeColorizeEffect.duration);
    },
    colorizePoint: function(gridX,gridY) {
        var node=this.rects[gridY][gridX];
        this.colorizeNode(node,this.nodeStyle.closed.fill);
    },
    tagNode: function(x,y, color,tag) {
        var coord = this.toPageCoordinate(x, y);

        this.paper.text(coord[0]+this.nodeSize/2,coord[1]+this.nodeSize/2,tag)
            .attr({"font-size":"18px"});

    },
    zoomNode: function(node) {
        node.toFront().attr({
            transform: this.nodeZoomEffect.transform,
        }).animate({
            transform: this.nodeZoomEffect.transformBack,
        }, this.nodeZoomEffect.duration);
    },
    setWalkableAt: function(gridX, gridY, value) {
        var node, i, blockedNodes = this.blockedNodes;
        if (!blockedNodes) {
            blockedNodes = this.blockedNodes = new Array(this.numRows);
            for (i = 0; i < this.numRows; ++i) {
                blockedNodes[i] = [];
            }
        }
        node = blockedNodes[gridY][gridX];
        if (value) {
            // clear blocked node
            if (node) {
                this.colorizeNode(node, this.rects[gridY][gridX].attr('fill'));
                this.zoomNode(node);
                setTimeout(function() {
                    node.remove();
                }, this.nodeZoomEffect.duration);
                blockedNodes[gridY][gridX] = null;
            }
        } else {
            // draw blocked node
            if (node) {
                return;
            }
            node = blockedNodes[gridY][gridX] = this.rects[gridY][gridX].clone();
            this.colorizeNode(node, this.nodeStyle.blocked.fill);
            this.zoomNode(node);
        }
    },
    clearFootprints: function() {
        var i, x, y, coord, coords = this.getDirtyCoords();
        for (i = 0; i < coords.length; ++i) {
            coord = coords[i];
            x = coord[0];
            y = coord[1];
            this.rects[y][x].attr(this.nodeStyle.normal);
            this.setCoordDirty(x, y, false);
        }
    },
    clearBlockedNodes: function() {
        var i, j, blockedNodes = this.blockedNodes;
        if (!blockedNodes) {
            return;
        }
        for (i = 0; i < this.numRows; ++i) {
            for (j = 0 ;j < this.numCols; ++j) {
                if (blockedNodes[i][j]) {
                    blockedNodes[i][j].remove();
                    blockedNodes[i][j] = null;
                }
            }
        }
    },
    drawPath: function(paths) {
        for (var i=0;i<paths.length;i++){
            var path=paths[i];
        if (!path.length) {
            return;
        }
        var svgPath = this.buildSvgPath(path);
        this.path = this.paper.path(svgPath).attr(this.pathStyle);}
    },
    /**
     * Given a path, build its SVG represention.
     */
    buildSvgPath: function(path) {
        var i, strs = [], size = this.nodeSize;

        strs.push('M' + (path[0][0] * size + size / 2) + ' ' +
                  (path[0][1] * size + size / 2));



        for (i = 1; i < path.length; ++i) {
            strs.push('L' + (path[i][0] * size + size / 2) + ' ' +
                      (path[i][1] * size + size / 2));
            // strs.push(drawLineArrow(x,y,path[i][0],path[i][1],size));
            // x=path[i][0];
            // y=path[i][1];
        }


        return strs.join('');
    },
    clearPath: function() {
        if (this.path) {
            this.path.remove();
        }
    },
    /**
     * Helper function to convert the page coordinate to grid coordinate
     */
    toGridCoordinate: function(pageX, pageY) {
        return [
            Math.floor(pageX / this.nodeSize),
            Math.floor(pageY / this.nodeSize)
        ];
    },
    /**
     * helper function to convert the grid coordinate to page coordinate
     */
    toPageCoordinate: function(gridX, gridY) {
        return [
            gridX * this.nodeSize,
            gridY * this.nodeSize
        ];
    },
    // showStats: function(opts) {
    //     var texts = [
    //         'length: ' + Math.round(opts.pathLength * 100) / 100,
    //         'time: ' + opts.timeSpent + 'ms',
    //         'operations: ' + opts.operationCount
    //     ];
    //     $('#stats').show().html(texts.join('<br>'));
    // },
    setCoordDirty: function(gridX, gridY, isDirty) {
        var x, y,
            numRows = this.numRows,
            numCols = this.numCols,
            coordDirty;

        if (this.coordDirty === undefined) {
            coordDirty = this.coordDirty = [];
            for (y = 0; y < numRows; ++y) {
                coordDirty.push([]);
                for (x = 0; x < numCols; ++x) {
                    coordDirty[y].push(false);
                }
            }
        }

        this.coordDirty[gridY][gridX] = isDirty;
    },
    getDirtyCoords: function() {
        var x, y,
            numRows = this.numRows,
            numCols = this.numCols,
            coordDirty = this.coordDirty,
            coords = [];

        if (coordDirty === undefined) {
            return [];
        }

        for (y = 0; y < numRows; ++y) {
            for (x = 0; x < numCols; ++x) {
                if (coordDirty[y][x]) {
                    coords.push([x, y]);
                }
            }
        }
        return coords;
    },
};
function drawLineArrow(x1,y1,x2,y2,Par){
    var path;
    var slopy,cosy,siny;
    //var Par=10.0;
    var x3,y3;
    slopy=Math.atan2((y1-y2),(x1-x2));
    cosy=Math.cos(slopy);
    siny=Math.sin(slopy);

    path="M"+x1+","+y1+" L"+x2+","+y2;

    x3=(Number(x1)+Number(x2))/2;
    y3=(Number(y1)+Number(y2))/2;


    path +=" M"+x3+","+y3;

    path +=" L"+(Number(x3)+Number(Par*cosy-(Par/2.0*siny)))+","+(Number(y3)+Number(Par*siny+(Par/2.0*cosy)));


    path +=" M"+(Number(x3)+Number(Par*cosy+Par/2.0*siny)+","+ (Number(y3)-Number(Par/2.0*cosy-Par*siny)));
    path +=" L"+x3+","+y3;


    return path;
}