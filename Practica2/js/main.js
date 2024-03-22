// Declaración de variables globales
let nombreAtribElem, nombreJuegoElem; // Elementos de entrada para nombres de atributos y juegos
let nombreAtrib, nombreJuego; // Nombres de atributos y juegos
let divTablaElem, tablaElem, divArbolElem; // Elementos div para la tabla y el árbol
let errorMsgElem; // Elemento para mostrar mensajes de error
let atributos = []; // Array para almacenar atributos
let juego = [], juego_copia = []; // Arrays para almacenar juegos y una copia inmutable del juego
let resultado; // Variable para almacenar el resultado final
let sol = []; // Array para almacenar la solución (atributos mínimos del árbol)
const treeConfig = { // Configuración del árbol
    container: "#tree-simple",
    connectors: {
        type: "straight"
    }
};
let treeChart = [treeConfig]; // Array para almacenar la estructura del árbol
let hojasSueltas = [], ultimoMinKey; // Variables para el manejo del árbol

// Función que se ejecuta al cargar la página
function onPageLoad() {
    // Asignación de elementos del DOM a variables
    nombreAtribElem = document.getElementById("nomAtrib");
    nombreJuegoElem = document.getElementById("nomJuego");
    divTablaElem = document.getElementById("divTabla");
    divArbolElem = document.getElementById("tree-simple");
    errorMsgElem = document.getElementById('msg');
    // Asignación de eventos de cambio a los elementos de entrada de nombres de atributos y juegos
    nombreAtribElem.addEventListener('change', (event)=> {
        atributos = [];
        readTextFile(event, atributos);
    });
    nombreJuegoElem.addEventListener('change', (event)=> {
        juego = [];
        juego_copia = [];
        readTextFile(event, juego, 1);
    });
}

// Función para leer un archivo de texto seleccionado por el usuario
function readTextFile(event, dataObj, type = 0) {
    // Obtención de la lista de archivos seleccionados
    const fileList = event.target.files;
    if(fileList.length > 0){
         const reader = new FileReader(); // Creación de un objeto FileReader
         // Evento que se ejecuta al cargar el contenido del archivo
         reader.addEventListener('load', (event) => {
                const result = event.target.result;
                errorMsgElem.innerText = "";
                // Procesamiento del resultado según el tipo especificado
                if(type === 0) {
                    // Lectura de atributos
                    atributos = result.split(",");
                    // Eliminación de saltos de línea en los atributos
                    atributos.forEach((e, i) => atributos[i] = e.replace(/(?:\r\n|\r|\n)/g, ''));
                    console.log(atributos);
                } else {
                    // Lectura de juegos
                    if(atributos.length === 0) {
                        nombreJuegoElem.value = "";
                        errorMsgElem.innerText = 'Debes seleccionar primero el fichero de atributos';
                        return;
                    }
                    let result2 = result.replace(/(?:\r|\r|)/g, '');
                    let rows = result2.split('\n');
                    rows = rows.filter((str) => str !== '');
                    rows.forEach((e, i) => {
                        const row = e.split(",");
                        const obj = {};
                        // Creación de objetos de juego con atributos
                        atributos.forEach((a, i) => obj[a] = row[i]);
                        dataObj.push(obj);
                        // Creación de una copia del juego original
                        juego_copia.push({...obj});
                    });
                    console.log(juego);
                }
         })
         // Lectura del archivo como texto
         reader.readAsText(fileList[0]);
    }
}

// Función que se ejecuta al hacer clic en un botón
function buttonClick(mode) {
    if(mode === 'iniciar') {
        iniciar();
    }
}

// Función para inicializar el proceso de construcción del árbol
function iniciar() {
    if(atributos.length === 0 || juego.length === 0) {
        errorMsgElem.innerText = 'Debes seleccionar los ficheros de atributos y de juego.';
        return;
    }
    // Limpiar elementos del DOM
    divTablaElem.innerHTML = '';
    divArbolElem.innerHTML = '';
    resultado = atributos[atributos.length - 1];
    treeChart = [treeConfig]; // Reiniciar la estructura del árbol
    sol = [];
    id3(0); // Iniciar el algoritmo ID3 para construir el árbol
}

// Función para calcular la entropía
function entropia(x) {
    if (x === 0) {
        return 0
    }
    return -x * Math.log2(x)
}

