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

function LogComponent(msg) {
  this.message = msg
}

function WarnComponent() {}

const LogSystem = ents => ents
  .filter(hasComponent(LogComponent))
  .forEach(x => {
    if (hasComponent(WarnComponent)(x))
      console.warn(x.components.LogComponent.message)
    else
      console.log(x.components.LogComponent.message);
    delete x.components.LogComponent
  })

window.addEventListener('load', () => {

  const world = createWorld()

  world.createEntity()
    .addComponent(new LogComponent('Hello'))

  world.createEntity()
    .addComponent(new LogComponent('world!'))
    .addComponent(new WarnComponent)

  world.addSystem(LogSystem)

  const gameLoop = () => {
    world.update()
    requestAnimationFrame(gameLoop)
  }

  gameLoop()
})
