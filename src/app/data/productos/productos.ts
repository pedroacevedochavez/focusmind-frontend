import { Producto } from '../../models/producto/producto';

// Repositorio Mock de 8 productos (HU-03/HU-04). El producto id 6 (sin registroSanitario)
// valida intencionalmente el badge de alerta sanitaria ABET 2 (HU-06).
export const PRODUCTOS_MOCK: Producto[] = [
  {
    id: 1,
    nombre: 'NeuroFocus Alpha',
    marca: 'NutraLab Perú',
    imagen: 'assets/nootropico-memoria-alpha.jpg',
    categoria: 'memoria',
    objetivo: 'mejorar-memoria',
    precio: 119.90,
    descripcion:
      'Fórmula avanzada con Bacopa Monnieri y Fosfatidilserina para potenciar la memoria de trabajo y la retención de información a largo plazo.',
    ingredientes: [
      'Bacopa Monnieri 300mg',
      'Fosfatidilserina 100mg',
      'Vitamina B6 5mg',
      'Ginkgo Biloba 120mg',
    ],
    dosisRecomendada: '1 cápsula al día, junto con el desayuno.',
    contraindicaciones: [
      'No recomendado en gestantes y mujeres en periodo de lactancia.',
      'Consultar con un médico si se encuentra en tratamiento con anticoagulantes.',
    ],
    alergenos: ['Soya', 'Gluten'],
    registroSanitario: 'N-0012456-2024',
    entidadRegistro: 'DIGESA',
  },
  {
    id: 2,
    nombre: 'ZenCalm Magnesio',
    marca: 'Andes Wellness',
    imagen: 'assets/suplemento-estres-magnesio.jpg',
    categoria: 'estres',
    objetivo: 'reducir-estres',
    precio: 75.00,
    descripcion:
      'Magnesio bisglicinato de alta absorción combinado con L-Teanina para reducir los niveles de cortisol y promover la calma mental durante el día.',
    ingredientes: [
      'Magnesio Bisglicinato 200mg',
      'L-Teanina 150mg',
      'Vitamina B6 2mg',
    ],
    dosisRecomendada: '2 cápsulas al día, preferiblemente en la noche.',
    contraindicaciones: [
      'No combinar con medicamentos sedantes sin supervisión médica.',
    ],
    alergenos: [],
    registroSanitario: 'N-0023871-2023',
    entidadRegistro: 'DIGESA',
  },
  {
    id: 3,
    nombre: 'EnergyBoost Cordyceps',
    marca: 'PerúVital Labs',
    imagen: 'assets/suplemento-energia-cordyceps.jpg',
    categoria: 'energia',
    objetivo: 'aumentar-energia',
    precio: 145.50,
    descripcion:
      'Extracto micelar de Cordyceps Militaris combinado con Rhodiola Rosea para incrementar los niveles de energía física y mental sin el efecto rebote de la cafeína.',
    ingredientes: [
      'Cordyceps Militaris 500mg',
      'Rhodiola Rosea 200mg',
      'Cafeína Anhidra 50mg',
    ],
    dosisRecomendada: '1 cápsula en la mañana, alejada de los alimentos.',
    contraindicaciones: [
      'No recomendado para personas con hipertensión no controlada.',
      'Evitar su consumo después de las 4:00 p.m.',
    ],
    alergenos: [],
    registroSanitario: 'M-0098712-2024',
    entidadRegistro: 'DIGEMID',
  },
  {
    id: 4,
    nombre: 'DeepSleep Melatonina',
    marca: 'Andes Wellness',
    imagen: 'assets/suplemento-sueno-melatonina.jpg',
    categoria: 'sueno',
    objetivo: 'mejorar-sueno',
    precio: 58.90,
    descripcion:
      'Combinación de Melatonina, L-Triptófano y Manzanilla para conciliar el sueño de forma natural y mejorar la calidad del descanso profundo.',
    ingredientes: [
      'Melatonina 3mg',
      'L-Triptófano 200mg',
      'Extracto de Manzanilla 100mg',
    ],
    dosisRecomendada: '1 cápsula, 30 minutos antes de dormir.',
    contraindicaciones: [
      'No conducir ni operar maquinaria pesada después de su consumo.',
    ],
    alergenos: [],
    registroSanitario: 'N-0034567-2022',
    entidadRegistro: 'DIGESA',
  },
  {
    id: 5,
    nombre: 'MoodLift Omega-3',
    marca: 'NutraLab Perú',
    imagen: 'assets/suplemento-animo-omega3.jpg',
    categoria: 'animo',
    objetivo: 'mejorar-animo',
    precio: 99.90,
    descripcion:
      'Aceite de pescado de alta concentración en EPA y DHA, formulado para favorecer el equilibrio del estado de ánimo y la salud cerebral a largo plazo.',
    ingredientes: [
      'Aceite de Pescado 1000mg',
      'EPA 400mg',
      'DHA 300mg',
      'Vitamina E 5mg',
    ],
    dosisRecomendada: '2 cápsulas al día, junto con las comidas.',
    contraindicaciones: [
      'Consultar con un médico si se encuentra en tratamiento con anticoagulantes.',
    ],
    alergenos: ['Pescado'],
    registroSanitario: 'N-0045123-2023',
    entidadRegistro: 'DIGESA',
  },
  {
    id: 6,
    nombre: 'ClarityMind Bacopa',
    marca: 'BioCognition',
    imagen: 'assets/nootropico-enfoque-bacopa.jpg',
    categoria: 'enfoque',
    objetivo: 'aumentar-concentracion',
    precio: 64.90,
    descripcion:
      'Extracto estandarizado de Bacopa Monnieri al 50% de bacósidos, orientado a mejorar la claridad mental y la capacidad de concentración sostenida.',
    ingredientes: [
      'Bacopa Monnieri 320mg (50% bacósidos)',
      'Pimienta Negra (Piperina) 5mg',
    ],
    dosisRecomendada: '1 cápsula al día, junto con alimentos.',
    contraindicaciones: [
      'Puede causar malestar estomacal leve en dosis altas.',
    ],
    alergenos: [],
    registroSanitario: null,
    entidadRegistro: null,
  },
  {
    id: 7,
    nombre: 'MemoryPlus Ginkgo',
    marca: 'PerúVital Labs',
    imagen: 'assets/nootropico-memoria-ginkgo.jpg',
    categoria: 'memoria',
    objetivo: 'mejorar-memoria',
    precio: 89.50,
    descripcion:
      'Ginkgo Biloba estandarizado combinado con Colina, diseñado para mejorar la circulación cerebral y la velocidad de procesamiento de información.',
    ingredientes: [
      'Ginkgo Biloba 240mg',
      'Colina (Bitartrato) 150mg',
      'Ácido Fólico 400mcg',
    ],
    dosisRecomendada: '1 cápsula al día, junto con el almuerzo.',
    contraindicaciones: [
      'No recomendado junto con anticoagulantes o antiagregantes plaquetarios.',
      'Suspender su consumo dos semanas antes de cirugías programadas.',
    ],
    alergenos: ['Gluten'],
    registroSanitario: 'M-0076543-2023',
    entidadRegistro: 'DIGEMID',
  },
  {
    id: 8,
    nombre: 'FocusPro L-Teanina',
    marca: 'BioCognition',
    imagen: 'assets/nootropico-enfoque-teanina.jpg',
    categoria: 'enfoque',
    objetivo: 'aumentar-concentracion',
    precio: 110.00,
    descripcion:
      'L-Teanina pura combinada con Cafeína en proporción 2:1, formulada para lograr un estado de concentración relajada ("flow") sin nerviosismo.',
    ingredientes: [
      'L-Teanina 200mg',
      'Cafeína Anhidra 100mg',
      'Vitamina B12 10mcg',
    ],
    dosisRecomendada:
      '1 cápsula en la mañana, antes de iniciar actividades de concentración.',
    contraindicaciones: [
      'No recomendado en personas sensibles a la cafeína.',
      'Evitar su consumo en las últimas 6 horas antes de dormir.',
    ],
    alergenos: [],
    registroSanitario: 'N-0056789-2024',
    entidadRegistro: 'DIGESA',
  },
];