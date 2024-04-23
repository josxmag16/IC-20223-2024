// Definición de la clase Bayes
class Bayes {
  // Constructor de la clase Bayes
  constructor(N) {
      this.N = N; // Número de dimensiones
      this.classes = {}; // Diccionario para almacenar las clases y sus características
  }

  // Método para entrenar el clasificador Bayesiano
  training() {
      // Generar vectores de media y matrices de covarianza para cada clase
      for (let class_name in this.classes) {
          this.classes[class_name].generate_m_vector();
          this.classes[class_name].generate_c_matrix();
      }
  }

  // Método para clasificar un vector de características
  classify(class_vector) {
      let mini = Number.POSITIVE_INFINITY;
      let class_name = "";
      // Iterar sobre las clases conocidas
      for (let c in this.classes) {
          const m_vector = this.classes[c].get_m_vector();
          let diff_vector = math.subtract(math.transpose(class_vector), this.classes[c].get_m_vector());
          const c_matrix = this.classes[c].get_c_matrix();
          // Calcular la distancia de Mahalanobis
          let dm = math.multiply(math.multiply(diff_vector, math.inv(this.classes[c].get_c_matrix())), diff_vector);
          if (dm < mini) {
              mini = dm;
              class_name = c;
          }
      }
      return class_name; // Devolver el nombre de la clase más probable
  }

  // Método para obtener una clase específica
  get_class(class_name) {
      return this.classes[class_name];
  }

  // Método para obtener todas las clases
  get_classes() {
      return this.classes;
  }

  // Método para añadir un vector a una clase existente o crear una nueva clase
  add_x(vector, class_name) {
      if (!(class_name in this.classes)) {
          this.classes[class_name] = new Class(this.N, class_name);
      }
      this.classes[class_name].x_vectors.push(vector);
  }
}

// Definición de la clase Class
class Class {
  // Constructor de la clase Class
  constructor(N, name) {
      this.N = N; // Número de dimensiones
      this.class_name = name; // Nombre de la clase
      this.x_vectors = []; // Vectores de características de la clase
      this.m_vector = Array(N).fill(0); // Vector de media
      this.c_matrix = math.zeros([this.N, this.N]); // Matriz de covarianza
  }

  // Método para obtener el nombre de la clase
  get_class_name() {
      return this.class_name;
  }

  // Método para generar el vector de media
  generate_m_vector() {
      // Calcular la media como el promedio de los vectores de características
      for (let vector of this.x_vectors) {
          this.m_vector = math.add(this.m_vector, vector);
      }
      this.m_vector = math.divide(this.m_vector, this.x_vectors.length);
  }

  // Método para generar la matriz de covarianza
  generate_c_matrix() {
      // Calcular la covarianza como el promedio de los productos externos de los vectores centrados
      for (let vector of this.x_vectors) {
          let diff_vector = [math.subtract(vector, this.m_vector)];
          let mul = [math.multiply(diff_vector, math.transpose(diff_vector))];
          if (mul.length !== this.N || mul[0].length !== this.N) {
              mul = math.multiply(math.transpose(diff_vector), diff_vector);
          }
          this.c_matrix = math.add(this.c_matrix, mul);
      }
      this.c_matrix = math.divide(this.c_matrix, this.x_vectors.length);
  }

  // Método para obtener el vector de media
  get_m_vector() {
      return this.m_vector;
  }

  // Método para obtener la matriz de covarianza
  get_c_matrix() {
      return this.c_matrix;
  }
}