// Función principal del algoritmo ID3 para construir el árbol de decisión
function id3(numLlamadas) {
    // Obtener el número de atributos y filas del juego
    let cols = atributos.length;
    let rows = juego.length;

    if(cols === 2) return // Condición de salida

    let merito = {};
    let numeroAtrs = {};
    let si = {};
    let no = {};

    // Calcular el mérito de cada atributo
    for(let atr of atributos) {
        if(atr === resultado) continue;
        numeroAtrs[atr] = {};
        si[atr] = {};
        no[atr] = {};
        for(let row = 0; row < rows; row++) {
            let valor = juego[row][atr];
            if(numeroAtrs[atr][valor]) numeroAtrs[atr][valor] += 1;
            else numeroAtrs[atr][valor] = 1;

            if(juego[row][resultado] === 'no') {
                if(no[atr][valor]) no[atr][valor] += 1;
                else no[atr][valor] = 1;
            } else if(juego[row][resultado] === 'si') {
                if(si[atr][valor]) si[atr][valor] += 1;
                else si[atr][valor] = 1;
            }

            if(!si[atr][valor]) si[atr][valor] = 0;
            if(!no[atr][valor]) no[atr][valor] = 0;
        }

        merito[atr] = 0;
        for(let key in numeroAtrs[atr]) {
            merito[atr] += numeroAtrs[atr][key] / rows * (entropia(si[atr][key] / (si[atr][key] + no[atr][key]))
                + entropia(no[atr][key] / (si[atr][key] + no[atr][key])));
        }
    }
    //se saca el menor merito
    let minimo = Object.values(merito)[0];
    let min_key = Object.keys(merito)[0];
    for(let value in merito) {
        if(merito[value] < minimo) {
            min_key = value;
            minimo = merito[value];
        }
    }
    sol.push(min_key);

    //construir hoja arbol Movi, movi all the people movi
    if(treeChart.length === 1) {
        let hoja = {
            text: {
                name: min_key,
            }
        };
        treeChart.push(hoja);
        let nombreHijos = Object.keys(numeroAtrs[min_key]);//array de hijos (string)
        nombreHijos.forEach((n) => treeChart.push({ parent: hoja, text: { name: n } }));
        treeChart.forEach((node, i) => {
            if(node.parent === hoja) {
                if(numeroAtrs[min_key][node.text.name] === si[min_key][node.text.name]) {
                    treeChart.push({ parent: node,  text: { name: "si" }, fin: true });
                    nombreHijos.splice(nombreHijos.findIndex(n => n == node.text.name), 1);
                } else if(numeroAtrs[min_key][node.text.name] === no[min_key][node.text.name]) {
                    treeChart.push({ parent: node,  text: { name: "no" }, fin: true });
                    nombreHijos.splice(nombreHijos.findIndex(n => n === node.text.name), 1);
                }
            }
        })
        hojasSueltas = nombreHijos;
        ultimoMinKey = min_key;
    } else {
        let hijoSi = {}, hijoNo = {}, total = {};
        let nombreHijos = Object.keys(numeroAtrs[min_key]);
        for(let hoja of hojasSueltas) {
            if(!hijoSi[hoja]) hijoSi[hoja] = {};
            if(!hijoNo[hoja]) hijoNo[hoja] = {};
            if(!total[hoja]) total[hoja] = {};
            for(hijo of nombreHijos) {
                if(!hijoSi[hoja][hijo]) hijoSi[hoja][hijo] = 0;
                if(!hijoNo[hoja][hijo]) hijoNo[hoja][hijo] = 0;
                if(!total[hoja][hijo]) total[hoja][hijo] = 0;
                for(obj of juego_copia) {
                    if(obj[ultimoMinKey] === hoja && obj[min_key] === hijo){
                        if(obj[resultado] == 'si') hijoSi[hoja][hijo]++;
                        else if(obj[resultado] == 'no') hijoNo[hoja][hijo]++;
                        total[hoja][hijo]++;
                    }
                }
            }
        }

        let hojaElegida, coincidencias = 0, hojaCoincidencias;
        for(let hoja of hojasSueltas) {
            for(hijo of nombreHijos) {
                if(total[hoja][hijo] === hijoSi[hoja][hijo] || total[hoja][hijo] === hijoNo[hoja][hijo]){
                    hojaCoincidencias = hoja;
                    coincidencias++;//hojaElegida es el padre.
                }
            }
        }
        if(coincidencias === nombreHijos.length) hojaElegida = hojaCoincidencias;
        hojasSueltas.splice(hojasSueltas.findIndex(n => n === hojaElegida), 1);
        let hoja2 = { text: { name: min_key }, parent: treeChart.find(n => n.text && n.text.name && n.text.name === hojaElegida) }
        treeChart.push(hoja2);
        nombreHijos.forEach((n) => treeChart.push({ parent: hoja2, text: { name: n } }));
        
        treeChart.forEach((node, i) => {
            if(node.parent === hoja2) {
                if(total[hojaElegida][node.text.name] === hijoSi[hojaElegida][node.text.name]) {
                    treeChart.push({ parent: node,  text: { name: "si" }, fin: true });
                    nombreHijos.splice(nombreHijos.findIndex(n => n == node.text.name), 1);
                } else if(total[hojaElegida][node.text.name] === hijoNo[hojaElegida][node.text.name]) {
                    treeChart.push({ parent: node,  text: { name: "no" }, fin: true });
                    nombreHijos.splice(nombreHijos.findIndex(n => n === node.text.name), 1);
                }
            }
        });
        hojasSueltas.concat(nombreHijos);
    }
    //pintar tablas
    pintarTablas(merito, numeroAtrs, si, no, min_key, minimo, numLlamadas);

    //se elimina el atributo con menor merito.
    atributos = atributos.filter(value => {
        return value != min_key
    })
    for(let row = 0; row < rows; row++) {
        delete juego[row][min_key];
    }

    id3(numLlamadas + 1);
}

