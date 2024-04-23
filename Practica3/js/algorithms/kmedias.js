// Definición de la clase KMeans
class KMeans {
  // Constructor de la clase KMeans
  constructor(x, v, b, epsilon, clases) {
      this.x = x;  // Datos de entrada
      this.v = v;  // Centros iniciales
      this.n = math.transpose(x).length;  // Número de atributos
      this.c = clases;  // Número de clases
      this.b = b;  // Parámetro de la función de pertenencia
      this.epsilon = epsilon;  // Tolerancia de convergencia
  }

  // Método para calcular la distancia euclidiana entre dos puntos
  _d(i, j) {
      let sum = 0;
      for (let k = 0; k < this.x.length; k++) {
          sum += Math.pow(this.x[k][j] - this.v[i][k], 2);
      }
      return sum;
  }

  // Método para calcular la función de pertenencia
  _p(i, j) {
      const exp = 1 / (this.b - 1);

      const d = this._d(i, j);
      if (d === 0.0) {
          return 1.0;
      }

      let num = math.pow(1 / d, exp);
      let den = 0;
      for (let r = 0; r < this.c; r++) {
          den += math.pow(1 / this._d(r, j), exp);
      }
      return num / den;
  }

  // Método para realizar el algoritmo K-Means
  calculate(drawer) {
      console.log("==========");
      let cont = 0;
      while (true) {
          let u = math.zeros([this.c, this.n]);  // Matriz de pertenencia
          let new_v = math.zeros([this.v.length, this.v[0].length]);  // Nuevos centros

          // Calcular la matriz de pertenencia y los nuevos centros
          for (let i = 0; i < this.c; i++) {
              let num = math.zeros([this.x.length]);
              let den = 0;
              for (let j = 0; j < this.n; j++) {
                  let p = this._p(i, j);
                  u[i][j] = p;
                  let aux = math.pow(p, this.b);
                  for(let k = 0; k < num.length; k++) {
                      num[k] += aux * this.x[k][j];
                  }
                  den += aux;
              }
              for(let k = 0; k < new_v[0].length; k++) {
                  new_v[i][k] = num[k] / den;
              }
          }

          // Calcular la máxima diferencia entre los centros antiguos y los nuevos
          let max_delta = 0.0;
          for (let i = 0; i < this.c; i++) {
              let sum = 0;
              for (let k = 0; k < this.v[i].length; k++) {
                  sum += Math.pow(this.v[i][k] - new_v[i][k], 2);
              }
              let delta = Math.sqrt(sum);
              console.log("delta", delta);
              max_delta = Math.max(max_delta, delta)
          }

          // Mostrar resultados en el drawer (elemento del DOM)
          drawer.innerHTML += `<h1>Centros</h1>`;
          drawer.innerHTML += `<table class="table table-bordered table-striped table-dark table-sm mb-3" id="tabla-centros-${cont}"></table>`;
          generateTable(document.getElementById(`tabla-centros-${cont}`), this.v);

          drawer.innerHTML += `<h1>Nuevos centros</h1>`;
          drawer.innerHTML += `<table class="table table-bordered table-striped table-dark table-sm mb-3" id="tabla-new_centros-${cont}"></table>`;
          generateTable(document.getElementById(`tabla-new_centros-${cont}`), new_v);

          drawer.innerHTML += `<h1>Matriz de pertenencia</h1>`;
          drawer.innerHTML += `<div class="table-responsive"><table class="table table-bordered table-striped table-dark table-sm mb-3" id="tabla-matrix-${cont}"></table></div>`;
          generateTable(document.getElementById(`tabla-matrix-${cont}`), u);

          drawer.innerHTML += `<h1>Delta: ${max_delta} ${(max_delta < this.epsilon ? '<' : '>')} ${this.epsilon}</h1>`;
          console.log(`centros:\n${this.v}\n`
                      + `nuevos centros:\n${new_v}\n`
                      + `matriz de pertenencia:\n${u}\n`
                      + `delta:\n${max_delta}\n`
                      + `${"-".repeat(10)}`);

          drawer.innerHTML += `<h1>________________________________________</h1>`;
          cont++;
          this.v = new_v;
          if (max_delta <= this.epsilon) {
              return this.v;
          }
      }
  }

  // Método para clasificar un ejemplo basado en los centros calculados
  classify(centres, example) {
      let distances = [];
      for (let i = 0; i < centres.length; i++) {
          let dist = 0;
          for (let j = 0; j < example.length; j++) {
              dist += (example[j] - centres[i][j]) ** 2;
          }
          distances.push(dist);
      }
      return distances.indexOf(Math.min(...distances));
  }
}
