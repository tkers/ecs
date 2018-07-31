const createWorld = () => {
  const entities = []
  const systems = []
  let _entn = 0

  const addComponent = (ent, comp) => {
    ent.components[comp.constructor.name] = comp
    return ent
  }

  const createEntity = () => {
    const newEnt = {
      id: ++_entn,
      components: {}
    }
    newEnt.addComponent = c => addComponent(newEnt, c)
    entities.push(newEnt)
    return newEnt
  }

  const addSystem = fn => systems.push(fn)

  const update = () => {
    systems.forEach(fn => fn(entities))
  }

  return {
    createEntity,
    addComponent,
    addSystem,
    update
  }
}

const hasComponent = cname => ent => !!ent.components[cname.name || cname]
const hasComponents = cnames => ent => cnames.every(cname => !!ent.components[cname.name || cname])
