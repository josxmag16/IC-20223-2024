let currentMode = null;
let messageBox = null;
let scenario = [];
let tableElement = null, rowsElement = null, colsElement = null, mountainHeight = null, planeHeight = null;
let rows = 10, columns = 10, mHeight = 0, pHeight = 0;

let openList = [];
let closedList = [];
let startNode = null;
let endNode = null;
let path = [];
let waypoints = [];
let dangerZones = [];

function onPageLoad() {
    messageBox = document.getElementById('msg');
    mountainHeight = document.getElementById('mountainHeight');
    planeHeight = document.getElementById('planeHeight');
    rowsElement = document.getElementById('rows');
    colsElement = document.getElementById('columns');
    mountainHeight.value = mHeight;
    planeHeight.value = pHeight;
    rowsElement.value = rows;
    colsElement.value = columns;
    tableElement = document.getElementById('table');
    drawTable(rows, columns);
}

function drawTable(r, c) {
    tableElement.innerHTML = "";
    scenario = new Array(r);
    for(let i = 0; i < r; i++) {
        scenario[i] = new Array(c);
        let row = tableElement.insertRow(i);
        for(let j = 0; j < c; j++) {
            let cell = row.insertCell(j);
            cell.id = `${i}-${j}`;
            cell.addEventListener('click', function(){
                cellClick(i, j);
            });
            scenario[i][j] = new Node(i, j);
        }
    }

    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            scenario[i][j].updateAdjacent(scenario);
        }
    }
}

function buttonClick(mode) {
    currentMode = mode;
    switch(currentMode) {
        case 'prohibited': {
            break;
        }
        case 'reset': {
            startNode = endNode = null;
            openList = [];
            closedList = [];
            path = [];
            waypoints = [];
            dangerZones = [];
            drawTable(rows, columns);
            break;
        } case 'start': {
            if(startNode === null || endNode === null) {
                messageBox.innerText = 'Debe definir un punto de inicio y otro de fin.';
                return;
            }
            openList.push(startNode);
            const result = waypoints.length === 0 ? search(endNode) : searchWaypoint();
            if(result.length === 0) {
                messageBox.innerText = 'No se ha encontrado solución.';
                return;
            }
            result.forEach((node) => {
                const cell = getCell(node.x, node.y);
                paint(cell, 'table-info');
            });
            break;
        }
    }
}

function cellClick(x, y) {
    messageBox.innerText = "";
    const cell = getCell(x, y);
    const node = scenario[x][y];
    if(currentMode === 'prohibited') {
        if(node.waypoint) {
            messageBox.innerText = 'No puede poner un punto de referencia aquí.';
            return;
        }
        if(!node.prohibited) {
            node.prohibited = true;
            paint(cell, 'table-danger');
        }
    } else if(currentMode === 'start') {
        if(startNode !== null) {
            messageBox.innerText = 'Ya ha definido el comienzo.';
            return;
        }
        if(node.waypoint) {
            messageBox.innerText = 'No puede poner un punto de referencia al comienzo.';
            return;
        }
        paint(cell, 'table-primary');
        startNode = node;
    } else if(currentMode === 'end') {
        if(endNode !== null) {
            messageBox.innerText = 'Ya ha definido el final.';
            return;
        }
        if(node.waypoint) {
            messageBox.innerText = 'No puede poner un punto de referencia al final.';
            return;
        }
        paint(cell, 'table-success');
        endNode = node;
    } else if(currentMode === 'delete') {
        removeColors(cell);
        if(node.prohibited) node.prohibited = false;
        if(node.waypoint) {
            node.waypoint = false;
            waypoints.splice(waypoints.indexOf(node), 1);
        }
        if(node.dangerZone) node.dangerZone = false;
        if(node.mountain) node.mountain = false;
        if(node === startNode) startNode = null;
        if(node == endNode) endNode = null;
    } else if(currentMode === 'waypoint') {
        if(startNode !== null && startNode == node || endNode !== null && endNode == node || node.prohibited || node.dangerZone || node.mountain) {
            messageBox.innerText = 'No puede poner un punto de referencia aquí.';
            return;
        }
        if(!node.waypoint) {
            node.waypoint = true;
            paint(cell, 'table-warning');
            waypoints.push(node);
        }
    } else if(currentMode === 'danger') {
        if(node.waypoint) {
            messageBox.innerText = 'No puede poner un punto de referencia aquí.';
            return;
        }
        paint(cell, 'table-dark');
        node.dangerZone = true;
        dangerZones.push(node);
    } else if(currentMode === 'mountain') {
        if(node.waypoint) {
            messageBox.innerText = 'No puede poner un punto de referencia aquí.';
            return;
        }
        if(pHeight === 0 || mHeight === 0) {
            messageBox.innerText = 'Debe definir la altura de la montaña y del plano.';
            return;
        }
        paint(cell, 'table-secondary');
        node.mountain = true;
    }
}

