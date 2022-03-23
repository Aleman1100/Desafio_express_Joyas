const express = require('express');
const req = require('express/lib/request');
const joyas = require('./data/joyas.js')
const app = express()
app.listen(3000, () => console.log('Your app listening on port 3000'))

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Oh wow! this is working =)')
})

// 1. Crear una ruta para la devolución de todas las joyas aplicando HATEOAS.
const HATEOASV1 = () =>
joyas.results.map((j) => {
  return {
    name: j.name,
    href: `http://localhost:3000/joyas/${j.id}`,
  };
});

const joya = (id) => {
  return joyas.results.find((j) => j.id == id)
}

app.get('/joyas/:id', (req,res) => {
  const id = req.params.id;
  res.send(joya(id))
});

// 2. Hacer una segunda versión de la API que ofrezca los mismos datos pero con los
// nombres de las propiedades diferentes.

const HATEOASV2 = () =>
joyas.results.map((j) => {
  return {
    joya: j.name,
    src: `http://localhost:3000/joyas/${j.id}`
  };
});

// 3. La API REST debe poder ofrecer una ruta con la que se puedan filtrar las joyas por categoría.

const filtroCategory = (category) => {
  return joyas.results.filter((j) => j.category === category);
};

app.get('/api/v2/category/:categoria', (req,res) => {
  const categoria = req.params.categoria;
  res.send({
    cant: filtroCategory(categoria).length,
    joyas: filtroCategory(categoria),
  })
})

// 4. Crear una ruta que permita el filtrado por campos de una joya a consultar.

const fieldsSelect = (joya, fields) => {
  for (propiedad in joya) {
    if (!fields.includes(propiedad)) delete joya [propiedad];
  }
  return joya
};

app.get('/api/v2/joya/:id', (req,res) => {
  const { id } = req.params;
  const { fields } = req.query;
if (fields) return res.send({ joya: fieldsSelect(joya(id),
  fields.split(",") ) });
    joya(id)
    ? res.send({
      joya: joya(id),
    })
    // 5. Crear una ruta que devuelva como payload un JSON con un mensaje de error cuando
    // el usuario consulte el id de una joya que no exista.
    : res.status(404).send({
      error: '404 Not Found',
      message: 'No existe la joya señalada',
    })
});

// 6. Permitir hacer paginación de las joyas usando Query Strings.

// 7. Permitir hacer ordenamiento de las joyas según su valor de forma ascendente o
// descendente usando Query Strings.

const orderValues = (order) => {
  return order == 'asc'
  ? joyas.results.sort((a,b) => (a.value > b.value ? 1 : -1))
  : order == 'desc'
  ? joyas.results.sort((a,b) => (a.value < b.value ? 1 : -1))
  : false
};

app.get('/api/v2/joyas', (req,res) => {
  const { values } = req.query;
  if (values == 'asc') return res.send(orderValues('asc'));
  if (values == 'desc') return res.send(orderValues('desc'));
  if (req.query.page) {
    const { page } = req.query;
    return res.send({ joyas: HATEOASV2().slice (page * 2 - 2, page * 2) });
  }
  res.send({ 
    joyas: HATEOASV2(),
  });
});


