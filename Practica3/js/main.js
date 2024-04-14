let nombreAtribElem, nombreJuegoElem;
let nombreAtrib, nombreJuego;
let tablaElem, divTablaElem;
let errorMsgElem;
let datos = {}, ejemplo = {};
let resultado;
let sol = [];
const centrosIniciales = [[4.6, 3.0, 4.0, 0.0], [6.8, 3.4, 4.6, 0.7]];
function onPageLoad() {
    nombreAtribElem = document.getElementById("nomAtrib");
    nombreJuegoElem = document.getElementById("nomJuego");
    tablaElem = document.getElementById("table");
    errorMsgElem = document.getElementById('msg');
    divTablaElem = document.getElementById('results');
    nombreAtribElem.addEventListener('change', (event) => {
        datos = {};
        readTextFile(event);
    });
    nombreJuegoElem.addEventListener('change', (event) => {
        ejemplo = {};
        readTextFile(event, 1);
    });
    
}

function readTextFile(event, type = 0)//type 0 lee atributos, type 1 lee propiedades
{
    const fileList = event.target.files;
    if (fileList.length > 0) {
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            const result = event.target.result;
            errorMsgElem.innerText = "";
            if (type === 0) {
                let result2 = result.replace(/(?:\r|\r|)/g, '');
                let rows = result2.split('\n');
                rows.forEach(e => {
                    const row = e.split(",");
                    const v = [parseFloat(row[0]), parseFloat(row[1]), parseFloat(row[2]), parseFloat(row[3])];
                    if (!datos[row[4]]) datos[row[4]] = [];
                    datos[row[4]].push(v);
                });
                console.log(datos);
            } else {
                if (Object.keys(datos).length === 0) {
                    nombreJuegoElem.value = "";
                    errorMsgElem.innerText = 'Debes seleccionar primero el fichero de clases';
                    return;
                }
                const row = result.split(",");
                ejemplo[row[4]] = [parseFloat(row[0]), parseFloat(row[1]), parseFloat(row[2]), parseFloat(row[3])];
                console.log(ejemplo);
            }
        })
        reader.readAsText(fileList[0]);
    }
}

function buttonClick(mode) {
    divTablaElem.innerHTML = '';
    divTablaElem.classList.add('hide');
    if (mode === 'kmedias') {
        let arr = []
        Object.keys(datos).forEach(k => arr = arr.concat(datos[k]));
        exec_kmedias(arr, centrosIniciales, algorismos.kmedias.pesoExponencial, algorismos.kmedias.tolerancia, 2);
    } else if (mode === 'bayes') {
        exec_bayes();
    } else if (mode === 'lloyd') {
        exec_lloyd();
    }
}

function exec_kmedias(x, v, b, epsilon, clases) {
    const k = new KMeans(math.transpose(x), v, b, epsilon, clases);
    divTablaElem.innerHTML += `<h1>Tolerancia: ${epsilon}</h1>`;
    const result = k.calculate(divTablaElem);
    console.log(result);

    const testName = Object.keys(ejemplo)[0];

    divTablaElem.innerHTML += `<h5>Clasificación Kmedias:</h5>`;
    divTablaElem.innerHTML += `<h5>[${ejemplo[testName]}] (${testName}) clasificado como clase: ${k.classify(result, ejemplo[testName])}</h5>`;

    divTablaElem.classList.remove('hide');
}

function exec_bayes() {
    const b = new Bayes(4);
    Object.keys(datos).forEach(k => {
        datos[k].forEach(arr => b.add_x(arr, k));
    });
    console.log("Carga finalizada Bayes.");
    b.training();
    for(let c in b.get_classes()) {
        console.log("Clase", c);
        divTablaElem.innerHTML += `<h1>${c}</h1>`
        divTablaElem.innerHTML += `<h5>Vector - M:</h5>`
        divTablaElem.innerHTML += `<table class="table table-bordered table-striped table-dark table-sm mb-3" id="tabla-${c}-1"></table>`;
        divTablaElem.innerHTML += `<h5>Matriz - C:</h5>`
        divTablaElem.innerHTML += `<table class="table table-bordered table-striped table-dark table-sm mb-3" id="tabla-${c}-2"></table>`;
        generateTable(document.getElementById(`tabla-${c}-1`), [b.get_class(c).get_m_vector()])
        generateTable(document.getElementById(`tabla-${c}-2`), b.get_class(c).get_c_matrix())
        console.log("M: ", b.get_class(c).get_m_vector());
        console.log("C: ", b.get_class(c).get_c_matrix());
        console.log("---------------------------------");
    }
    divTablaElem.classList.remove('hide');
    const testName = Object.keys(ejemplo)[0];

    console.log("\n>>> Clasificación Bayes \n");
    console.log("Test 1:");
    console.log(ejemplo[testName], " clasificado como clase ", b.classify(ejemplo[testName]));

    divTablaElem.innerHTML += `<h5>Clasificación Bayes:</h5>`;
    divTablaElem.innerHTML += `<h5>[${ejemplo[testName]}] clasificado como clase: ${b.classify(ejemplo[testName])}</h5>`;
}

function exec_lloyd() {
    let arr = [];
    Object.keys(datos).forEach(k => arr = arr.concat(datos[k]));

    const l = new Lloyd(arr, centrosIniciales, algorismos.lloyd.tolerancia, algorismos.lloyd.maxIteraciones, algorismos.lloyd.razonAprendizaje);
    const result = l.calculate(divTablaElem);
    console.log("result lloyd", result);
    const testName = Object.keys(ejemplo)[0];
    divTablaElem.innerHTML += `<h5>Clasificación LLoyd:</h5>`;
    divTablaElem.innerHTML += `<h5>[${ejemplo[testName]}] (${testName}) clasificado como clase: ${l.classify(result, ejemplo[testName])}</h5>`;
    divTablaElem.classList.remove('hide');
}


function generateTable(table, data) {
    for (let vector of data) {
        let row = table.insertRow();
        for (num of vector) {
            let cell = row.insertCell();
            let text = document.createTextNode(num);
            cell.appendChild(text);
        }
    }
}

function generateTable2(table, data) {
    let row = table.insertRow();
    for (num of data) {
        let cell = row.insertCell();
        let text = document.createTextNode(num);
        cell.appendChild(text);
    }
}