function paint(cell, color) {
    removeColors(cell);
    cell.classList.add(color);
}

function removeColors(cell) {
    cell.classList.remove('table-danger');
    cell.classList.remove('table-primary');
    cell.classList.remove('table-success');
    cell.classList.remove('table-dark');
    cell.classList.remove('table-warning');
    cell.classList.remove('table-secondary');
}

function getCell(x, y) {
    return document.getElementById(`${x}-${y}`);
}

function rowsColsChange() {
    rows = rowsElement.value;
    columns = colsElement.value;
    if(rows > 50) {
        rows = 50;
        rowsElement.value = 50;
    } 
    if(columns > 50) {
        columns = 50;
        colsElement.value = 50;
    }
    if(rows > 0 && columns > 0)
        drawTable(rows, columns);
}

function heightChange(){
    mHeight = mountainHeight.value;
    pHeight = planeHeight.value;
}

function heuristic(position0, position1) {
    let d1 = Math.abs(position1.x - position0.x);
    let d2 = Math.abs(position1.y - position0.y);
    return d1 + d2;
}

function search(end) {
    while (openList.length > 0) {
        let lowestIndex = 0;
        for (let i = 0; i < openList.length; i++) {
            if (openList[i].f < openList[lowestIndex].f) {
                lowestIndex = i;
            }
        }
        let current = openList[lowestIndex];
        if (current === end) {
            let temp = current;
            path.push(temp);
            while (temp.parent) {
                path.push(temp.parent);
                temp = temp.parent;
            }
            return path.reverse();
        }

        openList.splice(lowestIndex, 1);
        closedList.push(current);

        let neighbors = current.adjacent;

        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];
            if(neighbor.prohibited) continue;
            if(mHeight !== 0 && pHeight !== 0 && neighbor.mountain && pHeight <= mHeight) continue;
            if (!closedList.includes(neighbor)) {
                let possibleG = current.g + 1;

                if (!openList.includes(neighbor)) {
                    openList.push(neighbor);
                } else if (possibleG >= neighbor.g) {
                    continue;
                }

                neighbor.g = possibleG;
                neighbor.h = heuristic(neighbor, end);
                if(neighbor.dangerZone) neighbor.h += 1.1;
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
            }
        }
    }

    return [];
}

function searchWaypoint() {
    let sol = [];
    waypoints.push(endNode);
    let nextWaypoint = findNextWaypoint(startNode);
    waypoints.splice(waypoints.indexOf(nextWaypoint), 1);
    let aux = search(nextWaypoint);
    if(aux.length === 0)
        return [];
    sol = aux;

    let current = null;
    while(waypoints.length > 0) {
        current = nextWaypoint;
        current.reset();
        nextWaypoint = findNextWaypoint(current);
        nextWaypoint.reset();
        waypoints.splice(waypoints.indexOf(nextWaypoint), 1);
        openList = [current];
        closedList = [];
        path = [];
        aux = search(nextWaypoint);

        if(aux.length !== 0) {
            aux.splice(0, 1);
            sol = sol.concat(aux);
        } else {
            return [];
        }
    }
    return sol;
}

function findNextWaypoint(start) {
    if(waypoints.length > 0) {
        let minDistance = heuristic(waypoints[0], start);
        let minIndex = 0;
        for(let i = 0; i < waypoints.length; i++) {
            if(minDistance > heuristic(waypoints[i], start) && waypoints[i] !== endNode) {
                minDistance = heuristic(waypoints[i], start);
                minIndex = i;
            }
        }
        return waypoints[minIndex];
    }
    return null;
}

function Node(x, y) {
    this.x = x;
    this.y = y;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.adjacent = [];
    this.parent = undefined;
    this.prohibited = false;
    this.waypoint = false;
    this.dangerZone = false;
    this.mountain = false;

    this.updateAdjacent = function (grid) {
        let i = this.x;
        let j = this.y;
        if (i < columns - 1) {
            this.adjacent.push(grid[i + 1][j]);
        }
        if (i > 0) {
            this.adjacent.push(grid[i - 1][j]);
        }
        if (j < rows - 1) {
            this.adjacent.push(grid[i][j + 1]);
        }
        if (j > 0) {
            this.adjacent.push(grid[i][j - 1]);
        }

        if (i > 0 && j > 0) {
            this.adjacent.push(grid[i - 1][j - 1]);
        }
        if (i > 0 && j < columns - 1) {
            this.adjacent.push(grid[i - 1][j + 1]);
        }
        if (i < rows - 1 && j > 0) {
            this.adjacent.push(grid[i + 1][j - 1]);
        }
        if (i < rows - 1 && j < columns - 1) {
            this.adjacent.push(grid[i + 1][j + 1]);
        }
    };

    this.reset = function() {
        this.g = 0;
        this.h = 0;
        this.parent = undefined;
    }
}