function pintarTablas(merito, numeroAtrs, si, no, min_key, minimo, numLlamadas) {
    divTablaElem.innerHTML += `<table class="table table-bordered table-striped table-dark table-sm mb-3" id="tabla-${numLlamadas}"></table>`;
    tablaElem = document.getElementById(`tabla-${numLlamadas}`);
    generateTableHead(tablaElem, atributos);
    generateTable(tablaElem, juego);
    let htmlCode = '';
    for(let atr of atributos) {
        if(atr === resultado) continue;
        htmlCode += `<table class="table table-bordered table-dark table-sm"><thead align="center"><tr>`;
        htmlCode += `<th scope="col" colspan="${Object.keys(numeroAtrs[atr]).length}">${atr}</th></tr></thead>`;
        htmlCode += `<tbody align="center"><tr>`;
        for(let val in numeroAtrs[atr]) {
            htmlCode += '<td><i>' + val + " = " + numeroAtrs[atr][val] + '</i></td>'
        }
        htmlCode += `</tr><tr>`;

        let j = 1
        for(let val in si[atr]) {
            htmlCode += '<td>p' + j + " = " + si[atr][val] + "/" + numeroAtrs[atr][val] + '</td>'
            j += 1
        }
        htmlCode += `</tr><tr>`;

        j = 1
        for(let val in no[atr]) {
            htmlCode += '<td>n' + j + " = " + no[atr][val] + "/" + numeroAtrs[atr][val] + '</td>'
            j += 1
        }
        htmlCode += '</tr>'
        htmlCode += '</tbody></table>'
    }

        htmlCode += '<h2>Méritos</h2>'
        let N = 0
        for(let atr of atributos) {
            if(atr === resultado) continue;
            for(let val in numeroAtrs[atr]) {
                N += numeroAtrs[atr][val]
            }
            htmlCode += '<p>Mérito(' + atr + ') = '
            for(let val in numeroAtrs[atr]) {
                if(Object.keys(numeroAtrs[atr])[Object.keys(numeroAtrs[atr]).length - 1] != val) {
                    htmlCode += numeroAtrs[atr][val] + "/" + N + ' infor (' + si[atr][val] + '/' + numeroAtrs[atr][val] + ', ' + no[atr][val] + '/' + numeroAtrs[atr][val] + ') + '
                }
                else {
                    htmlCode += numeroAtrs[atr][val] + "/" + N + ' infor (' + si[atr][val] + '/' + numeroAtrs[atr][val] + ', ' + no[atr][val] + '/' + numeroAtrs[atr][val] + ') = '
                }
            }
            htmlCode += merito[atr].toFixed(2)
            htmlCode += '</p>'
        }
        htmlCode += '<br><h5 align="center"><i>Escogemos ' + min_key + ' porque tiene el menor mérito (' + minimo.toFixed(2) + ')</i></h5>'
        htmlCode += '<br>'
        htmlCode += '<hr style="height:2px;border-width:0;color:black;background-color:black">'
        htmlCode += '<br>'

        if(atributos.length === 3) {
            htmlCode += '<br><h5 align="center"><i>Los atributos mínimos del árbol: ' + sol + '</i></h5>';
            generarArbol();
        }
    divTablaElem.innerHTML += htmlCode;
}

function generarArbol() {

    let my_chart = new Treant(treeChart);
}
function generateTableHead(table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
      let th = document.createElement("th");
      let text = document.createTextNode(key);
      th.appendChild(text);
      row.appendChild(th);
    }
  }
  
function generateTable(table, data) {
    for (let element of data) {
        let row = table.insertRow();
        for (key in element) {
            let cell = row.insertCell();
            let text = document.createTextNode(element[key]);
            cell.appendChild(text);
        }
    }
}