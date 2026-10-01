// ==========================================================
// Qué se puede editar del inicio desde el panel (Admin → Inicio)
// y el valor original de cada cosa.
//
// Este esquema arma solo el formulario del panel, limpia lo que
// se guarda y completa lo que falta. Para sumar un campo nuevo
// alcanza con agregarlo acá y usarlo en views/inicio.ejs.
//
// Tipos: texto (una línea) · lineas (varios renglones) · parrafo
//        numero · link · imagen · opciones · lista (fija o variable)
// En los textos, *palabra* se muestra en cursiva.
// ==========================================================

const IMG = (nombre) => `/img/inicio/${nombre}`;

const FONDOS = { claro: "Crema", medio: "Arena", oscuro: "Oscuro" };

const texto = (etiqueta, defecto, max = 80, extra = {}) => ({ tipo: "texto", etiqueta, defecto, max, ...extra });
const parrafo = (etiqueta, defecto, max = 300, extra = {}) => ({ tipo: "parrafo", etiqueta, defecto, max, ...extra });
const link = (etiqueta, defecto, extra = {}) => ({ tipo: "link", etiqueta, defecto, max: 255, ancho: "medio", ...extra });
const imagen = (etiqueta, defecto, extra = {}) => ({ tipo: "imagen", etiqueta, defecto, ...extra });
const etiquetaSeccion = (defecto) => texto("Texto chico de arriba", defecto, 40);
const tituloSeccion = (defecto) =>
  texto("Título", defecto, 70, { ayuda: "Poné *entre asteriscos* la parte que va en cursiva." });

