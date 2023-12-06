# Hono Deno REST API Template

A template of REST API app using [Hono](https://hono.dev/) framework

```
deno run --allow-net main.ts
```

This starts the server at http://localhost:8000/

Try go to http://localhost:8000/api/Brachiosaurus or http://localhost:8000/api/


<!-- APP BOTS LIVING IN WORLD -->
**APLICACIÓN: BOTS VIVIENDO EN UN MUNDO**

- **Desarrollo de la Historia:**
  Con el paso de los años, los bots han avanzado en su capacidad para trabajar y comerciar. Se han enfrentado a desafíos ambientales y han logrado adaptarse, desarrollando nuevas formas de obtener recursos. La sociedad bot ha experimentado cambios sociales, desde la introducción de estructuras familiares más complejas hasta el surgimiento de líderes destacados en la comunidad bot. Cada generación hereda no solo los recursos, sino también las decisiones y legados de sus predecesores, dando forma a un mundo en constante evolución.

El sistema ofrece las siguientes capacidades:

- **Definir Tiempo de Vida:**
  Permite establecer la duración máxima de vida para los bots en términos de segundos, donde 1 segundo equivale a 1 hora de vida en el mundo ficticio.

- **Establecer Cantidad Inicial de Bots:**
  Permite especificar la cantidad inicial de "humanos" (bots) que habitarán el mundo desde el inicio.

- **Bots que Realizan Compras y Viven:**
  Los bots son capaces de realizar compras y llevan a cabo las actividades básicas para su supervivencia en el entorno definido.

- **Definir Mundo de Dinero Inicial:**
  Permite asignar una cantidad inicial de dinero en el mundo, un recurso esencial para la subsistencia de los bots.

- **Rastrear Legados o Padres de los Bots:**
  Proporciona la capacidad de identificar las relaciones familiares, permitiendo conocer quiénes son los padres de cada bot.

Cada bot humano debe realizar las siguientes acciones:

- **Trabajar:**
  Los bots tienen la capacidad de trabajar para ganar dinero, esencial para su supervivencia y bienestar.

- **Comer:**
  Los bots necesitan alimentarse para mantener sus puntos de salud. Se requiere dinero y productos para poder comer.

- **Dormir:**
  La acción de dormir es crucial para el bienestar de los bots. La falta de sueño puede afectar la productividad y la remuneración por el trabajo.

- **Aparearse (si es mayor de edad):**
  Los bots adultos tienen la posibilidad de reproducirse, pero este proceso conlleva un costo.

- **Tiempo de Vida Máximo:**
  Cada bot tiene un límite de tiempo de vida, determinado en segundos, que define su existencia en el mundo.

- **Calidad de Esfuerzo Según Edad:**
  La calidad del trabajo realizado por un bot puede variar según su edad.

- **Puntos de Salud:**
  Los bots poseen puntos de salud que son vitales para su supervivencia. Perder todos los puntos de salud resulta en la muerte del bot.

El tiempo en el mundo ficticio se mide en segundos, donde 1 segundo equivale a 1 hora y 24 segundos equivalen a 1 día.

**Reglas:**

- No es posible comer sin tener dinero.
- No se puede comer sin disponer de productos.
- No se puede obtener dinero si no se trabaja.
- Aparearse tiene un costo asociado.
- La prioridad es mantener la vida del bot.
- La pérdida de todos los puntos de salud lleva a la muerte del bot.
- Es necesario comer 3 veces al día; la falta de una comida resulta en la pérdida de un punto de vida.

**Condiciones:**

- Los bots tienen la capacidad de trabajar durante todo el día.
- La falta de sueño durante 8 horas afecta la productividad y la remuneración.
- Los bots pueden aparearse tantas veces como deseen.


- **Progresión del Tiempo:**
  En el mundo ficticio, el tiempo avanza de manera continua, reflejando el paso de las horas y los días. Además de la medición estándar donde 1 segundo equivale a 1 hora, se podría considerar la implementación de eventos especiales o cambios estacionales que afecten a los bots. Por ejemplo, períodos de abundancia o escasez de recursos, eventos climáticos que influyan en la salud de los bots, o el desarrollo de nuevas tecnologías a lo largo del tiempo.

