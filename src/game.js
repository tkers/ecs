import { createWorld, hasComponent, hasComponents } from './ecs'

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

function VelocityComponent(vx, vy) {
  this.vx = vx
  this.vy = vy
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

const MovementSystem = ents => ents
  .filter(hasComponents([PositionComponent, VelocityComponent]))
  .forEach(ent => {
    ent.components.PositionComponent.x += ent.components.VelocityComponent.vx
    ent.components.PositionComponent.y += ent.components.VelocityComponent.vy
  })

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
    .addComponent(new VelocityComponent(1, 2))

  world.createEntity()
    .addComponent(new PositionComponent(250, 250))
    .addComponent(new SpriteComponent(32, '#00ffff'))
    .addComponent(new VelocityComponent(-0.5, -3))

  const canvas = document.getElementById('cvs')
  world.addSystem(RenderSystem(canvas, 400, 300))
  world.addSystem(LogSystem)
  world.addSystem(MovementSystem)

  const gameLoop = () => {
    world.update()
    requestAnimationFrame(gameLoop)
  }

  gameLoop()
})