const SECCIONES = {
  portada: {
    titulo: "Portada",
    descripcion: "Lo primero que se ve al entrar: título, botones y las fotos grandes.",
    siempreVisible: true,
    campos: {
      etiqueta: texto("Texto chico de arriba", "Colección otoño · invierno", 70),
      titulo: {
        tipo: "lineas",
        etiqueta: "Título grande",
        defecto: "Detalles que\n*se lucen*,\nprendas que\nse quedan.",
        max: 90,
        maxLineas: 4,
        ayuda: "Cada renglón aparece con una animación. *Entre asteriscos* va en cursiva.",
      },
      bajada: parrafo(
        "Texto debajo del título",
        "Remeras con bordado de perlas, abrigos que abrazan y básicos pensados para combinar. Moda que acompaña tu día, de la mañana a la noche.",
        260
      ),
      botonTexto: texto("Botón principal", "Ver la colección", 30, { ancho: "medio" }),
      botonLink: link("Link del botón principal", "/catalogo"),
      secundarioTexto: texto("Link secundario", "Conocé Matilda", 30, { ancho: "medio" }),
      secundarioLink: link("A dónde lleva", "#esencia"),
      imagen: imagen("Foto principal", IMG("tapado-camel.webp"), {
        ayuda: "Queda mejor una foto cuadrada o vertical, con la prenda al centro.",
        fondo: "medio",
      }),
      sello: texto("Texto del sello que gira", "MATILDA ✦ BOUTIQUE ✦ NUEVA TEMPORADA ✦", 50),
      miniImagen: imagen("Foto de la tarjetita", IMG("remeras-paris.webp"), { ancho: "medio" }),
      miniTexto: {
        tipo: "lineas",
        etiqueta: "Texto de la tarjetita",
        defecto: "Paris\n*en perlas*",
        max: 40,
        maxLineas: 2,
        ancho: "medio",
      },
    },
  },

  cinta: {
    titulo: "Cinta en movimiento",
    descripcion: "La franja oscura con palabras que se desplazan.",
    campos: {
      palabras: {
        tipo: "lineas",
        etiqueta: "Palabras",
        defecto: "Nueva temporada\n*Bordado de perlas*\nAlgodón premium\n*Abrigos de paño*\nEdición limitada\n*Hecho para combinar*",
        max: 240,
        maxLineas: 10,
        ayuda: "Una por renglón. *Entre asteriscos* va en cursiva.",
      },
    },
  },

  esencia: {
    titulo: "Nuestra esencia",
    descripcion: "El texto grande con fotitos y las cifras.",
    campos: {
      etiqueta: etiquetaSeccion("Nuestra esencia"),
      texto: parrafo(
        "Texto",
        "Creemos que vestirse bien [foto1] no es seguir una moda: es elegir prendas que te hagan sentir *vos* [foto2]. Por eso cuidamos cada tela, cada costura y cada perla, y te acompañamos desde la primera consulta.",
        420,
        { ayuda: "Escribí [foto1] y [foto2] donde quieras que aparezcan las fotitos redondas." }
      ),
      foto1: imagen("[foto1]", IMG("remeras-paris.webp"), { ancho: "medio" }),
      foto2: imagen("[foto2]", IMG("tapado-camel.webp"), { ancho: "medio", fondo: "oscuro" }),
      cifras: {
        tipo: "lista",
        etiqueta: "Cifras",
        item: "Cifra",
        cantidad: 4,
        ayuda: "Dejá el texto vacío para ocultar una cifra.",
        campos: {
          numero: { tipo: "numero", etiqueta: "Número", max: 9999999, ancho: "tercio" },
          sufijo: texto("Signo", "", 3, { ancho: "tercio", placeholder: "+ o %" }),
          texto: texto("Texto", "", 30, { ancho: "tercio" }),
        },
        defecto: [
          { numero: 6, sufijo: "", texto: "años vistiéndote" },
          { numero: 12, sufijo: "+", texto: "colecciones" },
          { numero: 24, sufijo: "", texto: "provincias con envío" },
          { numero: 98, sufijo: "%", texto: "clientas felices" },
        ],
      },
    },
  },

  categorias: {
    titulo: "Categorías",
    descripcion: "Las tarjetas grandes que llevan a cada tipo de prenda.",
    campos: {
      etiqueta: etiquetaSeccion("Comprá por categoría"),
      titulo: tituloSeccion("Todo para *tu guardarropa*"),
      items: {
        tipo: "lista",
        etiqueta: "Tarjetas",
        item: "Categoría",
        cantidad: 4,
        campos: {
          nombre: texto("Nombre", "", 30, { ancho: "medio" }),
          link: link("Link", "", { ayuda: "Ej: /catalogo?categoria=Remeras abre esa categoría." }),
          frase: parrafo("Frase", "", 120),
          imagen: imagen("Foto", ""),
          fondo: { tipo: "opciones", etiqueta: "Fondo de la foto", opciones: FONDOS, defecto: "claro" },
        },
        defecto: [
          { nombre: "Remeras", link: "/catalogo?categoria=Remeras", frase: "Algodón suave y bordados de perlas. El básico que se lleva todo.", imagen: IMG("remeras-paris.webp"), fondo: "claro" },
          { nombre: "Abrigos", link: "/catalogo?categoria=Abrigos", frase: "Paños y tejidos para llegar abrigada y con estilo.", imagen: IMG("tapado-camel.webp"), fondo: "medio" },
          { nombre: "Jeans y pantalones", link: "/catalogo?categoria=Jeans%20y%20pantalones", frase: "Tiro alto, cortes rectos y sastreros. Calzan de verdad.", imagen: IMG("modelo-remera.webp"), fondo: "claro" },
          { nombre: "Vestidos", link: "/catalogo?categoria=Vestidos", frase: "Para el día, para la noche, para cualquier plan.", imagen: IMG("tapado-camel.webp"), fondo: "oscuro" },
        ],
      },
    },
  },

  novedades: {
    titulo: "Novedades",
    descripcion: "Las últimas prendas del catálogo (se cargan solas desde Productos).",
    campos: {
      etiqueta: etiquetaSeccion("Recién llegado"),
      titulo: tituloSeccion("Lo *nuevo* de la semana"),
      botonTexto: texto("Link al catálogo", "Ver todo el catálogo", 30, { ancho: "medio" }),
      botonLink: link("A dónde lleva", "/catalogo"),
    },
  },

  detalles: {
    titulo: "Detalles",
    descripcion: "Lo que hace distinta a la marca; en PC la foto cambia con cada punto.",
    campos: {
      etiqueta: etiquetaSeccion("El detalle"),
      titulo: tituloSeccion("Hecho para *durar y lucirse*"),
      pasos: {
        tipo: "lista",
        etiqueta: "Puntos",
        item: "Punto",
        cantidad: 4,
        campos: {
          titulo: texto("Título", "", 40),
          texto: parrafo("Texto", "", 240),
          imagen: imagen("Foto", ""),
        },
        defecto: [
          { titulo: "Perlas aplicadas a mano", texto: "Cada letra de nuestras remeras PARIS lleva perlas cosidas una por una. Ninguna es exactamente igual a otra.", imagen: IMG("remeras-paris.webp") },
          { titulo: "Tejidos que se sienten", texto: "Algodón peinado, paños suaves y géneros con caída. Elegimos telas que se ven bien y se sienten mejor.", imagen: IMG("tapado-camel.webp") },
          { titulo: "Cortes que acompañan", texto: "Hombros marcados, largos pensados y siluetas relajadas: prendas que se adaptan a vos, no al revés.", imagen: IMG("modelo-remera.webp") },
          { titulo: "Colores para combinar", texto: "Negro, blanco, crudo y camel. Una paleta atemporal para armar mil looks con pocas prendas.", imagen: IMG("remeras-paris.webp") },
        ],
      },
    },
  },

  estilo: {
    titulo: "Guía de estilo",
    descripcion: "La sección oscura con ideas para combinar las prendas.",
    campos: {
      etiqueta: etiquetaSeccion("Guía de estilo"),
      titulo: tituloSeccion("Cuatro ideas para *combinar*"),
      bajada: parrafo("Texto", "Con pocas prendas bien elegidas se arman muchos looks. Estas son nuestras fórmulas favoritas.", 200),
      imagen: imagen("Foto", IMG("modelo-remera.webp"), { ayuda: "Queda mejor una foto vertical." }),
      consejos: {
        tipo: "lista",
        etiqueta: "Ideas",
        item: "Idea",
        cantidad: 4,
        campos: {
          titulo: texto("Título", "", 40),
          texto: parrafo("Texto", "", 140),
        },
        defecto: [
          { titulo: "Remera + jean de tiro alto", texto: "La dupla de siempre. Sumá un cinto fino y zapatillas blancas." },
          { titulo: "Tapado camel sobre negro", texto: "Un total black con un abrigo claro: elegante y sin esfuerzo." },
          { titulo: "Perlas como protagonistas", texto: "Si la remera brilla, el resto va simple: pantalón liso y poco accesorio." },
          { titulo: "Capas livianas", texto: "Remera, cárdigan y abrigo. Te las sacás o te las ponés según el día." },
        ],
      },
    },
  },

  talles: {
    titulo: "Guía de talles",
    descripcion: "La tabla de medidas con una frase de ayuda.",
    campos: {
      etiqueta: etiquetaSeccion("Guía de talles"),
      titulo: tituloSeccion("Encontrá *tu talle*"),
      bajada: parrafo("Texto", "Medidas del cuerpo en centímetros. Si estás entre dos talles, te recomendamos el más grande. ¿Dudas? Escribinos y te asesoramos.", 220),
      botonTexto: texto("Botón", "Consultar por WhatsApp", 30, { ancho: "medio" }),
      botonLink: link("Link del botón", "#", { ayuda: "Ej: https://wa.me/549XXXXXXXXXX" }),
      tabla: {
        tipo: "lista",
        etiqueta: "Tabla de medidas",
        item: "Talle",
        cantidad: 5,
        ayuda: "Dejá el talle vacío para ocultar una fila.",
        campos: {
          talle: texto("Talle", "", 6, { ancho: "tercio" }),
          busto: texto("Busto", "", 10, { ancho: "tercio" }),
          cintura: texto("Cintura", "", 10, { ancho: "tercio" }),
          cadera: texto("Cadera", "", 10, { ancho: "tercio" }),
        },
        defecto: [
          { talle: "XS", busto: "80–84", cintura: "60–64", cadera: "86–90" },
          { talle: "S", busto: "85–89", cintura: "65–69", cadera: "91–95" },
          { talle: "M", busto: "90–94", cintura: "70–74", cadera: "96–100" },
          { talle: "L", busto: "95–99", cintura: "75–79", cadera: "101–105" },
          { talle: "XL", busto: "100–106", cintura: "80–86", cadera: "106–112" },
        ],
      },
    },
  },

  looks: {
    titulo: "Looks",
    descripcion: "El mosaico de fotos con la frase.",
    campos: {
      etiqueta: etiquetaSeccion("#MatildaLooks"),
      titulo: tituloSeccion("Inspiración *real*"),
      redTexto: texto("Link a redes", "Seguinos en Instagram", 30, { ancho: "medio" }),
      redLink: link("A dónde lleva", "#", { ayuda: "Ej: https://instagram.com/tu_marca" }),
      frase: texto("Frase del cuadro blanco", "“La elegancia es *no pasar desapercibida*, sin hacer ruido.”", 110),
      fotos: {
        tipo: "lista",
        etiqueta: "Fotos",
        item: "Foto",
        cantidad: 5,
        ayuda: "La 1 es la alta y la 3 la ancha; las demás son cuadradas.",
        campos: {
          imagen: imagen("Foto", ""),
          texto: texto("Epígrafe", "", 30, { ancho: "medio" }),
          fondo: { tipo: "opciones", etiqueta: "Fondo", opciones: FONDOS, defecto: "claro", ancho: "medio" },
        },
        defecto: [
          { imagen: IMG("tapado-camel.webp"), texto: "Camel de domingo", fondo: "medio" },
          { imagen: IMG("remeras-paris.webp"), texto: "Paris, en dos tonos", fondo: "oscuro" },
          { imagen: IMG("modelo-remera.webp"), texto: "Remera + jean", fondo: "claro" },
          { imagen: IMG("remeras-paris.webp"), texto: "Negro total", fondo: "oscuro" },
          { imagen: IMG("tapado-camel.webp"), texto: "El abrigo de la temporada", fondo: "claro" },
        ],
      },
    },
  },

  testimonios: {
    titulo: "Testimonios",
    descripcion: "Opiniones de clientas que van cambiando solas.",
    campos: {
      etiqueta: etiquetaSeccion("Lo que dicen"),
      items: {
        tipo: "lista",
        etiqueta: "Opiniones",
        item: "Opinión",
        min: 1,
        max: 8,
        campos: {
          texto: parrafo("Opinión", "", 240),
          autor: texto("Nombre", "", 40, { ancho: "medio" }),
          lugar: texto("Ciudad", "", 40, { ancho: "medio" }),
        },
        defecto: [
          { texto: "La remera con perlas es aún más linda en persona. Me llegó en 3 días y el talle me calzó perfecto.", autor: "Lucía M.", lugar: "Córdoba" },
          { texto: "El tapado camel es una belleza: abriga, cae divino y combina con todo. Ya pienso en el segundo.", autor: "Martina G.", lugar: "Rosario" },
          { texto: "Me asesoraron por WhatsApp con los talles y acertaron. Compra fácil, empaque hermoso.", autor: "Carla R.", lugar: "CABA" },
        ],
      },
    },
  },

  cierre: {
    titulo: "Cierre",
    descripcion: "La invitación final antes del pie de página.",
    campos: {
      etiqueta: etiquetaSeccion("Tu próximo favorito"),
      titulo: {
        tipo: "lineas",
        etiqueta: "Título",
        defecto: "Encontrá la prenda que\nte va a *acompañar*",
        max: 80,
        maxLineas: 3,
        ayuda: "*Entre asteriscos* va en cursiva.",
      },
      botonTexto: texto("Botón", "Ver el catálogo", 30, { ancho: "medio" }),
      botonLink: link("Link del botón", "/catalogo"),
      secundarioTexto: texto("Link secundario", "Ver abrigos", 40, { ancho: "medio" }),
      secundarioLink: link("A dónde lleva", "/catalogo?categoria=Abrigos"),
    },
  },
};

module.exports = { SECCIONES, FONDOS };
