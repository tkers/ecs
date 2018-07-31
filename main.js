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


/* ---------- Actual Game Logic starts here ---------- */

function LogComponent(msg) {
  this.message = msg
}

function WarnComponent() {}

function SpriteComponent(size, color) {
  this.size = size
  this.color = color
}

function PositionComponent(x, y) {
  this.x = x
  this.y = y
}

const LogSystem = ents => ents
  .filter(hasComponent(LogComponent))
  .forEach(x => {
    if (hasComponent(WarnComponent)(x))
      console.warn(x.components.LogComponent.message)
    else
      console.log(x.components.LogComponent.message);
    delete x.components.LogComponent
  })

const RenderSystem = (canvas, w, h) => {
  const ctx = canvas.getContext('2d')
  canvas.width = w
  canvas.height = h

  return ents => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ents
      .filter(hasComponents([SpriteComponent, PositionComponent]))
      .forEach(ent => {
        ctx.fillStyle = ent.components.SpriteComponent.color
        ctx.fillRect(ent.components.PositionComponent.x, ent.components.PositionComponent.y, ent.components.SpriteComponent.size, ent.components.SpriteComponent.size)
      })
    }
}

window.addEventListener('load', () => {

  const world = createWorld()

  world.createEntity()
    .addComponent(new LogComponent('Hello'))

  world.createEntity()
    .addComponent(new LogComponent('world!'))
    .addComponent(new WarnComponent)

  world.createEntity()
    .addComponent(new PositionComponent(10, 10))
    .addComponent(new SpriteComponent(32, '#ff00ff'))

  world.createEntity()
    .addComponent(new PositionComponent(250, 250))
    .addComponent(new SpriteComponent(32, '#00ffff'))

  const canvas = document.getElementById('cvs')
  world.addSystem(RenderSystem(canvas, 400, 300))
  world.addSystem(LogSystem)

  const gameLoop = () => {
    world.update()
    requestAnimationFrame(gameLoop)
  }

  gameLoop()
})
